'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProductById(productId);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to load product details. Please try again later.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} x ${product.name} added to cart!`);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              NCCart
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                All Products
              </Link>
              <Link
                href="/cart"
                className="relative text-gray-700 hover:text-indigo-600 transition"
              >
                <span className="text-2xl">🛒</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-indigo-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <div className="aspect-square bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-9xl">📦</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index ? 'border-indigo-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(product.averageRating || 0) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {product.averageRating?.toFixed(1) || '0.0'} ({product._count?.reviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-bold">
                        Save {Math.round(product.discount)}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-gray-700 mb-6">{product.shortDescription}</p>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div>
                    <p className="text-green-600 font-semibold mb-2">
                      ✓ In Stock ({product.stock} available)
                    </p>
                    {product.stock < product.lowStockAlert && (
                      <p className="text-orange-600 text-sm">Only {product.stock} left - Order soon!</p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600 font-semibold">✗ Out of Stock</p>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                    product.stock > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-40">SKU:</span>
                    <span className="text-gray-900">{product.sku}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Country of Origin:</span>
                    <span className="text-gray-900">{product.countryOfOrigin}</span>
                  </div>
                  {product.weight && (
                    <div className="flex">
                      <span className="text-gray-600 w-40">Weight:</span>
                      <span className="text-gray-900">{product.weight} kg</span>
                    </div>
                  )}
                  {product.hsn && (
                    <div className="flex">
                      <span className="text-gray-600 w-40">HSN Code:</span>
                      <span className="text-gray-900">{product.hsn}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
        </div>

        {/* Specifications */}
        {product.specifications && typeof product.specifications === 'object' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex border-b pb-2">
                  <span className="text-gray-600 font-medium w-1/2">{key}:</span>
                  <span className="text-gray-900 w-1/2">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Information */}
        {product.seller && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Information</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                🏪
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.seller.businessName}</h3>
                {product.seller.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(product.seller?.rating || 0) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.seller?.rating?.toFixed(1)} Seller Rating
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {review.user?.name || 'Anonymous'}
                        </span>
                        {review.isVerified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        {review.helpfulCount > 0 && (
                          <span>👍 {review.helpfulCount} found this helpful</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
