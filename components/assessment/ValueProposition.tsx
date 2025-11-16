const values = [
  {
    title: 'Gut Health & Digestive Function',
    description:
      'Understand digestive patterns, symptoms, and how well you are absorbing vital nutrients.',
  },
  {
    title: 'Toxic Load & Mineral Balance',
    description:
      'Spot potential heavy metal burden, mineral deficiencies, and where cellular testing could help.',
  },
  {
    title: 'Lifestyle & Wellness Foundations',
    description:
      'Evaluate sleep, stress, movement, and daily rituals impacting your energy and resilience.',
  },
]

export function ValueProposition() {
  return (
    <section className="bg-warm-white py-16">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className="text-center">
          <p className="font-lora text-3xl text-forest">Discover Your Wellness Baseline</p>
          <p className="mt-4 text-lg text-forest/80">
            This comprehensive assessment measures three critical areas that influence every aspect of your wellbeing.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm">
              <p className="font-lora text-xl text-forest">{value.title}</p>
              <p className="mt-3 text-sm text-forest/80">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
