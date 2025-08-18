import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const hackathons = [
  {
    name: "AI Innovation Challenge",
    deadline: "July 15th",
    prize: "$10,000",
    image: "https://placehold.co/600x400.png",
    hint: "AI innovation"
  },
  {
    name: "Sustainable Solutions Hack",
    deadline: "August 20th",
    prize: "$15,000",
    image: "https://placehold.co/600x400.png",
    hint: "sustainable solutions"
  },
  {
    name: "FinTech Disruptors",
    deadline: "September 5th",
    prize: "$20,000",
    image: "https://placehold.co/600x400.png",
    hint: "fintech"
  },
  {
    name: "HealthTech Revolution",
    deadline: "October 1st",
    prize: "$12,000",
    image: "https://placehold.co/600x400.png",
    hint: "healthtech"
  },
];

export function UpcomingHackathons() {
  return (
    <section className="py-20 px-6 container mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 font-headline">Upcoming Hackathons</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {hackathons.map((hackathon) => (
          <Card key={hackathon.name} className="bg-secondary border-white/10 overflow-hidden group transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10">
            <Image
              src={hackathon.image}
              alt={`${hackathon.name} banner`}
              width={600}
              height={400}
              data-ai-hint={hackathon.hint}
              className="w-full h-40 object-cover transition-transform group-hover:scale-105"
            />
            <CardContent className="p-5">
              <h3 className="text-lg font-bold font-headline">{hackathon.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Deadline: {hackathon.deadline}</p>
              <p className="text-sm font-bold text-accent mt-2">Prize: {hackathon.prize}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
