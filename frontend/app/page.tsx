"use client";

import Link from "next/link";
import { Coffee, QrCode, ClipboardList, TrendingUp, ArrowRight, Check } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-crema-50 text-espresso-900 selection:bg-primary-300/60 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-espresso-950/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <div className="">
              {/* <Coffee className="w-5 h-5 text-espresso-950" /> */}
              <img src="/images/logo.png" alt="Coffee" className="w-10 h-10" />
            </div>
            <span className="text-lg font-display font-semibold tracking-tight text-crema-50">
              Roast<span className="text-primary-400">&amp;Ticket</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:inline-flex text-crema-100 hover:bg-crema-50/10">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="gap-2">
                Get started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — dark roast */}
      <section className="relative bg-espresso-950 pt-32 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-25 bg-primary-500 rounded-[100%] blur-[130px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-primary-400 font-mono text-xs tracking-[0.2em] uppercase mb-6 border border-primary-400/30 rounded-full px-3 py-1">
              Order to close-out, one counter
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-crema-50 mb-6 leading-[1.05]">
              Run your cafe the way you'd run the counter&nbsp;
              <span className="italic text-primary-400">&mdash; by hand, at scale.</span>
            </h1>
            <p className="max-w-lg text-lg text-crema-200/80 mb-10 leading-relaxed">
              QR menus, live tickets, table status and daily takings — in one screen your staff will actually enjoy using.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/register">
                <Button className="h-13 px-7 text-base shadow-xl shadow-primary-600/20 hover:-translate-y-0.5 transition-transform">
                  Open your cafe
                </Button>
              </Link>
              <Link href="#features" className="text-crema-200/70 hover:text-crema-50 text-sm font-medium underline underline-offset-4 decoration-crema-200/30">
                See how it works
              </Link>
            </div>
          </div>

          {/* Signature: a live order ticket */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 bg-primary-500/10 blur-2xl rounded-3xl" />
            <div className="ticket-edge ticket-edge-dark relative bg-espresso-900 pt-4 pb-6 px-6 rounded-b-2xl shadow-2xl rotate-[-2deg] font-mono text-crema-100">
              <div className="flex justify-between items-baseline text-xs text-crema-100/50 uppercase tracking-widest mb-4">
                <span>Table 07</span>
                <span>#A182</span>
              </div>
              <ul className="space-y-2 text-sm border-t border-b border-dashed border-crema-100/20 py-4">
                <li className="flex justify-between"><span>2&times; Cold Brew</span><span>240.00</span></li>
                <li className="flex justify-between"><span>1&times; Croissant</span><span>110.00</span></li>
                <li className="flex justify-between"><span>1&times; Cortado</span><span>150.00</span></li>
              </ul>
              <div className="flex justify-between items-baseline mt-4 text-primary-400 font-semibold text-lg">
                <span className="font-sans text-xs text-crema-100/50 uppercase tracking-widest self-center">Total</span>
                <span>&#8377;500.00</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-leaf-500 text-xs">
                <Check className="w-3.5 h-3.5" /> Fired to kitchen &middot; 0:04
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-crema-50 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-primary-600 font-mono text-xs tracking-[0.2em] uppercase mb-3">What's on the counter</h2>
            <h3 className="text-3xl md:text-4xl font-display font-semibold text-espresso-900">Three screens. Nothing extra.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-espresso-900/10 rounded-2xl overflow-hidden border border-espresso-900/10">
            <FeatureCard
              icon={<QrCode className="w-6 h-6 text-primary-600" />}
              title="Digital QR menus"
              description="Every table gets its own code. Guests scan, browse a menu that looks like yours, and order from their phone."
            />
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6 text-primary-600" />}
              title="Live tickets"
              description="Orders land on the dashboard the moment they're placed. Accept, fire, or cancel without leaving the counter."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
              title="Daily takings"
              description="Revenue, table turnover and your best sellers, tracked automatically — no spreadsheet at closing time."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-espresso-950 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary-400" />
            <span className="text-base font-display font-semibold text-crema-50">
              Roast<span className="text-primary-400">&amp;Ticket</span>
            </span>
          </div>
          <p className="text-crema-200/40 text-sm font-mono">
            &copy; {new Date().getFullYear()} &mdash; built for the counter, not the boardroom.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-crema-50 p-8 hover:bg-crema-100/60 transition-colors">
      <div className="bg-primary-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
        {icon}
      </div>
      <h4 className="text-lg font-display font-semibold text-espresso-900 mb-2.5">{title}</h4>
      <p className="text-espresso-900/60 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
