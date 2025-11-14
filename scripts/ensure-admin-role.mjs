#!/usr/bin/env node

/**
 * Ensures the configured admin user has role metadata and a profile.
 * Uses SUPABASE_SERVICE_ROLE_KEY, so keep this script in trusted environments only.
 */

import nextEnv from '@next/env'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const { loadEnvConfig } = nextEnv
  loadEnvConfig(process.cwd())

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail =
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL or NEXT_PUBLIC_ADMIN_EMAIL is required')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`🔎 Looking for admin user ${adminEmail}...`)

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`)
  }

  const adminUser = data.users.find(
    (user) => user.email?.toLowerCase() === adminEmail.toLowerCase()
  )

  if (!adminUser) {
    throw new Error(
      `Admin user ${adminEmail} was not found in Supabase. Create it first.`
    )
  }

  const existingRole = adminUser.user_metadata?.role?.toString().toLowerCase()
  if (existingRole === 'admin' || existingRole === 'superadmin') {
    console.log('✅ Admin role already set')
  } else {
    console.log('⚙️  Updating user metadata with admin role...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        user_metadata: {
          ...adminUser.user_metadata,
          role: 'admin',
          full_name:
            adminUser.user_metadata?.full_name || 'Leyla Admin',
        },
      }
    )

    if (updateError) {
      throw new Error(`Failed to update admin role: ${updateError.message}`)
    }

    console.log('✅ Admin metadata updated')
  }

  console.log('⚙️  Ensuring admin profile record exists...')
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: adminUser.id,
    email: adminEmail,
    full_name:
      adminUser.user_metadata?.full_name ||
      'Leyla Admin',
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    throw new Error(`Failed to upsert admin profile: ${profileError.message}`)
  }

  console.log('✅ Admin profile ensured')
}

main().catch((err) => {
  console.error(`❌ ${err.message}`)
  process.exit(1)
})
