import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DashboardClient from './DashboardClient'
import prisma from '@/lib/prisma'

export const metadata = {
  title: 'Dashboard – FinAI',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/sign-in')

  const userId = session.user.id

  // Fetch transactions (latest 10)
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 10,
  })

  // Fetch budgets for current month/year
  const now = new Date()
  const budgets = await prisma.budget.findMany({
    where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
  })

  // Aggregate: total income, total expenses this month
  const thisMonth = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      userId,
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    },
    _sum: { amount: true },
  })

  // Monthly spending for last 6 months (for chart)
  const sixMonths = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const result = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'expense',
          date: {
            gte: new Date(d.getFullYear(), d.getMonth(), 1),
            lt: new Date(d.getFullYear(), d.getMonth() + 1, 1),
          },
        },
        _sum: { amount: true },
      })
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        amount: result._sum.amount || 0,
      }
    })
  )

  // Category breakdown (expenses)
  const byCategory = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      userId,
      type: 'expense',
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    },
    _sum: { amount: true },
  })

  // Medium breakdown (expenses)
  const byMedium = await prisma.transaction.groupBy({
    by: ['medium'],
    where: {
      userId,
      type: 'expense',
      date: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    },
    _sum: { amount: true },
  })

  const income = thisMonth.find((r) => r.type === 'income')?._sum.amount ?? 0
  const expenses = thisMonth.find((r) => r.type === 'expense')?._sum.amount ?? 0

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      <Navbar />
      <DashboardClient
        user={session.user}
        transactions={JSON.parse(JSON.stringify(transactions))}
        budgets={JSON.parse(JSON.stringify(budgets))}
        income={income}
        expenses={expenses}
        sixMonths={sixMonths}
        byCategory={JSON.parse(JSON.stringify(byCategory))}
        byMedium={JSON.parse(JSON.stringify(byMedium))}
      />
    </div>
  )
}
