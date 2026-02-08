export const CONFIG = {
  // Tax configuration
  GST_RATE: 0.18, // 18% GST
  
  // Delivery configuration
  FREE_DELIVERY_THRESHOLD: 500, // Free delivery above ₹500
  DELIVERY_CHARGE: 50, // ₹50 delivery charge
  
  // Cart configuration
  MAX_CART_QUANTITY: 99,
  
  // API configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
} as const;
