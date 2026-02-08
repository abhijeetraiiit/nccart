export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  mrp: number;
  discount: number;
  sku: string;
  stock: number;
  lowStockAlert: number;
  images: string[];
  specifications?: Record<string, string | number>;
  countryOfOrigin: string;
  hsn?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    businessName: string;
    rating?: number;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  reviews?: Review[];
  _count?: {
    reviews: number;
  };
  averageRating?: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}
