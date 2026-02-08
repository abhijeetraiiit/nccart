# NCCart Frontend

Modern Next.js 15 frontend for the NCCart e-commerce platform.

## Features

### Product Listing (`/products`)
- Responsive grid layout
- Product search and filtering
- Product cards with images, prices, ratings
- Add to cart functionality
- Loading and error states

### Product Details (`/products/[id]`)
- Image gallery with thumbnails
- Detailed product information
- Quantity selector
- Customer reviews
- Seller information
- Specifications display

### Shopping Cart (`/cart`)
- Cart item management
- Quantity adjustment
- Price calculation with GST
- Delivery charge calculation
- Order summary

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **API**: Fetch with custom API wrapper
- **Storage**: localStorage for cart persistence

## Configuration

Environment variables in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=NCCart
NEXT_PUBLIC_SITE_DESCRIPTION=Enterprise Multivendor E-commerce Platform
```

Configuration constants in `lib/config.ts`:
- GST rate (18%)
- Delivery charges (₹50)
- Free delivery threshold (₹500)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env.local
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## File Structure

```
app/
├── cart/              # Shopping cart page
├── products/          # Product pages
│   ├── page.tsx      # Product listing
│   └── [id]/         # Product detail
├── layout.tsx        # Root layout with CartProvider
└── page.tsx          # Homepage

context/
└── CartContext.tsx   # Cart state management

lib/
├── api.ts           # API wrapper functions
└── config.ts        # Configuration constants

types/
└── product.ts       # TypeScript interfaces
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`:

- `GET /products` - List all products
- `GET /products/:id` - Get product details

## Cart Management

Cart data is persisted in localStorage and managed through React Context:
- Add items to cart
- Update quantities
- Remove items
- Calculate totals with GST

## Responsive Design

All pages are fully responsive:
- Mobile-first approach
- Tailwind CSS breakpoints
- Optimized for all screen sizes
