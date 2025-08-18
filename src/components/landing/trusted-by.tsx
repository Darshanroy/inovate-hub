import Image from "next/image";

const logos = [
  { name: "Google Cloud", src: "https://placehold.co/128x32.png", hint: "Google Cloud logo" },
  { name: "AWS", src: "https://placehold.co/128x32.png", hint: "AWS logo" },
  { name: "Microsoft Azure", src: "https://placehold.co/128x40.png", hint: "Microsoft Azure logo" },
  { name: "GitHub", src: "https://placehold.co/128x48.png", hint: "GitHub logo" },
  { name: "Cloudflare", src: "https://placehold.co/128x32.png", hint: "Cloudflare logo" },
];

export function TrustedBy() {
  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">Trusted by Industry Leaders</h2>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
          {logos.map((logo) => (
            <Image
              key={logo.name}
              alt={`${logo.name} Logo`}
              src={logo.src}
              width={128}
              height={48}
              data-ai-hint={logo.hint}
              className="h-auto w-auto opacity-60 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
