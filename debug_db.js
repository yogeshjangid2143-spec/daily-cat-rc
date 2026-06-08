const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
let env = {};
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
} catch (e) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';

async function debug() {
  try {
    const wRes = await fetch(`http://localhost:3000/api/leaderboard?period=weekly`);
    const weekly = await wRes.json();
    console.log('--- WEEKLY API RESPONSE ---');
    console.log(weekly);

    const aRes = await fetch(`http://localhost:3000/api/leaderboard?period=alltime`);
    const alltime = await aRes.json();
    console.log('--- ALLTIME API RESPONSE ---');
    console.log(alltime);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

debug();
