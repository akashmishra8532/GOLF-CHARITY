import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Spinner } from "../components/Spinner";
import { Alert } from "../components/Alert";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

type SubscriptionStatus = "active" | "expired" | "cancelled";
type SubscriptionInfo = {
  status: SubscriptionStatus;
  planInterval?: "monthly" | "yearly";
  currentPeriodEnd?: string;
};

// Enhanced subscription plans with e-commerce styling
const subscriptionPlans = [
  {
    id: "monthly",
    name: "Monthly Pro",
    description: "Perfect for getting started",
    price: "$29.99",
    originalPrice: "$59.99",
    discount: "50% OFF",
    features: [
      "Monthly prize draws",
      "Score tracking",
      "Charity contributions",
      "Basic analytics",
      "Email support"
    ],
    badge: "POPULAR",
    color: "bg-blue-500"
  },
  {
    id: "yearly",
    name: "Annual Elite",
    description: "Best value - Save 50%",
    price: "$299.99",
    originalPrice: "$599.99",
    discount: "50% OFF",
    features: [
      "Everything in Monthly",
      "Priority draw entry",
      "Advanced analytics",
      "Premium support",
      "Exclusive events",
      "2 months free"
    ],
    badge: "BEST VALUE",
    color: "bg-purple-500"
  }
];

const additionalProducts = [
  {
    id: "charity-boost",
    name: "Charity Support Plus",
    description: "Double your charitable impact",
    price: "$19.99",
    originalPrice: "$39.99",
    discount: "50% OFF",
    badge: "CHARITY FAVORITE",
    image: "/assets/products/charity-boost.jpg"
  },
  {
    id: "score-pro",
    name: "Professional Score Analysis",
    description: "AI-powered golf insights",
    price: "$9.99",
    originalPrice: "$19.99",
    discount: "50% OFF",
    badge: "NEW",
    image: "/assets/products/score-pro.jpg"
  }
];

export function SubscriptionPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [status, setStatus] = useState<SubscriptionInfo>({ status: "expired" });
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  async function refresh() {
    const res = await api.get("/api/subscription/status");
    setStatus(res.data.status);
  }

  useEffect(() => {
    let mounted = true;
    refresh()
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.error ?? "Failed to load subscription status");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function startCheckout(interval: "monthly" | "yearly") {
    setError(null);
    setBusyPlan(interval);
    try {
      const res = await api.post("/api/subscription/checkout-session", { interval });
      const url = res.data.url as string;
      window.location.href = url;
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to create Stripe checkout session");
    } finally {
      setBusyPlan(null);
    }
  }

  function toggleAddon(addonId: string) {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Membership Plans</h1>
          <p className="text-xl md:text-2xl mb-6">Choose your path to golf excellence and charitable impact</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="bg-red-500 px-3 py-1 rounded-full font-bold">50% OFF LIMITED TIME</span>
            <span className="bg-green-500 px-3 py-1 rounded-full font-bold">ALL PLANS</span>
          </div>
        </div>
      </section>

      {/* Current Status */}
      {status.status === "active" && (
        <section className="bg-green-50 border-b border-green-200 py-4 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-green-800">
              ✅ Your {status.planInterval} subscription is active until {new Date(status.currentPeriodEnd || "").toLocaleDateString()}
            </p>
          </div>
        </section>
      )}

      {/* Main Plans */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Membership</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative">
                {plan.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`${plan.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-400 line-through">{plan.originalPrice}</span>
                      </div>
                      <div className="text-red-500 font-bold">{plan.discount}</div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-6">
                      {plan.id === "monthly" ? "per month" : "per year (save 50%)"}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="text-green-500">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => startCheckout(plan.id as "monthly" | "yearly")}
                    disabled={busyPlan === plan.id || status.status === "active"}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {busyPlan === plan.id ? (
                      <span>Processing...</span>
                    ) : status.status === "active" ? (
                      <span>Already Subscribed</span>
                    ) : (
                      <span>Get Started Now</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Products */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Enhance Your Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {additionalProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📦</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {product.badge && (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{product.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold">{product.price}</span>
                        <span className="text-gray-400 line-through ml-2">{product.originalPrice}</span>
                        <div className="text-red-500 text-sm font-bold">{product.discount}</div>
                      </div>
                      
                      <button
                        onClick={() => toggleAddon(product.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedAddons.includes(product.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {selectedAddons.includes(product.id) ? 'Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Golf Charity?</h2>
            <p className="text-xl text-gray-600">Join thousands of golfers making a difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Win Prizes</h3>
              <p className="text-gray-600">Monthly draws with multiple prize tiers and jackpot rollovers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">❤️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Support Charities</h3>
              <p className="text-gray-600">10% minimum contribution to causes you care about</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
              <p className="text-gray-600">Advanced score tracking and performance analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          </div>
        </section>
      )}
    </div>
  );
}

