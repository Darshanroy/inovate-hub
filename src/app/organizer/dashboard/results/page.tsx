import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

const results = [
  { rank: 1, team: "AI Avengers", project: "EcoSort AI", score: 9.5, prize: "$10,000" },
  { rank: 2, team: "Data Dynamos", project: "FinPredict", score: 9.2, prize: "$5,000" },
  { rank: 3, team: "Code Crusaders", project: "HealthTrack", score: 8.8, prize: "$2,500" },
]

export default function ResultsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hackathon Results</h1>
        <Button size="lg" className="glowing-cta">
            <Trophy className="mr-2 h-5 w-5" />
            Publish Final Results
        </Button>
      </div>
       <p className="text-muted-foreground mb-8">
        Review the leaderboard and publish the final results to all participants.
      </p>

      <Card>
        <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Auto-generated leaderboard based on judge scores.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Project Title</TableHead>
                        <TableHead>Avg. Score</TableHead>
                        <TableHead>Prize</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map(r => (
                        <TableRow key={r.rank} className={r.rank === 1 ? "bg-primary/10" : ""}>
                            <TableCell className="font-bold text-lg">{r.rank}</TableCell>
                            <TableCell className="font-medium">{r.team}</TableCell>
                            <TableCell>{r.project}</TableCell>
                            <TableCell className="font-medium">{r.score.toFixed(1)}</TableCell>
                            <TableCell className="font-bold text-accent">{r.prize}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
