import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "../store/store";
import { logout } from "../store/authSlice";
import { useCart } from "../context/CartContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, totalItems, totalPrice, isOpen, setIsOpen, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-black text-white text-center py-2 text-sm font-medium"
      >
        🎉 Limited Time: 50% OFF All Memberships - Use Code: GOLF50
      </motion.div>

      {/* Main Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-gray-200 bg-white sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-lg">GC</span>
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-lg">GOLF CHARITY</div>
                  <div className="text-xs text-gray-500">Subscription Platform</div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link className="text-gray-700 hover:text-black font-medium transition-colors" to="/">
                  Home
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link className="text-gray-700 hover:text-black font-medium transition-colors" to="/charities">
                  Charities
                </Link>
              </motion.div>
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-700 hover:text-black font-medium transition-colors flex items-center gap-1"
                >
                  Memberships
                  <span className="text-xs">▼</span>
                </motion.button>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                >
                  <Link to="/subscription" className="block px-4 py-3 hover:bg-gray-50 text-sm">Monthly Plans</Link>
                  <Link to="/subscription" className="block px-4 py-3 hover:bg-gray-50 text-sm">Yearly Plans</Link>
                  <Link to="/subscription" className="block px-4 py-3 hover:bg-gray-50 text-sm">Special Offers</Link>
                </motion.div>
              </div>
              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link className="text-gray-700 hover:text-black font-medium transition-colors" to="/dashboard">
                      Dashboard
                    </Link>
                  </motion.div>
                  {user.role === "Admin" ? (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Link className="text-gray-700 hover:text-black font-medium transition-colors" to="/admin">
                        Admin
                      </Link>
                    </motion.div>
                  ) : null}
                </>
              ) : null}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-700 hover:text-black"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>

              {/* Cart Icon */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="text-gray-700 hover:text-black relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* User Actions */}
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 hidden lg:block">Welcome, {user.name}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      dispatch(logout());
                      navigate("/login");
                    }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link className="text-gray-700 hover:text-black font-medium" to="/login">
                    Login
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/signup"
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden text-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 py-4"
              >
                <nav className="flex flex-col space-y-4">
                  <Link className="text-gray-700 hover:text-black font-medium" to="/">
                    Home
                  </Link>
                  <Link className="text-gray-700 hover:text-black font-medium" to="/charities">
                    Charities
                  </Link>
                  <Link className="text-gray-700 hover:text-black font-medium" to="/subscription">
                    Memberships
                  </Link>
                  {user ? (
                    <>
                      <Link className="text-gray-700 hover:text-black font-medium" to="/dashboard">
                        Dashboard
                      </Link>
                      {user.role === "Admin" ? (
                        <Link className="text-gray-700 hover:text-black font-medium" to="/admin">
                          Admin
                        </Link>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Link className="text-gray-700 hover:text-black font-medium" to="/login">
                        Login
                      </Link>
                      <Link className="text-gray-700 hover:text-black font-medium" to="/signup">
                        Sign Up
                      </Link>
                    </>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Shopping Cart ({totalItems})</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-gray-500 text-lg">Your cart is empty</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/subscription');
                      }}
                      className="mt-4 bg-black text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Start Shopping
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                            {item.badge && (
                              <span className="inline-block bg-purple-500 text-white text-xs px-2 py-0.5 rounded mt-1">
                                {item.badge}
                              </span>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold">${item.price.toFixed(2)}</span>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                >
                                  -
                                </motion.button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                >
                                  +
                                </motion.button>
                              </div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, color: "#ef4444" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="border-t border-gray-200 p-6 bg-gray-50"
                >
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-xl">${totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Shipping and taxes calculated at checkout</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors"
                  >
                    Checkout Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                    className="w-full mt-2 bg-white border-2 border-black text-black py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded bg-white flex items-center justify-center">
                  <span className="text-black font-bold text-sm">GC</span>
                </div>
                <div className="font-bold">GOLF CHARITY</div>
              </div>
              <p className="text-gray-400 text-sm">
                Making every swing count for charitable causes through competitive golf subscriptions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/subscription" className="hover:text-white transition-colors">Monthly Plans</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">Yearly Plans</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">Special Offers</Link></li>
                <li><Link to="/charities" className="hover:text-white transition-colors">Gift Cards</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/charities" className="hover:text-white transition-colors">Charities</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Golf Charity Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

