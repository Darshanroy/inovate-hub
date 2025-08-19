
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { results } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Trophy, Download } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";


export function ResultsTab() {
  const { toast } = useToast();

  const handlePublishResults = () => {
    toast({
        title: "Results Published!",
        description: "The official results are now live for all participants to see."
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Review Scores</CardTitle>
          <CardDescription>
            Review the final scores submitted by the judges. You can make adjustments before publishing the final results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Rank</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.rank}>
                  <TableCell className="text-lg font-bold">{result.rank}</TableCell>
                  <TableCell className="font-medium">{result.team.name}</TableCell>
                  <TableCell>{result.projectTitle}</TableCell>
                  <TableCell className="text-right font-semibold text-lg">{result.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Publish Results</CardTitle>
            <CardDescription>Once you are satisfied with the scores, you can publish the official results. This action cannot be undone.</CardDescription>
        </CardHeader>
         <CardContent className="flex gap-4">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="lg">
                        <Trophy className="mr-2 h-5 w-5" />
                        Publish Results
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to publish the results?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will make the final leaderboard visible to all participants. This action cannot be reversed.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePublishResults}>Confirm & Publish</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button size="lg" variant="outline">
                <Download className="mr-2 h-5 w-5"/>
                Export as CSV
            </Button>
         </CardContent>
      </Card>

    </div>
  );
}
