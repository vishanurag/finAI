import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

// Helper function to parse PDF visually using X/Y coordinates to preserve tabular columns
const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json')
      const pdfParser = new PDFParser() // default mode to get full JSON structure
      
      pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError))
      pdfParser.on('pdfParser_dataReady', pdfData => {
        let visualTextContent = ''
        
        for (const page of pdfData.Pages) {
          // Group text elements by their Y coordinate (rounded for slight alignment offsets)
          const rows = {}
          for (const item of page.Texts) {
            const y = Math.round(item.y * 2) / 2 // round to nearest 0.5
            if (!rows[y]) rows[y] = []
            rows[y].push(item)
          }
          
          // Process rows from top to bottom
          const sortedY = Object.keys(rows).map(Number).sort((a, b) => a - b)
          for (const y of sortedY) {
            // Sort elements left to right
            const rowItems = rows[y].sort((a, b) => a.x - b.x)
            let rowText = ''
            let lastX = -1
            
            for (const item of rowItems) {
               const str = decodeURIComponent(item.R[0].T)
               if (lastX !== -1) {
                  const gap = item.x - lastX
                  // If there is a wide visual gap, add a distinctive column separator (|)
                  if (gap > 1.5) {
                    rowText += '   |   '
                  } else {
                    rowText += ' '
                  }
               }
               rowText += str
               lastX = item.x + (str.length * 0.3) // rough approximation of text block width
            }
            visualTextContent += rowText.trim() + '\n'
          }
        }
        resolve(visualTextContent)
      })
      
      pdfParser.parseBuffer(buffer)
    } catch (error) {
      reject(error)
    }
  })
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Convert file to buffer for pdf2json
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse the PDF text
    let text = ''
    try {
      text = await extractTextFromPDF(buffer)
      text = decodeURIComponent(text).trim()
    } catch (parseError) {
      console.error('PDF parsing error:', parseError)
      return NextResponse.json({ error: 'Failed to read the PDF content.' }, { status: 500 })
    }

    if (!text) {
      return NextResponse.json({ error: 'PDF appears to be empty or an unreadable image.' }, { status: 400 })
    }

    // Connect to OpenAI API
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured in environment variables.' }, { status: 500 })
    }

    const { OpenAI } = require('openai')
    const openai = new OpenAI({ apiKey })

    const prompt = `You are a financial AI assistant processing an extracted Indian bank statement.
Your tasks:
1. Extract ALL valid financial transactions.
2. DO NOT provide or include any sensitive details like Account Numbers, IFSC codes, Customer IDs, branch addresses, or names. Only extract transaction data.
3. Categorize each transaction into exactly one of these categories: "Food", "Shopping", "Transport", "Housing", "Business", "Travel", "Health", or "Other". 
4. Further analyze the transaction to determine the payment medium used, such as "UPI", "ATM Cash", "Bank Transfer", "Cheque", or "Other".
5. Determine if it is an "income" or "expense" transaction.
6. Provide a high-level financial insight aiming at optimizing or decreasing future expenses based on these transactions.

You MUST respond strictly in JSON format matching the following structure exactly:
{
  "insights": "Your high level insight... (Include the total current balance left between the first and last transaction. Also state the total monthly income (total credit amount) and total monthly expenses (total debit amount).)",
  "metrics": {
    "totalBalance": 12849.54,
    "income": 10012.00,
    "expense": 1163.25
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Short legible description",
      "amount": 1500,
      "type": "expense",
      "category": "Shopping",
      "medium": "UPI"
    }
  ]
}

Here is the raw extracted text from the PDF statement:
========================
${text.substring(0, 30000)}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise financial data extraction AI that outputs only correct JSON. The text below has been visually reconstructed from a structured PDF table where distinct columns are separated by ' | '. Pay EXTREMELY close attention to the column headers (e.g., Credit vs Debit columns). Also, crucially note that the text substring 'CR' or '/CR/' explicitly means Credit (Income), and 'DR' or '/DR/' explicitly means Debit (Expense)." },
        { role: "user", content: prompt + `\n\nCRITICAL: You MUST accurately calculate the total balance flow from start to finish, and the sum of all incomes and expenses, placing them logically exactly within the \`metrics\` object node.` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    })

    const responseText = response.choices[0].message.content

    // Clean up response if it wraps in \`\`\`json
    let parsedData = null
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedData = JSON.parse(cleanJson)
    } catch (e) {
      console.error("Failed to parse JSON from ChatGPT:", e)
      return NextResponse.json({ error: 'Failed to interpret AI response.' }, { status: 500 })
    }

    if (!parsedData || !parsedData.transactions) {
      return NextResponse.json({ error: 'No transactions found by AI.' }, { status: 400 })
    }

    // Insert these parsed transactions into the database
    for (let i = 0; i < parsedData.transactions.length; i++) {
      const item = parsedData.transactions[i]
      
      let txDate = new Date()
      if (item.date) {
        let d = new Date(item.date)
        if (!isNaN(d.getTime())) {
          txDate = d
        }
      }

      await prisma.transaction.create({
        data: {
          userId: session.user.id,
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
          type: item.type === 'income' ? 'income' : 'expense',
          category: item.category || 'Other',
          medium: item.medium || 'Other',
          description: (item.description || 'Bank Transaction').substring(0, 50),
          date: txDate,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Statement parsed successfully via ChatGPT', 
      count: parsedData.transactions.length,
      insights: parsedData.insights,
      metrics: parsedData.metrics
    })

  } catch (error) {
    console.error('File upload error:', error)
    if (error.message?.includes('429') || error.status === 429) {
      return NextResponse.json({ error: 'Your OpenAI API Key has exceeded its usage quota. Please check your billing details on platform.openai.com.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to process statement via ChatGPT API.' }, { status: 500 })
  }
}
