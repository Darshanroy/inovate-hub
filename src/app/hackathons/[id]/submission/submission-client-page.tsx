"use client";

import { useState, useEffect } from "react";
import type { Hackathon } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UploadCloud, File, X, PlusCircle, Link as LinkIcon, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubmissionClientPage({ hackathon }: { hackathon: Hackathon }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [techStack, setTechStack] = useState<string[]>(["React", "Node.js", "AI"]);

  const handleSaveDraft = () => {
    toast({
        title: "Draft Saved!",
        description: "Your submission has been saved as a draft.",
    });
  }

  const handleSubmit = () => {
     toast({
        title: "Project Submitted!",
        description: "Your project has been successfully submitted for review.",
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
    }
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  }


  useEffect(() => {
    if (!hackathon) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(hackathon.date) - +new Date();
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

  return (
    <>
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
          </div>
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
                  <Input className="mt-1 w-full" id="project-title" placeholder="e.g., AI-Powered Code Assistant" type="text" />
                </div>
                <div>
                  <Label htmlFor="project-description">Project Description</Label>
                  <Textarea className="mt-1 w-full" id="project-description" placeholder="Describe your project, its purpose, and what makes it unique." rows={4} />
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
                <div className="flex flex-wrap gap-2">
                  {techStack.map(tech => (
                     <span key={tech} className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">{tech}</span>
                  ))}
                  <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full border-dashed">
                    <PlusCircle className="h-4 w-4" /> Add Tech
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
                    <Input className="w-full pl-9" id="github-link" placeholder="https://github.com/user/repo" type="url" />
                   </div>
                </div>
                <div>
                  <Label htmlFor="video-link">Video Demo</Label>
                   <div className="relative mt-1">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="w-full pl-9" id="video-link" placeholder="https://youtube.com/watch?v=..." type="url" />
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
                           <Input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple/>
                        </Label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX up to 10MB</p>
                    </div>
                     {files.length > 0 && (
                        <div className="w-full mt-4 pt-4 border-t border-dashed border-border">
                            <p className="text-sm font-medium text-left mb-2">Uploaded files:</p>
                            <div className="space-y-2">
                            {files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md text-sm">
                                    <div className="flex items-center gap-2">
                                        <File className="h-4 w-4"/>
                                        <span className="font-medium">{file.name}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFile(file.name)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
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
            <Button variant="ghost" onClick={handleSaveDraft}>Save Draft</Button>
            <Button className="glowing-cta" onClick={handleSubmit}>Submit Project</Button>
          </div>
        </div>
      </main>
    </>
  );
}
