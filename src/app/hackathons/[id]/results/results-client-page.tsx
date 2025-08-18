
"use client";

import type { Hackathon, Result, Submission, Team } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Award, Download, Share2, Trophy, Eye } from "lucide-react";
import Image from "next/image";
import { mySubmission } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";


const PodiumCard = ({ result, rank }: { result: Result, rank: number }) => {
    const rankInfo = {
        1: { color: "border-amber-400", bgColor: "bg-amber-400", text: "First Place", imageSize: "h-36 w-36", badgeSize: "h-14 w-14 text-3xl", order: "md:order-2", shadow: "shadow-amber-400/30" },
        2: { color: "border-slate-400", bgColor: "bg-slate-400", text: "Second Place", imageSize: "h-32 w-32", badgeSize: "h-12 w-12 text-2xl", order: "md:order-1", shadow: "shadow-slate-400/30" },
        3: { color: "border-orange-700", bgColor: "bg-orange-700", text: "Third Place", imageSize: "h-32 w-32", badgeSize: "h-12 w-12 text-2xl", order: "md:order-3", shadow: "shadow-orange-700/40" },
    }[rank];

    if (!rankInfo) return null;

    return (
        <Card className={cn("flex flex-col items-center justify-end text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl", rankInfo.order, `hover:${rankInfo.shadow}`)}>
            <CardContent className="p-6">
                 <div className="relative mb-4">
                    <Image alt={result.team.name} className={cn("rounded-full border-4 object-cover mx-auto", rankInfo.imageSize, rankInfo.color)} src={result.team.avatar} width={192} height={192} data-ai-hint="team logo" />
                    <div className={cn("absolute -bottom-3 -right-3 flex items-center justify-center rounded-full font-bold text-white", rankInfo.bgColor, rankInfo.badgeSize)}>
                        {rank}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">{result.team.name}</h3>
                <p className="text-muted-foreground">{rankInfo.text}</p>
                 <p className="font-semibold text-accent mt-1">{result.projectTitle}</p>
            </CardContent>
        </Card>
    )
}

const YourSubmissionCard = ({ submission, hackathonId }: { submission: Submission, hackathonId: string}) => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold">{submission.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">This was your team's submission for the hackathon.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={`/hackathons/${hackathonId}/submission`}>
                            <Eye className="mr-2 h-4 w-4"/> View Your Submission
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}


export default function ResultsClientPage({ hackathon, results, userResult }: { hackathon: Hackathon, results: Result[], userResult?: Result }) {
    const podiumFinishers = results.slice(0, 3);
  return (
    <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Card className="mb-12 text-center p-8 bg-secondary/50">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Results for {hackathon.name}</h1>
          <p className="text-muted-foreground">The event has concluded. Congratulations to all participants!</p>
        </Card>

        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <Trophy className="inline-block mr-3 h-8 w-8 text-amber-400" />
            Podium Finishers
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-end">
             {podiumFinishers.map(result => <PodiumCard key={result.rank} result={result} rank={result.rank} />)}
          </div>
        </section>

        {userResult && (
             <section className="mb-12">
                 <h2 className="text-3xl font-bold mb-8 text-center">Your Submission</h2>
                 <YourSubmissionCard submission={mySubmission} hackathonId={hackathon.id} />
             </section>
        )}

        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">
            <Award className="inline-block mr-3 h-8 w-8" />
            Full Rankings
            </h2>
          <Card className="overflow-hidden">
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
                  <TableRow key={result.rank} className={cn(userResult && userResult.team.name === result.team.name ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-muted/50")}>
                    <TableCell className="text-lg font-bold">{result.rank}</TableCell>
                    <TableCell className="font-medium">{result.team.name}</TableCell>
                    <TableCell>{result.projectTitle}</TableCell>
                    <TableCell className="text-right font-semibold text-lg">{result.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

         <div className="mt-12 flex justify-center gap-4">
            <Button size="lg" variant="secondary">
                <Download className="mr-2 h-5 w-5"/>
                Download Certificate
            </Button>
            <Button size="lg" variant="outline">
                <Share2 className="mr-2 h-5 w-5"/>
                Share Results
            </Button>
        </div>
      </div>
    </main>
  );
}

