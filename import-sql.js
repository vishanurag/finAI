const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync('finai.sql', 'utf8');
  const lines = sql.split('\n');

  let currentTable = null;
  let columns = [];
  const tableData = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('COPY public.')) {
      const match = line.match(/COPY public\."?(\w+)"?\s*\((.*?)\)\s*FROM stdin;/i);
      if (match) {
        currentTable = match[1];
        columns = match[2].split(',').map(c => c.trim().replace(/"/g, ''));
        if (!tableData[currentTable]) tableData[currentTable] = [];
      }
    } else if (line === '\\.') {
      currentTable = null;
      columns = [];
    } else if (currentTable && line) {
      const values = line.split('\t');
      const data = {};
      for (let j = 0; j < columns.length; j++) {
        const val = values[j];
        data[columns[j]] = val === '\\N' ? null : val;
      }
      tableData[currentTable].push(data);
    }
  }
  
  const order = ['User', 'Account', 'Session', 'Budget', 'Transaction', 'VerificationToken'];
  for (const table of order) {
    if (!tableData[table]) continue;
    console.log(`Importing ${tableData[table].length} rows into ${table}...`);
    for (const data of tableData[table]) {
      const keys = Object.keys(data).map(k => `"${k}"`).join(', ');
      const vals = Object.values(data).map(v => v === null ? 'NULL' : `'${v.replace(/'/g, "''")}'`).join(', ');
      try {
        await prisma.$executeRawUnsafe(`INSERT INTO "${table}" (${keys}) VALUES (${vals}) ON CONFLICT DO NOTHING`);
      } catch (e) {
        console.error(`Failed to insert into ${table}:`, e.message);
      }
    }
  }
  console.log("Import completed!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
