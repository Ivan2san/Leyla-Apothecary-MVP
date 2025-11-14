import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'

loadEnvConfig(process.cwd())

async function ensureAdminUser() {
  const adminEmail = process.env.E2E_ADMIN_EMAIL
  const adminPassword = process.env.E2E_ADMIN_PASSWORD
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!adminEmail || !adminPassword) {
    console.warn('[e2e:setup] Skipping admin seed - missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD')
    return
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[e2e:setup] Skipping admin seed - missing Supabase URL or service role key')
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const listResult = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (listResult.error) {
    throw new Error(`[e2e:setup] Failed to list users: ${listResult.error.message}`)
  }

  const existingUser = listResult.data?.users?.find(
    (user) => user.email?.toLowerCase() === adminEmail.toLowerCase()
  )

  const baseMetadata = {
    role: 'admin',
    full_name: 'E2E Admin',
  }

  let adminUser = existingUser

  if (!adminUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: baseMetadata,
    })

    if (error) {
      throw new Error(`[e2e:setup] Failed to create admin user: ${error.message}`)
    }

    adminUser = data.user ?? undefined
  } else {
    const { error } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: adminPassword,
      user_metadata: { ...adminUser.user_metadata, ...baseMetadata },
    })

    if (error) {
      throw new Error(`[e2e:setup] Failed to update admin user: ${error.message}`)
    }
  }

  if (!adminUser) {
    throw new Error('[e2e:setup] Admin user could not be created or updated')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: adminUser.id,
      email: adminEmail,
      full_name: (adminUser.user_metadata?.full_name as string) || baseMetadata.full_name,
      updated_at: new Date().toISOString(),
    })

  if (profileError) {
    throw new Error(`[e2e:setup] Failed to upsert admin profile: ${profileError.message}`)
  }
}

async function globalSetup() {
  await ensureAdminUser()
}

export default globalSetup
