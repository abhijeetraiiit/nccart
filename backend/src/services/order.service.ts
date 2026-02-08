import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    seller: {
      id: string;
      businessName: string;
    };
  };
  quantity: number;
  subtotal: number;
}

interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total';
  sortOrder?: 'asc' | 'desc';
}

interface SellerOrderFilters extends OrderFilters {
  dateFrom?: Date;
  dateTo?: Date;
}

export class OrderService {
  // Generate unique order number
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Get count of orders today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${sequence}`;
  }

  // Calculate tax (18% GST)
  private calculateTax(amount: number): number {
    return Math.round(amount * 0.18 * 100) / 100;
  }

  // Calculate delivery charge based on order value
  private calculateDeliveryCharge(subtotal: number): number {
    if (subtotal >= 500) {
      return 0; // Free delivery for orders above 500
    }
    return 50; // Flat 50 rupees for orders below 500
  }

  // Create order from cart
  async createOrder(
    userId: string,
    addressId: string,
    cartItems: CartItem[],
    paymentMethod: PaymentMethod = PaymentMethod.COD
  ) {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Verify address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!address) {
      throw new Error('Address not found or does not belong to user');
    }

    // Validate stock availability
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.product.id },
        select: { stock: true, status: true },
      });

      if (!product) {
        throw new Error(`Product ${item.product.name} not found`);
      }

      if (product.status !== 'ACTIVE') {
        throw new Error(`Product ${item.product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product.name}. Only ${product.stock} available`
        );
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryCharge = this.calculateDeliveryCharge(subtotal);
    const tax = this.calculateTax(subtotal);
    const total = subtotal + deliveryCharge + tax;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          shippingAddressId: addressId,
          billingAddressId: addressId,
          subtotal,
          deliveryCharge,
          tax,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === PaymentMethod.COD 
            ? PaymentStatus.PENDING 
            : PaymentStatus.PROCESSING,
          status: OrderStatus.PENDING,
        },
      });

      // Create order items and update product stock
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.product.id,
            sellerId: item.product.seller.id,
            quantity: item.quantity,
            price: item.product.price,
            tax: this.calculateTax(item.subtotal),
            subtotal: item.subtotal,
          },
        });

        // Reduce product stock
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    // Fetch complete order details
    return this.getOrderById(order.id, userId);
  }

  // Get customer's orders with pagination and filters
  async getOrders(userId: string, filters: OrderFilters = {}) {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  price: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  businessName: true,
                  displayName: true,
                },
              },
            },
          },
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get single order details
  async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
                mrp: true,
              },
            },
            seller: {
              select: {
                id: true,
                businessName: true,
                displayName: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Update order status (seller only)
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    sellerId: string
  ) {
    // Verify seller has items in this order
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        sellerId,
      },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new Error('Order not found or you do not have permission to update it');
    }

    const currentStatus = orderItem.order.status;

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${status}`
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.DELIVERED && {
          deliveredAt: new Date(),
        }),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  // Cancel order
  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Can only cancel if order is PENDING or CONFIRMED
    const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellableStatuses.includes(order.status)) {
      throw new Error(
        `Cannot cancel order with status ${order.status}`
      );
    }

    // Cancel order and restore stock in transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      });
    });

    return cancelledOrder;
  }

  // Get seller's orders
  async getSellerOrders(sellerId: string, filters: SellerOrderFilters = {}) {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      items: {
        some: {
          sellerId,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            where: { sellerId },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Calculate seller-specific totals for each order
    const ordersWithSellerTotals = orders.map((order) => {
      const sellerItems = order.items;
      const sellerSubtotal = sellerItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const sellerTax = sellerItems.reduce((sum, item) => sum + item.tax, 0);

      return {
        ...order,
        sellerSubtotal,
        sellerTax,
        sellerTotal: sellerSubtotal + sellerTax,
        itemCount: sellerItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    });

    return {
      orders: ordersWithSellerTotals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get order analytics for seller
  async getOrderAnalytics(sellerId: string) {
    // Get all orders with seller's items
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            sellerId,
          },
        },
      },
      include: {
        items: {
          where: { sellerId },
        },
      },
    });

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerRevenue = order.items.reduce(
        (itemSum, item) => itemSum + item.subtotal,
        0
      );
      return sum + sellerRevenue;
    }, 0);

    const statusCounts = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<OrderStatus, number>
    );

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = orders.filter(
      (order) => order.createdAt >= sevenDaysAgo
    );

    const recentRevenue = recentOrders.reduce((sum, order) => {
      const sellerRevenue = order.items.reduce(
        (itemSum, item) => itemSum + item.subtotal,
        0
      );
      return sum + sellerRevenue;
    }, 0);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top selling products
    const productSales = orders.flatMap((order) => order.items);
    const productSalesMap = productSales.reduce(
      (acc, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            productId: item.productId,
            quantity: 0,
            revenue: 0,
          };
        }
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].revenue += item.subtotal;
        return acc;
      },
      {} as Record<string, { productId: string; quantity: number; revenue: number }>
    );

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Fetch product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product) => {
        const productDetails = await prisma.product.findUnique({
          where: { id: product.productId },
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        });
        return {
          ...productDetails,
          quantitySold: product.quantity,
          revenue: product.revenue,
        };
      })
    );

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      recentOrders: recentOrders.length,
      recentRevenue,
      statusCounts,
      topProducts: topProductsWithDetails,
    };
  }
}

export default new OrderService();
