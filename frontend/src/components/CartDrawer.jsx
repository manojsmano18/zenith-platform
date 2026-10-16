import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CheckCircle2, 
  Lock, UserCheck, Tag, Banknote, Sparkles, Phone, MapPin 
} from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  currentUser,
  onRequireLogin
}) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (currentUser?.shippingAddress) {
      setAddress(currentUser.shippingAddress);
    }
    if (currentUser?.phoneNumber) {
      setPhone(currentUser.phoneNumber);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const formatINR = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate Discount
  let discount = 0;
  if (appliedPromo === 'ZENITH10') {
    discount = subtotal * 0.10;
  } else if (appliedPromo === 'WELCOME500' && subtotal >= 2000) {
    discount = 500;
  } else if (appliedPromo === 'SUPERDEAL') {
    discount = subtotal * 0.20;
  }
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    setPromoError('');

    if (code === 'ZENITH10') {
      setAppliedPromo('ZENITH10');
      setPromoInput('ZENITH10');
    } else if (code === 'WELCOME500') {
      if (subtotal < 2000) {
        setPromoError('WELCOME500 requires minimum cart value of ₹2,000');
        return;
      }
      setAppliedPromo('WELCOME500');
      setPromoInput('WELCOME500');
    } else if (code === 'SUPERDEAL') {
      setAppliedPromo('SUPERDEAL');
      setPromoInput('SUPERDEAL');
    } else {
      setPromoError('Invalid coupon code. Try ZENITH10 or WELCOME500');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoInput('');
    setPromoError('');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    if (cartItems.length === 0) return;
    if (!phone.trim()) {
      alert('Please enter your contact phone number for the delivery agent.');
      return;
    }
    if (!address.trim()) {
      alert('Please enter your complete doorstep shipping address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: currentUser.fullName || 'Registered Customer',
        customerEmail: currentUser.email,
        phoneNumber: phone.trim(),
        shippingAddress: address.trim(),
        promoCode: appliedPromo || null,
        paymentMethod: 'Cash on Delivery',
        status: 'CONFIRMED',
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const orderData = await response.json();
      setCompletedOrder(orderData);
      onClearCart();
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Your Cart 
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {completedOrder ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Order Confirmed!</h3>
                <p className="text-sm text-slate-400">
                  Thank you, <span className="text-slate-200 font-medium">{completedOrder.customerName}</span>. Your order <span className="font-mono text-emerald-400 font-bold">#{completedOrder.id}</span> is confirmed.
                </p>
                
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5" /> Cash on Delivery (COD)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payable on Arrival:</span>
                    <span className="text-emerald-400 font-bold text-sm">{formatINR(completedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Contact Phone:</span>
                    <span className="text-slate-200 font-mono font-medium">{completedOrder.phoneNumber}</span>
                  </div>
                  {completedOrder.promoCode && (
                    <div className="flex justify-between text-slate-400">
                      <span>Promo Applied:</span>
                      <span className="text-emerald-400 font-mono font-semibold">{completedOrder.promoCode} (-{formatINR(completedOrder.discountAmount)})</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Destination:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{completedOrder.shippingAddress}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    onClose();
                  }}
                  className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg font-medium text-slate-300">Your cart is empty</p>
                <p className="text-sm mt-1">Explore our store and add high performance gear!</p>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3.5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 items-center">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-lg object-cover bg-slate-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                        <p className="text-xs text-emerald-400 font-bold mt-0.5">{formatINR(item.price)}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-slate-200">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Promo Code Box */}
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" /> Apply Coupon Code
                    </span>
                    {appliedPromo && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Coupon Active
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ZENITH10"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      disabled={!!appliedPromo}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                    />
                    {appliedPromo ? (
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-rose-400">{promoError}</p>
                  )}

                  {!appliedPromo && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('ZENITH10')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> ZENITH10 (10% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo('WELCOME500')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-800 flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> WELCOME500 (₹500 OFF)
                      </button>
                    </div>
                  )}
                </div>

                {/* Authentication & Shipping Details */}
                {currentUser ? (
                  <form id="checkout-form" onSubmit={handleCheckout} className="pt-2 space-y-3">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Customer Account:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> {currentUser.fullName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    </div>

                    {/* Phone Number Input */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Contact Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Required for courier delivery SMS & call.</span>
                    </div>

                    {/* Address Input */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Doorstep Delivery Address <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <textarea
                          required
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="House / Flat No, Street, Landmark, City, State, Pincode"
                        />
                      </div>
                    </div>

                    {/* Cash on Delivery Notice */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
                      <Banknote className="w-5 h-5 shrink-0 text-amber-400" />
                      <div>
                        <span className="font-bold block">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-amber-400/80">Pay with Cash or UPI to the courier agent when delivered.</span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="pt-2 space-y-3">
                    <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-500/20 text-center space-y-2">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account Required to Order</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Please sign in or register to enable Cash on Delivery checkout and doorstep tracking.
                      </p>
                      <button
                        type="button"
                        onClick={onRequireLogin}
                        className="w-full mt-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
                      >
                        Sign In / Register to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Summary */}
          {!completedOrder && cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-semibold">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({appliedPromo})</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Method</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5" /> Cash on Delivery (FREE)
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Net Payable (COD)</span>
                  <span className="text-emerald-400 font-mono">{formatINR(finalTotal)}</span>
                </div>
              </div>

              {currentUser ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm"
                >
                  {isSubmitting ? 'Placing COD Order...' : (
                    <>
                      Place Cash on Delivery Order <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireLogin}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Sign In to Place Order
                </button>
              )}
              
              <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Prepayment • Pay upon physical delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
