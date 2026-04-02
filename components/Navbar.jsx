'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { TrendingUp, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FinAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-indigo-500/40"
                    />
                  )}
                  <span className="text-sm text-slate-300">{session.user?.name?.split(' ')[0]}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <Link href="/sign-in" className="btn-glow text-sm font-medium text-white px-5 py-2 rounded-lg">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-3">
          {status === 'authenticated' ? (
            <>
              <Link href="/dashboard" className="block text-sm text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block text-sm text-red-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/sign-in" className="block text-sm text-indigo-400" onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
