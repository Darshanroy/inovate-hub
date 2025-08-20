
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { 
  Eye, 
  Users, 
  FileText, 
  Calendar, 
  Search, 
  Filter,
  Crown,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format, isPast, isFuture, parseISO } from "date-fns";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export type Round = { name: string; date: string; description: string };
export type Hackathon = { 
  id: string; 
  name: string; 
  rounds?: Round[]; 
  date: string; 
  image: string; 
  hint: string; 
  description: string; 
  locationType: 'online'|'offline'; 
  registrationStatus?: 'Confirmed'|'Pending'|'Waitlisted'; 
  teamId?: string|null; 
  submissionStatus?: 'Not Started'|'Draft'|'Submitted';
  team?: {
    id: string;
    name: string;
    code: string;
    members: Array<{
      id: string;
      name: string;
      email: string;
      isLeader: boolean;
    }>;
  };
};

const getEventStatus = (hackathon: Hackathon) => {
  if (hackathon.rounds && hackathon.rounds.length > 0) {
    const firstRoundDate = parseISO(hackathon.rounds[0].date);
    const lastRoundDate = parseISO(hackathon.rounds[hackathon.rounds.length - 1].date);
    
    if (isPast(lastRoundDate)) return "Ended";
    if (isFuture(firstRoundDate)) return "Not Started";
    return "Ongoing";
  }
  // Fallback for single-date hackathons
  const eventDate = parseISO(hackathon.date);
  const eventEndDate = new Date(eventDate);
  eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration

  if (isPast(eventEndDate)) return "Ended";
  if (isFuture(eventDate)) return "Not Started";
  return "Ongoing";
}

export default function MyHackathonsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view your hackathons.' });
        return;
      }

      // Load registrations
      const registrationsRes = await apiService.myRegistrations(token);
      const registeredHackathons = registrationsRes.hackathons || [];

      // Load team information for each hackathon
      const hackathonsWithTeams = await Promise.all(
        registeredHackathons.map(async (hackathon: any) => {
          try {
            const teamRes = await apiService.getMyTeam(token, hackathon.id);
            return {
              ...hackathon,
              team: teamRes.team,
              teamId: teamRes.team ? teamRes.team.id : null
            };
          } catch (error) {
            // User might not be in a team for this hackathon
            return {
              ...hackathon,
              team: null,
              teamId: null
            };
          }
        })
      );

      setHackathons(hackathonsWithTeams);
    } catch (error: any) {
      console.error('Failed to load hackathons:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load hackathons' });
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = useMemo(() => {
    let list = hackathons.slice();
    if (statusFilter !== "All") {
      list = list.filter(h => getEventStatus(h) === statusFilter);
    }
    if (searchTerm) {
      list = list.filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list.sort((a,b) => {
      const dateA = a.rounds && a.rounds[0] ? new Date(a.rounds[0].date) : new Date(a.date);
      const dateB = b.rounds && b.rounds[0] ? new Date(b.rounds[0].date) : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [hackathons, statusFilter, searchTerm]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <Clock className="h-4 w-4" />;
      case 'Ongoing':
        return <AlertCircle className="h-4 w-4" />;
      case 'Ended':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-green-100 text-green-800';
      case 'Ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading your hackathons..." />;
  }

  return (
    <div className="container mx-auto max-w-6xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Hackathons</h1>
        <p className="text-muted-foreground">Track your hackathon registrations and team progress.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hackathons or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("All")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "Not Started" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("Not Started")}
          >
            Upcoming
          </Button>
          <Button
            variant={statusFilter === "Ongoing" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("Ongoing")}
          >
            Ongoing
          </Button>
          <Button
            variant={statusFilter === "Ended" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("Ended")}
          >
            Ended
          </Button>
        </div>
      </div>

      {filteredHackathons.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {hackathons.length === 0 ? "No hackathons yet" : "No hackathons found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hackathons.length === 0 
              ? "Join your first hackathon to get started!" 
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {hackathons.length === 0 && (
            <LoadingButton href="/hackathons" loadingMessage="Opening hackathons...">
              Browse Hackathons
            </LoadingButton>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHackathons.map((hackathon) => {
            const status = getEventStatus(hackathon);
            const displayDate = hackathon.rounds && hackathon.rounds[0] ? hackathon.rounds[0].date : hackathon.date;
            
            return (
              <Card key={hackathon.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{hackathon.name}</h3>
                        <Badge className={getStatusColor(status)}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{status}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{hackathon.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(displayDate), "PPP")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {hackathon.locationType}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {hackathon.registrationStatus || 'Confirmed'}
                          </div>
                          <div className="text-sm text-muted-foreground">Registration Status</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {hackathon.team ? hackathon.team.members.length : 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Team Members</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {hackathon.submissionStatus || 'Not Started'}
                          </div>
                          <div className="text-sm text-muted-foreground">Submission Status</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="mt-4">
                      {hackathon.team ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{hackathon.team.name}</h4>
                              <p className="text-sm text-muted-foreground">Code: {hackathon.team.code}</p>
                            </div>
                            <Badge variant="outline">
                              {hackathon.team.members.length} members
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {hackathon.team.members.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{member.name}</span>
                                      {member.isLeader && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Crown className="mr-1 h-3 w-3" />
                                          Leader
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground mb-4">You're not part of a team yet</p>
                          <LoadingButton 
                            href={`/hackathons/${hackathon.id}/find-team`}
                            loadingMessage="Finding teams..."
                          >
                            Find a Team
                          </LoadingButton>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="actions" className="mt-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <LoadingButton 
                          href={`/hackathons/${hackathon.id}`}
                          variant="outline" 
                          size="sm"
                          loadingMessage="Opening hackathon..."
                        >
                          <Eye className="mr-2 h-4 w-4"/>
                          View Details
                        </LoadingButton>
                        
                        {status === 'Not Started' && hackathon.team && (
                          <LoadingButton 
                            href={`/hackathons/${hackathon.id}/team`}
                            variant="outline" 
                            size="sm"
                            loadingMessage="Opening team management..."
                          >
                            <Users className="mr-2 h-4 w-4"/>
                            Manage Team
                          </LoadingButton>
                        )}
                        
                        {status === 'Not Started' && !hackathon.team && (
                          <LoadingButton 
                            href={`/hackathons/${hackathon.id}/find-team`}
                            variant="secondary" 
                            size="sm"
                            loadingMessage="Finding teams..."
                          >
                            <Users className="mr-2 h-4 w-4"/>
                            Join a Team
                          </LoadingButton>
                        )}
                        
                        {status === 'Ongoing' && (!hackathon.submissionStatus || hackathon.submissionStatus === 'Not Started') && (
                          <LoadingButton 
                            href={`/hackathons/${hackathon.id}/submission`}
                            size="sm"
                            loadingMessage="Opening submission..."
                          >
                            <FileText className="mr-2 h-4 w-4"/>
                            Submit Project
                          </LoadingButton>
                        )}
                        
                        {status === 'Ongoing' && hackathon.submissionStatus === 'Draft' && (
                          <LoadingButton 
                            href={`/hackathons/${hackathon.id}/submission`}
                            size="sm" 
                            variant="secondary"
                            loadingMessage="Opening submission..."
                          >
                            <FileText className="mr-2 h-4 w-4"/>
                            Edit Submission
                          </LoadingButton>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
