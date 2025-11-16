import type { SupabaseClient } from '@supabase/supabase-js'
import type { CompoundHerbComponent } from '@/types'

type AnySupabase = SupabaseClient<any, 'public', any>

export type SafetySeverity = 'info' | 'warning' | 'error'

export interface SafetyIssue {
  severity: SafetySeverity
  code: string
  message: string
  herbId?: string | null
  herbName?: string
}

export interface SafetyContext {
  pregnancyStatus?: 'not_pregnant' | 'pregnant' | 'nursing' | 'unsure'
  medications?: string[]
  allergies?: string[]
}

const STATIC_SAFETY_RULES: Record<
  string,
  {
    pregnancy?: 'avoid' | 'caution'
    interactions?: string[]
  }
> = {
  'vitex-berry': {
    pregnancy: 'avoid',
    interactions: ['Hormonal medications'],
  },
  'ashwagandha-root': {
    pregnancy: 'caution',
    interactions: ['Thyroid medications', 'Sedatives'],
  },
  'turmeric-root': {
    interactions: ['Blood thinners'],
  },
  garlic: {
    interactions: ['Blood thinners'],
  },
  'hawthorn-berry': {
    interactions: ['Cardiac medications'],
  },
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry))
  }
  return []
}

function normalizeTextEntries(entries?: string[]) {
  return (entries || []).map((entry) => entry.toLowerCase())
}

export async function checkFormulaSafety({
  supabase,
  formula,
  context,
}: {
  supabase: AnySupabase
  formula: CompoundHerbComponent[]
  context?: SafetyContext
}): Promise<SafetyIssue[]> {
  const productIds = Array.from(
    new Set(formula.map((herb) => herb.product_id).filter(Boolean))
  )

  if (productIds.length === 0) {
    return []
  }

  const [{ data: herbRules }, { data: products }] = await Promise.all([
    supabase
      .from('herb_safety_rules')
      .select('product_id, contraindications, interactions, pregnancy_risk_level')
      .in('product_id', productIds),
    supabase
      .from('products')
      .select('id, name, slug')
      .in('id', productIds),
  ])

  const ruleMap = new Map(
    (herbRules || []).map((rule) => [
      rule.product_id,
      {
        pregnancy: rule.pregnancy_risk_level as 'avoid' | 'caution' | null,
        interactions: normalizeList(rule.interactions),
        contraindications: normalizeList(rule.contraindications),
      },
    ])
  )

  const productMap = new Map((products || []).map((product) => [product.id, product]))
  const issues: SafetyIssue[] = []
  const medicationText = normalizeTextEntries(context?.medications)
  const allergyText = normalizeTextEntries(context?.allergies)

  for (const herb of formula) {
    if (!herb.product_id) continue
    const product = productMap.get(herb.product_id)
    const slug = product?.slug
    const rule = ruleMap.get(herb.product_id)
    const staticRule = slug ? STATIC_SAFETY_RULES[slug] : undefined

    const pregnancyRisk = rule?.pregnancy || staticRule?.pregnancy
    if (
      pregnancyRisk &&
      context?.pregnancyStatus &&
      context.pregnancyStatus !== 'not_pregnant'
    ) {
      issues.push({
        severity: pregnancyRisk === 'avoid' ? 'error' : 'warning',
        code: 'PREGNANCY',
        herbId: herb.product_id,
        herbName: product?.name,
        message:
          pregnancyRisk === 'avoid'
            ? `${product?.name ?? 'This herb'} should be avoided during pregnancy or nursing.`
            : `${product?.name ?? 'This herb'} requires practitioner oversight during pregnancy or nursing.`,
      })
    }

    const interactions = [
      ...(rule?.interactions ?? []),
      ...(staticRule?.interactions ?? []),
    ]

    if (interactions.length > 0 && medicationText.length > 0) {
      issues.push({
        severity: 'warning',
        code: 'MEDICATION',
        herbId: herb.product_id,
        herbName: product?.name,
        message: `${product?.name ?? 'This herb'} may interact with: ${interactions.join(
          ', '
        )}. Review before dispensing.`,
      })
    }

    if (allergyText.length > 0) {
      const herbName = (product?.name || '').toLowerCase()
      if (herbName && allergyText.some((entry) => herbName.includes(entry))) {
        issues.push({
          severity: 'error',
          code: 'ALLERGY',
          herbId: herb.product_id,
          herbName: product?.name,
          message: `${product?.name ?? 'This herb'} matches an allergy noted in the intake.`,
        })
      }
    }
  }

  return issues
}

export function aggregateSafetySeverity(issues: SafetyIssue[]): SafetySeverity {
  if (issues.some((issue) => issue.severity === 'error')) {
    return 'error'
  }

  if (issues.some((issue) => issue.severity === 'warning')) {
    return 'warning'
  }

  return 'info'
}
