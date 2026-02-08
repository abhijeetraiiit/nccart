import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductService {
  // Create a new product
  async createProduct(data: {
    sellerId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    mrp?: number;
    sku?: string;
    hsn?: string;
    gst?: number;
    stock: number;
    lowStockThreshold?: number;
    images?: string[];
    specifications?: any;
    countryOfOrigin?: string;
    brand?: string;
    weight?: number;
    dimensions?: any;
  }) {
    const product = await prisma.product.create({
      data: {
        ...data,
        status: ProductStatus.DRAFT,
      },
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return product;
  }

  // Get all products with filters
  async getProducts(filters: {
    status?: ProductStatus;
    sellerId?: string;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      sellerId,
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (sellerId) where.sellerId = sellerId;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (inStock) where.stock = { gt: 0 };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              businessName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single product by ID
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return product;
  }

  // Update product
  async updateProduct(
    id: string,
    sellerId: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      mrp?: number;
      stock?: number;
      status?: ProductStatus;
      images?: string[];
      specifications?: any;
      categoryId?: string;
    }
  ) {
    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id, sellerId },
    });

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  // Delete product
  async deleteProduct(id: string, sellerId: string) {
    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id, sellerId },
    });

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    await prisma.product.delete({
      where: { id },
    });

    return { success: true, message: 'Product deleted successfully' };
  }

  // Update stock
  async updateStock(id: string, sellerId: string, quantity: number) {
    const product = await prisma.product.findFirst({
      where: { id, sellerId },
    });

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    return updated;
  }

  // Get product analytics for seller
  async getSellerProductAnalytics(sellerId: string) {
    const [total, active, draft, outOfStock] = await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.product.count({ where: { sellerId, status: ProductStatus.ACTIVE } }),
      prisma.product.count({ where: { sellerId, status: ProductStatus.DRAFT } }),
      prisma.product.count({ where: { sellerId, stock: 0 } }),
    ]);

    return {
      total,
      active,
      draft,
      outOfStock,
    };
  }
}

export default new ProductService();
