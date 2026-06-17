
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function generateRecoveryLink() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: 'madalinciolacu2019@gmail.com',
  });

  if (error) {
    console.error("Error generating link:", error.message);
  } else {
    console.log("Recovery Link generated:");
    console.log(data.properties.action_link);
  }
}

generateRecoveryLink();
