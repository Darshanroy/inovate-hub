"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRightCircle, Users, Award, FileText, Settings, Download, Filter, Search, Eye, Clock, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  date: string;
  registration_count: number;
  team_count: number;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  team?: string;
  registration_date: string;
  skills: string[];
}

interface Submission {
  id: string;
  hackathon_id: string;
  team_id: string;
  team_name: string;
  project_title: string;
  project_description: string;
  tech_stack: string[];
  github_link?: string;
  video_link?: string;
  files: any[];
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  score?: number;
  feedback?: string;
  submitted_at: string;
  updated_at: string;
  created_at: string;
}

interface Judge {
  id: string;
  name: string;
  email: string;
  avatar: string;
  expertise: string[];
  assigned_submissions: number;
}

export default function ManageHackathonPage() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [searchTerm, setSearchTerm] = useState("");
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
        toast({ title: 'Please log in', description: 'You need to be logged in to manage hackathons.' });
        return;
      }

      // Load hackathon details
      const hackathonRes = await apiService.getHackathon(hackathonId);
      setHackathon(hackathonRes);

      // Load participants
      const participantsRes = await apiService.getHackathonParticipants(token, hackathonId);
      setParticipants(participantsRes.participants || []);

      // Load submissions
      setLoadingSubmissions(true);
      try {
        const submissionsRes = await apiService.listHackathonSubmissions(token, hackathonId);
        setSubmissions(submissionsRes.submissions || []);
      } catch (error) {
        console.error('Failed to load submissions:', error);
        setSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }

      const mockJudges: Judge[] = [
        {
          id: "1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@tech.com",
          avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random",
          expertise: ["AI/ML", "Healthcare Tech"],
          assigned_submissions: 3
        },
        {
          id: "2",
          name: "Mike Chen",
          email: "mike.chen@startup.com",
          avatar: "https://ui-avatars.com/api/?name=Mike+Chen&background=random",
          expertise: ["IoT", "Smart Cities"],
          assigned_submissions: 2
        }
      ];
      setJudges(mockJudges);
    } catch (error: any) {
      console.error('Failed to load hackathon data:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load hackathon data' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (type: 'participants' | 'submissions' | 'judges') => {
    // This would trigger a download of the data
    toast({ title: 'Export started', description: `Exporting ${type} data...` });
  };

  const handleAssignJudge = (submissionId: string, judgeId: string) => {
    // This would assign a judge to review a submission
    toast({ title: 'Judge assigned', description: 'Judge has been assigned to review this submission.' });
  };

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/hackathons/${hackathonId}/submission/view/${submissionId}`);
  };

  const handleUpdateSubmissionStatus = (submissionId: string, status: Submission['status']) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId ? { ...sub, status } : sub
    ));
    toast({ title: 'Status updated', description: 'Submission status has been updated.' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hackathon management...</p>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage {hackathon.name}</h1>
          <p className="text-muted-foreground mt-2">Manage participants, submissions, and judging for your hackathon.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/organizer/dashboard/view/${hackathon.id}`)}>
            View Stats
          </Button>
          <Button variant="outline" onClick={() => router.push(`/organizer/dashboard/edit/${hackathon.id}`)}>
            Edit Event
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hackathon.registration_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams Formed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hackathon.team_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Judges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{judges.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="judges">Judges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Participants</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage all registered participants</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('participants')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="space-y-2">
                {participants
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                          {participant.team && (
                            <Badge variant="secondary" className="text-xs mt-1">Team: {participant.team}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(participant.registration_date), 'MMM dd, yyyy')}
                        </p>
                        {participant.skills && participant.skills.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {participant.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Submissions</CardTitle>
                  <p className="text-sm text-muted-foreground">Review and manage project submissions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExportData('submissions')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading submissions...</p>
                  </div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                  <p className="text-muted-foreground">
                    Participants haven't submitted any projects for this hackathon yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{submission.project_title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">by {submission.team_name}</p>
                          <p className="text-sm mb-3 line-clamp-2">{submission.project_description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Submitted: {format(parseISO(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
                            </span>
                            {submission.score && <span>Score: {submission.score}/100</span>}
                          </div>
                          {submission.tech_stack && submission.tech_stack.length > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-medium">Tech Stack:</span>
                              <div className="flex flex-wrap gap-1">
                                {submission.tech_stack.slice(0, 3).map((tech) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {submission.tech_stack.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{submission.tech_stack.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge 
                            variant={
                              submission.status === 'approved' ? 'default' : 
                              submission.status === 'rejected' ? 'destructive' : 
                              submission.status === 'reviewed' ? 'secondary' : 
                              submission.status === 'submitted' ? 'outline' : 'secondary'
                            }
                          >
                            {submission.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewSubmission(submission.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="judges" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Judges</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage judging panel and assignments</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Add Judge
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportData('judges')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {judges.map((judge) => (
                  <div key={judge.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={judge.avatar} />
                        <AvatarFallback>{getInitials(judge.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{judge.name}</h3>
                        <p className="text-sm text-muted-foreground">{judge.email}</p>
                        <div className="flex gap-1 mt-1">
                          {judge.expertise.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{judge.assigned_submissions} submissions</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Assign More
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Settings</CardTitle>
              <p className="text-sm text-muted-foreground">Configure hackathon settings and preferences</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Registration Status</h3>
                    <p className="text-sm text-muted-foreground">Allow or disable new registrations</p>
                  </div>
                  <Button variant="outline">Open Registration</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Submission Deadline</h3>
                    <p className="text-sm text-muted-foreground">Set the final submission deadline</p>
                  </div>
                  <Button variant="outline">Set Deadline</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Judging Criteria</h3>
                    <p className="text-sm text-muted-foreground">Configure judging criteria and weights</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Results Announcement</h3>
                    <p className="text-sm text-muted-foreground">Schedule when to announce winners</p>
                  </div>
                  <Button variant="outline">Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
