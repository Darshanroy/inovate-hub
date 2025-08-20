"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRightCircle, Users, Calendar, DollarSign, BarChart3, TrendingUp, Award, Clock, MapPin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  date: string;
  rounds?: Array<{ name: string; date: string; description: string }>;
  prize: number;
  locationType: 'online' | 'offline';
  location?: string;
  image: string;
  hint: string;
  description: string;
  tracks: string[];
  rules: string;
  prizes: string;
  sponsors: any[];
  faq: any[];
  team_size: number;
  registration_count: number;
  team_count: number;
  created_at: string;
}

interface HackathonStats {
  totalRegistrations: number;
  totalTeams: number;
  submissionsReceived: number;
  averageTeamSize: number;
  topSkills: string[];
  registrationTrend: number[];
  genderDistribution: { male: number; female: number; other: number };
  locationDistribution: { online: number; offline: number };
}

export default function ViewHackathonPage() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [stats, setStats] = useState<HackathonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadHackathonData();
  }, [hackathonId]);

  const loadHackathonData = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view hackathon details.' });
        return;
      }

      // Load hackathon details
      const hackathonRes = await apiService.getHackathon(hackathonId);
      setHackathon(hackathonRes);

      // Load hackathon statistics (this would be a new API endpoint)
      // For now, we'll use mock data
      const mockStats: HackathonStats = {
        totalRegistrations: hackathonRes.registration_count || 0,
        totalTeams: hackathonRes.team_count || 0,
        submissionsReceived: Math.floor((hackathonRes.registration_count || 0) * 0.7), // 70% submission rate
        averageTeamSize: hackathonRes.team_size || 4,
        topSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
        registrationTrend: [12, 19, 25, 32, 45, 67, 89, 120, 156, 189, 234, 289],
        genderDistribution: { male: 65, female: 30, other: 5 },
        locationDistribution: { online: 80, offline: 20 }
      };
      setStats(mockStats);
    } catch (error: any) {
      console.error('Failed to load hackathon data:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load hackathon data' });
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (hackathon: Hackathon) => {
    const eventDate = parseISO(hackathon.date);
    const now = new Date();
    const eventEndDate = new Date(eventDate);
    eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration

    if (now > eventEndDate) return "Ended";
    if (now > eventDate) return "Ongoing";
    return "Upcoming";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Hackathon not found</h3>
          <p className="text-muted-foreground mb-4">The hackathon you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/organizer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <Button variant="ghost" size="sm" onClick={() => router.forward()}>
          <ArrowRightCircle className="mr-2 h-4 w-4" />
          Forward
        </Button>
      </div>

      {/* Hackathon Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{hackathon.name}</h1>
          <p className="text-muted-foreground mt-2">{hackathon.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={getEventStatus(hackathon) === 'Ongoing' ? 'default' : 'secondary'}>
              {getEventStatus(hackathon)}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(parseISO(hackathon.date), 'PPP')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {hackathon.locationType === 'online' ? 'Online' : hackathon.location || 'TBD'}
            </div>
            {hackathon.prize && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                ${hackathon.prize.toLocaleString()} prize pool
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/organizer/dashboard/edit/${hackathon.id}`)}>
            Edit Hackathon
          </Button>
          <Button onClick={() => router.push(`/organizer/dashboard/manage/${hackathon.id}`)}>
            Manage Event
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams Formed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Avg. {stats.averageTeamSize} members per team
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submissionsReceived}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.submissionsReceived / stats.totalRegistrations) * 100)}% submission rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(0, Math.ceil((parseISO(hackathon.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
              </div>
              <p className="text-xs text-muted-foreground">
                Until event starts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topSkills.map((skill, index) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm">{skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${100 - (index * 15)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {100 - (index * 15)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Male</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.genderDistribution.male}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{stats?.genderDistribution.male}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Female</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${stats?.genderDistribution.female}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{stats?.genderDistribution.female}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Other</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats?.genderDistribution.other}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{stats?.genderDistribution.other}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-1">
              {stats?.registrationTrend.map((value, index) => (
                <div key={index} className="flex-1 bg-primary rounded-t" style={{ height: `${(value / Math.max(...stats.registrationTrend)) * 100}%` }} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Last 12 days registration activity
            </p>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Location Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Online Participants</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.locationDistribution.online}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{stats?.locationDistribution.online}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Offline Participants</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats?.locationDistribution.offline}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{stats?.locationDistribution.offline}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Theme</h4>
              <p className="text-sm text-muted-foreground">{hackathon.theme}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Team Size</h4>
              <p className="text-sm text-muted-foreground">Up to {hackathon.team_size} members per team</p>
            </div>
            {hackathon.tracks && hackathon.tracks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tracks</h4>
                <div className="flex flex-wrap gap-1">
                  {hackathon.tracks.map((track) => (
                    <Badge key={track} variant="secondary" className="text-xs">
                      {track}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {hackathon.rounds && hackathon.rounds.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Event Rounds</h4>
                <div className="space-y-1">
                  {hackathon.rounds.map((round, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {round.name} - {format(parseISO(round.date), 'PPP')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
