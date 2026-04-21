/*
 * Break-Even ROI Calculator
 * Solo Ads Freedom Stack model: show buyers exactly when they'll profit
 * Placed on /order page to justify ad spend and increase buyer confidence
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, ChevronDown } from "lucide-react";

export default function BreakEvenCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [adSpend, setAdSpend] = useState(50);
  const [cpc, setCpc] = useState(0.45);
  const [convRate, setConvRate] = useState(3);

  const calc = useMemo(() => {
    const clicks = Math.round(adSpend / cpc);
    const sales = Math.round(clicks * (convRate / 100));
    const revenue = sales * 5; // $5 front-end
    const upsellRevenue = sales * 0.35 * 10; // 35% upsell take rate × $10
    const totalRevenue = revenue + upsellRevenue;
    const profit = totalRevenue - adSpend;
    const roi = adSpend > 0 ? ((profit / adSpend) * 100).toFixed(0) : "0";
    const breakEvenSales = Math.ceil(adSpend / (5 + 0.35 * 10));
    const breakEvenClicks = Math.ceil(breakEvenSales / (convRate / 100));
    const epc = clicks > 0 ? (totalRevenue / clicks).toFixed(3) : "0.000";
    return { clicks, sales, revenue, upsellRevenue, totalRevenue, profit, roi, breakEvenSales, breakEvenClicks, epc };
  }, [adSpend, cpc, convRate]);

  const isProfitable = calc.profit >= 0;

  return (
    <div className="border border-border/20 rounded-xl bg-card/10 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-card/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-amber" />
          </div>
          <div className="text-left">
            <p className="text-foreground/85 text-sm font-medium">Solo Ads ROI Calculator</p>
            <p className="text-foreground/40 text-xs">Calculate your break-even point before buying traffic</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-foreground/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/15">
              {/* Inputs */}
              <div className="grid grid-cols-3 gap-4 mt-4 mb-5">
                <div>
                  <label className="text-foreground/50 text-xs mb-1.5 block">Ad Spend ($)</label>
                  <input
                    type="number"
                    value={adSpend}
                    onChange={(e) => setAdSpend(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-card/30 border border-border/30 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-amber/50 transition-colors"
                    min={1}
                    step={10}
                  />
                </div>
                <div>
                  <label className="text-foreground/50 text-xs mb-1.5 block">Cost Per Click ($)</label>
                  <input
                    type="number"
                    value={cpc}
                    onChange={(e) => setCpc(Math.max(0.01, Number(e.target.value)))}
                    className="w-full bg-card/30 border border-border/30 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-amber/50 transition-colors"
                    min={0.01}
                    step={0.05}
                  />
                </div>
                <div>
                  <label className="text-foreground/50 text-xs mb-1.5 block">Conv. Rate (%)</label>
                  <input
                    type="number"
                    value={convRate}
                    onChange={(e) => setConvRate(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-card/30 border border-border/30 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-amber/50 transition-colors"
                    min={0.1}
                    step={0.5}
                  />
                </div>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Clicks", value: calc.clicks.toLocaleString(), icon: TrendingUp },
                  { label: "Sales", value: calc.sales, icon: DollarSign },
                  { label: "Total Revenue", value: `$${calc.totalRevenue.toFixed(2)}`, icon: DollarSign },
                  { label: "EPC", value: `$${calc.epc}`, icon: TrendingUp },
                ].map((item) => (
                  <div key={item.label} className="bg-card/20 border border-border/15 rounded-lg p-3 text-center">
                    <p className="text-foreground/40 text-xs mb-1">{item.label}</p>
                    <p className="text-foreground/90 text-base font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Profit/Loss banner */}
              <div
                className={`rounded-lg p-4 flex items-center justify-between ${
                  isProfitable
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <div>
                  <p className={`text-sm font-semibold ${isProfitable ? "text-green-400" : "text-red-400"}`}>
                    {isProfitable ? `Profit: +$${calc.profit.toFixed(2)}` : `Loss: -$${Math.abs(calc.profit).toFixed(2)}`}
                  </p>
                  <p className="text-foreground/40 text-xs mt-0.5">
                    Break-even: {calc.breakEvenSales} sales ({calc.breakEvenClicks} clicks needed)
                  </p>
                </div>
                <div
                  className={`text-2xl font-bold ${isProfitable ? "text-green-400" : "text-red-400"}`}
                >
                  {isProfitable ? "+" : ""}{calc.roi}%
                  <span className="text-xs font-normal ml-1 text-foreground/40">ROI</span>
                </div>
              </div>

              <p className="text-foreground/30 text-xs mt-3 text-center">
                Assumes 35% upsell take rate on $10 Upsell 1. Adjust inputs to match your traffic source.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
