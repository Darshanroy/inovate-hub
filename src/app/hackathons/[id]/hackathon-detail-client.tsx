
"use client";

import React, { useEffect, useState } from "react";
import type { Hackathon } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Check, Share } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const JoinHackathonDialog = ({ open, onOpenChange, hackathonId }: { open: boolean, onOpenChange: (open: boolean) => void, hackathonId: string }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [lookingForTeam, setLookingForTeam] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Submitted!",
      description: "Your request to join has been sent to the organizers.",
    });
    onOpenChange(false);
    // In a real app, you would also update the user's registration status
    // and then redirect based on their team preference.
    setTimeout(() => {
      if (lookingForTeam) {
        router.push(`/hackathons/${hackathonId}/find-team`);
      } else {
        router.push(`/hackathons/${hackathonId}/team`);
      }
    }, 1000)
  }
  
  return (
     <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Hackathon</DialogTitle>
          <DialogDescription>
            Complete your registration to join this event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivation">Why do you want to join this hackathon?</Label>
            <Textarea id="motivation" placeholder="I'm excited to build..." required />
          </div>
           <div className="space-y-2">
            <Label>Do you have a team?</Label>
            <RadioGroup defaultValue="no" onValueChange={(value) => setLookingForTeam(value === 'no')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="r-yes" />
                <Label htmlFor="r-yes">Yes, I have a team code</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="r-no" />
                <Label htmlFor="r-no">No, I'm looking for a team</Label>
              </div>
            </RadioGroup>
          </div>
           <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio/Resume Link (Optional)</Label>
            <Input id="portfolio" placeholder="https://linkedin.com/in/..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Submit Registration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function HackathonDetailClientPage({ hackathon }: { hackathon: Hackathon }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);


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

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [hackathon]);

  
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
            <Button onClick={() => setIsJoinDialogOpen(true)} className="h-10 px-6 text-sm font-bold">
              Join Now
            </Button>
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
      <JoinHackathonDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen} hackathonId={hackathon.id} />
    </main>
  );
}
