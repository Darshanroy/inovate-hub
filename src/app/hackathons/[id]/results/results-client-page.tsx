
"use client";

import type { Hackathon, Result, Team } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Award, Download, Share2, Trophy } from "lucide-react";
import Image from "next/image";

const PodiumCard = ({ result, rank }: { result: Result, rank: number }) => {
    const rankColors = {
        1: "border-amber-400",
        2: "border-slate-400",
        3: "border-orange-700",
    }
    const rankBgColors = {
        1: "bg-amber-400",
        2: "bg-slate-400",
        3: "bg-orange-700",
    }
    const rankText = {
        1: "First Place",
        2: "Second Place",
        3: "Third Place",
    }
    const imageSize = {
        1: "h-48 w-48",
        2: "h-40 w-40",
        3: "h-40 w-40",
    }
    const rankBadgeSize = {
        1: "h-14 w-14 text-3xl",
        2: "h-12 w-12 text-2xl",
        3: "h-12 w-12 text-2xl",
    }
    return (
        <Card className={`flex flex-col items-center justify-end text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 ${rank === 1 ? 'md:order-first' : ''}`}>
            <CardContent className="p-6">
                 <div className="relative mb-4">
                    <Image alt={result.team.name} className={`${imageSize[rank as keyof typeof imageSize]} rounded-full border-4 ${rankColors[rank as keyof typeof rankColors]} object-cover`} src={result.team.avatar} width={192} height={192} data-ai-hint="team logo" />
                    <div className={`absolute -bottom-3 -right-3 flex items-center justify-center rounded-full ${rankBgColors[rank as keyof typeof rankBgColors]} font-bold text-white ${rankBadgeSize[rank as keyof typeof rankBadgeSize]}`}>
                        {rank}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">{result.team.name}</h3>
                <p className="text-muted-foreground">{rankText[rank as keyof typeof rankText]}</p>
                 <p className="font-semibold text-accent mt-1">{result.projectTitle}</p>
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

        {userResult && (
             <Card className="mb-12 p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold">Your Team's Result</h2>
                        <p className="text-muted-foreground">Here's how <span className="font-bold text-accent">{userResult.team.name}</span> performed.</p>
                    </div>
                     <div className="text-center">
                        <p className="text-lg font-medium">Your Rank</p>
                        <p className="text-5xl font-bold text-primary">{userResult.rank}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-lg font-medium">Final Score</p>
                        <p className="text-5xl font-bold text-primary">{userResult.score}</p>
                    </div>
                    <Button>
                        <Download className="mr-2 h-4 w-4" /> Download Certificate
                    </Button>
                </div>
            </Card>
        )}
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <Trophy className="inline-block mr-3 h-8 w-8 text-amber-400" />
            Podium Finishers
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
             {podiumFinishers.map(result => <PodiumCard key={result.rank} result={result} rank={result.rank} />)}
          </div>
        </section>

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
                  <TableRow key={result.rank} className={result.rank <= 3 ? "bg-primary/10" : ""}>
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

         <div className="mt-12 text-center">
            <Button size="lg" variant="secondary">
                <Share2 className="mr-2 h-5 w-5"/>
                Share Results
            </Button>
        </div>
      </div>
    </main>
  );
}

