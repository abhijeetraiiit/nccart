'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    if (confirm(`Remove "${productName}" from cart?`)) {
      removeFromCart(productId);
    }
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const deliveryCharge = cartTotal > 500 ? 0 : 50;
  const tax = cartTotal * 0.18; // 18% GST
  const finalTotal = cartTotal + deliveryCharge + tax;

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
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-gray-400 text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({cartCount})
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.productId} className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.productId}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition"
                          >
                            {item.product.name}
                          </Link>
                          
                          {item.product.shortDescription && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.product.shortDescription}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-4">
                            {/* Price */}
                            <div className="text-xl font-bold text-gray-900">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.product.stock}
                                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                handleRemoveItem(item.productId, item.product.name)
                              }
                              className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="mt-2 text-sm text-gray-600">
                            Subtotal:{' '}
                            <span className="font-semibold text-gray-900">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity >= item.product.stock && (
                            <p className="text-sm text-orange-600 mt-2">
                              Maximum available quantity reached
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? 'text-green-600 font-semibold' : ''}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-sm text-gray-600">
                      Add ₹{(500 - cartTotal).toFixed(2)} more to get FREE delivery
                    </p>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>GST (18%)</span>
                    <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition mb-4">
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block w-full text-center border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">We Accept</h3>
                  <div className="flex gap-2 text-2xl">
                    💳 🏦 📱
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Credit Card, Debit Card, UPI, Net Banking
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">🔒 Safe & Secure</h3>
                  <p className="text-sm text-gray-600">
                    Your payment information is processed securely
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Clear Cart?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
