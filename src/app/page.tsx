import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const hackathons = [
  {
    name: "AI Innovation Challenge",
    theme: "Artificial Intelligence",
    endsIn: "12d 4h 32m",
    image: "https://placehold.co/600x400.png",
    hint: "AI robot"
  },
  {
    name: "Sustainable Solutions Hackathon",
    theme: "Sustainability",
    endsIn: "8d 11h 15m",
    image: "https://placehold.co/600x400.png",
    hint: "green energy"
  },
  {
    name: "FinTech Disruption",
    theme: "Financial Technology",
    endsIn: "21d 2h 5m",
    image: "https://placehold.co/600x400.png",
    hint: "finance chart"
  },
  {
    name: "Healthcare Innovation Sprint",
    theme: "Healthcare",
    endsIn: "5d 1h 22m",
    image: "https://placehold.co/600x400.png",
    hint: "medical technology"
  },
  {
    name: "Creative Coding Marathon",
    theme: "Creative Coding",
    endsIn: "15d 18h 45m",
    image: "https://placehold.co/600x400.png",
    hint: "abstract art"
  },
  {
    name: "Data Science Decathlon",
    theme: "Data Science",
    endsIn: "30d 9h 0m",
    image: "https://placehold.co/600x400.png",
    hint: "data visualization"
  },
   {
    name: "AI Innovation Challenge",
    theme: "Artificial Intelligence",
    endsIn: "12d 4h 32m",
    image: "https://placehold.co/600x400.png",
    hint: "AI robot"
  },
  {
    name: "Sustainable Solutions Hackathon",
    theme: "Sustainability",
    endsIn: "8d 11h 15m",
    image: "https://placehold.co/600x400.png",
    hint: "green energy"
  },
];


export default function Home() {
  return (
    <main className="container mx-auto flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="rounded-full">Theme</Button>
            <Button variant="secondary" className="rounded-full">Date</Button>
            <Button variant="secondary" className="rounded-full">Prize Pool</Button>
            <Button variant="secondary" className="rounded-full">Online/Offline</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hackathons.map((hackathon, index) => (
          <Card key={index} className="bg-secondary border-white/10 flex transform flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
            <CardContent className="p-4 flex flex-col gap-3">
              <Image
                src={hackathon.image}
                alt={hackathon.name}
                width={600}
                height={400}
                className="mb-4 w-full h-auto aspect-video rounded-lg object-cover"
                data-ai-hint={hackathon.hint}
              />
              <div>
                <h3 className="text-lg font-bold leading-tight">{hackathon.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Theme: {hackathon.theme}</p>
                <p className="text-xs text-muted-foreground mt-1">Ends in: {hackathon.endsIn}</p>
              </div>
            </CardContent>
             <div className="p-4 pt-0">
                <Button className="w-full">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
