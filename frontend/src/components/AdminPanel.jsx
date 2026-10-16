import React, { useEffect, useState } from 'react';
import { 
  DollarSign, ShoppingCart, Package, TrendingUp, RefreshCw, 
  Clock, LogOut, CheckCircle2, Truck, Box, Plus, ShieldCheck, 
  Banknote, Tag, Filter, Phone, MapPin, AlertCircle, 
  UploadCloud, FolderOpen, Trash2, ExternalLink, Edit3, Layers, 
  Image as ImageIcon, Eye, Star, Check
} from 'lucide-react';
import FileUploader from './FileUploader';

export default function AdminPanel({ onLogout, onProductAdded, onProductUpdated }) {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'catalog' | 'media'
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Audio',
    imageUrl: '/images/headphones.jpg',
    stockQuantity: 25,
    rating: 4.8,
    featured: true
  });

  // Edit Product Modal State (Full Product Editing)
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const presets = [
    { label: 'Studio ANC Headphones', path: '/images/headphones.jpg' },
    { label: 'Mechanical Keyboard', path: '/images/keyboard.jpg' },
    { label: 'Precision Mouse', path: '/images/mouse.jpg' },
    { label: '4K OLED Monitor', path: '/images/monitor.jpg' },
    { label: 'Smart Desk Lamp', path: '/images/lamp.jpg' },
    { label: 'Studio Speakers', path: '/images/speakers.jpg' },
    { label: 'Stealth Desk Mat', path: '/images/deskmat.jpg' },
    { label: 'Ultra Pro Webcam', path: '/images/webcam.jpg' },
    { label: 'Wireless Earbuds', path: '/images/earbuds.jpg' },
    { label: 'Ergonomic Laptop Riser', path: '/images/stand.jpg' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes, productsRes, mediaRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/uploads')
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      if (ordersRes.ok) {
        const orderData = await ordersRes.json();
        setOrders(orderData);
      }
      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setCatalogProducts(prodData);
      }
      if (mediaRes.ok) {
        const filesData = await mediaRes.json();
        setMediaFiles(filesData);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/status?status=${encodeURIComponent(newStatus)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Order #${orderId} status changed to ${newStatus.replace(/_/g, ' ')}`);
        fetch('/api/analytics').then(r => r.json()).then(d => setAnalytics(d)).catch(() => {});
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Could not update status: ' + err.message);
      fetchData();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stockQuantity: parseInt(newProduct.stockQuantity),
          rating: parseFloat(newProduct.rating || 4.8),
          featured: !!newProduct.featured
        })
      });

      if (res.ok) {
        setShowAddProduct(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: 'Audio',
          imageUrl: '/images/headphones.jpg',
          stockQuantity: 25,
          rating: 4.8,
          featured: true
        });
        fetchData();
        if (onProductAdded) onProductAdded();
        if (onProductUpdated) onProductUpdated();
        showToast('New product created! Live on website storefront.');
      }
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  // Full Product Edit Handler
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingProduct(true);

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: parseFloat(editingProduct.price),
          category: editingProduct.category,
          imageUrl: editingProduct.imageUrl,
          stockQuantity: parseInt(editingProduct.stockQuantity),
          rating: parseFloat(editingProduct.rating),
          featured: !!editingProduct.featured
        })
      });

      if (res.ok) {
        showToast(`"${editingProduct.name}" updated! Changes are live on website.`);
        setEditingProduct(null);
        fetchData();
        if (onProductUpdated) onProductUpdated();
        if (onProductAdded) onProductAdded();
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Removed "${name}" from catalog.`);
        fetchData();
        if (onProductUpdated) onProductUpdated();
        if (onProductAdded) onProductAdded();
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleDeleteMediaFile = async (fileName) => {
    if (!confirm(`Are you sure you want to delete file "${fileName}"?`)) return;
    try {
      const res = await fetch(`/api/uploads/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Deleted ${fileName}`);
        setMediaFiles(prev => prev.filter(f => f.fileName !== fileName));
      }
    } catch (err) {
      alert('Failed to delete file: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'CONFIRMED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const cards = [
    {
      title: 'Gross Revenue (INR)',
      value: formatINR(analytics?.totalRevenue),
      icon: Banknote,
      color: 'from-emerald-500/20 to-emerald-500/5',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Total Dispatched Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500/20 to-blue-500/5',
      textColor: 'text-blue-400',
    },
    {
      title: 'Active Hardware SKUs',
      value: `${catalogProducts.length || analytics?.totalProducts || 0} Products`,
      icon: Package,
      color: 'from-purple-500/20 to-purple-500/5',
      textColor: 'text-purple-400',
    },
    {
      title: 'Uploaded Media Assets',
      value: `${mediaFiles.length} Files`,
      icon: UploadCloud,
      color: 'from-amber-500/20 to-amber-500/5',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in py-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Admin Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Merchant Admin Control Center
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Staff Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Storefront Operations, Product Catalog Management & Order Fulfillment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl glass-card border border-slate-800 bg-gradient-to-b ${c.color} relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2 rounded-xl bg-slate-900/60 ${c.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Orders & COD Pipeline ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'catalog'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Edit Products & Catalog ({catalogProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('media')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'media'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>File Uploader & Media Storage ({mediaFiles.length})</span>
        </button>
      </div>

      {/* TAB 1: Order Fulfillment & Status Management */}
      {activeSubTab === 'orders' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-emerald-400" />
                Customer Orders & Cash on Delivery Fulfillment
              </h3>
              <p className="text-xs text-slate-400">View customer contact numbers, delivery addresses, and change delivery status with instant feedback.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              {orders.length} Total Orders Placed
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer & Contact</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount (COD)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">#{ord.id}</td>
                    
                    {/* Customer & Phone */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.customerEmail}</div>
                      {ord.phoneNumber && (
                        <a 
                          href={`tel:${ord.phoneNumber}`}
                          className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 hover:underline font-mono"
                        >
                          <Phone className="w-3 h-3" /> {ord.phoneNumber}
                        </a>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 text-slate-300 max-w-[180px] truncate" title={ord.shippingAddress}>
                      {ord.shippingAddress}
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 text-slate-300">
                      {ord.items && ord.items.length > 0 ? (
                        <span className="font-medium text-slate-200">
                          {ord.items.map(it => `${it.productName} (x${it.quantity})`).join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-500">No items</span>
                      )}
                    </td>

                    {/* Amount & COD */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{formatINR(ord.totalAmount)}</div>
                      <div className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Banknote className="w-2.5 h-2.5" /> Cash on Delivery
                      </div>
                      {ord.promoCode && (
                        <div className="text-[10px] text-emerald-400 font-mono">
                          Code: {ord.promoCode} (-{formatINR(ord.discountAmount)})
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(ord.status)}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={ord.status}
                          disabled={updatingOrderId === ord.id}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Catalog & Full Product Editor */}
      {activeSubTab === 'catalog' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Live Product Catalog & Editor
              </h3>
              <p className="text-xs text-slate-400">
                Click <strong>"Edit Product"</strong> to change title, price, description, category, stock, or upload a new image. Changes reflect immediately on the storefront.
              </p>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl"
            >
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {catalogProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative group">
                    <img 
                      src={prod.imageUrl} 
                      alt={prod.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        {prod.category}
                      </span>
                      {prod.featured && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Featured
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5" title={prod.name}>
                      {prod.name}
                    </h4>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">
                      {formatINR(prod.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span>Stock: <strong className="text-slate-300">{prod.stockQuantity}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" /> {prod.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live on Store
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingProduct({ ...prod })}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Product
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: File Uploader & Media Storage */}
      {activeSubTab === 'media' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              Manual File Uploader & Storage Gallery
            </h3>
            <p className="text-xs text-slate-400">
              Drag & drop or select images from your local computer. Files are stored directly in local Zenith uploads storage and served via Spring Boot.
            </p>
          </div>

          {/* Direct File Uploader Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Upload New Local File
            </h4>
            <FileUploader
              onUploadSuccess={(url, fileData) => {
                showToast('File uploaded successfully! Available in media storage.');
                fetchData();
              }}
              label="Click or Drag & Drop Image Here to Upload"
              description="Upload files from your computer (JPG, PNG, WEBP, GIF). Same will be served at /api/uploads/..."
            />
          </div>

          {/* Media Files Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Uploaded Files ({mediaFiles.length})
              </h4>
              <button
                onClick={fetchData}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Media
              </button>
            </div>

            {mediaFiles.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                No files manually uploaded yet. Use the uploader above to upload your first image!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-2 group"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative">
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate" title={file.fileName}>
                        {file.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-900">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
                        title="View Full Image"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          setNewProduct({
                            ...newProduct,
                            imageUrl: file.url
                          });
                          setShowAddProduct(true);
                        }}
                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-semibold"
                      >
                        Create Product
                      </button>
                      <button
                        onClick={() => handleDeleteMediaFile(file.fileName)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                        title="Delete File"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setEditingProduct(null)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                Edit Product
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                SKU #{editingProduct.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Update pricing, title, description, category, stock inventory, or replace image.
            </p>

            <form onSubmit={handleUpdateProduct} className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Displays">Displays</option>
                    <option value="Workspace">Workspace</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={editingProduct.rating}
                    onChange={(e) => setEditingProduct({ ...editingProduct, rating: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="featuredEditCheck"
                  checked={!!editingProduct.featured}
                  onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="featuredEditCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Feature this hardware on the storefront homepage
                </label>
              </div>

              {/* Image Uploader */}
              <div className="space-y-2 pt-1">
                <label className="text-xs text-slate-300 block">Product Image</label>
                <FileUploader
                  compact
                  defaultUrl={editingProduct.imageUrl}
                  onUploadSuccess={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                  label="Upload Replacement Image from Computer"
                  description="Choose or drop any image file to update this product."
                />
              </div>

              {/* Presets swatch buttons */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Or Pick From Hardware Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: p.path })}
                      className={`px-2 py-1.5 rounded-lg text-[11px] text-left truncate transition-colors border ${
                        editingProduct.imageUrl === p.path
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20"
                  >
                    {isSavingProduct ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PRODUCT */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddProduct(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Add New Product to Catalog</h3>
            <p className="text-xs text-slate-400">Save a new hardware SKU directly to the Spring Boot database. Upload a file manually or choose from presets.</p>
            
            <form onSubmit={handleCreateProduct} className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Zenith Titanium Cable Organizer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Precision milled cable weight with magnetic anchors..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                    placeholder="2999"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Displays">Displays</option>
                    <option value="Workspace">Workspace</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={newProduct.rating}
                    onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Integrated File Uploader */}
              <div className="pt-1">
                <label className="text-xs text-slate-300 block mb-1">Upload Product Image File</label>
                <FileUploader
                  compact
                  defaultUrl={newProduct.imageUrl}
                  onUploadSuccess={(url) => {
                    setNewProduct({ ...newProduct, imageUrl: url });
                  }}
                  label="Upload Hardware Image from Computer"
                  description="Choose or drop any image file. It will be stored and used as the product image."
                />
              </div>

              {/* Clean Preset Selectors */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Or Choose Hardware Preset</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, imageUrl: p.path })}
                      className={`px-2 py-1.5 rounded-lg text-[11px] text-left truncate transition-colors border ${
                        newProduct.imageUrl === p.path
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20"
                >
                  Save & Publish to Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
