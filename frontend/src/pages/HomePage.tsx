import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Spinner } from "../components/Spinner";
import { Alert } from "../components/Alert";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

type Charity = { id: string; name: string; description: string; imageUrl: string; slug: string };

// Dummy data for rich UI presentation
const dummyProducts = [
  {
    id: "golf-pro",
    name: "Golf Pro Elite Membership",
    category: "Memberships",
    price: 29.99,
    originalPrice: 59.99,
    discount: "50% OFF",
    image: "/assets/products/golf-pro-elite.jpg",
    badge: "BEST SELLER"
  },
  {
    id: "charity-champion",
    name: "Charity Champion Package",
    category: "Special Offers",
    price: 49.99,
    originalPrice: 99.99,
    discount: "50% OFF",
    image: "/assets/products/charity-champion.jpg",
    badge: "LIMITED TIME"
  },
  {
    id: "monthly-draw",
    name: "Monthly Draw Access",
    category: "Subscriptions",
    price: 19.99,
    originalPrice: 39.99,
    discount: "50% OFF",
    image: "/assets/products/monthly-draw.jpg",
    badge: "POPULAR"
  },
  {
    id: "score-tracker",
    name: "Premium Score Tracker",
    category: "Tools",
    price: 9.99,
    originalPrice: 19.99,
    discount: "50% OFF",
    image: "/assets/products/score-tracker.jpg",
    badge: "NEW"
  }
];

const categories = [
  { name: "Memberships", icon: "⭐", count: 12 },
  { name: "Charity Support", icon: "❤️", count: 8 },
  { name: "Draw Entries", icon: "🎯", count: 15 },
  { name: "Score Tools", icon: "📊", count: 6 }
];

export function HomePage() {
  const apiBase = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/charities")
      .then((res) => {
        if (!mounted) return;
        setCharities(res.data.charities);
      })
      .catch((e) => setError(e?.response?.data?.error ?? "Failed to load charities"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => charities.slice(0, 3), [charities]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner with 50% OFF */}
      <section className="relative bg-black text-white py-8 px-4 text-center" role="banner">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" aria-label="50% OFF MARKDOWNS - Limited Time Offer">50% OFF MARKDOWNS</h1>
          <p className="text-xl md:text-2xl mb-6">Limited Time Offer - Join Our Golf Charity Platform Today!</p>
          <Link
            to="/subscription"
            className="inline-block bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            aria-label="Shop now and save 50% on memberships"
          >
            SHOP NOW - SAVE 50%
          </Link>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16 px-4" aria-labelledby="products-heading">
        <div className="max-w-7xl mx-auto">
          <h2 id="products-heading" className="text-3xl font-bold text-center mb-12">Featured Memberships & Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
            {dummyProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                role="listitem"
                aria-label={`${product.name} - ${product.category} - $${product.price}`}
              >
                <div className="relative overflow-hidden bg-gray-100">
                  <motion.div 
                    className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {product.discount}
                  </motion.div>
                  <motion.div 
                    className="absolute top-3 right-3 z-10 bg-black text-white px-3 py-1 text-xs font-bold rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {product.badge}
                  </motion.div>
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</p>
                  <h3 className="text-lg font-semibold mt-1 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold">${product.price}</span>
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        image: product.image,
                        badge: product.badge
                      });
                      addToast(`${product.name} added to cart!`, 'success');
                    }}
                    className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-50"
                    aria-label={`Add ${product.name} to cart for $${product.price}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 px-4 bg-gray-50" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto">
          <h2 id="categories-heading" className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6" role="list">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                role="listitem"
                tabIndex={0}
                aria-label={`${category.name} category with ${category.count} items`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Handle category selection
                  }
                }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  whileHover={{ rotate: 10 }}
                >
                  {category.icon}
                </motion.div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.count} items</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Make Every Swing Count</h2>
              <p className="text-lg text-gray-600 mb-6">
                Join our exclusive golf charity platform where your passion for golf meets meaningful impact. 
                Track your scores, compete in monthly draws, and support charities you care about.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Track your Stableford scores with our advanced system</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Participate in monthly prize draws with multiple tiers</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Support charities making a difference in communities</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Connect with fellow golf enthusiasts</span>
                </li>
              </ul>
              <Link
                to="/subscription"
                className="inline-block bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors"
              >
                GET STARTED NOW
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/assets/lifestyle/golf-1.jpg" alt="Golf Lifestyle" className="rounded-lg w-full h-48 object-cover" />
              <img src="/assets/lifestyle/golf-2.jpg" alt="Golf Community" className="rounded-lg w-full h-48 object-cover" />
              <img src="/assets/lifestyle/golf-3.jpg" alt="Charity Impact" className="rounded-lg w-full h-48 object-cover" />
              <img src="/assets/lifestyle/golf-4.jpg" alt="Competition" className="rounded-lg w-full h-48 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Charities</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto">
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((charity) => (
                <div key={charity.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    {charity.imageUrl ? (
                      <img
                        src={charity.imageUrl.startsWith("/") ? `${apiBase}${charity.imageUrl}` : charity.imageUrl}
                        alt={charity.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">Charity Logo</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{charity.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{charity.description || "Supporting meaningful causes through golf"}</p>
                  <Link
                    to={`/charities/${charity.slug}`}
                    className="inline-block text-center w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Game</h2>
          <p className="text-lg mb-8">Get exclusive offers, draw results, and charity impact updates</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-black"
            />
            <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

