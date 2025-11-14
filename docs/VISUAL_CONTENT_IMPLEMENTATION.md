# Visual Content System - Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the Visual Content System architecture defined in [VISUAL_CONTENT_SYSTEM.md](./VISUAL_CONTENT_SYSTEM.md).

## Implementation Phases

### Phase 1: Directory Structure (15 minutes)

Create the required directories:

```bash
# Create visual assets directories
mkdir -p public/images/{heroes,products,lifestyle,ingredients,marketing,ui}/
mkdir -p public/images/heroes/{homepage,about,products,booking,blog}
mkdir -p public/images/products/{tinctures,salves,collections}
mkdir -p public/images/ui/{icons,patterns,textures}

# Create library directories
mkdir -p lib/visual
```

### Phase 2: Configuration Files (30 minutes)

#### 1. Create `lib/visual/overlay-variants.ts`

```bash
# File already documented in VISUAL_CONTENT_SYSTEM.md
# Copy the overlay variants configuration from the architecture doc
```

Key exports:
- `BRAND_COLORS`: Immutable brand colors
- `BrandOverlayVariant`: TypeScript type for overlay options
- `OVERLAY_STYLES`: Desktop overlay styles
- `MOBILE_OVERLAY_STYLES`: Mobile-optimized overlays
- `TEXTURE_OVERLAY`: Optional texture pattern

#### 2. Create `lib/visual/image-configs.ts`

```bash
# File already documented in VISUAL_CONTENT_SYSTEM.md
# Copy the image configuration from the architecture doc
```

Key exports:
- `IMAGE_PATHS`: Centralized path constants
- `IMAGE_DIMENSIONS`: Standard dimensions for each image type
- `IMAGE_QUALITY`: Quality settings by image type
- `IMAGE_FORMATS`: Preferred formats

### Phase 3: Enhanced HeroBanner Component (45 minutes)

#### Update `components/ui/hero-banner.tsx`

The component needs these enhancements:

1. **Add Brand Overlay Support**
   - Import `BrandOverlayVariant` and overlay styles
   - Extend `overlay` prop to accept brand variants
   - Add `withTexture` prop for optional texture overlay

2. **Add Responsive Overlay Logic**
   - Detect mobile vs desktop
   - Apply appropriate overlay opacity
   - Maintain text readability

3. **Update Default Overlay**
   - Change default from `"gradient"` to `"sage-gradient"`
   - Ensures brand consistency by default

Example usage after implementation:
```typescript
<HeroBanner
  title="Natural Wellness"
  imageSrc="/images/heroes/homepage/morning-ritual.webp"
  imageAlt="Peaceful morning herbal tea ritual"
  overlay="sage-gradient" // New brand overlay
  withTexture={true}      // Optional texture
/>
```

### Phase 4: Image Sourcing (Ongoing)

#### Create Unsplash Collections

1. **Create Account**: Sign up at unsplash.com
2. **Create Collections**:
   - "Leyla's Apothecary - Heroes"
   - "Leyla's Apothecary - Products"
   - "Leyla's Apothecary - Lifestyle"
   - "Leyla's Apothecary - Botanicals"

3. **Curate Images**:
   - Search keywords: "herbal medicine", "apothecary", "tincture bottles"
   - Add images that match brand aesthetic
   - Download high-resolution versions

#### Image Processing Workflow

```bash
# 1. Download from Unsplash to source directory
mkdir -p source-images/

# 2. Convert to WebP format
npm install -g cwebp

# 3. Optimize and rename
cwebp -q 85 source-images/original.jpg -o public/images/heroes/homepage/2024-11-13_hero_homepage_morning-ritual_v1.webp

# 4. Create JPEG fallback
convert public/images/heroes/homepage/2024-11-13_hero_homepage_morning-ritual_v1.webp \
        public/images/heroes/homepage/2024-11-13_hero_homepage_morning-ritual_v1.jpg
```

### Phase 5: Update Existing Pages (1-2 hours)

#### Homepage (`app/page.tsx`)

Before:
```typescript
<HeroBanner
  title="Welcome"
  imageSrc="https://images.unsplash.com/..."
  overlay="dark"
/>
```

After:
```typescript
<HeroBanner
  title="Natural Wellness, Powered by AI"
  subtitle="Where Nature Meets Technology"
  description="Personalized herbal remedies crafted for your unique wellness journey"
  imageSrc="/images/heroes/homepage/2024-11-13_hero_homepage_morning-ritual_sage-overlay_v1.webp"
  imageAlt="Peaceful morning herbal tea ritual with fresh herbs on wooden table"
  overlay="sage-gradient"
  height="large"
  textAlign="center"
  withTexture={true}
  primaryCTA={{
    text: "Take Wellness Quiz",
    href: "/quiz"
  }}
  secondaryCTA={{
    text: "Explore Products",
    href: "/products"
  }}
/>
```

#### Booking Page (`app/booking/page.tsx`)

```typescript
<HeroBanner
  title="Book Your Consultation"
  subtitle="Personalized Naturopathic Care"
  description="Virtual consultations available - Start your healing journey today"
  imageSrc="/images/heroes/booking/2024-11-13_hero_booking_consultation-space_warm-gradient_v1.webp"
  imageAlt="Cozy consultation room with plants and herbal tea"
  overlay="warm-gradient"
  height="medium"
  textAlign="center"
  primaryCTA={{
    text: "Schedule Now",
    href: "/booking#calendar"
  }}
/>
```

### Phase 6: Testing (30 minutes)

```bash
# 1. Type check
npm run type-check

# 2. Run tests
npm test

# 3. Build check
npm run build

# 4. Visual regression testing
# Test on multiple devices:
# - Mobile (375px, 414px)
# - Tablet (768px, 1024px)
# - Desktop (1280px, 1920px)

# 5. Performance check
# Run Lighthouse audit
# Target scores:
# - Performance: >90
# - Accessibility: 100
# - Best Practices: 100
```

### Phase 7: Documentation Updates (15 minutes)

1. **Update README.md**
   - Add link to Visual Content System docs
   - Add image sourcing guidelines
   - Add component usage examples

2. **Update Component Documentation**
   - Document new HeroBanner props
   - Add usage examples
   - Include overlay variant examples

3. **Create Image Database**
   - Track all images in spreadsheet or database
   - Include: filename, usage, license, photographer
   - Update regularly

## Maintenance Checklist

### Monthly Tasks
- [ ] Review image performance metrics
- [ ] Check for broken image links
- [ ] Update Unsplash collections with new images
- [ ] Optimize any slow-loading images
- [ ] Review and update alt text for SEO

### Quarterly Tasks
- [ ] Conduct visual brand audit
- [ ] Update seasonal hero images
- [ ] Review and refresh product photography
- [ ] A/B test new hero variations
- [ ] Update image sourcing guidelines

### Annual Tasks
- [ ] Full visual content audit
- [ ] Review and update all documentation
- [ ] Negotiate new stock photo licenses
- [ ] Professional photoshoot (if budget allows)
- [ ] Update brand color palette (requires approval)

## Troubleshooting

### Image Not Loading
1. Check file exists at specified path
2. Verify file extension matches code
3. Check Next.js image optimization is working
4. Inspect network tab for 404 errors
5. Verify Next/Image `sizes` prop is correct

### Overlay Not Displaying
1. Check overlay variant name is correct
2. Verify overlay styles are imported
3. Inspect element in dev tools
4. Check z-index stacking context
5. Verify CSS is not being overridden

### Performance Issues
1. Run Lighthouse audit
2. Check image file sizes (<200KB target)
3. Verify images use WebP format
4. Check `priority` prop for above-fold images
5. Ensure lazy loading for below-fold images
6. Review `sizes` prop for responsive loading

### Brand Inconsistency
1. Verify using approved brand colors only
2. Check overlay opacity values
3. Review image color grading
4. Ensure consistent typography
5. Compare with Photography Guide standards

## Resources

### Internal Documentation
- [Visual Content System Architecture](./VISUAL_CONTENT_SYSTEM.md)
- [Photography Guide](./Leylas_Apothecary_Image_Photography_Guide.md)
- [Brand Color System](./BRAND_COLOR_SYSTEM.md)
- [Project Rules](../.claude/PROJECT_RULES.md)

### External Resources
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Unsplash License](https://unsplash.com/license)
- [WebP Conversion Guide](https://developers.google.com/speed/webp)
- [Lighthouse Performance](https://developers.google.com/web/tools/lighthouse)

### Tools
- [TinyPNG](https://tinypng.com/) - Image compression
- [Squoosh](https://squoosh.app/) - Image optimization
- [cwebp](https://developers.google.com/speed/webp/docs/cwebp) - WebP conversion
- [ImageOptim](https://imageoptim.com/) - Mac image optimization

## Support

For questions or issues:
1. Check this implementation guide
2. Review the architecture documentation
3. Search existing GitHub issues
4. Create a new issue with detailed description
5. Tag with `visual-content` label

---

**Last Updated**: November 2024
**Version**: 1.0
**Next Review**: December 2024
