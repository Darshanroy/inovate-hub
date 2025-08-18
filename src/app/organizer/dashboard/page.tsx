
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ArrowRight, Users, FileText } from "lucide-react"
import { hackathons } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { format, isPast } from "date-fns"

export default function OrganizerDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Hackathons</h1>
        <Button asChild>
          <Link href="/organizer/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Hackathon
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">
        Here you can manage all your hackathons, participants, and results.
      </p>
      
      <div className="space-y-6">
        {hackathons.map((hackathon) => {
          const eventEnded = isPast(new Date(new Date(hackathon.date).setDate(new Date(hackathon.date).getDate() + 2)));
          return (
            <Card key={hackathon.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{hackathon.name}</CardTitle>
                  <CardDescription>{format(new Date(hackathon.date), "PPP")}</CardDescription>
                </div>
                 <Badge variant={eventEnded ? "secondary" : "default"}>{eventEnded ? "Ended" : "Live"}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="text-3xl font-bold">128</p>
                  </div>
                   <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground">Submissions</p>
                    <p className="text-3xl font-bold">32</p>
                  </div>
                   <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground">Teams</p>
                    <p className="text-3xl font-bold">45</p>
                  </div>
                   <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground">Judges</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button asChild variant="outline" disabled={eventEnded}>
                    <Link href={`/organizer/dashboard/edit/${hackathon.id}`}>
                        Manage Event <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
