import React, { useEffect, useState } from 'react';
import { 
  Package, Clock, CheckCircle2, Truck, MapPin, Phone, 
  Banknote, Sparkles, RefreshCw, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function MyOrders({ currentUser, onShopNow }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const fetchUserOrders = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/user?email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [currentUser]);

  // Stepper helper
  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 1;
    }
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received by Zenith' },
    { label: 'Confirmed', desc: 'Stock reserved' },
    { label: 'Shipped', desc: 'In express transit' },
    { label: 'Out for Delivery', desc: 'Courier nearby' },
    { label: 'Delivered', desc: 'Doorstep arrival' },
  ];

  return (
    <div className="space-y-8 animate-fade-in py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass rounded-2xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            My Orders & Doorstep Tracking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Signed in as <span className="text-slate-200 font-semibold">{currentUser.fullName}</span> ({currentUser.email})
          </p>
        </div>

        <button
          onClick={fetchUserOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Tracking
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p>Retrieving your order fulfillment records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center glass rounded-3xl p-8 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-600">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any hardware orders yet. Browse our audio and workspace collection with 100% Cash on Delivery!
          </p>
          <button
            onClick={onShopNow}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => {
            const currentStep = getStepIndex(ord.status);
            const isCancelled = ord.status === 'CANCELLED';

            return (
              <div 
                key={ord.id}
                className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl p-6 sm:p-8 space-y-6"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-bold text-white">Order #{ord.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ord.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : ord.status === 'SHIPPED'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : ord.status === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block font-medium">Total Amount Due (COD)</span>
                    <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                      {formatINR(ord.totalAmount)}
                    </span>
                    {ord.promoCode && (
                      <span className="text-[11px] text-emerald-400/90 block font-medium">
                        Coupon {ord.promoCode} applied (-{formatINR(ord.discountAmount)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Progress Stepper (Only if not cancelled) */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {steps.map((st, sidx) => {
                        const isCompleted = sidx <= currentStep;
                        const isCurrent = sidx === currentStep;

                        return (
                          <div key={sidx} className="relative flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : sidx + 1}
                            </div>
                            <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-emerald-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                              {st.label}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                              {st.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                    This order was cancelled.
                  </div>
                )}

                {/* Items & Delivery Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80 text-xs">
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Package Items</span>
                    <div className="space-y-2">
                      {ord.items?.map((it) => (
                        <div key={it.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{it.productName}</span>
                          <div className="text-right">
                            <span className="text-slate-400 text-[11px] block">Qty: {it.quantity}</span>
                            <span className="font-mono text-emerald-400 font-bold">{formatINR(it.price * it.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Payment Info */}
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3 h-fit">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Delivery Snapshot</span>
                    
                    <div className="space-y-2 text-slate-300">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ord.shippingAddress}</span>
                      </div>

                      {ord.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-mono font-medium">{ord.phoneNumber}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-amber-300 font-semibold">
                        <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Pay via Cash / UPI on Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
