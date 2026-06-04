const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function generateDuscoNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DUS-${code}`;
}

async function getUniqueDuscoNumber() {
  let duscoNumber;
  let exists = true;
  while (exists) {
    duscoNumber = generateDuscoNumber();
    const { data } = await supabase.from('users').select('id').eq('dusco_number', duscoNumber).maybeSingle();
    exists = !!data;
  }
  return duscoNumber;
}

module.exports = { supabase, generateDuscoNumber, getUniqueDuscoNumber };
