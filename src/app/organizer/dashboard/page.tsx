
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ArrowRight } from "lucide-react"
import { hackathons, Hackathon } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { format, isPast, isFuture, parseISO } from "date-fns"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ListFilter } from "lucide-react"

export default function OrganizerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const getEventStatus = (hackathon: Hackathon) => {
    if (hackathon.rounds && hackathon.rounds.length > 0) {
        const firstRoundDate = parseISO(hackathon.rounds[0].date);
        const lastRoundDate = parseISO(hackathon.rounds[hackathon.rounds.length - 1].date);
        
        if (isPast(lastRoundDate)) return "Ended";
        if (isFuture(firstRoundDate)) return "Upcoming";
        return "Ongoing";
    }
    // Fallback for single-date hackathons
    const eventDate = parseISO(hackathon.date);
    const eventEndDate = new Date(eventDate);
    eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration

    if (isPast(eventEndDate)) return "Ended";
    if (isPast(eventDate)) return "Ongoing";
    return "Upcoming";
  }

  const filteredHackathons = hackathons
    .filter(h => {
        if (statusFilter === "All") return true;
        return getEventStatus(h) === statusFilter;
    })
    .filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalHackathons = hackathons.length;
  const totalParticipants = 128; // mock data
  const upcomingDeadlines = hackathons.filter(h => getEventStatus(h) === 'Upcoming').length;


  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Manage all your events from one central hub.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/organizer/dashboard/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Hackathon
          </Link>
        </Button>
      </div>

       <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHackathons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
          </CardContent>
        </Card>
      </div>
      

      <Card>
        <CardHeader>
          <CardTitle>My Hackathons</CardTitle>
          <CardDescription>
            Here you can manage all your hackathons, participants, and results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
             <Input 
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
             />
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <ListFilter className="mr-2 h-4 w-4" />
                    Status: {statusFilter}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    {["All", "Upcoming", "Ongoing", "Ended"].map(s => (
                          <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {filteredHackathons.map((hackathon) => {
              const status = getEventStatus(hackathon);
              const displayDate = hackathon.rounds && hackathon.rounds.length > 0 ? hackathon.rounds[0].date : hackathon.date;
              return (
                <Card key={hackathon.id} className="bg-secondary">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{hackathon.name}</CardTitle>
                      <CardDescription>{format(new Date(displayDate), "PPP")}</CardDescription>
                    </div>
                     <Badge variant={status === "Ended" ? "secondary" : status === 'Ongoing' ? "destructive" : "default"}>{status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-sm">
                       <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p className="font-bold">128</p>
                       </div>
                       <div>
                          <p className="text-muted-foreground">Submissions</p>
                          <p className="font-bold">32</p>
                       </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end bg-black/10 p-4">
                    <Button asChild>
                        <Link href={`/organizer/dashboard/edit/${hackathon.id}`}>
                            Manage Event <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
