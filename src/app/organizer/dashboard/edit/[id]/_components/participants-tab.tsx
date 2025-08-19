
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, User, Mail, ExternalLink, Calendar } from "lucide-react"
import { apiService, Participant } from "@/lib/api"
import { getCookie } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"

export function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const params = useParams();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadParticipants();
  }, [hackathonId]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view participants.' });
        return;
      }
      const res = await apiService.getHackathonParticipants(token, hackathonId);
      setParticipants(res.participants || []);
      
      // Also load teams for the teams tab
      const teamsRes = await apiService.listTeams(hackathonId);
      setTeams(teamsRes.teams || []);
    } catch (error: any) {
      console.error('Failed to load participants:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load participants' });
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const soloParticipants = participants.filter(p => !p.team);
  const teamParticipants = participants.filter(p => p.team);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading participants...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>
          Manage and view all participants registered for this hackathon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({participants.length})</TabsTrigger>
            <TabsTrigger value="solo">Solo ({soloParticipants.length})</TabsTrigger>
            <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="space-y-4">
              {filteredParticipants.map(participant => (
                <Card key={participant.id} className="bg-secondary/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{participant.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </div>
                          {participant.team && (
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="h-3 w-3 text-blue-500" />
                              <span className="text-sm text-blue-600 font-medium">
                                Team: {participant.team.team_name} ({participant.team.team_code})
                              </span>
                            </div>
                          )}
                          {participant.looking_for_team && !participant.team && (
                            <Badge variant="outline" className="mt-1">
                              <User className="mr-1 h-3 w-3" />
                              Looking for team
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(participant.registration_date).toLocaleDateString()}
                        </div>
                        {participant.portfolio_link && (
                          <Button variant="ghost" size="sm" asChild className="mt-2">
                            <a href={participant.portfolio_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Portfolio
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {participant.motivation && (
                      <div className="mt-4 p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Motivation:</strong> {participant.motivation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="solo" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search solo participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="space-y-4">
              {soloParticipants.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(participant => (
                <Card key={participant.id} className="bg-secondary/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{participant.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            <User className="mr-1 h-3 w-3" />
                            Solo participant
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(participant.registration_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {participant.motivation && (
                      <div className="mt-4 p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Motivation:</strong> {participant.motivation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <Card key={team.id} className="bg-background">
                  <CardHeader>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription>Code: {team.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {team.members.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          {member.id === team.leader_id && (
                            <Badge variant="secondary" className="text-xs">Leader</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {team.members.length} / {team.max_members} members
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{participants.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Solo Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{soloParticipants.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
