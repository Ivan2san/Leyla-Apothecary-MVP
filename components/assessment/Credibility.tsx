const expertise = [
  'Advanced gut health restoration and microbiome therapy',
  'Heavy metal detoxification protocols',
  'Oligoscan spectroscopy (certified practitioner)',
  'Custom herbal medicine formulation',
  'Evidence-based nutritional therapy',
]

const researchNotes = [
  '85% of chronic health conditions are linked to gut dysfunction',
  '92% of people have at least one mineral deficiency',
  'Early detection of toxic load can prevent serious long-term health issues',
]

export function Credibility() {
  return (
    <section className="bg-forest/5 py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="font-lora text-3xl text-forest">Created by Leyla – Your Guide to Natural Health</p>
            <p className="mt-4 text-forest/80">
              Leyla is a registered naturopath with over 20 years of clinical experience helping hundreds of clients transform their health in the Southern Highlands and beyond.
            </p>
            <ul className="mt-6 space-y-3 text-forest/90">
              {expertise.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-terracotta">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-md">
            <p className="font-lora text-xl text-forest">Research Foundation</p>
            <ul className="mt-4 space-y-4 text-sm text-forest/80">
              {researchNotes.map((note) => (
                <li key={note} className="flex gap-3">
                  <span className="text-sage">→</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-sage/20 p-4 text-sm text-forest/80">
              Leyla&apos;s clinical lens blends herbal medicine, nutrition, and advanced technology like Oligoscan to uncover the precise drivers of your symptoms.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
