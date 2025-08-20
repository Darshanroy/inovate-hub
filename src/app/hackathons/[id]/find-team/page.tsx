
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Crown, 
  
  ArrowLeft,
  Copy,
  Check,
  KeyRound,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import Link from "next/link";
import { Team, SoloParticipant } from "@/lib/data";

 

export default function FindTeamPage() {
  const [filter, setFilter] = useState("teams");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [teams, setTeams] = useState<any[]>([]);
  const [soloParticipants, setSoloParticipants] = useState<SoloParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedTeams, setRequestedTeams] = useState<string[]>([]);
  const [invitedParticipants, setInvitedParticipants] = useState<string[]>([]);
  const [teamCode, setTeamCode] = useState("");
  const [joiningTeam, setJoiningTeam] = useState(false);
  // AI matcher state
  const [aiSkills, setAiSkills] = useState("");
  const [aiInterests, setAiInterests] = useState("");
  const [aiMatches, setAiMatches] = useState<SoloParticipant[]>([]);
  const [aiSearching, setAiSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [invites, setInvites] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadTeamsAndParticipants();
  }, [hackathonId]);

  const loadTeamsAndParticipants = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view teams.' });
        return;
      }

      // Load teams
      const teamsRes = await apiService.listTeams(hackathonId);
      setTeams(teamsRes.teams || []);

      // Load participants (public-safe) scoped to this hackathon
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const url = new URL(`/hackathons/participants/public/${encodeURIComponent(hackathonId)}`, base).toString();
      const resp = await fetch(url, { cache: 'no-store' });
      const participantsRes = await resp.json();
      const solo = (participantsRes.participants || []).filter((p: any) => !p.team);
      setSoloParticipants(solo);
      if (token) {
        try {
          const invRes = await apiService.listInvitations(token);
          setInvites(invRes.invitations || []);
        } catch {
          setInvites([]);
        }
      }
    } catch (error: any) {
      console.error('Failed to load teams:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load teams' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToJoin = async (teamId: string, teamName: string) => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to join a team.' });
        return;
      }

      await apiService.requestJoinTeam(token, hackathonId, teamId, "I'd like to join your team!");
      setRequestedTeams(prev => [...prev, teamId]);
      toast({
        title: "Request Sent",
        description: `Your request to join ${teamName} has been sent.`
      });
    } catch (error: any) {
      toast({ title: 'Failed to send request', description: error.message || 'Something went wrong' });
    }
  };

  const handleJoinWithCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      toast({ title: 'Team code required', description: 'Please enter a team code.' });
      return;
    }

    try {
      setJoiningTeam(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to join a team.' });
        return;
      }

      await apiService.joinTeam(token, hackathonId, teamCode.trim());
      toast({
        title: "Successfully joined team!",
        description: `You have joined the team with code: ${teamCode}.`
      });
      
      // Clear the form
      setTeamCode("");
      
      // Redirect to team page after a short delay
      setTimeout(() => {
        router.push(`/hackathons/${hackathonId}/team`);
      }, 1000);
    } catch (error: any) {
      console.error('Join team error:', error);
      toast({ 
        title: 'Failed to join team', 
        description: error.message || 'Invalid team code or team is full' 
      });
    } finally {
      setJoiningTeam(false);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParticipants = soloParticipants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tokenize = (s: string) => (s || "").toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);
  const jaccard = (a: string[], b: string[]) => {
    const sa = new Set(a), sb = new Set(b);
    const inter = [...sa].filter(x => sb.has(x)).length;
    const union = new Set([...a, ...b]).size || 1;
    return inter / union;
  };

  const handleAiMatch = () => {
    setAiSearching(true);
    try {
      const desiredSkills = tokenize(aiSkills);
      const desiredInterests = tokenize(aiInterests);
      const results = [...soloParticipants]
        .map(p => {
          const pSkills = (p.skills || []).map((x: any) => String(x).toLowerCase());
          const scoreSkills = jaccard(desiredSkills, pSkills);
          const scoreInterests = desiredInterests.length ? jaccard(desiredInterests, pSkills) : 0;
          const score = scoreSkills * 0.7 + scoreInterests * 0.3;
          return { p, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(x => x.p);
      setAiMatches(results);
      if (results.length === 0) {
        toast({ title: 'No close matches', description: 'Try adding a few more skills or interests.' });
      }
    } finally {
      setAiSearching(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter">Find Your Team</h1>
          <p className="text-muted-foreground mt-2">Connect with other participants or join an existing team.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {/* AI Team Matcher (hackathon-specific) */}
          <Card className="bg-secondary/50 mb-8">
            <CardHeader>
              <CardTitle className="text-lg">AI Team Matcher</CardTitle>
              <CardDescription>Enter your skills and interests to discover participants in this hackathon who are a good fit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ai-skills">Your skills (comma separated)</Label>
                  <Input id="ai-skills" placeholder="React, Node.js, MongoDB" value={aiSkills} onChange={(e) => setAiSkills(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ai-interests">Interests (optional)</Label>
                  <Input id="ai-interests" placeholder="AI, FinTech, Web" value={aiInterests} onChange={(e) => setAiInterests(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAiMatch} disabled={aiSearching}> {aiSearching ? 'Finding…' : 'Find Matches'} </Button>
                {aiMatches.length > 0 && (
                  <span className="text-sm text-muted-foreground">Top matches: {aiMatches.length}</span>
                )}
              </div>
              {aiMatches.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 mt-2">
                  {aiMatches.map((participant) => (
                    <Card key={participant.id} className="bg-background">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{participant.name}</h4>
                            {participant.skills && participant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {participant.skills.slice(0, 6).map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button size="sm" onClick={() => setInvitedParticipants(prev => [...prev, participant.id])} disabled={invitedParticipants.includes(participant.id)}>
                          {invitedParticipants.includes(participant.id) ? 'Invited' : 'Invite'}
            </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mb-8">
            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <form className="flex items-center gap-2" onSubmit={handleJoinWithCode}>
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <Input
                    name="team-code"
                    placeholder="Enter team code to join..."
                    className="bg-transparent border-0 focus-visible:ring-0"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={joiningTeam}>
                    {joiningTeam ? 'Joining...' : 'Join'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg mb-6 max-w-md mx-auto">
            <Button 
              variant={filter === "teams" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("teams")}
              className="flex-1"
            >
              <Users className="mr-2 h-4 w-4" />
              Teams ({teams.length})
            </Button>
            <Button 
              variant={filter === "participants" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("participants")}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              Solo ({soloParticipants.length})
            </Button>
            <Button 
              variant={filter === "invitations" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("invitations")}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Invitations ({invites.length})
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${filter === "teams" ? "teams" : "participants"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-6">
            {filter === 'teams' && (
              <div className="space-y-4">
                {filteredTeams.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                    <p className="text-muted-foreground mb-4">
                      {teams.length === 0 ? "Be the first to create a team!" : "Try adjusting your search criteria."}
                    </p>
                    {teams.length === 0 && (
                      <Button onClick={() => setCreating(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Team
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredTeams.map(team => (
                    <Card key={team.id} className="bg-secondary/50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold">{team.name}</h3>
                            </div>
                            {team.description && (
                              <p className="text-muted-foreground mb-4">{team.description}</p>
                            )}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex -space-x-2">
                                {team.members.map((member: any) => (
                                  <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {team.members.length} / {team.max_members} members
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRequestToJoin(team.id, team.name)}
                            disabled={requestedTeams.includes(team.id)}
                            variant={requestedTeams.includes(team.id) ? "secondary" : "default"}
                          >
                            {requestedTeams.includes(team.id) ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Request Sent
                              </>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Request to Join
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {filter === 'participants' && (
              <div className="space-y-4">
                {filteredParticipants.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No solo participants found</h3>
                    <p className="text-muted-foreground">Everyone seems to have found their teams!</p>
                  </div>
                ) : (
                  filteredParticipants.map(participant => (
                    <Card key={participant.name} className="bg-secondary/50">
                      <CardContent className="p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold">{participant.name}</h3>
                            {participant.skills && participant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {participant.skills.map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={async () => {
                            try {
                              const token = getCookie('authToken');
                              if (!token) { toast({ title: 'Please log in' }); return; }
                              await apiService.inviteParticipant(token, hackathonId, participant.id);
                              setInvitedParticipants(prev => [...prev, participant.id]);
                              toast({ title: 'Invitation sent' });
                            } catch (e: any) {
                              toast({ title: 'Failed to invite', description: e?.message || 'Try again' });
                            }
                          }}
                          disabled={invitedParticipants.includes(participant.id)}
                          variant={invitedParticipants.includes(participant.id) ? "secondary" : "default"}
                        >
                          {invitedParticipants.includes(participant.id) ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Invited
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Invite
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {filter === 'invitations' && (
              <div className="space-y-4">
                {invites.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invitations</h3>
                    <p className="text-muted-foreground">Team leaders can invite you to join their teams here.</p>
                  </div>
                ) : (
                  invites.map((inv) => (
                    <Card key={inv.id} className="bg-secondary/50">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{inv.team_name}</h3>
                          {inv.message && <p className="text-muted-foreground mt-1">{inv.message}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={async () => {
                            try {
                              const token = getCookie('authToken');
                              if (!token) { toast({ title: 'Please log in' }); return; }
                              await apiService.respondInvitation(token, inv.id, 'accept');
                              toast({ title: 'Joined team' });
                              setInvites(prev => prev.filter(i => i.id !== inv.id));
                              router.push(`/hackathons/${hackathonId}/team`);
                            } catch (e: any) {
                              toast({ title: 'Failed to accept', description: e?.message || 'Try again' });
                            }
                          }}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              const token = getCookie('authToken');
                              if (!token) { toast({ title: 'Please log in' }); return; }
                              await apiService.respondInvitation(token, inv.id, 'reject');
                              toast({ title: 'Invitation rejected' });
                              setInvites(prev => prev.filter(i => i.id !== inv.id));
                            } catch (e: any) {
                              toast({ title: 'Failed to reject', description: e?.message || 'Try again' });
                            }
                          }}>Reject</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Team Dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
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
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                const token = getCookie('authToken');
                if (!token) { toast({ title: 'Please log in' }); return; }
                if (!teamName.trim()) { toast({ title: 'Team name is required' }); return; }
                await apiService.createTeam(token, hackathonId, { name: teamName.trim(), description: teamDesc.trim() || undefined });
                toast({ title: 'Team created' });
                setCreating(false);
                router.push(`/hackathons/${hackathonId}/team`);
              } catch (e: any) {
                toast({ title: 'Failed to create team', description: e?.message || 'Try again' });
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </>
  );
}
