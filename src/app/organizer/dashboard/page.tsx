
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, ArrowRight, Eye, Edit, Trash2, ArrowLeft, ArrowRightCircle, Users, Calendar, DollarSign, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, isPast, isFuture, parseISO } from "date-fns"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
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
import { useRouter } from "next/navigation"

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  rounds?: Array<{ name: string; start?: string; end?: string; date?: string; description: string }>;
  prize: number;
  locationType: 'online' | 'offline';
  image: string;
  hint: string;
  description: string;
  registration_count: number;
  team_count: number;
  created_at: string;
  status?: 'draft' | 'published' | 'ended';
}

export default function OrganizerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

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
    const safeParse = (s?: string) => {
      if (!s) return undefined;
      try { const d = parseISO(s); return isNaN(d.getTime()) ? undefined : d; } catch { return undefined; }
    };
    if (hackathon.rounds && hackathon.rounds.length > 0) {
      const first = hackathon.rounds[0];
      const last = hackathon.rounds[hackathon.rounds.length - 1];
      const firstDate = safeParse(first.start || first.date);
      const lastDate = safeParse(last.end || last.date);
      if (firstDate && lastDate) {
        if (isPast(lastDate)) return "Ended";
        if (isFuture(firstDate)) return "Upcoming";
        return "Ongoing";
      }
    }
    const start = safeParse(hackathon.start_date || hackathon.date);
    const end = safeParse(hackathon.end_date);
    if (start && end) {
      if (isPast(end)) return "Ended";
      if (isFuture(start)) return "Upcoming";
      return "Ongoing";
    }
    if (start) {
      if (isFuture(start)) return "Upcoming";
      return "Ongoing";
    }
    return "Upcoming";
  }

  const handleViewHackathon = (hackathon: Hackathon) => {
    // Navigate to a detailed view page with stats
    router.push(`/organizer/dashboard/view/${hackathon.id}`);
  };

  const handleEditHackathon = (hackathon: Hackathon) => {
    // Navigate to edit page
    router.push(`/organizer/dashboard/edit/${hackathon.id}`);
  };

  const handleManageHackathon = (hackathon: Hackathon) => {
    // Navigate to management page with participants, submissions, judging
    router.push(`/organizer/dashboard/manage/${hackathon.id}`);
  };

  const handleDeleteHackathon = async (hackathon: Hackathon) => {
    if (!confirm(`Are you sure you want to delete "${hackathon.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to delete hackathons.' });
        return;
      }

      await apiService.deleteHackathon(token, hackathon.id);
      toast({ title: 'Hackathon deleted', description: 'The hackathon has been deleted successfully.' });
      loadHackathons(); // Reload the list
    } catch (error: any) {
      console.error('Failed to delete hackathon:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete hackathon' });
    }
  };

  const filteredHackathons = hackathons
    .filter(h => {
        if (statusFilter === "All") return true;
        return getEventStatus(h) === statusFilter;
    })
    .filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalHackathons = hackathons.length;
  const totalParticipants = hackathons.reduce((sum, h) => sum + (h.registration_count || 0), 0);
  const totalTeams = hackathons.reduce((sum, h) => sum + (h.team_count || 0), 0);
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
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <Button variant="ghost" size="sm" onClick={() => router.forward()}>
          <ArrowRightCircle className="mr-2 h-4 w-4" />
          Forward
        </Button>
      </div>

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

       <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHackathons}</div>
            <p className="text-xs text-muted-foreground">
              {hackathons.filter(h => getEventStatus(h) === 'Ongoing').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              Registered teams
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled events
            </p>
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
                <LoadingButton href="/organizer/dashboard/create" loadingMessage="Opening creator...">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Hackathon
                </LoadingButton>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHackathons.map((hackathon) => (
                <div key={hackathon.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{hackathon.name}</h3>
                      <p className="text-sm text-muted-foreground">{hackathon.theme}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getEventStatus(hackathon) === 'Ongoing' ? 'default' : 'secondary'}>
                          {getEventStatus(hackathon)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {hackathon.registration_count || 0} participants • {hackathon.team_count || 0} teams
                        </span>
                        {typeof hackathon.prize === 'number' && hackathon.prize > 0 && (
                          <span className="text-sm text-muted-foreground">
                            • ₹{hackathon.prize.toLocaleString('en-IN')} prize pool
                          </span>
                        )}
                        {(hackathon.start_date || hackathon.end_date) && (
                          <span className="text-sm text-muted-foreground">
                            • {hackathon.start_date ? format(parseISO(hackathon.start_date), 'PP') : '—'} → {hackathon.end_date ? format(parseISO(hackathon.end_date), 'PP') : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LoadingButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewHackathon(hackathon)}
                      loadingMessage="Opening hackathon..."
                    >
                      <Eye className="mr-2 h-4 w-4"/>
                      View
                    </LoadingButton>
                    <LoadingButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditHackathon(hackathon)}
                      loadingMessage="Opening editor..."
                    >
                      <Edit className="mr-2 h-4 w-4"/>
                      Edit
                    </LoadingButton>
                    <LoadingButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleManageHackathon(hackathon)}
                      loadingMessage="Opening management..."
                    >
                      <ArrowRight className="mr-2 h-4 w-4"/>
                      Manage
                    </LoadingButton>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteHackathon(hackathon)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4"/>
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
