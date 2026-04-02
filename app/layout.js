import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'FinAI – Smart Finance Dashboard',
  description: 'AI-powered personal finance tracker. Track expenses, manage budgets, and get intelligent insights about your money.',
  keywords: 'finance, budget, expense tracker, AI, personal finance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
