/**
 * Run migration via Supabase Management API SQL endpoint
 * POST https://api.supabase.com/v1/projects/{ref}/database/query
 */
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'ceaarwxcqoacmynozlzy';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlYWFyd3hjcW9hY215bm96bHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzg4OTA0NSwiZXhwIjoyMDk5NDY1MDQ1fQ.Ao6WLPrGOzK7HhXq2tNnDd04FRgk2HStEd0UQQ4xIVU';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

async function runMigration() {
  const sqlPath = path.join(__dirname, 'supabase', 'migrations', '008_student_journey_tracking.sql');
  const fullSQL = fs.readFileSync(sqlPath, 'utf-8');

  console.log('🚀 Running migration 008_student_journey_tracking.sql...\n');

  // Try the Supabase SQL execution endpoint (used by Supabase Studio)
  // This endpoint accepts raw SQL and uses the service role key
  const endpoints = [
    // Studio SQL endpoint
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    // pg-meta query endpoint  
    `${SUPABASE_URL}/pg/query`,
    // Alternative pg-meta
    `${SUPABASE_URL}/pg-meta/default/query`,
  ];

  let success = false;

  for (const endpoint of endpoints) {
    console.log(`Trying endpoint: ${endpoint}`);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'x-connection-encrypted': 'true',
        },
        body: JSON.stringify({ query: fullSQL }),
      });

      const status = res.status;
      const text = await res.text();
      
      if (status >= 200 && status < 300) {
        console.log(`✅ Migration executed successfully via ${endpoint}`);
        console.log(`Response: ${text.substring(0, 500)}`);
        success = true;
        break;
      } else {
        console.log(`❌ Status ${status}: ${text.substring(0, 300)}\n`);
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}\n`);
    }
  }

  if (!success) {
    console.log('\n⚠️  Automated SQL execution not available via REST API.');
    console.log('📋 MANUAL STEP REQUIRED:');
    console.log('   1. Open: https://supabase.com/dashboard/project/ceaarwxcqoacmynozlzy/sql');
    console.log('   2. Paste the contents of: supabase/migrations/008_student_journey_tracking.sql');
    console.log('   3. Click "Run"\n');
    console.log('   Alternatively, I will try using supabase-js to create tables via inserts...\n');
    
    // Fallback: Create tables one by one using supabase-js rpc if a helper function exists
    // Since we can't run DDL via REST, let's verify if tables already exist
    console.log('📋 Checking if tables already exist...\n');
  }

  // Verify tables regardless
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  
  const tables = ['drivers', 'vehicles', 'bus_stops', 'student_stops', 'driver_trips', 'student_journey', 'journey_alerts'];
  let allExist = true;
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error && error.message.includes('schema cache')) {
      console.log(`   ❌ ${table}: NOT FOUND`);
      allExist = false;
    } else if (error) {
      console.log(`   ⚠️  ${table}: ${error.message}`);
      allExist = false;
    } else {
      console.log(`   ✅ ${table}: exists (${data.length} rows)`);
    }
  }

  if (allExist) {
    console.log('\n🎉 All 7 tables verified successfully!');
    
    // Also check seed data
    console.log('\n📋 Checking seed data...');
    const { data: drivers } = await supabase.from('drivers').select('name');
    console.log(`   Drivers: ${(drivers || []).map(d => d.name).join(', ') || 'None'}`);
    
    const { data: vehicles } = await supabase.from('vehicles').select('bus_identifier');
    console.log(`   Vehicles: ${(vehicles || []).map(v => v.bus_identifier).join(', ') || 'None'}`);
    
    const { data: stops } = await supabase.from('bus_stops').select('stop_name, stop_order').order('stop_order');
    console.log(`   Stops: ${(stops || []).map(s => `${s.stop_order}.${s.stop_name}`).join(' → ') || 'None'}`);
    
    const { data: mappings } = await supabase.from('student_stops').select('student_id, stop_id');
    console.log(`   Student-Stop Mappings: ${(mappings || []).length}`);
  } else {
    console.log('\n❌ Some tables are missing. Please run the migration manually.');
  }
}

runMigration().catch(console.error);
