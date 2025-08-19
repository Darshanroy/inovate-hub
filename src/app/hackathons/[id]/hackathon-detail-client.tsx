
"use client";

import React, { useEffect, useState } from "react";
type Round = { name: string; date: string; description: string };
type Hackathon = { id: string; name: string; theme: string; date: string; rounds?: Round[]; prize: number; locationType: 'online'|'offline'; image: string; hint: string; description: string; tracks?: string[]; rules?: string; prizes?: string; sponsors?: any[]; faq?: any[] };
type Submission = { title: string; description: string; techStack: string[]; githubUrl: string; videoUrl: string; status: 'draft'|'submitted' };
import { Button } from "@/components/ui/button";
import { Check, Edit, FileText, Link as LinkIcon, Share, Youtube, CalendarDays, Users } from "lucide-react";
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

// Mock data for mySubmission
const mySubmission: Submission = {
  title: "My Awesome Project",
  description: "A revolutionary application that solves real-world problems...",
  techStack: ["React", "Node.js", "MongoDB"],
  githubUrl: "https://github.com/myuser/myproject",
  videoUrl: "https://youtube.com/watch?v=example",
  status: 'draft'
};

const JoinHackathonDialog = ({ open, onOpenChange, hackathonId }: { open: boolean, onOpenChange: (open: boolean) => void, hackathonId: string }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [lookingForTeam, setLookingForTeam] = useState(true);
  const [motivation, setMotivation] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to join.' });
        return;
      }
      const res = await apiService.registerForHackathon(token, hackathonId, {
        motivation,
        hasTeam: !lookingForTeam,
        teamCode: teamCode || undefined,
        portfolio: portfolio || undefined,
      });
      toast({ title: res.message || 'Registration Submitted!' });
      onOpenChange(false);
      setTimeout(() => {
        if (lookingForTeam) {
          router.push(`/hackathons/${hackathonId}/find-team`);
        } else {
          router.push(`/hackathons/${hackathonId}/team`);
        }
      }, 500);
    } catch (err: any) {
      toast({ title: 'Registration failed', description: String(err?.message || err) });
    } finally {
      setSubmitting(false);
    }
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
            <Textarea id="motivation" placeholder="I'm excited to build..." required value={motivation} onChange={(e) => setMotivation(e.target.value)} />
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
          {!lookingForTeam && (
            <div className="space-y-2">
              <Label htmlFor="teamCode">Team Code</Label>
              <Input id="teamCode" placeholder="Enter your team code" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} />
            </div>
          )}
           <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio/Resume Link (Optional)</Label>
            <Input id="portfolio" placeholder="https://linkedin.com/in/..." value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Registration'}</Button>
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

const TimelineTab = ({ rounds }: { rounds: Round[] }) => (
  <div className="space-y-6">
    <div className="grid gap-6">
      {rounds.map((round, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{round.name}</h3>
                <p className="text-muted-foreground mb-2">{round.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {format(new Date(round.date), "PPP")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const RulesTab = ({ rules }: { rules?: string }) => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hackathon Rules</h3>
        <div className="prose prose-sm max-w-none">
          {rules ? (
            <div className="whitespace-pre-wrap">{rules}</div>
          ) : (
            <div className="space-y-4">
              <p>Standard hackathon rules apply:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All code must be written during the hackathon period</li>
                <li>Teams can consist of 1-4 members</li>
                <li>Use of open-source libraries is allowed</li>
                <li>Projects must be original and not previously submitted</li>
                <li>All team members must be registered participants</li>
                <li>Submissions must include source code and documentation</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const TracksTab = ({ tracks }: { tracks?: string[] }) => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hackathon Tracks</h3>
        <div className="grid gap-4">
          {tracks && tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{track}</h4>
              </div>
            ))
          ) : (
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Web Development</h4>
                <p className="text-sm text-muted-foreground mt-1">Build innovative web applications</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Mobile Development</h4>
                <p className="text-sm text-muted-foreground mt-1">Create mobile apps for iOS/Android</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">AI/ML</h4>
                <p className="text-sm text-muted-foreground mt-1">Leverage artificial intelligence and machine learning</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Blockchain</h4>
                <p className="text-sm text-muted-foreground mt-1">Build decentralized applications</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const PrizesTab = ({ prizes }: { prizes?: string }) => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Prizes</h3>
        <div className="prose prose-sm max-w-none">
          {prizes ? (
            <div className="whitespace-pre-wrap">{prizes}</div>
          ) : (
            <div className="grid gap-6">
              <div className="text-center p-6 border rounded-lg">
                <h4 className="text-2xl font-bold text-primary mb-2">🥇 1st Place</h4>
                <p className="text-lg font-semibold">$10,000</p>
                <p className="text-sm text-muted-foreground">Plus mentorship and resources</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <h4 className="text-2xl font-bold text-primary mb-2">🥈 2nd Place</h4>
                <p className="text-lg font-semibold">$5,000</p>
                <p className="text-sm text-muted-foreground">Plus mentorship opportunities</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <h4 className="text-2xl font-bold text-primary mb-2">🥉 3rd Place</h4>
                <p className="text-lg font-semibold">$2,500</p>
                <p className="text-sm text-muted-foreground">Plus networking opportunities</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const SponsorsTab = ({ sponsors }: { sponsors?: any[] }) => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sponsors</h3>
        <div className="grid gap-4">
          {sponsors && sponsors.length > 0 ? (
            sponsors.map((sponsor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{sponsor.name}</h4>
                <p className="text-sm text-muted-foreground">{sponsor.description}</p>
              </div>
            ))
          ) : (
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">TechCorp</h4>
                <p className="text-sm text-muted-foreground">Leading technology company</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">InnovateHub</h4>
                <p className="text-sm text-muted-foreground">Innovation platform</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">StartupFund</h4>
                <p className="text-sm text-muted-foreground">Venture capital firm</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const FAQTab = ({ faq }: { faq?: any[] }) => (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faq && faq.length > 0 ? (
            faq.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-medium mb-2">{item.question}</h4>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">When does the hackathon start?</h4>
                <p className="text-sm text-muted-foreground">The hackathon starts on the date specified in the timeline.</p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">How many people can be in a team?</h4>
                <p className="text-sm text-muted-foreground">Teams can have 1-4 members.</p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">What technologies can I use?</h4>
                <p className="text-sm text-muted-foreground">You can use any programming language, framework, or technology stack.</p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">How do I submit my project?</h4>
                <p className="text-sm text-muted-foreground">Submit your project through the submission portal with source code and documentation.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

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
  const [hasTeam, setHasTeam] = useState(false);

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
        
        // Check if user has a team
        if (found) {
          try {
            const teamRes = await apiService.getMyTeam(token, hackathon.id);
            setHasTeam(!!teamRes.team);
          } catch (error) {
            setHasTeam(false);
          }
        }
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
              <div className="flex items-center gap-2">
                <Button asChild className="h-10 px-6 text-sm font-bold">
                  <Link href={`/hackathons/${hackathon.id}/submission`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Go to Submission
                  </Link>
                </Button>
                {hasTeam ? (
                  <Button asChild variant="outline" className="h-10 px-6 text-sm font-bold">
                    <Link href={`/hackathons/${hackathon.id}/team`}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="h-10 px-6 text-sm font-bold">
                    <Link href={`/hackathons/${hackathon.id}/find-team`}>
                      <Users className="mr-2 h-4 w-4" />
                      Find Team
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
                <Button onClick={async () => { try { const t = getCookie('authToken'); if (!t) return setIsJoinDialogOpen(true); setIsJoinDialogOpen(true); } catch {} }} className="h-10 px-6 text-sm font-bold">
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
                 <TabsTrigger key={link} value={link.toLowerCase()} className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">{link}</TabsTrigger>
            ))}
             {isRegistered && (
                 <TabsTrigger value="submission" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">My Submission</TabsTrigger>
            )}
             {isRegistered && hasTeam && (
                 <TabsTrigger value="team" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">My Team</TabsTrigger>
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
            <TabsContent value="rules">
                <RulesTab rules={hackathon.rules} />
            </TabsContent>
            <TabsContent value="tracks">
                <TracksTab tracks={hackathon.tracks} />
            </TabsContent>
            <TabsContent value="prizes">
                <PrizesTab prizes={hackathon.prizes} />
            </TabsContent>
            <TabsContent value="sponsors">
                <SponsorsTab sponsors={hackathon.sponsors} />
            </TabsContent>
            <TabsContent value="faq">
                <FAQTab faq={hackathon.faq} />
            </TabsContent>
            {isRegistered && (
                <TabsContent value="submission">
                    <MySubmissionTab submission={mySubmission} hackathonId={hackathon.id} />
                </TabsContent>
            )}
            {isRegistered && hasTeam && (
                <TabsContent value="team">
                    <div className="pt-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">My Team</h2>
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                            <p className="text-muted-foreground mb-4">Manage your team, view members, and handle team requests.</p>
                            <Button asChild>
                                <Link href={`/hackathons/${hackathon.id}/team`}>
                                    <Users className="mr-2 h-4 w-4" />
                                    Go to Team Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            )}
        </Tabs>
      </div>
      <JoinHackathonDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen} hackathonId={hackathon.id} />
    </main>
  );
}
