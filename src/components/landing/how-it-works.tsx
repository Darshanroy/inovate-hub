const steps = ["Register", "Team", "Build", "Submit", "Win"];

export function HowItWorks() {
  return (
    <section className="py-20 px-6 container mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 font-headline">How It Works</h2>
      <div className="relative">
        <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-secondary -translate-y-1/2"></div>
        <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent -translate-y-1/2"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0">
          {steps.map((step, index) => (
            <div key={step} className="text-center md:w-1/5 flex flex-col items-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground font-headline">
                {index + 1}
              </div>
              <p className="mt-4 font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
