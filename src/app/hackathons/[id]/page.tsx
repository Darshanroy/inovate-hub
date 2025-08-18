
"use client";

import { useEffect, useState } from "react";
import { hackathons } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Check, Share } from "lucide-react";
import Image from "next/image";

// Helper to add Material Symbols link
const useMaterialSymbols = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
};


export default function HackathonDetailPage({ params }: { params: { id: string } }) {
  useMaterialSymbols();
  const hackathon = hackathons.find((h) => h.id === params.id);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!hackathon) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(hackathon.date) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [hackathon]);


  if (!hackathon) {
    notFound();
  }
  
  const progressSteps = ["Register", "Team", "Submit", "Judge", "Results"];

  const sponsors = [
    { name: "Sponsor 1", image: "https://placehold.co/200x80.png", hint: "company logo" },
    { name: "Sponsor 2", image: "https://placehold.co/200x80.png", hint: "company logo" },
    { name: "Sponsor 3", image: "https://placehold.co/200x80.png", hint: "company logo" },
    { name: "Sponsor 4", image: "https://placehold.co/200x80.png", hint: "company logo" },
  ]

  return (
    <main className="container mx-auto max-w-7xl flex-1 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative min-h-[300px] w-full overflow-hidden rounded-2xl bg-cover bg-center shadow-lg">
          <Image
            src={hackathon.image}
            alt={hackathon.name}
            fill
            className="object-cover"
            data-ai-hint={hackathon.hint}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter text-white">{hackathon.name}</h1>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button className="h-10 px-6 text-sm font-bold">Join Now</Button>
            <Button variant="secondary" className="h-10 px-6 text-sm font-bold">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-4xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            <div className="text-4xl font-bold">:</div>
            <div>
              <div className="text-4xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">Hours</div>
            </div>
            <div className="text-4xl font-bold">:</div>
            <div>
              <div className="text-4xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
             <div className="text-4xl font-bold">:</div>
            <div>
              <div className="text-4xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">Seconds</div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <a className="whitespace-nowrap border-b-2 border-primary px-1 py-4 text-sm font-medium text-primary" href="#">Overview</a>
            <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground" href="#">Rules</a>
            <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground" href="#">Tracks</a>
            <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground" href="#">Timeline</a>
            <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground" href="#">Prizes</a>
            <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground" href="#">Sponsors</a>
            <a className="whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-sm font-medium text-muted-foreground hover:border-gray-300 hover:text-foreground" href="#">FAQ</a>
          </nav>
        </div>
        <div className="py-12">
          <h2 className="text-2xl font-semibold text-foreground">Hackathon Progress</h2>
          <div className="mt-6 flex items-center space-x-4">
             {progressSteps.map((step, index) => (
                <React.Fragment key={step}>
                <div className={`flex flex-col items-center ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`flex size-10 items-center justify-center rounded-full ${index === 0 ? 'bg-primary text-primary-foreground' : 'border-2 border-border'}`}>
                    {index === 0 ? <Check className="h-5 w-5" /> : index + 1}
                    </div>
                    <div className="mt-2 text-sm font-medium">{step}</div>
                </div>
                {index < progressSteps.length - 1 && <div className="flex-1 border-t-2 border-dashed border-border"></div>}
                </React.Fragment>
            ))}
          </div>
        </div>
        <div className="py-8">
          <h2 className="text-2xl font-semibold text-foreground">About the Challenge</h2>
          <p className="mt-4 text-base text-muted-foreground">
           {hackathon.description}
          </p>
        </div>
        <div className="py-8">
          <h2 className="text-2xl font-semibold text-foreground">Sponsors</h2>
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            {sponsors.map(sponsor => (
                 <div key={sponsor.name} className="bg-secondary rounded-lg flex items-center justify-center p-4">
                    <Image src={sponsor.image} alt={sponsor.name} width={200} height={80} className="object-contain saturate-0" data-ai-hint={sponsor.hint}/>
                </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
