
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UploadCloud, 
  File, 
  X, 
  PlusCircle, 
  Link as LinkIcon, 
  Youtube, 
  Save, 
  Send,
  Edit,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { apiService, Submission, SubmissionFile } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { format, parseISO, isAfter } from "date-fns";

interface Hackathon {
  id: string;
  name: string;
  date: string;
  submission_deadline?: string;
  team_size: number;
}

interface SubmissionFormData {
  project_title: string;
  project_description: string;
  tech_stack: string[];
  github_link: string;
  video_link: string;
}

export default function SubmissionClientPage({ hackathon }: { hackathon: Hackathon }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [formData, setFormData] = useState<SubmissionFormData>({
    project_title: "",
    project_description: "",
    tech_stack: [],
    github_link: "",
    video_link: "",
  });
  const [newTech, setNewTech] = useState("");
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadExistingSubmission();
    checkDeadline();
  }, [hackathonId]);

  useEffect(() => {
    if (!hackathon) return;

    const calculateTimeLeft = () => {
      const deadline = hackathon.submission_deadline || hackathon.date;
      const difference = +new Date(deadline) - +new Date();
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

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [hackathon]);

  const checkDeadline = () => {
    const deadline = hackathon.submission_deadline || hackathon.date;
    setIsDeadlinePassed(isAfter(new Date(), new Date(deadline)));
  };

  const loadExistingSubmission = async () => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view submissions.' });
        return;
      }

      const response = await apiService.getMySubmission(token, hackathonId);
      if (response.submission) {
        setExistingSubmission(response.submission);
        setFormData({
          project_title: response.submission.project_title,
          project_description: response.submission.project_description,
          tech_stack: response.submission.tech_stack,
          github_link: response.submission.github_link || "",
          video_link: response.submission.video_link || "",
        });
        setFiles(response.submission.files);
      }
    } catch (error: any) {
      console.error('Failed to load submission:', error);
      // Don't show error toast for "no submission found"
      if (!error.message?.includes('No submission found')) {
        toast({ title: 'Error', description: error.message || 'Failed to load submission' });
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to save drafts.' });
        return;
      }

      if (existingSubmission) {
        await apiService.saveSubmissionDraft(token, existingSubmission.id, formData);
      } else {
        const response = await apiService.createSubmission({
          token,
          hackathon_id: hackathonId,
          submission: formData,
        });
        setExistingSubmission({
          id: response.submission_id,
          hackathon_id: hackathonId,
          team_id: "",
          team_name: "",
          project_title: formData.project_title,
          project_description: formData.project_description,
          tech_stack: formData.tech_stack,
          github_link: formData.github_link,
          video_link: formData.video_link,
          files: [],
          status: 'draft',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }

      toast({ title: 'Draft Saved!', description: 'Your submission has been saved as a draft.' });
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!existingSubmission) {
      toast({ title: 'Error', description: 'Please save a draft first before submitting.' });
      return;
    }

    try {
      setSubmitting(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to submit.' });
        return;
      }

      await apiService.submitProject(token, existingSubmission.id);
      toast({ title: 'Project Submitted!', description: 'Your project has been successfully submitted for review.' });
      router.push(`/hackathons/${hackathonId}`);
    } catch (error: any) {
      console.error('Failed to submit:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit project' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !existingSubmission) return;

    const newFiles = Array.from(e.target.files);
    setUploadingFiles(prev => [...prev, ...newFiles]);

    try {
      const token = getCookie('authToken');
      if (!token) return;

      for (const file of newFiles) {
        const response = await apiService.uploadSubmissionFile(token, existingSubmission.id, file);
        setFiles(prev => [...prev, response.file]);
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      toast({ title: 'Error', description: error.message || 'Failed to upload file' });
    } finally {
      setUploadingFiles(prev => prev.filter(f => !newFiles.includes(f)));
    }
  };

  const removeFile = async (fileId: string) => {
    if (!existingSubmission) return;

    try {
      const token = getCookie('authToken');
      if (!token) return;

      await apiService.deleteSubmissionFile(token, existingSubmission.id, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error: any) {
      console.error('Failed to remove file:', error);
      toast({ title: 'Error', description: error.message || 'Failed to remove file' });
    }
  };

  const addTechStack = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()]
      }));
      setNewTech("");
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const getSubmissionStatus = () => {
    if (!existingSubmission) return null;
    
    switch (existingSubmission.status) {
      case 'draft':
        return { label: 'Draft', icon: Save, color: 'bg-yellow-500' };
      case 'submitted':
        return { label: 'Submitted', icon: Send, color: 'bg-blue-500' };
      case 'reviewed':
        return { label: 'Reviewed', icon: Eye, color: 'bg-purple-500' };
      case 'approved':
        return { label: 'Approved', icon: CheckCircle, color: 'bg-green-500' };
      case 'rejected':
        return { label: 'Rejected', icon: X, color: 'bg-red-500' };
      default:
        return null;
    }
  };

  const status = getSubmissionStatus();

  if (isDeadlinePassed && !existingSubmission) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Submission Deadline Passed</h2>
          <p className="text-muted-foreground mb-4">
            The submission deadline for this hackathon has passed. You can no longer submit a new project.
          </p>
          <Button onClick={() => router.push(`/hackathons/${hackathonId}`)}>
            Back to Hackathon
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <LoadingOverlay message="Loading submission..." />}
      <div className="fixed left-0 right-0 top-[65px] z-20 border-b border-t border-border/20 bg-primary/10 py-3 text-center backdrop-blur-sm">
        <p className="text-sm">
          <span className="font-bold">Submission Deadline:</span> {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </p>
      </div>
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mt-16 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight">Submit Your Project</h2>
            <p className="mt-2 text-muted-foreground">
              Share your innovative project with the world. Fill out the form below to showcase your work and compete for prizes.
            </p>
            {status && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <status.icon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            )}
          </div>

          {existingSubmission && existingSubmission.status === 'submitted' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Your project has been submitted successfully! You can still edit it until the deadline.</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/hackathons/${hackathonId}/submission/view`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View My Submission
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="card space-y-8 divide-y divide-border bg-card p-8 rounded-2xl">
            {/* Project Details */}
            <div className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold">Project Details</h3>
                <p className="mt-1 text-sm text-muted-foreground">Basic information about your creation.</p>
              </div>
              <div className="space-y-6 md:col-span-2">
                <div>
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input 
                    className="mt-1 w-full" 
                    id="project-title" 
                    placeholder="e.g., AI-Powered Code Assistant" 
                    type="text"
                    value={formData.project_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Project Description</Label>
                  <Textarea 
                    className="mt-1 w-full" 
                    id="project-description" 
                    placeholder="Describe your project, its purpose, and what makes it unique." 
                    rows={4}
                    value={formData.project_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold">Tech Stack</h3>
                <p className="mt-1 text-sm text-muted-foreground">What technologies did you use?</p>
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tech_stack.map(tech => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button 
                        onClick={() => removeTechStack(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology..."
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTechStack()}
                  />
                  <Button variant="outline" size="sm" onClick={addTechStack}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Links & Attachments */}
            <div className="grid grid-cols-1 gap-8 pt-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold">Links & Attachments</h3>
                <p className="mt-1 text-sm text-muted-foreground">Provide links to your repository and a demo video.</p>
              </div>
              <div className="space-y-6 md:col-span-2">
                <div>
                  <Label htmlFor="github-link">GitHub Repository</Label>
                  <div className="relative mt-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="w-full pl-9" 
                      id="github-link" 
                      placeholder="https://github.com/user/repo" 
                      type="url"
                      value={formData.github_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, github_link: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="video-link">Video Demo</Label>
                  <div className="relative mt-1">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="w-full pl-9" 
                      id="video-link" 
                      placeholder="https://youtube.com/watch?v=..." 
                      type="url"
                      value={formData.video_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_link: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="file-upload">Supporting Documents</Label>
                  <div className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 pb-6 pt-5 hover:border-primary">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4 flex text-sm text-muted-foreground">
                        <Label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                          <span>Upload a file</span>
                          <Input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={handleFileChange} 
                            multiple
                            disabled={!existingSubmission}
                          />
                        </Label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX up to 10MB</p>
                    </div>
                    {(files.length > 0 || uploadingFiles.length > 0) && (
                      <div className="w-full mt-4 pt-4 border-t border-dashed border-border">
                        <p className="text-sm font-medium text-left mb-2">Uploaded files:</p>
                        <div className="space-y-2">
                          {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md text-sm">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4"/>
                                <span className="font-medium">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFile(file.id)}>
                                <X className="h-4 w-4"/>
                              </Button>
                            </div>
                          ))}
                          {uploadingFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md text-sm">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4"/>
                                <span className="font-medium">{file.name}</span>
                                <span className="text-xs text-muted-foreground">(Uploading...)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={handleSaveDraft} disabled={saving}>
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              className="glowing-cta" 
              onClick={handleSubmit} 
              disabled={submitting || !existingSubmission || existingSubmission.status === 'submitted'}
            >
              {submitting ? 'Submitting...' : existingSubmission?.status === 'submitted' ? 'Already Submitted' : 'Submit Project'}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
