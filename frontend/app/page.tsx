export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            NCCart
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Enterprise Multivendor E-commerce Platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Zero Commission</h3>
              <p className="text-gray-600">240 days FREE trial + ₹5 platform fee</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Smart Delivery</h3>
              <p className="text-gray-600">Intelligent multi-courier integration</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold mb-2">Indian Compliance</h3>
              <p className="text-gray-600">Full legal & GST compliance</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Platform Status</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span className="text-lg">✅ Backend API Running</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span className="text-lg">✅ Database Schema Ready</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span className="text-lg">✅ Authentication System</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                <span className="text-lg">🚧 Product Catalog (In Progress)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                <span className="text-lg">🚧 Delivery Integration (In Progress)</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
                  Customer Login
                </a>
                <a href="/seller/login" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                  Seller Login
                </a>
                <a href="/register" className="border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
                  Register
                </a>
                <a href="/admin" className="border-2 border-gray-600 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition">
                  Admin Panel
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 text-gray-600">
            <p>Built for the Indian market 🇮🇳</p>
            <p className="text-sm mt-2">Production-ready multivendor e-commerce platform</p>
          </div>
        </div>
      </div>
    </main>
  )
}
