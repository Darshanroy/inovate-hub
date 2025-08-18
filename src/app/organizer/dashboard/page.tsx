import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function OrganizerDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <Button asChild>
            <Link href="/organizer/dashboard/create">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Create Hackathon
            </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">
        Welcome! Here you can manage all your hackathons, participants, and results.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Hackathons</CardTitle>
            <CardDescription>Number of events you've created.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Participants</CardTitle>
            <CardDescription>Across all your events.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Submissions</CardTitle>
            <CardDescription>Projects submitted to your hackathons.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">567</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
