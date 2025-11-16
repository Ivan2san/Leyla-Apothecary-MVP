import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CompoundHerbComponent,
  CompoundPricingRule,
  CompoundTier,
} from '@/types'

type AnySupabase = SupabaseClient<any, 'public', any>

export interface PriceBreakdown {
  price: number
  baseCost: number
  marginApplied: number
  rule: CompoundPricingRule
  bottleVolumeMl: number
}

export async function fetchPricingRule(
  supabase: AnySupabase,
  tier: CompoundTier
) {
  const { data, error } = await supabase
    .from('compound_pricing_rules')
    .select('*')
    .eq('tier', tier)
    .single()

  if (error || !data) {
    throw new Error(
      `Pricing rule not configured for tier ${tier}: ${error?.message ?? 'missing record'}`
    )
  }

  return data as CompoundPricingRule
}

export function clampPrice(
  value: number,
  rule: CompoundPricingRule,
  bottleVolumeMl: number = 100
) {
  const scale = bottleVolumeMl / 100
  const min = Number(rule.min_price_per_100ml) * scale
  const max = Number(rule.max_price_per_100ml) * scale

  if (!isFinite(min) || !isFinite(max)) {
    return value
  }

  return Math.min(Math.max(value, min), max)
}

export async function calculateCompoundPrice({
  supabase,
  formula,
  tier,
  bottleVolumeMl = 100,
}: {
  supabase: AnySupabase
  formula: CompoundHerbComponent[]
  tier: CompoundTier
  bottleVolumeMl?: number
}): Promise<PriceBreakdown> {
  if (!formula || formula.length === 0) {
    throw new Error('Formula must include at least one herb.')
  }

  const rule = await fetchPricingRule(supabase, tier)
  const productIds = Array.from(
    new Set(formula.map((herb) => herb.product_id).filter(Boolean))
  )

  const { data: products, error } = await supabase
    .from('products')
    .select('id, price, volume_ml')
    .in('id', productIds)

  if (error) {
    throw new Error(`Unable to load product pricing: ${error.message}`)
  }

  const productMap = new Map(
    (products || []).map((product) => [
      product.id,
      {
        price: Number(product.price),
        volume_ml: Number(product.volume_ml || 100),
      },
    ])
  )

  let baseCost = 0
  for (const herb of formula) {
    if (!herb.product_id) continue
    const product = productMap.get(herb.product_id)
    if (!product || !isFinite(product.price) || !isFinite(product.volume_ml)) {
      continue
    }

    const perMl = product.price / product.volume_ml
    const herbVolume = (herb.percentage / 100) * bottleVolumeMl
    baseCost += perMl * herbVolume
  }

  const margin = Number(rule.default_margin ?? 0)
  const rawPrice = baseCost * (1 + margin)
  const finalPrice = clampPrice(rawPrice, rule, bottleVolumeMl)

  return {
    price: Number(finalPrice.toFixed(2)),
    baseCost: Number(baseCost.toFixed(2)),
    marginApplied: margin,
    rule,
    bottleVolumeMl,
  }
}

export function formatPriceBreakdown(breakdown: PriceBreakdown) {
  return {
    price: breakdown.price.toFixed(2),
    baseCost: breakdown.baseCost.toFixed(2),
    margin: `${Math.round(breakdown.marginApplied * 100)}%`,
    tierRange: `${breakdown.rule.min_price_per_100ml}-${breakdown.rule.max_price_per_100ml} per 100ml`,
  }
}
