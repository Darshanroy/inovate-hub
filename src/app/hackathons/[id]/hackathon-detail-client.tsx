
"use client";

import React, { useEffect, useMemo, useState } from "react";
type Round = { name: string; date: string; description: string };
type Hackathon = { id: string; name: string; theme: string; date: string; rounds?: Round[]; prize: number; locationType: 'online'|'offline'; image: string; hint: string; description: string; tracks?: string[]; rules?: string; prizes?: string; sponsors?: { name?: string; description?: string }[]; faq?: { question: string; answer: string }[] };
import type { Submission } from "@/lib/api";
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
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Removed dummy submission; will fetch real submission if available

const JoinHackathonDialog = ({ open, onOpenChange, hackathonId }: { open: boolean, onOpenChange: (open: boolean) => void, hackathonId: string }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [lookingForTeam, setLookingForTeam] = useState(true);
  const [motivation, setMotivation] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resumeLink, setResumeLink] = useState('');
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
        fullName: fullName || undefined,
        role: role || undefined,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        experienceLevel: experienceLevel || undefined,
        github: github || undefined,
        linkedin: linkedin || undefined,
        resumeLink: resumeLink || undefined,
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
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Join HackHub Hackathon</DialogTitle>
          <DialogDescription>
            Complete your registration to join this event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Frontend Developer" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivation">Why do you want to join this hackathon?</Label>
            <Textarea id="motivation" placeholder="I'm excited to build impactful solutions at HackHub..." required value={motivation} onChange={(e) => setMotivation(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" placeholder="React, Node.js, MongoDB" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Input id="experience" placeholder="Beginner / Intermediate / Advanced" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub (Optional)</Label>
              <Input id="github" placeholder="https://github.com/username" value={github} onChange={(e) => setGithub(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
              <Input id="linkedin" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio/Website (Optional)</Label>
              <Input id="portfolio" placeholder="https://myportfolio.site" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
            </div>
           <div className="space-y-2">
              <Label htmlFor="resume">Resume Link (Optional)</Label>
              <Input id="resume" placeholder="https://drive.google.com/..." value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
            </div>
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
  return (
    <div className="space-y-10 pt-8">
      {hackathon.description && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground">About the Challenge</h2>
          <p className="mt-4 text-base text-muted-foreground">{hackathon.description}</p>
        </div>
      )}
      {hackathon.sponsors && hackathon.sponsors.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Sponsors</h2>
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            {hackathon.sponsors.map((s: any, idx: number) => (
              <div key={`${s.name || idx}`} className="bg-secondary rounded-lg flex items-center justify-center p-4">
                <span className="text-sm text-muted-foreground">{s.name || 'Sponsor'}</span>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
                  {(() => {
                    const d = new Date(round.date);
                    return isNaN(d.getTime()) ? '—' : format(d, "PPP");
                  })()}
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
  !rules ? null : (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hackathon Rules</h3>
        <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{rules}</div>
        </div>
      </CardContent>
    </Card>
  </div>
  )
);

const TracksTab = ({ tracks }: { tracks?: string[] }) => (
  !tracks || tracks.length === 0 ? null : (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hackathon Tracks</h3>
        <div className="grid gap-4">
            {tracks.map((track, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{track}</h4>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  </div>
  )
);

const PrizesTab = ({ prizes }: { prizes?: string }) => (
  !prizes ? null : (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Prizes</h3>
        <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{prizes}</div>
        </div>
      </CardContent>
    </Card>
  </div>
  )
);

const SponsorsTab = ({ sponsors }: { sponsors?: { name?: string; description?: string }[] }) => {
  if (!sponsors || sponsors.length === 0) return null;
  return (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sponsors</h3>
        <div className="grid gap-4">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{sponsor.name}</h4>
                {sponsor.description && (
                <p className="text-sm text-muted-foreground">{sponsor.description}</p>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
};

const FAQTab = ({ faq }: { faq?: any[] }) => (
  !faq || faq.length === 0 ? null : (
  <div className="space-y-6">
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
            {faq.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-medium mb-2">{item.question}</h4>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  </div>
  )
);

// Removed MySubmissionTab component with dummy data; will render real data inline when available

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
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const firstRoundDate = useMemo(() => {
    if (hackathon.rounds && hackathon.rounds.length > 0) return new Date(hackathon.rounds[0].date);
    return new Date(hackathon.date);
  }, [hackathon]);
  const lastRoundDate = useMemo(() => {
    if (hackathon.rounds && hackathon.rounds.length > 0) return new Date(hackathon.rounds[hackathon.rounds.length - 1].date);
    const end = new Date(hackathon.date); end.setDate(end.getDate() + 2); return end;
  }, [hackathon]);
  const now = new Date();
  const isStarted = now >= firstRoundDate;
  const isEnded = now > lastRoundDate;

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
          // Load my submission if window is open
          try {
            if (now >= firstRoundDate && now <= lastRoundDate) {
              const subRes = await apiService.getMySubmission(token, hackathon.id);
              setMySubmission(subRes.submission || null);
            } else {
              setMySubmission(null);
            }
          } catch {
            setMySubmission(null);
          }
        }
      } catch {}
    })();
  }, [hackathon]);

  useEffect(() => {
    if (!hackathon) return;

    const targetDate = firstRoundDate; // Use first round date for countdown

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

  const navLinks = [
    hackathon.rules ? "Rules" : null,
    hackathon.tracks && hackathon.tracks.length > 0 ? "Tracks" : null,
    (hackathon as any).prizes ? "Prizes" : null,
    (hackathon as any).sponsors && (hackathon as any).sponsors.length > 0 ? "Sponsors" : null,
    (hackathon as any).faq && (hackathon as any).faq.length > 0 ? "FAQ" : null,
  ].filter(Boolean) as string[];

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
                <Button className="h-10 px-6 text-sm font-bold" disabled={!isStarted || isEnded} onClick={() => {
                  router.push(`/hackathons/${hackathon.id}/submission`);
                }} title={!isStarted ? 'Submissions open when the hackathon starts' : (isEnded ? 'Submissions are closed' : undefined)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Go to Submission
                </Button>
                {hasTeam ? (
                  <Button onClick={() => router.push(`/hackathons/${hackathon.id}/team`)} variant="outline" className="h-10 px-6 text-sm font-bold">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                ) : (
                  <Button onClick={() => router.push(`/hackathons/${hackathon.id}/find-team`)} variant="outline" className="h-10 px-6 text-sm font-bold">
                    <Users className="mr-2 h-4 w-4" />
                    Find Team
                  </Button>
                )}
                {!hasTeam && (
                  <Button variant="secondary" className="h-10 px-6 text-sm font-bold" onClick={() => setCreatingTeam(true)}>
                    Create Team
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
            {hackathon.rounds && hackathon.rounds.length > 0 && (
                <TabsTrigger value="timeline" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Timeline</TabsTrigger>
             )}
             {navLinks.map(link => (
                 <TabsTrigger key={link} value={link.toLowerCase()} className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">{link}</TabsTrigger>
            ))}
            {isRegistered && isStarted && !isEnded && (
                 <TabsTrigger value="submission" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">My Submission</TabsTrigger>
            )}
             {isRegistered && hasTeam && (
                 <TabsTrigger value="team" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">My Team</TabsTrigger>
            )}
           </TabsList>
            <TabsContent value="overview">
                <OverviewTab hackathon={hackathon} />
            </TabsContent>
            {hackathon.rounds && hackathon.rounds.length > 0 && (
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
            {isRegistered && isStarted && !isEnded && (
                <TabsContent value="submission">
                  <div className="pt-12">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">My Submission</h2>
                    {mySubmission ? (
                      <Card className="bg-secondary/50">
                        <CardContent className="p-8 space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">{mySubmission.project_title}</h3>
                            <Badge variant={mySubmission.status === 'draft' ? 'secondary' : 'default'} className="capitalize">{mySubmission.status}</Badge>
                          </div>
                          <p className="text-muted-foreground">{mySubmission.project_description}</p>
                          {mySubmission.tech_stack && mySubmission.tech_stack.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Tech Stack</h4>
                              <div className="flex flex-wrap gap-2">
                                {mySubmission.tech_stack.map(tech => <Badge key={tech} variant="outline">{tech}</Badge>)}
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            {mySubmission.github_link && (
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <Link href={mySubmission.github_link} className="text-sm text-accent hover:underline" target="_blank">{mySubmission.github_link}</Link>
                              </div>
                            )}
                            {mySubmission.video_link && (
                              <div className="flex items-center gap-2">
                                <Youtube className="h-4 w-4 text-muted-foreground" />
                                <Link href={mySubmission.video_link} className="text-sm text-accent hover:underline" target="_blank">{mySubmission.video_link}</Link>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-border pt-6 flex justify-end">
                            <Button asChild>
                              <Link href={`/hackathons/${hackathon.id}/submission`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Submission
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Submission Yet</h3>
                        <p className="text-muted-foreground mb-4">When submissions open, you can create and manage your project here.</p>
                        <Button asChild disabled={!isStarted || isEnded} title={!isStarted ? 'Submissions open when the hackathon starts' : (isEnded ? 'Submissions are closed' : undefined)}>
                          <Link href={`/hackathons/${hackathon.id}/submission`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Create Submission
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
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
                            <Button onClick={() => router.push(`/hackathons/${hackathon.id}/team`)}>
                                <Users className="mr-2 h-4 w-4" />
                                Go to Team Dashboard
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            )}
        </Tabs>
      </div>
      <JoinHackathonDialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen} hackathonId={hackathon.id} />

      {/* Create Team Dialog */}
      {isRegistered && !hasTeam && (
        <Dialog open={creatingTeam} onOpenChange={setCreatingTeam}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Create a Team</DialogTitle>
              <DialogDescription>Set your team name and agenda/description.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Awesome Devs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDesc">Agenda / Description</Label>
                <Textarea id="teamDesc" value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} placeholder="What your team aims to build..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreatingTeam(false)}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const token = getCookie('authToken');
                  if (!token) { toast({ title: 'Please log in' }); return; }
                  if (!teamName.trim()) { toast({ title: 'Team name is required' }); return; }
                  await apiService.createTeam(token, hackathon.id, { name: teamName.trim(), description: teamDesc.trim() || undefined });
                  toast({ title: 'Team created' });
                  setCreatingTeam(false);
                  router.push(`/hackathons/${hackathon.id}/team`);
                } catch (e: any) {
                  toast({ title: 'Failed to create team', description: e?.message || 'Try again' });
                }
              }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
