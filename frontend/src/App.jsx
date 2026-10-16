import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import AboutUs from './components/AboutUs';
import MyOrders from './components/MyOrders';
import AuthModal from './components/AuthModal';
import { Search, Sparkles, Shield, Cpu, RefreshCw, Banknote } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'about' | 'orders' | 'admin'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // User Authentication State (Customer or Admin)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authModalPrompt, setAuthModalPrompt] = useState('');

  // Handle URL Path Navigation: /admin, /about, /orders, /
  const syncRouteWithLocation = (user) => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path === '/admin' || hash === '#admin') {
      if (user?.role === 'ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('store');
        setAuthModalMode('login');
        setAuthModalPrompt('Please sign in with Admin credentials to open the Admin Panel (admin / admin123)');
        setIsAuthModalOpen(true);
      }
    } else if (path === '/about' || hash === '#about') {
      setActiveTab('about');
    } else if (path === '/orders' || hash === '#orders') {
      if (user) {
        setActiveTab('orders');
      } else {
        setActiveTab('store');
        setAuthModalMode('login');
        setAuthModalPrompt('Please sign in to view your orders and live tracking.');
        setIsAuthModalOpen(true);
      }
    } else {
      setActiveTab('store');
    }
  };

  useEffect(() => {
    // Restore user session from localStorage
    const savedUser = localStorage.getItem('zenith_user');
    let userObj = null;
    if (savedUser) {
      try {
        userObj = JSON.parse(savedUser);
        setCurrentUser(userObj);
      } catch (e) {
        localStorage.removeItem('zenith_user');
      }
    }

    syncRouteWithLocation(userObj);

    const handlePopState = () => {
      const u = localStorage.getItem('zenith_user');
      syncRouteWithLocation(u ? JSON.parse(u) : null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const categories = ['All', 'Audio', 'Peripherals', 'Displays', 'Workspace'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenAuthModal = (mode = 'login', prompt = '') => {
    setAuthModalMode(mode);
    setAuthModalPrompt(prompt);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    if (userData.role === 'ADMIN') {
      setActiveTab('admin');
      window.history.pushState(null, '', '/admin');
    } else {
      if (window.location.pathname === '/orders') {
        setActiveTab('orders');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zenith_token');
    localStorage.removeItem('zenith_user');
    setCurrentUser(null);
    setActiveTab('store');
    window.history.pushState(null, '', '/');
  };

  const handleRequireLoginForCheckout = () => {
    handleOpenAuthModal('login', 'Please sign in or create an account to proceed with your Cash on Delivery order.');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        currentUser={currentUser}
        onOpenAuthModal={(mode) => handleOpenAuthModal(mode, '')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'store' && (
          <div className="space-y-10 animate-fade-in">
            {/* Hero Section */}
            <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 glass border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Spring Boot 3 + React Hardware Showcase
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Engineered for <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Precision</span>. Built for Scale.
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  Discover professional desktop peripherals, audiophile-grade monitoring, and workplace hardware. Backed by Java 21, Spring Data JPA, and automated Cloud CI/CD.
                </p>
                
                {/* Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                  <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-emerald-400" /> Java 21 Spring Boot 3</span>
                  <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-amber-400" /> 100% Cash on Delivery (COD)</span>
                  <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> 2-Year Replacement Warranty</span>
                </div>
              </div>
            </section>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hardware..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <p>Loading catalog from Spring Boot API...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center glass rounded-2xl p-8 border border-slate-800">
                <p className="text-slate-300 font-medium">No products match your filters</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All" categories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isInCart={cartItems.some(i => i.id === product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <AboutUs onShopNow={() => {
            setActiveTab('store');
            window.history.pushState(null, '', '/');
          }} />
        )}

        {activeTab === 'orders' && currentUser && (
          <MyOrders 
            currentUser={currentUser} 
            onShopNow={() => {
              setActiveTab('store');
              window.history.pushState(null, '', '/');
            }} 
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'ADMIN' && (
          <AdminPanel 
            onLogout={handleLogout} 
            onProductAdded={() => fetchProducts()} 
            onProductUpdated={() => fetchProducts()}
          />
        )}
      </main>

      {/* Slide-out Cart Drawer with Login Enforcement */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderSuccess={() => {
          fetchProducts();
        }}
        currentUser={currentUser}
        onRequireLogin={handleRequireLoginForCheckout}
      />

      {/* Unified User & Admin Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        promptMessage={authModalPrompt}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ZENITH Platform. Developed with Spring Boot 3 + React + Tailwind + Docker.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => { setActiveTab('store'); window.history.pushState(null, '', '/'); }} className="hover:text-emerald-400">Store</button>
            <span>•</span>
            <button onClick={() => { setActiveTab('about'); window.history.pushState(null, '', '/about'); }} className="hover:text-emerald-400">About Us</button>
            <span>•</span>
            {currentUser && currentUser.role !== 'ADMIN' && (
              <>
                <button onClick={() => { setActiveTab('orders'); window.history.pushState(null, '', '/orders'); }} className="hover:text-emerald-400">My Orders</button>
                <span>•</span>
              </>
            )}
            <button 
              onClick={() => {
                if (currentUser?.role === 'ADMIN') {
                  setActiveTab('admin');
                  window.history.pushState(null, '', '/admin');
                } else {
                  handleOpenAuthModal('login', 'Please sign in as Admin to access the Admin Panel (admin / admin123)');
                }
              }} 
              className="hover:text-emerald-400 font-medium"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
