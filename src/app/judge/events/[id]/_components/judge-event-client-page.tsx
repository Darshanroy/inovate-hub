
"use client";

import { useState } from "react";
import type { Hackathon, Submission, Criterion, Team } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, Award } from "lucide-react";
import { SubmissionDialog } from "./submission-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SubmissionWithScore = Submission & { score?: number; isScored?: boolean };

export default function JudgeEventClientPage({
  hackathon,
  submissions: initialSubmissions,
  criteria,
}: {
  hackathon: Hackathon;
  submissions: Submission[];
  criteria: Criterion[];
}) {
  const [submissions, setSubmissions] = useState<SubmissionWithScore[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithScore | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenDialog = (submission: SubmissionWithScore) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  const handleScoreSubmit = (submissionId: string, totalScore: number) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.team.id === submissionId ? { ...sub, isScored: true, score: totalScore } : sub
      )
    );
    setIsDialogOpen(false);
  };

  const handleFinalizeJudging = () => {
    toast({
        title: "Scores Submitted!",
        description: "Your final scores have been sent to the organizer."
    });
    // In a real app, you would navigate away or disable the button
  }

  const allSubmissionsScored = submissions.every(sub => sub.isScored);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Judging for "{hackathon.name}"</h1>
        <p className="text-muted-foreground">
          Review and score the submissions below based on the provided criteria.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {submissions.filter(s => s.isScored).length} of {submissions.length} submissions scored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Team Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.team.id}>
                  <TableCell className="font-medium">{submission.title}</TableCell>
                  <TableCell>{submission.team.name}</TableCell>
                  <TableCell>
                    <Badge variant={submission.isScored ? "default" : "secondary"}>
                      {submission.isScored ? "Scored" : "Not Scored"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(submission)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {submission.isScored ? "View Score" : "View & Score"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="lg" disabled={!allSubmissionsScored}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Finalize & Submit All Scores
                    </Button>
                </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to submit all scores?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Your scores will be final and sent to the organizer for review.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalizeJudging}>Confirm & Submit</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
      
      {selectedSubmission && (
        <SubmissionDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          submission={selectedSubmission}
          criteria={criteria}
          onScoreSubmit={handleScoreSubmit}
        />
      )}
    </div>
  );
}
