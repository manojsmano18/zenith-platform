import React from 'react';
import {
  Sparkles, Shield, Cpu, Award, Zap, Users, Globe2,
  ArrowRight, Banknote, RefreshCw, CheckCircle2, HeartHandshake, Headphones
} from 'lucide-react';

export default function AboutUs({ onShopNow }) {
  const values = [
    {
      icon: Cpu,
      title: "Aircraft-Grade CNC Machining",
      desc: "Every keyboard frame, audio enclosure, and monitor chassis is sculpted from solid billets of 6061-T6 aluminum, sandblasted, and anodized to resist oxidation and tactile wear."
    },
    {
      icon: Headphones,
      title: "Studio-Grade Acoustic Fidelity",
      desc: "Our headphones and reference desktop monitors undergo multi-point anechoic frequency calibration to ensure true neutral sound curves and zero distortion under peak load."
    },
    {
      icon: Banknote,
      title: "100% Cash on Delivery (COD)",
      desc: "We stand by our product quality before asking for a single rupee. Inspect your hardware package at your doorstep and pay with cash or UPI directly upon physical arrival."
    },
    {
      icon: Shield,
      title: "2-Year Hardware Replacement Warranty",
      desc: "Every mechanical keyboard, display, and headset includes an unconditional 24-month replacement warranty backed by our domestic service centers across 40+ major Indian cities."
    }
  ];

  const highlights = [
    { title: "Zero Prepayment Risk", desc: "No credit card needed upfront. Order with confidence via COD." },
    { title: "Pan-India Express Logistics", desc: "48-to-72 hour insured doorstep dispatch via priority air express." },
    { title: "15-Day Hassle-Free Returns", desc: "If you don't love the tactile feel or sound signature, return it no questions asked." },
    { title: "Carbon Neutral Footprint", desc: "100% biodegradable fiber packaging and 10-year repairable modular component design." }
  ];

  const stats = [
    { label: "Hardware Enthusiasts in India", value: "75,000+" },
    { label: "Pincodes Covered via COD", value: "19,000+" },
    { label: "Acoustic Tuning Patents", value: "24" },
    { label: "Average Customer Rating", value: "4.9 / 5.0" }
  ];

  return (
    <div className="space-y-16 animate-fade-in py-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden p-8 sm:p-16 glass border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Designed for Creators, Gamers & Engineers
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Obsessive Precision. <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Zero Compromise</span>.
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg leading-relaxed">
            ZENITH is an engineering collective dedicated to building the most refined computer hardware in India. We combine aerospace materials, audiophile acoustics, and transparent Cash on Delivery logistics to elevate your daily digital workstation.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={onShopNow}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 text-sm"
            >
              Shop the Collection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Numerical Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 text-center">
            <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">{s.value}</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Core Engineering Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">The Zenith Difference</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Why professional creators and technical leaders choose Zenith hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800 flex gap-4 hover:border-emerald-500/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Customer Trust & Logistics Policy */}
      <section className="glass rounded-3xl p-8 sm:p-12 border border-slate-800 bg-slate-900/60 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Doorstep Assurance</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Our 4-Way Customer Guarantee</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Ordering hardware online should never involve doubt. That's why we eliminated prepayment anxiety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, index) => (
            <div key={index} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">{h.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
