"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Edit, 
  File, 
  ExternalLink, 
  Youtube, 
  Github, 
  Save, 
  Send,
  Eye,
  CheckCircle,
  X,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiService, Submission } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function ViewSubmissionPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadSubmission();
  }, [hackathonId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view submissions.' });
        return;
      }

      const response = await apiService.getMySubmission(token, hackathonId);
      if (response.submission) {
        setSubmission(response.submission);
      } else {
        toast({ title: 'No submission found', description: 'You haven\'t submitted a project for this hackathon yet.' });
        router.push(`/hackathons/${hackathonId}/submission`);
      }
    } catch (error: any) {
      console.error('Failed to load submission:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load submission' });
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = () => {
    if (!submission) return null;
    
    switch (submission.status) {
      case 'draft':
        return { label: 'Draft', icon: Save, color: 'bg-yellow-500', variant: 'secondary' as const };
      case 'submitted':
        return { label: 'Submitted', icon: Send, color: 'bg-blue-500', variant: 'default' as const };
      case 'reviewed':
        return { label: 'Reviewed', icon: Eye, color: 'bg-purple-500', variant: 'secondary' as const };
      case 'approved':
        return { label: 'Approved', icon: CheckCircle, color: 'bg-green-500', variant: 'default' as const };
      case 'rejected':
        return { label: 'Rejected', icon: X, color: 'bg-red-500', variant: 'destructive' as const };
      default:
        return null;
    }
  };

  const status = getSubmissionStatus();

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading submission...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Submission Found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't submitted a project for this hackathon yet.
          </p>
          <Button onClick={() => router.push(`/hackathons/${hackathonId}/submission`)}>
            Create Submission
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        {/* Submission Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{submission.project_title}</h1>
            <p className="text-muted-foreground mt-2">by {submission.team_name}</p>
            <div className="flex items-center gap-4 mt-4">
              {status && (
                <Badge variant={status.variant} className="flex items-center gap-1">
                  <status.icon className="h-3 w-3" />
                  {status.label}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Submitted: {format(parseISO(submission.submitted_at), 'PPP')}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/hackathons/${hackathonId}/submission`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Submission
            </Button>
          </div>
        </div>

        {/* Status Alerts */}
        {submission.status === 'submitted' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your project has been submitted successfully! You can still edit it until the deadline.
            </AlertDescription>
          </Alert>
        )}

        {submission.status === 'approved' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Congratulations! Your project has been approved by the judges.
            </AlertDescription>
          </Alert>
        )}

        {submission.status === 'rejected' && (
          <Alert className="border-red-200 bg-red-50">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Your project was not approved. Please check the feedback below for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Project Description */}
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{submission.project_description}</p>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {submission.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        {(submission.github_link || submission.video_link) && (
          <Card>
            <CardHeader>
              <CardTitle>Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.github_link && (
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-muted-foreground" />
                  <Link 
                    href={submission.github_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    GitHub Repository
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
              {submission.video_link && (
                <div className="flex items-center gap-3">
                  <Youtube className="h-5 w-5 text-muted-foreground" />
                  <Link 
                    href={submission.video_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Video Demo
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Files */}
        {submission.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {submission.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Link 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Download
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback */}
        {submission.feedback && (
          <Card>
            <CardHeader>
              <CardTitle>Judge Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{submission.feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Score */}
        {submission.score && (
          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{submission.score}/100</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
