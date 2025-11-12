# Leyla's Apothecary - Brand Style Guide

## 🎨 Brand Colors

Your custom brand colors are now available throughout the application:

### Primary Colors

**Forest Green** - `#344E41`
- Usage: Primary buttons, headers, navigation
- Classes: `bg-forest`, `text-forest`, `border-forest`, etc.
- Example: `<button className="bg-forest text-white">Shop Now</button>`

**Sage Green** - `#A3B18A`
- Usage: Accents, secondary elements, highlights
- Classes: `bg-sage`, `text-sage`, `border-sage`, etc.
- Example: `<div className="bg-sage/20 border-sage">Featured</div>`

**Terracotta** - `#D98C4A`
- Usage: Call-to-action buttons, important highlights
- Classes: `bg-terracotta`, `text-terracotta`, `border-terracotta`, etc.
- Example: `<button className="bg-terracotta hover:bg-terracotta/90">Add to Cart</button>`

**Warm White** - `#FDFBF8`
- Usage: Backgrounds, cards, sections
- Classes: `bg-warm-white`, `text-warm-white`, `border-warm-white`, etc.
- Example: `<section className="bg-warm-white py-16">Content</section>`

---

## 🔤 Typography

### Font Families

**Lora** (Serif) - For headings and emphasis
- Classes: `font-lora`
- Usage: Headings, hero text, product names
- Example: `<h1 className="font-lora text-4xl font-bold">Welcome</h1>`

**Inter** (Sans-serif) - For body text (default)
- Classes: `font-inter`
- Usage: Body text, descriptions, UI elements
- Example: `<p className="font-inter text-base">Description text</p>`

**Note:** Inter is the default font, so you don't need to specify it unless overriding.

---

## 💡 Usage Examples

### Hero Section
```tsx
<section className="bg-forest text-warm-white py-24">
  <h1 className="font-lora text-5xl font-bold mb-4">
    Leyla's Apothecary
  </h1>
  <p className="font-inter text-lg text-warm-white/90">
    Premium herbal tinctures for natural wellness
  </p>
  <button className="bg-terracotta hover:bg-terracotta/90 text-white mt-8">
    Shop Now
  </button>
</section>
```

### Product Card
```tsx
<div className="bg-warm-white border border-sage rounded-lg p-6">
  <h3 className="font-lora text-2xl text-forest mb-2">
    Chamomile Tincture
  </h3>
  <p className="font-inter text-sage mb-4">
    Calming and relaxing herbal remedy
  </p>
  <button className="bg-terracotta text-white w-full">
    Add to Cart
  </button>
</div>
```

### Navigation
```tsx
<nav className="bg-forest text-warm-white">
  <ul className="font-inter flex gap-6">
    <li className="hover:text-sage transition">Home</li>
    <li className="hover:text-sage transition">Products</li>
    <li className="hover:text-sage transition">About</li>
  </ul>
</nav>
```

### Accent Section
```tsx
<div className="bg-sage/10 border-l-4 border-sage p-6">
  <h4 className="font-lora text-forest text-xl mb-2">
    Did You Know?
  </h4>
  <p className="font-inter text-forest/80">
    All our tinctures are made with organic herbs...
  </p>
</div>
```

---

## 🌈 Color Combinations

### Recommended Pairings

**Primary Palette:**
- Background: `bg-warm-white`
- Text: `text-forest`
- Accents: `text-sage` or `border-sage`
- CTAs: `bg-terracotta`

**Dark Mode / Hero Sections:**
- Background: `bg-forest`
- Text: `text-warm-white`
- Accents: `text-sage`
- CTAs: `bg-terracotta`

**Cards / Content Blocks:**
- Background: `bg-warm-white`
- Border: `border-sage`
- Heading: `text-forest font-lora`
- Body: `text-forest/80 font-inter`

---

## 🎯 Accessibility Notes

All color combinations have been chosen for readability:
- Forest on Warm White ✅ (High contrast)
- Warm White on Forest ✅ (High contrast)
- Terracotta on White ✅ (Good contrast)
- Sage for accents only (not primary text)

---

## 🚀 Quick Reference

| Element | Class | Color |
|---------|-------|-------|
| Primary BG | `bg-forest` | #344E41 |
| Accent BG | `bg-sage` | #A3B18A |
| CTA Button | `bg-terracotta` | #D98C4A |
| Page BG | `bg-warm-white` | #FDFBF8 |
| Headings | `font-lora` | Lora serif |
| Body | `font-inter` | Inter sans-serif |

---

## 📝 Next Steps

Now that brand colors are available, you can:
1. Update existing components to use brand colors
2. Apply `font-lora` to headings
3. Ensure CTAs use `bg-terracotta`
4. Set page backgrounds to `bg-warm-white`

All colors and fonts are ready to use - just apply the Tailwind classes!
