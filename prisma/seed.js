const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // You need to first sign in with Google to create a user,
  // then you can seed the data.
  //
  // To use this seed after signing in:
  // 1. Run `npm run dev`, sign in with Google
  // 2. Get your user ID from PostgreSQL: SELECT id FROM "User";
  // 3. Replace USER_ID below with your actual user id

  const USER_ID = 'REPLACE_WITH_YOUR_USER_ID'

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: USER_ID } })
  if (!user) {
    console.log('⚠️  User not found. Please sign in first, then update USER_ID in prisma/seed.js')
    return
  }

  console.log(`🌱 Seeding data for user: ${user.name ?? user.email}`)

  // Seed transactions
  const now = new Date()
  const transactions = [
    // Current month income
    { userId: USER_ID, amount: 85000, type: 'income', category: 'Business', description: 'Monthly Salary', date: new Date(now.getFullYear(), now.getMonth(), 1) },
    // Current month expenses
    { userId: USER_ID, amount: 12000, type: 'expense', category: 'Housing', description: 'Rent Payment', date: new Date(now.getFullYear(), now.getMonth(), 2) },
    { userId: USER_ID, amount: 4500, type: 'expense', category: 'Food', description: 'Grocery Shopping', date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { userId: USER_ID, amount: 2200, type: 'expense', category: 'Transport', description: 'Fuel & Commute', date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { userId: USER_ID, amount: 800, type: 'expense', category: 'Coffee', description: 'Café & Drinks', date: new Date(now.getFullYear(), now.getMonth(), 9) },
    { userId: USER_ID, amount: 5800, type: 'expense', category: 'Shopping', description: 'Clothing & Accessories', date: new Date(now.getFullYear(), now.getMonth(), 11) },
    { userId: USER_ID, amount: 1500, type: 'expense', category: 'Health', description: 'Gym Membership', date: new Date(now.getFullYear(), now.getMonth(), 13) },
    { userId: USER_ID, amount: 3200, type: 'expense', category: 'Food', description: 'Restaurant Dining', date: new Date(now.getFullYear(), now.getMonth(), 15) },
    { userId: USER_ID, amount: 7500, type: 'expense', category: 'Travel', description: 'Weekend Trip', date: new Date(now.getFullYear(), now.getMonth(), 17) },
    { userId: USER_ID, amount: 4800, type: 'expense', category: 'Shopping', description: 'Electronics', date: new Date(now.getFullYear(), now.getMonth(), 19) },
  ]

  const lastMonthTransactions = Array.from({ length: 5 }, (_, i) => ({
    userId: USER_ID,
    amount: Math.round((Math.random() * 5000 + 2000) * 100) / 100,
    type: 'expense',
    category: ['Food', 'Shopping', 'Transport', 'Health', 'Coffee'][i],
    description: `Last month expense ${i + 1}`,
    date: new Date(now.getFullYear(), now.getMonth() - 1, i * 5 + 1),
  }))

  await prisma.transaction.createMany({
    data: [...transactions, ...lastMonthTransactions],
    skipDuplicates: true,
  })

  // Seed budgets
  const budgets = [
    { userId: USER_ID, category: 'Food', limit: 8000, spent: 7700, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: USER_ID, category: 'Shopping', limit: 10000, spent: 10600, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: USER_ID, category: 'Transport', limit: 3000, spent: 2200, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: USER_ID, category: 'Housing', limit: 15000, spent: 12000, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: USER_ID, category: 'Health', limit: 2000, spent: 1500, month: now.getMonth() + 1, year: now.getFullYear() },
  ]

  for (const b of budgets) {
    await prisma.budget.upsert({
      where: { userId_category_month_year: { userId: b.userId, category: b.category, month: b.month, year: b.year } },
      update: b,
      create: b,
    })
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
