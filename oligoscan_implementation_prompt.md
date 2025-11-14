# Oligoscan Consultation Implementation Prompt

**Project Context:** Leyla's Apothecary - A naturopathy platform using Next.js, TypeScript, Supabase, and Stripe for consultation booking and herbal formulations.

---

## Feature Overview

Implement Oligoscan as a specialized consultation type in Leyla's Apothecary platform. Oligoscan is a non-invasive spectroscopy test that measures intracellular levels of 44 elements (21 minerals, 16 heavy metals, and 7 vitamins) by analyzing tissue at 4mm depth through the skin. Results are delivered immediately and provide a unique perspective on mineral uptake and heavy metal accumulation—complementary to blood, hair, and urine testing.

**Reference:** https://www.theoligoscan.com/

---

## Oligoscan Information & Educational Resources

### What is Oligoscan? (For Website Display)

Oligoscan is a cutting-edge, non-invasive testing method that measures the intracellular uptake of minerals, heavy metals, and vitamins using advanced spectroscopy technology. Unlike conventional blood or hair testing which capture a snapshot of circulating or excreted elements, Oligoscan reveals what has actually been bio-accumulated into your tissue cells—where the real health impact occurs.

**Key Advantages:**
- **Immediate Results**: Test completed in minutes with instant preliminary feedback
- **Deep Tissue Analysis**: Measures elements at 4mm depth through skin tissue (including muscle and capillaries)
- **Comprehensive**: Tests 44 elements—21 essential minerals, 16 heavy metals, and 7 key vitamins
- **Complementary Insight**: Provides different perspective than blood, hair, or urine testing
- **Non-Invasive**: No needles, no bodily fluids required—just light technology
- **Globally Available**: Can be performed anywhere with internet connection for result analysis

**What It Measures:**
- **Minerals**: Calcium, Magnesium, Potassium, Sodium, Phosphorus, Sulfur, Iron, Zinc, Copper, Manganese, Chromium, Molybdenum, Selenium, Iodine, Boron, Silica, Germanium, Titanium, Strontium, Vanadium, Lithium
- **Heavy Metals**: Lead, Mercury, Cadmium, Arsenic, Aluminum, Nickel, Uranium, Thorium, Cobalt, Palladium, Platinum, Gold, Silver, Tin, Thallium, Barium
- **Vitamins**: A, B6, B9 (Folate), B12, C, D, E

**How It Works:**
Oligoscan uses spectroscopy technology based on Beer-Lambert's Law—the principle that every element absorbs, emits, or reflects light at specific wavelengths. A specialized diffraction grating device projects the full visible light spectrum through the skin, measuring how much light is absorbed by each element present in your tissue. This non-invasive approach provides real-time quantification of your nutritional status at the cellular level.

**Why It Matters for Natural Health:**
For naturopathic practitioners like Leyla, Oligoscan reveals the true nutritional status of your cells—the destination where nutrients are actually utilized. This allows for highly targeted herbal and nutritional interventions based on your actual cellular mineral/metal status rather than general recommendations.

### Component: Educational Info Panel

This component displays on the booking page and can be placed on a dedicated Oligoscan information page:

```typescript
// components/consultations/oligoscan/oligoscan-info-panel.tsx

export function OligoscanInfoPanel() {
  return (
    <div className="space-y-6 bg-gradient-to-br from-sage-50 to-white p-6 rounded-lg border border-forest-green/10">
      
      <div>
        <h2 className="text-2xl font-bold text-forest-green mb-2">
          What is Oligoscan?
        </h2>
        <p className="text-gray-700">
          Oligoscan is a revolutionary spectroscopy-based assessment that measures 
          the intracellular uptake of 44 elements—providing insight into your body's 
          mineral status and heavy metal burden at the cellular level.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-forest-green flex items-center gap-2">
            <span className="text-lg">✓</span> Non-Invasive
          </h3>
          <p className="text-sm text-gray-600">
            No needles or blood samples needed—uses light technology only
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-forest-green flex items-center gap-2">
            <span className="text-lg">⚡</span> Immediate Results
          </h3>
          <p className="text-sm text-gray-600">
            Get preliminary feedback during your consultation
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-forest-green flex items-center gap-2">
            <span className="text-lg">📊</span> Comprehensive
          </h3>
          <p className="text-sm text-gray-600">
            Measures 44 elements: minerals, heavy metals, and vitamins
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-forest-green flex items-center gap-2">
            <span className="text-lg">🔬</span> Cellular Level
          </h3>
          <p className="text-sm text-gray-600">
            Shows what's actually in your cells—where health happens
          </p>
        </div>
      </div>

      <div className="bg-terracotta/10 border border-terracotta/20 rounded p-4">
        <p className="text-sm text-gray-700 mb-3">
          <strong>Complementary Testing:</strong> Oligoscan is not a replacement for 
          blood, hair, or urine testing. Instead, it provides a unique perspective on 
          your intracellular mineral and metal status—revealing what your body has 
          accumulated at the tissue level.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-forest-green">What You'll Learn:</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-sage">•</span>
            <span>Your mineral status across 21 essential minerals</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">•</span>
            <span>Heavy metal burden (lead, mercury, cadmium, arsenic, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">•</span>
            <span>Vitamin levels critical for cellular function</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">•</span>
            <span>Personalized herbal and nutritional recommendations</span>
          </li>
        </ul>
      </div>

      <div className="border-t border-forest-green/10 pt-4">
        <p className="text-xs text-gray-600 mb-3">
          Learn more about the science behind Oligoscan:
        </p>
        <div className="flex flex-wrap gap-2">
          <a 
            href="https://www.theoligoscan.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-forest-green hover:text-forest-green/80 underline flex items-center gap-1"
          >
            Official Oligoscan Site <span className="text-xs">↗</span>
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="https://www.theoligoscan.com/#spectroscopy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-forest-green hover:text-forest-green/80 underline flex items-center gap-1"
          >
            How It Works <span className="text-xs">↗</span>
          </a>
          <span className="text-gray-300">•</span>
          <a 
            href="https://www.theoligoscan.com/#testing-types" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-forest-green hover:text-forest-green/80 underline flex items-center gap-1"
          >
            Testing Methodology <span className="text-xs">↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}
```

### Component: Quick Facts Card

For sidebar or card-based layouts:

```typescript
// components/consultations/oligoscan/oligoscan-quick-facts.tsx

export function OligoscanQuickFacts() {
  const facts = [
    {
      number: '44',
      label: 'Elements Tested',
      description: '21 minerals, 16 heavy metals, 7 vitamins'
    },
    {
      number: '4mm',
      label: 'Tissue Depth',
      description: 'Measures intracellular uptake through skin'
    },
    {
      number: 'Immediate',
      label: 'Results',
      description: 'Preliminary feedback during consultation'
    },
    {
      number: '11+',
      label: 'Years',
      description: 'Proven testing methodology and validation'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {facts.map((fact) => (
        <div 
          key={fact.label}
          className="text-center p-4 bg-white rounded-lg border border-sage/20 hover:border-sage/50 transition-colors"
        >
          <div className="text-3xl font-bold text-forest-green mb-1">
            {fact.number}
          </div>
          <div className="text-sm font-semibold text-forest-green mb-1">
            {fact.label}
          </div>
          <div className="text-xs text-gray-600">
            {fact.description}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Website Page: Oligoscan Education Page

Create a dedicated page (`/oligoscan-testing`) with this structure:

```markdown
# Oligoscan: Intracellular Mineral & Heavy Metal Testing

## The Science of Oligoscan

Oligoscan uses advanced spectroscopy technology—a method that has been used across 
pharmaceutical, food processing, semiconductor, and forensic industries for decades. 
The technology is based on Beer-Lambert's Law, which states that every element absorbs, 
emits, or reflects light at specific, measurable wavelengths.

### How Different Tests Complement Each Other

**Blood Testing**: Shows what's currently in circulation
- Fresh snapshot of circulating minerals
- Indicates acute exposures
- Body maintains homeostasis, so levels stay relatively constant

**Hair Analysis**: Shows what your body excreted
- Represents the past 3 months of excretion
- Indicates what the body is eliminating
- Poor excreters may show under-represented toxic metals

**Urine (Challenge) Testing**: Shows what your body CAN excrete
- Measures excretion capability when challenged
- Indicates mobilization potential
- Determines if body can eliminate heavy metals

**Oligoscan (NEW)**: Shows what your body HAS ACCUMULATED
- Measures intracellular uptake—the destination
- Shows bio-accumulated minerals and metals
- Reveals true nutritional status at cellular level
- Unique perspective unavailable from other tests

[Visual comparison chart here]

## Elements Tested

### 21 Essential Minerals
Calcium, Magnesium, Potassium, Sodium, Phosphorus, Sulfur, Iron, Zinc, Copper, 
Manganese, Chromium, Molybdenum, Selenium, Iodine, Boron, Silica, Germanium, 
Titanium, Strontium, Vanadium, Lithium

### 16 Heavy Metals Screened
Lead, Mercury, Cadmium, Arsenic, Aluminum, Nickel, Uranium, Thorium, Cobalt, 
Palladium, Platinum, Gold, Silver, Tin, Thallium, Barium

### 7 Key Vitamins
A, B6, B9 (Folate), B12, C, D, E

## The Test Process

1. **Provide Biometrics**: Date of birth, gender, blood type, height, weight
2. **Answer Health History**: Symptoms, exposures, dietary habits, supplements
3. **Spectroscopy Assessment**: Non-invasive light-based measurement (15-20 minutes)
4. **Receive Results**: Immediate preliminary results during consultation
5. **Get Recommendations**: Personalized herbal and nutritional strategy

## Typical Findings & What They Mean

### Mineral Deficiencies
May indicate poor absorption, dietary insufficiency, or increased needs
→ Supported with targeted herbal, dietary, and supplementation strategies

### Heavy Metal Accumulation
May indicate environmental exposure, occupational contact, or poor excretion
→ Supported with gentle herbal detoxification strategies and lifestyle modifications

### Vitamin Insufficiencies
May indicate dietary gaps, absorption issues, or increased utilization
→ Supported with specific herbal sources and supplementation

## Who Benefits From Oligoscan?

- People with chronic health concerns seeking root causes
- Those exposed to environmental or occupational toxins
- Anyone with digestive issues affecting mineral absorption
- Clients looking for personalized health optimization
- Those interested in preventive health assessment

## Frequently Asked Questions

**Is Oligoscan a replacement for blood work?**
No, it's complementary. Different tests provide different information. Oligoscan 
shows intracellular status; blood shows circulation; hair shows excretion. 
Together they paint a complete picture.

**Is it safe?**
Yes, completely. It uses non-invasive light technology only—no radiation, 
no needles, no bodily fluids.

**How accurate are the results?**
Oligoscan has been used clinically for over 11 years with consistent, validated 
methodology based on established spectroscopy principles. Results are analyzed 
using Gaussian statistical distribution—the same methodology used across clinical 
laboratory testing.

**Can results change?**
Yes. Your mineral and metal status changes based on diet, supplementation, 
environmental exposure, and detoxification efforts. This makes Oligoscan excellent 
for tracking progress over time.

**What happens after I get results?**
Leyla will review your results, discuss findings with you, and create a personalized 
strategy combining herbal medicine, dietary recommendations, and lifestyle changes 
to optimize your mineral status and support your body's natural detoxification.

## Ready to Learn More?

[Book Your Oligoscan Consultation] [Learn More About Other Consultations]

---

**Resources:**
- [Official Oligoscan Technology](https://www.theoligoscan.com/)
- [Spectroscopy Methodology](https://www.theoligoscan.com/#spectroscopy)
- [How It Compares to Other Tests](https://www.theoligoscan.com/#testing-types)
```

### Email Template: Pre-Consultation Oligoscan Info

```html
<!-- emails/oligoscan-pre-consultation.html -->

<h2>Your Oligoscan Consultation is Coming Up!</h2>

<p>Hi [CLIENT_NAME],</p>

<p>We're excited to help you discover your intracellular mineral and heavy metal status 
through Oligoscan testing. Here's what to expect:</p>

<h3>📋 Before Your Consultation</h3>
<ul>
  <li>Have your date of birth, blood type ready (we already have height/weight)</li>
  <li>Wear comfortable, loose-fitting clothing for easy arm access</li>
  <li>No preparation needed—just come as you are</li>
  <li>Bring a list of current supplements/medications if you have one</li>
</ul>

<h3>⏱ During Your Consultation (45 minutes)</h3>
<ul>
  <li>Review your health history and any concerns (10 min)</li>
  <li>Oligoscan assessment—light-based, non-invasive test (15 min)</li>
  <li>Initial results discussion and observations (15 min)</li>
  <li>Next steps and recommendation overview (5 min)</li>
</ul>

<h3>📊 After Your Consultation</h3>
<ul>
  <li>Full detailed report delivered within 2-3 business days</li>
  <li>Personalized herbal and nutritional recommendations</li>
  <li>Optional follow-up consultation to dive deeper</li>
  <li>Progress tracking over time as you implement recommendations</li>
</ul>

<h3>Learn More</h3>
<p>Want to understand more about what Oligoscan measures?</p>
<ul>
  <li><a href="https://www.theoligoscan.com/">Official Oligoscan Technology</a></li>
  <li><a href="https://www.theoligoscan.com/#spectroscopy">How the Test Works</a></li>
  <li><a href="https://www.theoligoscan.com/#testing-types">Comparing Test Types</a></li>
</ul>

<p>If you have any questions, reply to this email or call us.</p>

<p>Looking forward to supporting your health journey,<br>
Leyla's Apothecary Team</p>
```

### UI Component: Educational Tooltip

For inline education throughout the booking flow:

```typescript
// components/consultations/oligoscan/oligoscan-tooltip.tsx

export function OligoscanTooltip({ 
  topic, 
}: { 
  topic: 'intracellular' | 'spectroscopy' | 'complementary' | 'elements' 
}) {
  const tooltips = {
    intracellular: {
      title: 'What is Intracellular?',
      content: 'Intracellular means inside your cells. Oligoscan measures what has been bio-accumulated into your tissue cells—not just what\'s circulating in your blood.',
      link: 'https://www.theoligoscan.com/#spectroscopy',
      linkLabel: 'Learn more about cellular measurement'
    },
    spectroscopy: {
      title: 'What is Spectroscopy?',
      content: 'Spectroscopy is the science of measuring how substances absorb, emit, or reflect light. Each element has a unique light signature. Oligoscan uses this to identify and measure elements in your tissue.',
      link: 'https://www.theoligoscan.com/#spectroscopy',
      linkLabel: 'Understand the science'
    },
    complementary: {
      title: 'Complementary Testing',
      content: 'Oligoscan provides a different view than blood, hair, or urine tests. While blood shows circulation, Oligoscan shows what\'s actually stored in your cells.',
      link: 'https://www.theoligoscan.com/#testing-types',
      linkLabel: 'Compare all test types'
    },
    elements: {
      title: '44 Elements Tested',
      content: 'Oligoscan measures 21 essential minerals, 16 heavy metals, and 7 key vitamins. This comprehensive view helps Leyla create a precise health strategy.',
      link: 'https://www.theoligoscan.com/',
      linkLabel: 'See full element list'
    }
  };

  const tooltip = tooltips[topic];

  return (
    <div className="inline-flex items-center gap-1 group cursor-help">
      <span className="text-sage text-xs">ℹ</span>
      <div className="hidden group-hover:block absolute z-10 bg-white p-3 rounded-lg shadow-lg border border-sage/20 max-w-xs">
        <p className="font-semibold text-sm text-forest-green mb-2">
          {tooltip.title}
        </p>
        <p className="text-sm text-gray-700 mb-2">
          {tooltip.content}
        </p>
        <a 
          href={tooltip.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-forest-green hover:underline"
        >
          {tooltip.linkLabel} ↗
        </a>
      </div>
    </div>
  )
}
```

### Implementation Tip

When integrating these educational components, place them strategically:
- **Info panel**: Show when user first selects Oligoscan consultation type
- **Quick facts**: Display on booking confirmation page
- **Tooltips**: Add inline to form fields explaining what data is needed and why
- **Educational page**: Link from main consultation page and booking confirmation
- **Email**: Send pre-consultation info email with external resource links

This approach educates prospects **before** they commit, building confidence in the offering while directing interested users to authoritative third-party sources (the official Oligoscan site) for deeper learning.

---

## Business Logic

### What is Oligoscan in This Context?

- A **consultation type** (not an e-commerce product) that clients can book through the booking system
- Requires **pre-consultation data collection**: Date of Birth, Gender, Blood Type, Height, Weight
- Generates a **consultation outcome report** with 44 element readings and personalized recommendations
- Positioned as a **diagnostic tool** that feeds into custom herbal formulation recommendations
- Creates a **practitioner-led workflow**: clients book → provide data → get results → consult with Leyla for recommendations

### User Journey

1. Client navigates to "Book Consultation"
2. Selects "Oligoscan Assessment" as consultation type
3. Provides required biometric data (DOB, gender, blood type, height, weight)
4. Schedules consultation time with Leyla
5. System generates Oligoscan report with element readings
6. Consultation outcome is stored and linked to client profile
7. Results inform custom herbal compound recommendations
8. Leyla can generate follow-up recommendations based on results

---

## Technical Implementation Requirements

### 1. Database Schema Extensions

Add to the existing `assessments` table or create specialized tables:

```sql
-- Oligoscan Results Table
CREATE TABLE public.oligoscan_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    consultation_id UUID REFERENCES bookings(id),
    
    -- Pre-consultation biometric data
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL, -- 'male', 'female', 'other'
    blood_type TEXT NOT NULL, -- 'A+', 'O-', etc.
    height_cm DECIMAL(5,2) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    
    -- Element readings (44 total)
    minerals JSONB NOT NULL, -- 21 minerals with readings
    heavy_metals JSONB NOT NULL, -- 16 heavy metals with readings
    vitamins JSONB NOT NULL, -- A, B6, B9, B12, C, D, E
    
    -- Reference ranges and status
    reference_ranges JSONB, -- Gaussian-based normal ranges for each element
    abnormalities JSONB, -- Flagged elements outside normal ranges
    
    -- Analysis and recommendations
    summary TEXT,
    key_findings TEXT[],
    recommendations JSONB,
    severity_score DECIMAL(3,2), -- 0-10 scale for overall concern
    
    -- Metadata
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id), -- practitioner who reviewed
    notes TEXT,
    follow_up_recommended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment form responses (pre-consultation questionnaire)
CREATE TABLE public.oligoscan_questionnaire (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES bookings(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Health history relevant to Oligoscan
    primary_concerns TEXT[],
    known_exposures JSONB, -- Documented heavy metal exposures
    current_symptoms TEXT[],
    dietary_notes TEXT,
    supplement_usage JSONB,
    environmental_factors TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_oligoscan_user ON oligoscan_assessments(user_id);
CREATE INDEX idx_oligoscan_consultation ON oligoscan_assessments(consultation_id);
ALTER TABLE oligoscan_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE oligoscan_questionnaire ENABLE ROW LEVEL SECURITY;
```

### 2. TypeScript Types

```typescript
// types/oligoscan.ts

export interface OligoscanBiometrics {
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  heightCm: number;
  weightKg: number;
}

export interface ElementReading {
  name: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  status: 'low' | 'normal' | 'high' | 'critical';
  description: string;
}

export interface OligoscanResults {
  minerals: Record<string, ElementReading>; // Ca, Mg, K, Na, P, S, Cl, etc.
  heavyMetals: Record<string, ElementReading>; // Lead, Mercury, Cadmium, Arsenic, etc.
  vitamins: Record<string, ElementReading>; // A, B6, B9, B12, C, D, E
}

export interface OligoscanRecommendation {
  elementName: string;
  status: 'deficiency' | 'excess' | 'accumulation';
  herbsToConsider: string[]; // Links to herbal library
  dietaryRecommendations: string[];
  supplementationStrategy: string;
  timeframe: string; // e.g., "4-8 weeks"
  priority: 'high' | 'medium' | 'low';
}

export interface OligoscanAssessment {
  id: string;
  userId: string;
  consultationId: string;
  biometrics: OligoscanBiometrics;
  results: OligoscanResults;
  abnormalities: ElementReading[];
  recommendations: OligoscanRecommendation[];
  severityScore: number; // 0-10
  keyFindings: string[];
  summary: string;
  testDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OligoscanQuestionnaire {
  consultationId: string;
  userId: string;
  primaryConcerns: string[];
  knownExposures: {
    type: string; // 'occupational', 'environmental', 'medical', 'lifestyle'
    description: string;
    duration: string;
  }[];
  currentSymptoms: string[];
  dietaryNotes: string;
  supplementUsage: {
    supplement: string;
    dosage: string;
    duration: string;
  }[];
  environmentalFactors: string;
  createdAt: Date;
}
```

### 3. API Endpoints

Create these Next.js API routes:

```typescript
// app/api/consultations/oligoscan/route.ts
// POST: Create new Oligoscan consultation booking
// GET: List user's Oligoscan consultations

// app/api/consultations/oligoscan/[id]/route.ts
// GET: Retrieve specific Oligoscan assessment results
// PATCH: Update assessment with practitioner notes
// DELETE: Cancel assessment

// app/api/consultations/oligoscan/[id]/questionnaire/route.ts
// POST: Submit pre-consultation questionnaire
// GET: Retrieve questionnaire responses

// app/api/consultations/oligoscan/generate-report/[id]/route.ts
// POST: Generate full Oligoscan report (practitioner only)
// GET: Download report as PDF

// app/api/consultations/oligoscan/recommendations/[id]/route.ts
// GET: Get AI-generated herbal recommendations based on results
// POST: Save practitioner-customized recommendations
```

### 4. UI Components

Create these React components:

```
components/
└── consultations/
    └── oligoscan/
        ├── oligoscan-booking-form.tsx
        │   └── Step 1: Select Oligoscan from consultation types
        │   └── Step 2: Collect biometric data (DOB, gender, blood type, height, weight)
        │   └── Step 3: Schedule with Leyla
        │
        ├── oligoscan-questionnaire-form.tsx
        │   └── Health history form
        │   └── Known exposures
        │   └── Current symptoms
        │   └── Dietary patterns
        │   └── Supplement usage
        │   └── Environmental factors
        │
        ├── oligoscan-results-display.tsx
        │   └── Element readings table (organized by category: minerals, heavy metals, vitamins)
        │   └── Visual indicators (green/yellow/red for status)
        │   └── Abnormality highlights
        │   └── Severity score gauge
        │
        ├── oligoscan-report-generator.tsx
        │   └── Summary section
        │   └── Key findings
        │   └── Detailed element analysis
        │   └── PDF export
        │
        ├── oligoscan-recommendations-panel.tsx
        │   └── Herb suggestions (linked to herbal library)
        │   └── Dietary recommendations
        │   └── Supplementation strategy
        │   └── Timeline
        │   └── Practitioner notes section
        │
        └── oligoscan-timeline.tsx
            └── Track follow-up consultations
            └── Compare before/after assessments
```

### 5. Consultation Booking Integration

Extend the existing booking system to handle Oligoscan specifically:

```typescript
// In the booking form, add consultation type selection:

enum ConsultationType {
  INITIAL_CONSULTATION = 'initial_consultation',
  CUSTOM_COMPOUND = 'custom_compound',
  OLIGOSCAN_ASSESSMENT = 'oligoscan_assessment', // NEW
  FOLLOW_UP = 'follow_up',
}

// When user selects OLIGOSCAN_ASSESSMENT:
// 1. Show biometric collection form
// 2. Generate temporary assessment ID
// 3. Link to booking
// 4. Show questionnaire pre-fill option
// 5. Proceed to calendar/payment
```

---

## Implementation Workflow

### Phase 1: Data Model & API (Week 1-2)

- [ ] Create Supabase tables for `oligoscan_assessments` and `oligoscan_questionnaire`
- [ ] Set up Row Level Security policies
- [ ] Create TypeScript type definitions
- [ ] Build API endpoints for CRUD operations
- [ ] Add validation for biometric data
- [ ] Create service functions for data retrieval and manipulation

### Phase 2: Booking Flow Integration (Week 2-3)

- [ ] Extend booking form to include "Oligoscan Assessment" consultation type
- [ ] Create biometric data collection component
- [ ] Link biometric form to booking creation
- [ ] Store biometric data with consultation record
- [ ] Add confirmation email with pre-consultation instructions

### Phase 3: Questionnaire & Pre-Consultation (Week 3-4)

- [ ] Build questionnaire form component
- [ ] Implement form validation
- [ ] Store questionnaire responses
- [ ] Create email reminder for pre-consultation completion
- [ ] Build admin view to see submitted questionnaires

### Phase 4: Results Display & Analysis (Week 4-5)

- [ ] Create element readings display component
- [ ] Build results visualization (tables, charts, severity indicators)
- [ ] Implement abnormality highlighting logic
- [ ] Create practitioner admin interface to enter results
- [ ] Generate severity scoring algorithm

### Phase 5: Recommendations Engine (Week 5-6)

- [ ] Connect to herbal library database
- [ ] Build recommendation generation logic
- [ ] Create recommendations panel with herbal suggestions
- [ ] Link recommendations to custom compound builder
- [ ] Allow practitioner to customize/override recommendations

### Phase 6: Reporting & Follow-up (Week 6-7)

- [ ] Build report generation component
- [ ] Implement PDF export
- [ ] Create follow-up consultation workflow
- [ ] Build before/after comparison view
- [ ] Add practitioner notes and annotations

---

## Key Features to Implement

### 1. Biometric Data Collection
- Form validation for all 5 required fields
- Age calculation from DOB
- BMI calculation (optional enhancement)
- Data persistence tied to consultation

### 2. Element Reference Ranges
- Implement Gaussian-based normal ranges for all 44 elements
- Create logic to flag abnormalities (>2 std deviations)
- Severity scoring based on how far outside normal range
- Distinguish between "low", "normal", "high", "critical"

### 3. Results Visualization
- Organized display: Minerals section, Heavy Metals section, Vitamins section
- Color coding: Green (normal), Yellow (borderline), Red (abnormal)
- Hover tooltips with element descriptions
- Sorting/filtering capabilities

### 4. Recommendation Intelligence
- Link abnormal elements to relevant herbs from existing library
- Suggest dietary strategies based on specific deficiencies/excesses
- Provide supplementation guidance
- Organize by priority (high/medium/low)

### 5. Practitioner Dashboard
- View all submitted questionnaires
- Enter element readings directly or import from device
- Add clinical notes and observations
- Generate reports for clients
- Track follow-up consultations

### 6. Client Dashboard
- View own Oligoscan results
- Download PDF report
- See personalized recommendations
- Schedule follow-up consultations
- Track improvement over time with before/after comparisons

---

## Integration Points

### Connect to Existing Systems:

1. **Booking System**: Oligoscan is a consultation type that flows through existing booking → calendar → payment workflow

2. **User Profiles**: Store Oligoscan results in user profile for history tracking

3. **Herbal Library**: Link high-level recommendations to actual herbal products/compounds

4. **Custom Compound Builder**: Use Oligoscan results as starting point for custom formula creation

5. **Email System**: Trigger emails for pre-consultation reminders, results notification, follow-up suggestions

6. **Payment**: Oligoscan consultation charged through existing Stripe integration

---

## Data Flow Diagram

```
User Books Consultation
         ↓
   Select "Oligoscan"
         ↓
   Submit Biometrics
   (DOB, Gender, Blood Type, Height, Weight)
         ↓
   Confirm Booking & Payment
         ↓
   Pre-Consultation Questionnaire
   (Health history, exposures, symptoms)
         ↓
   Consultation Day with Leyla
         ↓
   Practitioner Enters Element Readings
   (44 elements: minerals, heavy metals, vitamins)
         ↓
   System Generates Report & Recommendations
   (Severity score, abnormality flags, herbal suggestions)
         ↓
   Client Views Results Dashboard
         ↓
   Custom Formula Created Based on Results
         ↓
   Follow-Up Consultation Scheduled (if needed)
```

---

## Example Element Data Structure

```typescript
const elementLibrary = {
  minerals: {
    calcium: {
      symbol: 'Ca',
      wavelength: '422.7nm',
      functionInBody: 'Bone health, muscle contraction, nerve transmission',
      deficiencySymptoms: ['Muscle cramps', 'Osteoporosis risk', 'Irregular heartbeat'],
      excessSymptoms: ['Kidney stones', 'Soft tissue calcification'],
      herbsForDeficiency: ['Horsetail', 'Nettle', 'Sesame'],
      herbsForExcess: ['Parsley', 'Cilantro'],
      referenceMin: 60,
      referenceMax: 120,
      unit: 'mg/dL intracellular',
    },
    magnesium: {
      symbol: 'Mg',
      wavelength: '279.5nm',
      functionInBody: 'Energy production, muscle relaxation, enzymatic reactions',
      deficiencySymptoms: ['Muscle cramps', 'Fatigue', 'Sleep issues', 'Anxiety'],
      excessSymptoms: ['Digestive issues', 'Lethargy'],
      herbsForDeficiency: ['Nettle', 'Chickweed', 'Amaranth'],
      referenceMin: 35,
      referenceMax: 75,
      unit: 'mg/dL intracellular',
    },
    // ... 19 more minerals
  },
  heavyMetals: {
    lead: {
      symbol: 'Pb',
      wavelength: '405.8nm',
      toxicityThreshold: 10,
      commonSources: ['Old paint', 'Contaminated soil', 'Industrial pollution'],
      detoxHerbs: ['Cilantro', 'Chlorella', 'Spirulina', 'Garlic'],
      chelationStrategy: 'Gentle herbal support, not pharmaceutical chelation',
      recommendedMonitoring: 'Every 3-6 months',
    },
    mercury: {
      symbol: 'Hg',
      wavelength: '253.7nm',
      toxicityThreshold: 5,
      commonSources: ['Dental amalgam', 'Fish consumption', 'Industrial exposure'],
      detoxHerbs: ['Cilantro', 'Chlorella', 'Garlic'],
      chelationStrategy: 'Gentle herbal support',
      recommendedMonitoring: 'Every 3-6 months',
    },
    // ... 14 more heavy metals
  },
  vitamins: {
    vitaminA: {
      symbol: 'A',
      functionInBody: 'Vision, immune function, skin health',
      deficiencySymptoms: ['Night blindness', 'Dry skin', 'Weak immunity'],
      sources: ['Beta-carotene rich foods', 'Leafy greens', 'Orange vegetables'],
      herbsForDeficiency: ['Carrot', 'Dandelion greens', 'Spinach'],
    },
    // ... 6 more vitamins
  },
};
```

---

## Testing Checklist

- [ ] Biometric form validates all 5 required fields
- [ ] Booking creates Oligoscan assessment record correctly
- [ ] Questionnaire responses store properly
- [ ] Element readings calculate severity correctly
- [ ] Abnormalities flag when outside 2 std deviations
- [ ] Recommendations generate based on abnormal elements
- [ ] Report generates and exports as PDF
- [ ] Follow-up consultation workflow works
- [ ] Before/after comparison displays correctly
- [ ] All user data is properly secured with RLS
- [ ] Email notifications trigger at correct times
- [ ] Client dashboard shows correct information

---

## Notes for Implementation

1. **Reference Ranges**: These are established using Gaussian methodology per the Oligoscan documentation. Consider storing these as a configuration table so they can be updated without code changes.

2. **Spectroscopy Science**: While we're not implementing actual spectroscopy device integration initially, the data structure should support it for future hardware integration.

3. **Complementary Testing**: Remember that Oligoscan is complementary to blood/hair/urine tests—results should be positioned this way in the UI.

4. **Practitioner Expertise**: This feature heavily depends on Leyla's expertise to interpret results and create recommendations. The UI should support her clinical notes and expert override of AI suggestions.

5. **Privacy & Compliance**: Health data is sensitive. Ensure all data is encrypted, properly backed up, and complies with Australian health privacy regulations (Privacy Act, APPs).

6. **Future Enhancement**: Consider integrating with actual Oligoscan device APIs if they become available, allowing real-time result import.

