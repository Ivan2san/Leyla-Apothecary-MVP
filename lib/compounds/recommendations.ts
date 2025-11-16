import type { SupabaseClient } from '@supabase/supabase-js'
import type { GuidedRecommendation, GuidedHerbSuggestion } from '@/types'
import type { GuidedAssessmentInput } from '@/lib/validations/assessments'

interface HerbRule {
  slug: string
  name: string
  startPercentage: number
  minPercentage: number
  maxPercentage: number
  notes?: string
  avoidDuringPregnancy?: boolean
}

const GOAL_LIBRARY: Record<string, HerbRule[]> = {
  sleep: [
    {
      slug: 'valerian-root',
      name: 'Valerian Root',
      startPercentage: 30,
      minPercentage: 20,
      maxPercentage: 40,
      notes: 'Deep calm + sleep onset',
    },
    {
      slug: 'passionflower',
      name: 'Passionflower',
      startPercentage: 25,
      minPercentage: 15,
      maxPercentage: 35,
      notes: 'Quiet racing thoughts',
    },
    {
      slug: 'lemon-balm',
      name: 'Lemon Balm',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 30,
      notes: 'Mood lifting nervine',
    },
    {
      slug: 'ashwagandha-root',
      name: 'Ashwagandha Root',
      startPercentage: 15,
      minPercentage: 10,
      maxPercentage: 25,
      notes: 'Night-time adaptogen for busy minds',
    },
  ],
  stress: [
    {
      slug: 'ashwagandha-root',
      name: 'Ashwagandha',
      startPercentage: 30,
      minPercentage: 20,
      maxPercentage: 35,
      notes: 'Adaptogen for cortisol balance',
    },
    {
      slug: 'lemon-balm',
      name: 'Lemon Balm',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 25,
    },
    {
      slug: 'passionflower',
      name: 'Passionflower',
      startPercentage: 15,
      minPercentage: 10,
      maxPercentage: 20,
    },
    {
      slug: 'hawthorn-berry',
      name: 'Hawthorn Berry',
      startPercentage: 10,
      minPercentage: 5,
      maxPercentage: 20,
      notes: 'Circulatory support for anxious hearts',
    },
  ],
  digestion: [
    {
      slug: 'ginger-root',
      name: 'Ginger Root',
      startPercentage: 25,
      minPercentage: 15,
      maxPercentage: 35,
    },
    {
      slug: 'peppermint',
      name: 'Peppermint',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 30,
      notes: 'Gas + bloating support',
    },
    {
      slug: 'fennel-seed',
      name: 'Fennel Seed',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 25,
    },
    {
      slug: 'burdock-root',
      name: 'Burdock Root',
      startPercentage: 15,
      minPercentage: 5,
      maxPercentage: 20,
      notes: 'Liver + lymph support',
    },
  ],
  immunity: [
    {
      slug: 'elderberry',
      name: 'Elderberry',
      startPercentage: 30,
      minPercentage: 20,
      maxPercentage: 35,
    },
    {
      slug: 'echinacea',
      name: 'Echinacea',
      startPercentage: 25,
      minPercentage: 15,
      maxPercentage: 30,
      notes: 'Acute immune activation',
    },
    {
      slug: 'astragalus-root',
      name: 'Astragalus',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 25,
      notes: 'Long-term immune resilience',
    },
    {
      slug: 'garlic',
      name: 'Garlic',
      startPercentage: 10,
      minPercentage: 5,
      maxPercentage: 15,
      notes: 'Broad antimicrobial',
    },
  ],
  energy: [
    {
      slug: 'astragalus-root',
      name: 'Astragalus',
      startPercentage: 25,
      minPercentage: 15,
      maxPercentage: 30,
    },
    {
      slug: 'turmeric-root',
      name: 'Turmeric Root',
      startPercentage: 15,
      minPercentage: 10,
      maxPercentage: 20,
      notes: 'Inflammation + joint support',
    },
    {
      slug: 'ginger-root',
      name: 'Ginger Root',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 25,
    },
    {
      slug: 'vitex-berry',
      name: 'Vitex Berry',
      startPercentage: 15,
      minPercentage: 5,
      maxPercentage: 20,
      notes: 'Hormone-friendly tone for cycling fatigue',
      avoidDuringPregnancy: true,
    },
  ],
  detox: [
    {
      slug: 'burdock-root',
      name: 'Burdock Root',
      startPercentage: 25,
      minPercentage: 15,
      maxPercentage: 30,
      notes: 'Lymphatic drainage + skin clarity',
    },
    {
      slug: 'calendula',
      name: 'Calendula',
      startPercentage: 20,
      minPercentage: 10,
      maxPercentage: 25,
      notes: 'Moves lymph and soothes tissue',
    },
    {
      slug: 'turmeric-root',
      name: 'Turmeric Root',
      startPercentage: 15,
      minPercentage: 10,
      maxPercentage: 25,
      notes: 'Inflammation + liver support',
    },
    {
      slug: 'red-raspberry-leaf',
      name: 'Red Raspberry Leaf',
      startPercentage: 15,
      minPercentage: 5,
      maxPercentage: 20,
      notes: 'Uterine tone + mineral support',
      avoidDuringPregnancy: true,
    },
  ],
}

const FALLBACK_RULES: HerbRule[] = [
  {
    slug: 'lemon-balm',
    name: 'Lemon Balm',
    startPercentage: 25,
    minPercentage: 15,
    maxPercentage: 35,
  },
  {
    slug: 'ginger-root',
    name: 'Ginger Root',
    startPercentage: 20,
    minPercentage: 10,
    maxPercentage: 30,
  },
  {
    slug: 'burdock-root',
    name: 'Burdock Root',
    startPercentage: 15,
    minPercentage: 5,
    maxPercentage: 25,
  },
]

type AnySupabase = SupabaseClient<any, 'public', any>

export async function generateGuidedRecommendations(
  payload: GuidedAssessmentInput,
  supabase: AnySupabase
): Promise<GuidedRecommendation> {
  const combinedRules = payload.goals.flatMap((goal) => GOAL_LIBRARY[goal] ?? [])
  const dedupedRules: HerbRule[] = []
  const seen = new Set<string>()

  for (const rule of combinedRules) {
    if (seen.has(rule.slug)) continue
    dedupedRules.push(rule)
    seen.add(rule.slug)
    if (dedupedRules.length >= 5) break
  }

  if (dedupedRules.length === 0) {
    dedupedRules.push(...FALLBACK_RULES)
  } else if (dedupedRules.length < 3) {
    dedupedRules.push(
      ...FALLBACK_RULES.filter((rule) => !seen.has(rule.slug)).slice(
        0,
        3 - dedupedRules.length
      )
    )
  }

  const slugs = dedupedRules.map((rule) => rule.slug)
  const productMap = new Map<string, { id: string; name: string; contraindications: string[] | null }>()

  if (slugs.length > 0) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, slug, name, contraindications')
      .in('slug', slugs)

    if (error) {
      console.error('Failed to load herb metadata:', error)
    } else if (products) {
      products.forEach((product) => {
        productMap.set(product.slug, {
          id: product.id,
          name: product.name,
          contraindications: product.contraindications,
        })
      })
    }
  }

  const suggested_herbs: GuidedHerbSuggestion[] = dedupedRules.map((rule) => {
    const product = productMap.get(rule.slug)
    return {
      product_id: product?.id ?? null,
      slug: rule.slug,
      name: product?.name ?? rule.name,
      start_percentage: rule.startPercentage,
      min_percentage: rule.minPercentage,
      max_percentage: rule.maxPercentage,
      notes: rule.notes,
    }
  })

  const warnings: GuidedRecommendation['warnings'] = []

  if (payload.medications.length > 0) {
    warnings.push({
      code: 'MEDICATIONS',
      message: 'Review potential herb-medication interactions before finalizing this blend.',
    })
  }

  if (payload.pregnancy_status !== 'not_pregnant') {
    const riskyHerbs = dedupedRules.filter((rule) => rule.avoidDuringPregnancy).map((rule) => rule.name)
    if (riskyHerbs.length > 0) {
      warnings.push({
        code: 'PREGNANCY',
        message: `The following herbs need practitioner approval during pregnancy or lactation: ${riskyHerbs.join(', ')}.`,
      })
    }
  }

  if (payload.sensitivities.includes('avoid_alcohol')) {
    warnings.push({
      code: 'ALCOHOL_BASE',
      message: 'Current compounds use alcohol extractions. Flag this for glycerite conversion before bottling.',
    })
  }

  const primary_goal = payload.goals[0] ?? 'custom'
  const summary = `Focus: ${primary_goal}. Supporting goals: ${payload.goals.slice(1).join(', ') || 'n/a'}.`

  return {
    primary_goal,
    suggested_herbs,
    warnings,
    metadata: {
      goals: payload.goals,
      pregnancy_status: payload.pregnancy_status,
      stimulant_sensitivity: payload.stimulant_sensitivity,
      sleep_quality: payload.sleep_quality,
      summary,
    },
  }
}
