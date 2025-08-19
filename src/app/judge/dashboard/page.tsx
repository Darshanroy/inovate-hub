
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { judgeEvents } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
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

export default function JudgeDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredEvents = judgeEvents
    .filter(e => {
        if (statusFilter === "All") return true;
        return e.status === statusFilter;
    })
    .filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Judging Dashboard</h1>
        <p className="text-muted-foreground">Welcome, Judge. Here are your assigned hackathons.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Events</CardTitle>
          <CardDescription>
            Select an event to start judging submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
             <Input 
                placeholder="Search events..."
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
                    {["All", "Ongoing", "Closed"].map(s => (
                          <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="bg-secondary">
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription>{format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}</CardDescription>
                  </div>
                   <Badge variant={event.status === "Closed" ? "secondary" : "destructive"}>{event.status}</Badge>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {event.submissionsToJudge} submissions to judge
                    </p>
                </CardContent>
                <CardFooter className="justify-end bg-black/10 p-4">
                  <Button asChild disabled={event.status === 'Closed'}>
                      <Link href={`/judge/events/${event.id}`}>
                          Judge Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
                </CardFooter>
              </Card>>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
