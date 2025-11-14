#!/usr/bin/env node

/**
 * Sets or resets the admin user's password using the Supabase service role key.
 * This is meant for controlled environments (local dev, trusted CI) only.
 */

import nextEnv from '@next/env'
import { createClient } from '@supabase/supabase-js'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail =
  process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
const adminPassword =
  process.env.ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase URL or service role key in env')
  process.exit(1)
}

if (!adminEmail) {
  console.error('❌ ADMIN_EMAIL (or NEXT_PUBLIC_ADMIN_EMAIL) must be set')
  process.exit(1)
}

if (!adminPassword) {
  console.error('❌ ADMIN_PASSWORD (or E2E_ADMIN_PASSWORD) must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log(`🔐 Ensuring admin user ${adminEmail} exists...`)

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`)
  }

  let adminUser = data.users.find(
    (user) => user.email?.toLowerCase() === adminEmail.toLowerCase()
  )

  const metadataPatch = {
    role: 'admin',
    full_name: adminUser?.user_metadata?.full_name || 'Leyla Admin',
  }

  if (!adminUser) {
    console.log('👤 Admin user not found, creating...')
    const { data: createData, error: createError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: metadataPatch,
      })

    if (createError) {
      throw new Error(`Failed to create admin user: ${createError.message}`)
    }

    adminUser = createData.user ?? undefined
    if (!adminUser) {
      throw new Error('Admin user creation returned no user object')
    }

    console.log('✅ Admin user created')
  } else {
    console.log('🔄 Updating password and metadata...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: adminPassword,
        user_metadata: { ...adminUser.user_metadata, ...metadataPatch },
      }
    )

    if (updateError) {
      throw new Error(`Failed to update admin user: ${updateError.message}`)
    }

    console.log('✅ Admin user updated')
  }

  console.log('⚙️  Ensuring admin profile record exists...')
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: adminUser.id,
    email: adminEmail,
    full_name: metadataPatch.full_name,
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    throw new Error(`Failed to upsert admin profile: ${profileError.message}`)
  }

  console.log('✅ Admin profile ensured')
  console.log('🎉 Done! Share the ADMIN_PASSWORD value with trusted testers.')
}

main().catch((error) => {
  console.error(`❌ ${error.message}`)
  process.exit(1)
})

