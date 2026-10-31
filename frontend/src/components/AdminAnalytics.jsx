import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, RefreshCw, Clock } from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p>Crunching live telemetry & sales figures...</p>
      </div>
    );
  }

  const formatINR = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  const cards = [
    {
      title: 'Total Revenue',
      value: formatINR(analytics?.totalRevenue),
      icon: DollarSign,
      color: 'from-emerald-500/20 to-emerald-500/5',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Completed Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500/20 to-blue-500/5',
      textColor: 'text-blue-400',
    },
    {
      title: 'Average Order Value (AOV)',
      value: formatINR(analytics?.averageOrderValue),
      icon: TrendingUp,
      color: 'from-purple-500/20 to-purple-500/5',
      textColor: 'text-purple-400',
    },
    {
      title: 'Catalog Size',
      value: `${analytics?.totalProducts || 0} SKUs`,
      icon: Package,
      color: 'from-amber-500/20 to-amber-500/5',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Merchant Performance & Sales Telemetry</h2>
          <p className="text-sm text-slate-400">Live analytics calculated directly from Spring Boot 3 & PostgreSQL.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-xl border border-slate-800 transition-colors w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
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

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing SKUs */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Top Revenue Contributors</h3>
          <p className="text-xs text-slate-400">Products generating the highest total volume.</p>

          <div className="space-y-4 mt-4">
            {analytics?.topSellingProducts?.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate max-w-[250px]">
                    {idx + 1}. {item.productName}
                  </span>
                  <span className="text-emerald-400 font-bold">{formatINR(item.revenue)} ({item.totalSold} sold)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(15, (item.revenue / (analytics.totalRevenue || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Order Stream */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Recent Order Activity
          </h3>
          <p className="text-xs text-slate-400">Latest transactions dispatched through backend.</p>

          <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1">
            {analytics?.recentOrders?.map((ord) => (
              <div
                key={ord.id}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{ord.id}</span>
                    <span className="text-sm font-semibold text-slate-200">{ord.customerName}</span>
                  </div>
                  <span className="text-xs text-slate-500 block truncate max-w-[200px]">
                    {ord.items?.length || 0} items • {ord.shippingAddress}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white block">{formatINR(ord.totalAmount)}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
