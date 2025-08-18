import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download } from "lucide-react"

const submissions = [
  { id: 1, team: "AI Avengers", project: "EcoSort AI", link: "#" },
  { id: 2, team: "Code Crusaders", project: "HealthTrack", link: "#" },
  { id: 3, team: "Data Dynamos", project: "FinPredict", link: "#" },
]

export default function SubmissionsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Submission Management</h1>
        <Button>
            <Download className="mr-2 h-4 w-4" />
            Export All Submissions
        </Button>
      </div>
       <p className="text-muted-foreground mb-8">
        View and download all project submissions for your hackathon.
      </p>

      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Project Title</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions.map(s => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.team}</TableCell>
                            <TableCell>{s.project}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={s.link}>View Submission</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
