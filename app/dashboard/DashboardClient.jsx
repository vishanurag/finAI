'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ShoppingCart, Utensils, Car, Home, Briefcase,
  Coffee, Plane, Heart, Upload, Loader2, Sparkles
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const CATEGORY_ICONS = {
  Food: Utensils, Shopping: ShoppingCart, Transport: Car,
  Housing: Home, Business: Briefcase, Coffee: Coffee,
  Travel: Plane, Health: Heart, Other: Wallet,
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16']

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const formatDate = (d) => {
  const date = new Date(d)
  const day = String(date.getDate()).padStart(2, '0')
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

export default function DashboardClient({
  user, transactions, budgets, income, expenses, sixMonths, byCategory, byMedium = []
}) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [aiInsight, setAiInsight] = useState(null)
  const [uiMetrics, setUiMetrics] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (data.count === 0) {
          alert('Could not find any recognizable transaction formats in this PDF.')
        } else {
          if (data.insights) {
             setAiInsight(data.insights)
          }
          if (data.metrics) {
             setUiMetrics(data.metrics)
          }
          router.refresh()
        }
      } else {
        alert(data.error || 'Failed to parse statement.')
      }
    } catch (error) {
      console.error(error)
      alert('Error uploading file')
    } finally {
      setUploading(false)
    }
  }
  const displayIncome = uiMetrics?.income ?? income
  const displayExpenses = uiMetrics?.expense ?? expenses
  const displayBalance = uiMetrics?.totalBalance ?? (income - expenses)
  const savingsRate = displayIncome > 0 ? (((displayIncome - displayExpenses) / displayIncome) * 100).toFixed(1) : 0

  const statCards = [
    {
      label: 'Total Balance',
      value: formatCurrency(displayBalance),
      icon: Wallet,
      color: 'from-indigo-500 to-blue-600',
      change: '+12.5%',
      up: true,
    },
    {
      label: 'Monthly Income',
      value: formatCurrency(displayIncome),
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      change: '+5.2%',
      up: true,
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(displayExpenses),
      icon: TrendingDown,
      color: 'from-red-500 to-rose-600',
      change: '-3.1%',
      up: false,
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate}%`,
      icon: PiggyBank,
      color: 'from-amber-500 to-orange-600',
      change: '+2.4%',
      up: true,
    },
  ]

  const pieData = byCategory.map((b) => ({
    name: b.category,
    value: b._sum.amount,
  }))

  const pieMediumData = byMedium.map((b) => ({
    name: b.medium || 'Other',
    value: b._sum.amount,
  }))

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'User'}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s your financial overview for this month</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <input 
              type="file" 
              accept="application/pdf" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-medium rounded-xl transition-all duration-200 shadow-lg disabled:opacity-70"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span className="hidden sm:inline">{uploading ? 'Analyzing...' : 'Upload Bank Statement'}</span>
            </button>
          </div>
          {user?.image && (
            <Image
              src={user.image}
              alt="avatar"
              width={48}
              height={48}
              className="rounded-full ring-2 ring-indigo-500"
            />
          )}
        </div>
      </div>

      {/* AI Insight Panel */}
      {aiInsight && (
        <div className="mb-8 relative overflow-hidden rounded-2xl glass p-6 border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                ChatGPT Insight
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">NEW</span>
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">
                {aiInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="glass stat-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon size={18} className="text-white" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {s.change}
              </span>
            </div>
            <p className="text-slate-400 text-xs mb-1">{s.label}</p>
            <p className="text-white text-lg sm:text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Area Chart Row */}
      <div className="glass p-6 mb-8">
        <h2 className="text-white font-semibold mb-6">Spending Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={sixMonths}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#818cf8' }}
              formatter={(v) => [formatCurrency(v), 'Expenses']}
            />
            <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: '#6366f1', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Category Pie */}
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-6">Expenses by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v) => [formatCurrency(v)]}
                />
                <Legend
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-2">
              <PiggyBank size={40} className="text-slate-600" />
              <p className="text-slate-500 text-sm">No expense data yet</p>
            </div>
          )}
        </div>

        {/* Medium Pie */}
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-6">Expenses by Medium</h2>
          {pieMediumData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieMediumData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieMediumData.map((_, i) => (
                    <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} /> // Offset colors for distinction
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v) => [formatCurrency(v)]}
                />
                <Legend
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center gap-2">
              <Wallet size={40} className="text-slate-600" />
              <p className="text-slate-500 text-sm">No transaction medium data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Transactions + Budgets */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-5">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <Wallet size={40} className="text-slate-600" />
              <p className="text-slate-500 text-sm">No transactions yet</p>
              <p className="text-slate-600 text-xs">Add your first transaction to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => {
                const Icon = CATEGORY_ICONS[t.category] || Wallet
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                      <Icon size={16} className={t.type === 'income' ? 'text-emerald-400' : 'text-red-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.description}</p>
                      <p className="text-slate-500 text-xs">{t.category} · {formatDate(t.date)}</p>
                    </div>
                    <p className={`text-sm font-semibold flex-shrink-0 ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Budget Progress */}
        <div className="glass p-6">
          <h2 className="text-white font-semibold mb-5">Monthly Budgets</h2>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <PiggyBank size={40} className="text-slate-600" />
              <p className="text-slate-500 text-sm">No budgets configured</p>
              <p className="text-slate-600 text-xs">Set up budgets to track your spending limits</p>
            </div>
          ) : (
            <div className="space-y-5">
              {budgets.map((b) => {
                const pct = Math.min((b.spent / b.limit) * 100, 100)
                const isOver = b.spent > b.limit
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-medium">{b.category}</p>
                      <p className={`text-xs font-semibold ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                      </p>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-slate-600 mt-1">{pct.toFixed(0)}% used</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
