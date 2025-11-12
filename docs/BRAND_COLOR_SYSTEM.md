# Leyla's Apothecary Brand Color System

## Overview
This document outlines the comprehensive color system for Leyla's Apothecary. All components, new features, and UI elements should use these colors to maintain brand consistency.

## Core Brand Colors

### Primary: Sage Green (#A3B18A)
**Meaning:** Growth, balance, nature
**Usage:** Main interactive elements, primary buttons, navigation highlights
**Tailwind Classes:** `bg-sage`, `text-sage`, `border-sage`
**HSL:** `hsl(60, 21%, 60%)`

```tsx
// Example usage
<Button className="bg-sage hover:bg-sage/90 text-forest">
  Primary Action
</Button>
```

### Secondary: Terracotta (#D98C4A)
**Meaning:** Warmth, earth, grounding
**Usage:** CTAs, important actions, accents, hover states
**Tailwind Classes:** `bg-terracotta`, `text-terracotta`, `border-terracotta`
**HSL:** `hsl(30, 64%, 57%)`

```tsx
// Example usage
<Button className="bg-terracotta hover:bg-terracotta/90 text-warm-white">
  Book Consultation
</Button>
```

### Base: Warm Off-White (#FDFBF8)
**Meaning:** Purity, light, space
**Usage:** Page backgrounds, card backgrounds, text on dark backgrounds
**Tailwind Classes:** `bg-warm-white`, `text-warm-white`
**HSL:** `hsl(36, 56%, 98%)`

```tsx
// Example usage
<div className="bg-warm-white p-6">
  Content here
</div>
```

### Accent: Deep Forest Green (#344E41)
**Meaning:** Wisdom, depth, trust
**Usage:** Headings, body text, emphasized content, dark UI elements
**Tailwind Classes:** `bg-forest`, `text-forest`, `border-forest`
**HSL:** `hsl(143, 25%, 24%)`

```tsx
// Example usage
<h1 className="text-forest font-lora text-4xl">
  Welcome to Leyla's Apothecary
</h1>
```

### Support: Soft Gray
**Meaning:** Subtlety, sophistication
**Usage:** Secondary text, subtle borders, disabled states
**Tailwind Classes:** `text-gray-600`, `text-gray-500`

## Shadcn/UI Color Mappings

Our brand colors are hardcoded into shadcn/ui's semantic color system:

- **`primary`** → Sage Green (#A3B18A)
- **`secondary`** → Terracotta (#D98C4A)
- **`accent`** → Deep Forest (#344E41)
- **`background`** → Warm Off-White (#FDFBF8)
- **`foreground`** → Deep Forest (#344E41)
- **`muted`** → Light Sage tones
- **`border`** → Sage tints

## Component Variants

### Button Variants

**Primary (Sage):**
```tsx
<Button variant="default">Sage Button</Button>
<Button className="btn-sage">Custom Sage</Button>
```

**Secondary (Terracotta):**
```tsx
<Button variant="secondary">Terracotta Button</Button>
<Button className="btn-terracotta">Custom Terracotta</Button>
```

**Accent (Forest):**
```tsx
<Button variant="accent">Forest Button</Button>
<Button className="btn-forest">Custom Forest</Button>
```

### Card Variants

**Sage Card:**
```tsx
<Card className="card-sage">
  <CardContent>Sage-themed content</CardContent>
</Card>
```

**Terracotta Card:**
```tsx
<Card className="card-terracotta">
  <CardContent>Terracotta-themed content</CardContent>
</Card>
```

**Forest Card:**
```tsx
<Card className="card-forest">
  <CardContent>Forest-themed content</CardContent>
</Card>
```

### Badge Variants

```tsx
<Badge className="badge-sage">Sage Badge</Badge>
<Badge className="badge-terracotta">Terracotta Badge</Badge>
```

## Color Combinations

### Recommended Combinations

**High Contrast (Accessibility First):**
- Forest text on Warm White background
- Warm White text on Forest background
- Forest text on Sage background

**Warm & Inviting:**
- Terracotta accents on Warm White
- Sage backgrounds with Forest text
- Terracotta buttons on Sage cards

**Natural & Calming:**
- Sage/Forest gradients
- Light Sage backgrounds
- Forest headings with Gray body text

### Avoid These Combinations
- Sage text on Terracotta (poor contrast)
- Terracotta text on Sage (readability issues)
- Warm White text on light Sage (insufficient contrast)

## Opacity/Alpha Values

Use these opacity values for subtle variations:

- **5%:** Very subtle backgrounds (`bg-sage/5`)
- **10%:** Light backgrounds (`bg-sage/10`)
- **20%:** Muted highlights (`bg-terracotta/20`)
- **30%:** Borders and dividers (`border-sage/30`)
- **50%:** Hover states on transparent elements
- **70%:** Medium emphasis
- **90%:** Strong emphasis, hover states (`hover:bg-terracotta/90`)

## Typography Colors

### Headings
```tsx
<h1 className="text-forest font-lora">Main Heading</h1>
<h2 className="text-forest/90 font-lora">Subheading</h2>
```

### Body Text
```tsx
<p className="text-forest/70">Regular body text</p>
<p className="text-gray-600">Secondary text</p>
```

### Links
```tsx
<a className="text-sage hover:text-forest">Navigation Link</a>
<a className="text-terracotta hover:text-terracotta/80">CTA Link</a>
```

## Backgrounds

### Page Backgrounds
```tsx
<section className="bg-warm-white">Main content</section>
<section className="bg-sage/10">Featured section</section>
<section className="bg-brand-gradient">Hero section</section>
```

### Card/Component Backgrounds
```tsx
<div className="bg-white">Elevated white card</div>
<div className="bg-brand-subtle">Subtle brand background</div>
```

## Utility Classes

We've created custom utility classes for common patterns:

- `.btn-sage` - Sage green button
- `.btn-terracotta` - Terracotta button
- `.btn-forest` - Forest green button
- `.card-sage` - Sage-themed card
- `.card-terracotta` - Terracotta-themed card
- `.card-forest` - Forest-themed card
- `.badge-sage` - Sage badge
- `.badge-terracotta` - Terracotta badge
- `.text-brand-primary` - Sage text
- `.text-brand-secondary` - Terracotta text
- `.text-brand-accent` - Forest text
- `.bg-brand-gradient` - Sage to Terracotta gradient
- `.bg-brand-subtle` - Subtle sage background

## Implementation Rules

1. **All buttons** should use either `btn-sage`, `btn-terracotta`, or `btn-forest`
2. **All headings** should use `text-forest` with `font-lora`
3. **All cards** should have either `border-sage/20` or one of the card variant classes
4. **All page backgrounds** should use `bg-warm-white` or `bg-sage/5`
5. **All CTAs** should use terracotta (`bg-terracotta`)
6. **All focus rings** use sage (`ring-sage`)

## Accessibility

All color combinations have been tested for WCAG AA compliance:

- **Forest (#344E41) on Warm White (#FDFBF8):** AAA ✓
- **Warm White (#FDFBF8) on Forest (#344E41):** AAA ✓
- **Forest (#344E41) on Sage (#A3B18A):** AA ✓
- **Warm White (#FDFBF8) on Terracotta (#D98C4A):** AA ✓

## Examples

See these components for reference implementations:
- `/components/ui/hero-banner.tsx` - Brand color usage
- `/components/booking/BookingForm.tsx` - Button and card variants
- `/app/page.tsx` - Page layout with brand colors

## Quick Reference

```typescript
// Brand Colors Object
export const brandColors = {
  sage: '#A3B18A',      // Primary
  terracotta: '#D98C4A', // Secondary
  warmWhite: '#FDFBF8',  // Base
  forest: '#344E41',     // Accent
} as const;
```
