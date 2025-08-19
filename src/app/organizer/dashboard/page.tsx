
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ArrowRight, Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, isPast, isFuture, parseISO } from "date-fns"
import { useState, useEffect } from "react"
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
import { apiService } from "@/lib/api"
import { getCookie } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  date: string;
  rounds?: Array<{ name: string; date: string; description: string }>;
  prize: number;
  locationType: 'online' | 'offline';
  image: string;
  hint: string;
  description: string;
  registration_count: number;
  team_count: number;
  created_at: string;
}

export default function OrganizerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view your hackathons.' });
        return;
      }
      const res = await apiService.getOrganizerHackathons(token);
      setHackathons(res.hackathons || []);
    } catch (error: any) {
      console.error('Failed to load hackathons:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load hackathons' });
    } finally {
      setLoading(false);
    }
  };

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
  const totalParticipants = hackathons.reduce((sum, h) => sum + h.registration_count, 0);
  const upcomingDeadlines = hackathons.filter(h => getEventStatus(h) === 'Upcoming').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your hackathons...</p>
        </div>
      </div>
    );
  }

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
            Manage and monitor all your hackathon events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <ListFilter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Upcoming">Upcoming</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Ongoing">Ongoing</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Ended">Ended</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredHackathons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {hackathons.length === 0 ? (
                  <>
                    <p className="text-lg font-semibold mb-2">No hackathons yet</p>
                    <p>Create your first hackathon to get started!</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold mb-2">No hackathons found</p>
                    <p>Try adjusting your search or filter criteria.</p>
                  </>
                )}
              </div>
              {hackathons.length === 0 && (
                <Button asChild>
                  <Link href="/organizer/dashboard/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Hackathon
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHackathons.map((hackathon) => (
                <div key={hackathon.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{hackathon.name}</h3>
                      <p className="text-sm text-muted-foreground">{hackathon.theme}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getEventStatus(hackathon) === 'Ongoing' ? 'default' : 'secondary'}>
                          {getEventStatus(hackathon)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {hackathon.registration_count} participants • {hackathon.team_count} teams
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/hackathons/${hackathon.id}`}>
                        <Eye className="mr-2 h-4 w-4"/>
                        View
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/organizer/dashboard/edit/${hackathon.id}`}>
                        <Edit className="mr-2 h-4 w-4"/>
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/organizer/dashboard/edit/${hackathon.id}`}>
                        <ArrowRight className="mr-2 h-4 w-4"/>
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
