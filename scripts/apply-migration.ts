/**
 * Script to apply database migrations to Supabase
 * Run with: npx tsx scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration(migrationPath: string) {
  console.log(`Applying migration: ${migrationPath}`)

  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('Migration failed:', error)
      return false
    }

    console.log('Migration applied successfully!')
    return true
  } catch (err) {
    console.error('Error applying migration:', err)
    return false
  }
}

async function main() {
  const migrationFile = process.argv[2] || 'supabase/migrations/20250112010000_fix_orders_schema.sql'
  const migrationPath = path.join(process.cwd(), migrationFile)

  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  console.log('Reading migration file...')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log('Executing SQL directly...')

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: statement + ';' })

      if (error) {
        console.error('Error executing statement:', error)
        console.log('Statement:', statement.substring(0, 100) + '...')
        // Continue with next statement
      } else {
        console.log('✓ Statement executed')
      }
    } catch (err: any) {
      console.error('Exception:', err.message)
    }
  }

  console.log('\nMigration process complete. Please verify in Supabase dashboard.')
}

main().catch(console.error)
