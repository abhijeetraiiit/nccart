import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

interface Cart {
  customerId: string;
  items: CartItem[];
  updatedAt: Date;
}

// In-memory cart storage (will be replaced with Redis or database in production)
class CartStore {
  private carts: Map<string, Cart> = new Map();

  getCart(customerId: string): Cart {
    if (!this.carts.has(customerId)) {
      this.carts.set(customerId, {
        customerId,
        items: [],
        updatedAt: new Date(),
      });
    }
    return this.carts.get(customerId)!;
  }

  setCart(customerId: string, cart: Cart): void {
    cart.updatedAt = new Date();
    this.carts.set(customerId, cart);
  }

  deleteCart(customerId: string): void {
    this.carts.delete(customerId);
  }
}

const cartStore = new CartStore();

export class CartService {
  // Helper method to get customer ID from user ID
  async getCustomerIdFromUserId(userId: string): Promise<string> {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    return customer.id;
  }

  // Add item to cart
  async addToCart(customerId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Verify product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        status: true,
        images: true,
        seller: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'ACTIVE') {
      throw new Error('Product is not available for purchase');
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    const cart = cartStore.getCart(customerId);
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new Error(`Only ${product.stock} items available in stock`);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date(),
      });
    }

    cartStore.setCart(customerId, cart);

    return this.getCart(customerId);
  }

  // Get user's cart with product details
  async getCart(customerId: string) {
    const cart = cartStore.getCart(customerId);

    if (cart.items.length === 0) {
      return {
        customerId,
        items: [],
        total: 0,
        itemCount: 0,
        updatedAt: cart.updatedAt,
      };
    }

    // Fetch product details for all items
    const productIds = cart.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        mrp: true,
        discount: true,
        stock: true,
        status: true,
        images: true,
        seller: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });

    // Map products to cart items
    const items = cart.items
      .map((cartItem) => {
        const product = products.find((p: any) => p.id === cartItem.productId);
        if (!product) return null;

        return {
          product,
          quantity: cartItem.quantity,
          subtotal: product.price * cartItem.quantity,
          addedAt: cartItem.addedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      customerId,
      items,
      total,
      itemCount,
      updatedAt: cart.updatedAt,
    };
  }

  // Update cart item quantity
  async updateCartItem(customerId: string, productId: string, quantity: number) {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (quantity === 0) {
      // If quantity is 0, remove the item
      return this.removeFromCart(customerId, productId);
    }

    const cart = cartStore.getCart(customerId);
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    // Verify product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, status: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'ACTIVE') {
      throw new Error('Product is not available for purchase');
    }

    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }

    cart.items[itemIndex].quantity = quantity;
    cartStore.setCart(customerId, cart);

    return this.getCart(customerId);
  }

  // Remove item from cart
  async removeFromCart(customerId: string, productId: string) {
    const cart = cartStore.getCart(customerId);
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);
    cartStore.setCart(customerId, cart);

    return this.getCart(customerId);
  }

  // Clear entire cart
  async clearCart(customerId: string) {
    cartStore.deleteCart(customerId);

    return {
      customerId,
      items: [],
      total: 0,
      itemCount: 0,
      message: 'Cart cleared successfully',
    };
  }

  // Get cart total
  async getCartTotal(customerId: string) {
    const cart = await this.getCart(customerId);

    return {
      customerId,
      total: cart.total,
      itemCount: cart.itemCount,
      items: cart.items.length,
    };
  }

  // Validate cart items (check stock availability and prices)
  async validateCart(customerId: string) {
    const cart = cartStore.getCart(customerId);

    if (cart.items.length === 0) {
      return {
        valid: true,
        issues: [],
      };
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        status: true,
        price: true,
      },
    });

    const issues: any[] = [];

    cart.items.forEach((cartItem) => {
      const product = products.find((p: any) => p.id === cartItem.productId);

      if (!product) {
        issues.push({
          productId: cartItem.productId,
          issue: 'Product no longer exists',
        });
        return;
      }

      if (product.status !== 'ACTIVE') {
        issues.push({
          productId: product.id,
          productName: product.name,
          issue: 'Product is no longer available',
        });
      }

      if (product.stock < cartItem.quantity) {
        issues.push({
          productId: product.id,
          productName: product.name,
          issue: `Insufficient stock. Only ${product.stock} available, but ${cartItem.quantity} requested`,
          availableStock: product.stock,
          requestedQuantity: cartItem.quantity,
        });
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

export default new CartService();
