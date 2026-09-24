const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Prefer the service-role key. It bypasses row level security, which is what
// lets migration 003 enable deny-all RLS on every table — locking the anon key
// out of the database entirely — without changing a line of application logic.
// See docs/RLS_DESIGN.md.
//
// The fallback to the anon key keeps this deploy safe to ship before the new
// key is configured. It is NOT safe to enable RLS while running on the
// fallback: with no service-role key and no policies, every query would be
// denied. The startup log below says which mode is active.
const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

if (usingServiceRole) {
  console.log('Supabase: service-role key (RLS bypassed — deny-all RLS can be enabled)');
} else {
  console.warn('Supabase: anon key — set SUPABASE_SERVICE_ROLE_KEY before enabling RLS');
}

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
