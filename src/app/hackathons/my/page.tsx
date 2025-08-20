
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { HackathonCard } from "@/components/ui/hackathon-card";
import { 
  Eye, 
  Users, 
  FileText, 
  Calendar, 
  Search, 
  Filter,
  Crown,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart
} from "lucide-react";
import Link from "next/link";
import { format, isPast, isFuture, parseISO } from "date-fns";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export type Round = { name: string; date: string; description: string };
export type Hackathon = { 
  id: string; 
  name: string; 
  rounds?: Round[]; 
  date: string; 
  image: string; 
  hint: string; 
  description: string; 
  locationType: 'online'|'offline'; 
  registrationStatus?: 'Confirmed'|'Pending'|'Waitlisted'; 
  teamId?: string|null; 
  submissionStatus?: 'Not Started'|'Draft'|'Submitted';
  prize: number;
  theme: string;
  team?: {
    id: string;
    name: string;
    code: string;
    members: Array<{
      id: string;
      name: string;
      email: string;
      isLeader: boolean;
    }>;
  };
};

const getEventStatus = (hackathon: Hackathon) => {
  if (hackathon.rounds && hackathon.rounds.length > 0) {
    const firstRoundDate = parseISO(hackathon.rounds[0].date);
    const lastRoundDate = parseISO(hackathon.rounds[hackathon.rounds.length - 1].date);
    
    if (isPast(lastRoundDate)) return "Ended";
    if (isFuture(firstRoundDate)) return "Not Started";
    return "Ongoing";
  }
  // Fallback for single-date hackathons
  const eventDate = parseISO(hackathon.date);
  const eventEndDate = new Date(eventDate);
  eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration

  if (isPast(eventEndDate)) return "Ended";
  if (isFuture(eventDate)) return "Not Started";
  return "Ongoing";
}

export default function MyHackathonsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [wishlistedHackathons, setWishlistedHackathons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

      // Load registrations
      const registrationsRes = await apiService.myRegistrations(token);
      const registeredHackathons = registrationsRes.hackathons || [];

      // Load team information for each hackathon
      const hackathonsWithTeams = await Promise.all(
        registeredHackathons.map(async (hackathon: any) => {
          try {
            const teamRes = await apiService.getMyTeam(token, hackathon.id);
            return {
              ...hackathon,
              team: teamRes.team,
              teamId: teamRes.team ? teamRes.team.id : null
            };
          } catch (error) {
            // User might not be in a team for this hackathon
            return {
              ...hackathon,
              team: null,
              teamId: null
            };
          }
        })
      );

      setHackathons(hackathonsWithTeams);
    } catch (error: any) {
      console.error('Failed to load hackathons:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load hackathons' });
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = (hackathonId: string, isWishlisted: boolean) => {
    setWishlistedHackathons(prev => {
      const newSet = new Set(prev);
      if (isWishlisted) {
        newSet.add(hackathonId);
      } else {
        newSet.delete(hackathonId);
      }
      return newSet;
    });
  };

  const filteredHackathons = useMemo(() => {
    let list = hackathons.slice();
    if (statusFilter !== "All") {
      list = list.filter(h => getEventStatus(h) === statusFilter);
    }
    if (searchTerm) {
      list = list.filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list.sort((a,b) => {
      const dateA = a.rounds && a.rounds[0] ? new Date(a.rounds[0].date) : new Date(a.date);
      const dateB = b.rounds && b.rounds[0] ? new Date(b.rounds[0].date) : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [hackathons, statusFilter, searchTerm]);

  const ongoingHackathons = filteredHackathons.filter(h => getEventStatus(h) === "Ongoing");
  const upcomingHackathons = filteredHackathons.filter(h => getEventStatus(h) === "Not Started");
  const endedHackathons = filteredHackathons.filter(h => getEventStatus(h) === "Ended");
  const wishlistHackathons = filteredHackathons.filter(h => wishlistedHackathons.has(h.id));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <Clock className="h-4 w-4" />;
      case 'Ongoing':
        return <AlertCircle className="h-4 w-4" />;
      case 'Ended':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-green-100 text-green-800';
      case 'Ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingOverlay message="Loading your hackathons..." />;
  }

  return (
    <div className="container mx-auto max-w-6xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Hackathons</h1>
        <p className="text-muted-foreground">Track your hackathon registrations and team progress.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hackathons or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "All" ? "default" : "outline"}
            size="sm"
            className={statusFilter === "All" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            onClick={() => setStatusFilter("All")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "Not Started" ? "default" : "outline"}
            size="sm"
            className={statusFilter === "Not Started" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            onClick={() => setStatusFilter("Not Started")}
          >
            Upcoming
          </Button>
          <Button
            variant={statusFilter === "Ongoing" ? "default" : "outline"}
            size="sm"
            className={statusFilter === "Ongoing" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            onClick={() => setStatusFilter("Ongoing")}
          >
            Ongoing
          </Button>
          <Button
            variant={statusFilter === "Ended" ? "default" : "outline"}
            size="sm"
            className={statusFilter === "Ended" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600 border-blue-600 hover:bg-blue-50"}
            onClick={() => setStatusFilter("Ended")}
          >
            Ended
          </Button>
        </div>
      </div>

      {filteredHackathons.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {hackathons.length === 0 ? "No hackathons yet" : "No hackathons found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hackathons.length === 0 
              ? "Join your first hackathon to get started!" 
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {hackathons.length === 0 && (
            <LoadingButton href="/hackathons" loadingMessage="Opening hackathons...">
              Browse Hackathons
            </LoadingButton>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Wishlist Hackathons Section */}
          {wishlistHackathons.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-bold">Wishlist Hackathons</h2>
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                  {wishlistHackathons.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wishlistHackathons.map((hackathon) => (
                  <HackathonCard 
                    key={hackathon.id} 
                    hackathon={hackathon}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ongoing Hackathons Section */}
          {ongoingHackathons.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Ongoing Hackathons</h2>
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  {ongoingHackathons.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ongoingHackathons.map((hackathon) => (
                  <HackathonCard 
                    key={hackathon.id} 
                    hackathon={hackathon}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlistedHackathons.has(hackathon.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Hackathons Section */}
          {upcomingHackathons.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Upcoming Hackathons</h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                  {upcomingHackathons.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {upcomingHackathons.map((hackathon) => (
                  <HackathonCard 
                    key={hackathon.id} 
                    hackathon={hackathon}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlistedHackathons.has(hackathon.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Ended Hackathons Section */}
          {endedHackathons.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Ended Hackathons</h2>
                <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                  {endedHackathons.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {endedHackathons.map((hackathon) => (
                  <HackathonCard 
                    key={hackathon.id} 
                    hackathon={hackathon}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlistedHackathons.has(hackathon.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
