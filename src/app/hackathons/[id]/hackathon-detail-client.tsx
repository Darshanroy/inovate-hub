
"use client";

import React, { useEffect, useState } from "react";
type Round = { name: string; date: string; description: string };
type Hackathon = { id: string; name: string; theme: string; date: string; rounds?: Round[]; prize: number; locationType: 'online'|'offline'; image: string; hint: string; description: string };
type Submission = { title: string; description: string; techStack: string[]; githubUrl: string; videoUrl: string; status: 'draft'|'submitted' };
import { Button } from "@/components/ui/button";
import { Check, Edit, FileText, Link as LinkIcon, Share, Youtube, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";


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

const OverviewTab = ({ hackathon }: { hackathon: Hackathon }) => {
   const progressSteps = ["Register", "Team", "Submit", "Judge", "Results"];
   const sponsors = [
    { name: "Sponsor 1", image: "https://placehold.co/200x80.png", hint: "company logo" },
    { name: "Sponsor 2", image: "https://placehold.co/200x80.png", hint: "company logo" },
    { name: "Sponsor 3", image: "https://placehold.co/200x80.png", hint: "company logo" },
    { name: "Sponsor 4", image: "https://placehold.co/200x80.png", hint: "company logo" },
  ]
  return (
    <div className="space-y-12">
       <div className="pt-12">
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
        <div>
          <h2 className="text-2xl font-semibold text-foreground">About the Challenge</h2>
          <p className="mt-4 text-base text-muted-foreground">
           {hackathon.description}
          </p>
        </div>
        <div>
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
  )
}

const TimelineTab = ({ rounds }: { rounds: Round[] }) => {
    return (
        <div className="pt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-8">Event Timeline</h2>
            <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border">
                {rounds.map((round, index) => (
                    <div key={index} className="relative pl-8 py-4 grid md:grid-cols-[1fr_2fr] gap-6">
                         <div className="absolute -left-7 top-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="text-right pr-8">
                             <time className="block text-sm font-semibold uppercase tracking-wider text-primary">{format(new Date(round.date), "dd MMMM yyyy")}</time>
                             <h3 className="text-lg font-bold text-foreground">{round.name}</h3>
                        </div>
                        <div>
                             <p className="text-muted-foreground">{round.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const MySubmissionTab = ({ submission, hackathonId }: { submission: Submission, hackathonId: string }) => {
    return (
        <div className="pt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">My Submission</h2>
             <Card className="bg-secondary/50">
                <CardContent className="p-8 space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">{submission.title}</h3>
                        <Badge variant={submission.status === 'draft' ? 'secondary' : 'default'} className="capitalize">{submission.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">{submission.description}</p>
                    <div>
                        <h4 className="font-semibold mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                           {submission.techStack.map(tech => <Badge key={tech} variant="outline">{tech}</Badge>)}
                        </div>
                    </div>
                    <div className="space-y-4">
                         <h4 className="font-semibold">Links</h4>
                        <div className="flex items-center gap-2">
                             <LinkIcon className="h-4 w-4 text-muted-foreground" />
                             <Link href={submission.githubUrl} className="text-sm text-accent hover:underline" target="_blank">{submission.githubUrl}</Link>
                        </div>
                         <div className="flex items-center gap-2">
                             <Youtube className="h-4 w-4 text-muted-foreground" />
                              <Link href={submission.videoUrl} className="text-sm text-accent hover:underline" target="_blank">{submission.videoUrl}</Link>
                        </div>
                    </div>
                     {submission.status === 'draft' && (
                        <div className="border-t border-border pt-6 flex justify-end">
                            <Button asChild>
                                <Link href={`/hackathons/${hackathonId}/submission`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Submission
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
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
  
  const [isRegistered, setIsRegistered] = useState(false);

  const getTargetDate = () => {
    if (hackathon.rounds && hackathon.rounds.length > 0) {
        // Use the first round's date for countdown
        return new Date(hackathon.rounds[0].date);
    }
    return new Date(hackathon.date);
  }

  useEffect(() => {
    if (!hackathon) return;
    (async () => {
      try {
        const token = getCookie('authToken');
        if (!token) return;
        const res = await apiService.myRegistrations(token);
        const found = (res.hackathons || []).some((h: any) => h.id === hackathon.id);
        setIsRegistered(found);
      } catch {}
    })();
  }, [hackathon]);

  useEffect(() => {
    if (!hackathon) return;

    const targetDate = getTargetDate();

    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
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

  const navLinks = ["Rules", "Tracks", "Prizes", "Sponsors", "FAQ"];
  const submission: Submission = { title: "", description: "", techStack: [], githubUrl: "", videoUrl: "", status: 'draft' };
  const hasTimeline = hackathon.rounds && hackathon.rounds.length > 0;

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
            {isRegistered ? (
               <Button asChild className="h-10 px-6 text-sm font-bold">
                  <Link href={`/hackathons/${hackathon.id}/submission`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Go to Submission
                  </Link>
                </Button>
            ) : (
                <Button onClick={async () => { try { const t = getCookie('authToken'); if (!t) return setIsJoinDialogOpen(true); await apiService.registerForHackathon(t, hackathon.id); setIsRegistered(true);} catch {} }} className="h-10 px-6 text-sm font-bold">
                  Join Now
                </Button>
            )}
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
         <Tabs defaultValue="overview" className="mt-8">
           <TabsList className="border-b border-border w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger value="overview" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Overview</TabsTrigger>
             {hasTimeline && (
                <TabsTrigger value="timeline" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Timeline</TabsTrigger>
             )}
             {navLinks.map(link => (
                 <TabsTrigger key={link} value={link.toLowerCase()} disabled className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">{link}</TabsTrigger>
            ))}
             {isRegistered && (
                 <TabsTrigger value="submission" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">My Submission</TabsTrigger>
            )}
           </TabsList>
            <TabsContent value="overview">
                <OverviewTab hackathon={hackathon} />
            </TabsContent>
             {hasTimeline && (
                <TabsContent value="timeline">
                    <TimelineTab rounds={hackathon.rounds!} />
                </TabsContent>
            )}
            {isRegistered && (
                <TabsContent value="submission">
                    <MySubmissionTab submission={mySubmission} hackathonId={hackathon.id} />
                </TabsContent>
            )}
        </Tabs>
      </div>
      <JoinHackathonDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen} hackathonId={hackathon.id} />
    </main>
  );
}
