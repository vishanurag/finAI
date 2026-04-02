import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  TrendingUp, Shield, Zap, BarChart3, PieChart,
  ArrowRight, CheckCircle, Star
} from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Smart Expense Tracking',
    desc: 'Automatically categorise and visualise every transaction. Know exactly where your money goes.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    desc: 'Get personalised recommendations backed by machine learning to optimise your spending habits.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    desc: 'Your data is encrypted end-to-end. We never sell your information. Your privacy is our priority.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: PieChart,
    title: 'Budget Planning',
    desc: 'Set monthly budgets by category. Get real-time alerts before you overspend.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: TrendingUp,
    title: 'Wealth Growth',
    desc: 'Track your net worth over time. Visualise progress toward savings goals.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: CheckCircle,
    title: 'Multi-Account Support',
    desc: 'Connect bank accounts, credit cards, and investments in one unified dashboard.',
    color: 'from-cyan-500 to-blue-600',
  },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    avatar: 'PS',
    text: 'FinAI completely transformed how I manage my finances. The AI insights helped me save ₹15,000 in just two months!',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Startup Founder',
    avatar: 'RV',
    text: 'The dashboard is beautiful and the budget tracking is incredibly intuitive. Best finance app I have ever used.',
    rating: 5,
  },
  {
    name: 'Anjali Mehta',
    role: 'Product Manager',
    avatar: 'AM',
    text: 'Finally an app that makes personal finance enjoyable. The charts and reports are stunning and actionable.',
    rating: 5,
  },
]

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '₹200Cr+', label: 'Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9★', label: 'Rating' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden pt-24 pb-32 px-4">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <Zap size={14} />
            AI-Powered Personal Finance
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="gradient-text">Master Your Money</span>
            <br />
            <span className="text-white">with Intelligence</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FinAI brings together smart expense tracking, AI insights, and beautiful visualisations so you can make every rupee count. Start your financial journey today — it's free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in" className="btn-glow inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg">
              Get Started Free
              <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center gap-2 text-slate-300 font-semibold px-8 py-4 rounded-xl border border-white/10 hover:border-indigo-500/40 hover:text-white transition-all">
              See Features
            </Link>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="glass p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-4 h-6 flex-1 bg-white/5 rounded-md max-w-xs" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Balance', value: '₹1,24,500', color: 'text-indigo-400' },
                { label: 'Monthly Income', value: '₹85,000', color: 'text-emerald-400' },
                { label: 'Expenses', value: '₹42,300', color: 'text-red-400' },
                { label: 'Savings Rate', value: '50.2%', color: 'text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 rounded-xl h-32 border border-white/5 flex items-center justify-center text-slate-600 text-sm">
                📈 Spending Chart
              </div>
              <div className="w-40 bg-white/5 rounded-xl h-32 border border-white/5 flex items-center justify-center text-slate-600 text-sm">
                🥧 Categories
              </div>
            </div>
          </div>
          {/* glow */}
          <div className="absolute inset-0 -z-10 bg-indigo-600/10 blur-3xl rounded-3xl" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to <span className="gradient-text">thrive financially</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A complete suite of tools designed to give you full visibility and control over your personal finances.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="glass p-6 stat-card group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4" style={{ background: '#0d0d18' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by <span className="gradient-text">thousands</span>
            </h2>
            <p className="text-slate-400">See what our users have to say about FinAI.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass p-6 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to take <span className="gradient-text">control</span>?
              </h2>
              <p className="text-slate-400 mb-8">Join thousands of Indians who trust FinAI with their financial future. Free forever.</p>
              <Link href="/sign-in" className="btn-glow inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl">
                Start for Free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold gradient-text">FinAI</span>
          </div>
          <p className="text-slate-600 text-sm"> <b className='text-white'>© 2026 FinAI.</b> Built for smart finance.
            <br></br>
            This is a <b className='text-white'>Minor Project Developed by Anurag Vishwakarma (0901CS243D03) & Udipt Kushwaha (0901CS243D12) under the guidance of Prof. Mona Pandey Sharma</b> at Dept. of CSE MITS Gwalior.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
