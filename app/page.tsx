export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Leyla&apos;s Apothecary
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-12">
          Premium Herbal Tinctures & Personalized Wellness
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Herbal Tinctures</h3>
            <p className="text-muted-foreground">
              Premium quality tinctures crafted with care
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Custom Compounds</h3>
            <p className="text-muted-foreground">
              Personalized formulations for your unique needs
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Consultations</h3>
            <p className="text-muted-foreground">
              Expert naturopathy guidance and support
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Platform under development - Coming soon!</p>
        </div>
      </div>
    </main>
  );
}
