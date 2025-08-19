
"use client";

import { useState } from "react";
import type { Submission, Criterion, Team } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Github, Youtube, Users, Link as LinkIcon, FileText } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

type Score = {
  criterionId: number;
  value: number;
  comment: string;
};

export function SubmissionDialog({
  isOpen,
  onOpenChange,
  submission,
  criteria,
  onScoreSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission & { score?: number; isScored?: boolean };
  criteria: Criterion[];
  onScoreSubmit: (submissionId: string, totalScore: number) => void;
}) {
  const { toast } = useToast();
  const [scores, setScores] = useState<Score[]>(
    criteria.map(c => ({ criterionId: c.id, value: 0, comment: "" }))
  );

  const handleScoreChange = (criterionId: number, value: number) => {
    const maxScore = criteria.find(c => c.id === criterionId)?.maxScore || 10;
    const newScore = Math.max(0, Math.min(value, maxScore));
    setScores(prev =>
      prev.map(s => (s.criterionId === criterionId ? { ...s, value: newScore } : s))
    );
  };

  const handleCommentChange = (criterionId: number, comment: string) => {
    setScores(prev =>
      prev.map(s => (s.criterionId === criterionId ? { ...s, comment } : s))
    );
  };

  const calculateTotalScore = () => {
    return scores.reduce((acc, score) => {
        const criterion = criteria.find(c => c.id === score.criterionId);
        if(!criterion) return acc;
        return acc + (score.value * criterion.weight);
    }, 0);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalScore = calculateTotalScore();
    onScoreSubmit(submission.team.id, totalScore);
    toast({
      title: "Score Submitted!",
      description: `Your score for "${submission.title}" has been recorded.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <ScrollArea className="h-full pr-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">{submission.title}</DialogTitle>
            <DialogDescription>By {submission.team.name}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Submission Details */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-lg">Project Description</h4>
                <p className="text-muted-foreground text-sm">
                  {submission.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-lg">Project Links</h4>
                <div className="space-y-3">
                  <Link href={submission.githubUrl} target="_blank" className="flex items-center gap-2 text-sm text-accent hover:underline">
                    <Github className="h-4 w-4" /> GitHub Repository
                  </Link>
                   <Link href={submission.videoUrl} target="_blank" className="flex items-center gap-2 text-sm text-accent hover:underline">
                    <Youtube className="h-4 w-4" /> Video Demo
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-lg">Team Members</h4>
                <div className="space-y-3">
                    {submission.team.members.map(member => (
                        <div key={member.name} className="flex items-center gap-3">
                            <Image src={member.avatar} alt={member.name} width={32} height={32} className="rounded-full" data-ai-hint="person face" />
                            <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

               <div>
                <h4 className="font-semibold mb-3 text-lg">Supporting Files</h4>
                <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" /> Download Files.zip
                </Button>
               </div>

            </div>

            {/* Right side: Scoring Form */}
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-secondary p-6">
              <h3 className="text-xl font-bold text-center">Scoring</h3>
              {criteria.map((criterion, index) => (
                <div key={criterion.id}>
                    <Separator className={index > 0 ? "mb-6" : "hidden"}/>
                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                             <Label htmlFor={`score-${criterion.id}`} className="text-base font-semibold">{criterion.name}</Label>
                             <span className="text-sm text-muted-foreground">Weight: {criterion.weight}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                            id={`score-${criterion.id}`}
                            type="number"
                            min="0"
                            max={criterion.maxScore}
                            value={scores.find(s => s.criterionId === criterion.id)?.value}
                            onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value))}
                            className="w-24"
                            disabled={submission.isScored}
                            />
                            <span className="text-muted-foreground">/ {criterion.maxScore}</span>
                        </div>
                        <div>
                            <Label htmlFor={`comment-${criterion.id}`} className="text-sm">Comments</Label>
                            <Textarea
                                id={`comment-${criterion.id}`}
                                value={scores.find(s => s.criterionId === criterion.id)?.comment}
                                onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                                placeholder={`Feedback on ${criterion.name.toLowerCase()}...`}
                                className="mt-1"
                                rows={2}
                                disabled={submission.isScored}
                            />
                        </div>
                    </div>
                </div>
              ))}
               <DialogFooter>
                {submission.isScored ? (
                     <div className="w-full text-center p-4 bg-green-900/50 text-green-300 rounded-lg">
                        <p className="font-bold">Already Scored: {submission.score} points</p>
                    </div>
                ) : (
                     <Button type="submit" className="w-full">Submit Score</Button>
                )}
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
