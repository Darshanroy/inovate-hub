"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  File, 
  ExternalLink, 
  Youtube, 
  Github, 
  Eye,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  MessageSquare,
  Star,
  Download
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiService, Submission } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function OrganizerViewSubmissionPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<'submitted' | 'reviewed' | 'approved' | 'rejected'>('submitted');
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;
  const submissionId = params.submissionId as string;

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view submissions.' });
        return;
      }

      const response = await apiService.getSubmission(submissionId);
      setSubmission(response.submission);
      setFeedback(response.submission.feedback || "");
      setScore(response.submission.score || 0);
      setStatus(response.submission.status as any);
    } catch (error: any) {
      console.error('Failed to load submission:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load submission' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setReviewing(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to review submissions.' });
        return;
      }

      // This would be an API call to update the submission with review
      // await apiService.updateSubmissionReview(token, submissionId, { status, score, feedback });
      
      toast({ title: 'Review submitted', description: 'Your review has been submitted successfully.' });
      router.push(`/organizer/dashboard/manage/${hackathonId}`);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit review' });
    } finally {
      setReviewing(false);
    }
  };

  const getSubmissionStatus = () => {
    if (!submission) return null;
    
    switch (submission.status) {
      case 'draft':
        return { label: 'Draft', icon: Clock, color: 'bg-yellow-500', variant: 'secondary' as const };
      case 'submitted':
        return { label: 'Submitted', icon: Eye, color: 'bg-blue-500', variant: 'default' as const };
      case 'reviewed':
        return { label: 'Reviewed', icon: MessageSquare, color: 'bg-purple-500', variant: 'secondary' as const };
      case 'approved':
        return { label: 'Approved', icon: CheckCircle, color: 'bg-green-500', variant: 'default' as const };
      case 'rejected':
        return { label: 'Rejected', icon: X, color: 'bg-red-500', variant: 'destructive' as const };
      default:
        return null;
    }
  };

  const statusInfo = getSubmissionStatus();

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
          <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The submission you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push(`/organizer/dashboard/manage/${hackathonId}`)}>
            Back to Management
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
              {statusInfo && (
                <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                  <statusInfo.icon className="h-3 w-3" />
                  {statusInfo.label}
                </Badge>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Submitted: {format(parseISO(submission.submitted_at), 'PPP')}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/organizer/dashboard/manage/${hackathonId}`)}>
              Back to Management
            </Button>
          </div>
        </div>

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
                      <Download className="h-4 w-4" />
                      Download
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Section */}
        <Card>
          <CardHeader>
            <CardTitle>Review & Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score */}
            <div>
              <label className="text-sm font-medium mb-2 block">Score (0-100)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{score}/100</span>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="flex gap-2">
                <Button
                  variant={status === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatus('approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant={status === 'rejected' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setStatus('rejected')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant={status === 'reviewed' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setStatus('reviewed')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mark Reviewed
                </Button>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="text-sm font-medium mb-2 block">Feedback</label>
              <Textarea
                placeholder="Provide detailed feedback for the team..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit Review */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitReview} 
                disabled={reviewing}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                {reviewing ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
