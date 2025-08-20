
"use client";

import { useState, useMemo, useEffect, memo } from "react";
import { apiService } from "@/lib/api";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { HackathonCard } from "@/components/ui/hackathon-card";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { getWishlist, toggleWishlist } from "@/lib/wishlist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

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
  sponsors?: string[];
}

const HackathonsPage = memo(function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    theme: "All",
    prize: "All",
    location: "All",
  });
  const [wishlistedHackathons, setWishlistedHackathons] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHackathons();
    // initialize wishlist from localStorage on mount
    setWishlistedHackathons(getWishlist());
  }, []);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const res = await apiService.listHackathons();
      setHackathons(res.hackathons || []);
    } catch (error) {
      console.error('Failed to load hackathons:', error);
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (hackathon: Hackathon) => {
    if (hackathon.rounds && hackathon.rounds.length > 0 && typeof hackathon.rounds[0].date === 'string' && typeof hackathon.rounds[hackathon.rounds.length - 1].date === 'string') {
      const firstRoundDate = parseISO(hackathon.rounds[0].date);
      const lastRoundDate = parseISO(hackathon.rounds[hackathon.rounds.length - 1].date);

      if (isPast(lastRoundDate)) return "Ended";
      if (isFuture(firstRoundDate)) return "Upcoming";
      return "Ongoing";
    }

    if (typeof hackathon.date !== 'string') {
      return "Unknown"; // Handle case where hackathon.date is not a string
    }
    
    // Fallback for single-date hackathons
    const eventDate = parseISO(hackathon.date);
    const eventEndDate = new Date(eventDate);
    eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration

    if (isPast(eventEndDate)) return "Ended";
    if (isPast(eventDate)) return "Ongoing";
    return "Upcoming";
  };

  const filteredHackathons = useMemo(() => {
    let list = hackathons.slice();

    // Theme filter
    if (filters.theme !== "All") {
      list = list.filter((h) => h.theme === filters.theme);
    }
    
    // Location filter
    if (filters.location !== "All") {
      list = list.filter((h) => h.locationType === filters.location.toLowerCase());
    }

    // Prize filter
    if (filters.prize !== "All") {
       list = list.sort((a, b) => {
        if (filters.prize === 'Highest') return (b.prize || 0) - (a.prize || 0);
        if (filters.prize === 'Lowest') return (a.prize || 0) - (b.prize || 0);
        return 0;
      });
    }

    return list;
  }, [hackathons, filters]);

  const ongoingHackathons = filteredHackathons.filter(h => getEventStatus(h) === "Ongoing");
  const upcomingHackathons = filteredHackathons.filter(h => getEventStatus(h) === "Upcoming");
  const endedHackathons = filteredHackathons.filter(h => getEventStatus(h) === "Ended");

  const handleFilterChange = (type: string, value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleWishlistToggle = (hackathonId: string, isWishlisted: boolean) => {
    const updated = toggleWishlist(hackathonId, isWishlisted);
    setWishlistedHackathons(new Set(updated));
  };

  const themes = ["All", "Artificial Intelligence", "Sustainability", "Financial Technology", "Healthcare", "Creative Coding", "Data Science"];
  const prizes = ["All", "Highest", "Lowest"];
  const locations = ["All", "Online", "Offline"];

  if (loading) {
    return <LoadingOverlay message="Loading hackathons..." />;
  }

  return (
    <main className="container mx-auto flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full">
                Theme: {filters.theme} <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filters.theme} onValueChange={(v) => handleFilterChange("theme", v)}>
                {themes.map(t => <DropdownMenuRadioItem key={t} value={t}>{t}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full">
                Prize Pool: {filters.prize} <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by Prize</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filters.prize} onValueChange={(v) => handleFilterChange("prize", v)}>
                {prizes.map(p => <DropdownMenuRadioItem key={p} value={p}>{p}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full">
                Location: {filters.location} <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filters.location} onValueChange={(v) => handleFilterChange("location", v)}>
                {locations.map(l => <DropdownMenuRadioItem key={l} value={l}>{l}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

             {/* Ongoing Hackathons Section */}
       {ongoingHackathons.length > 0 && (
         <section className="mb-12">
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
         <section className="mb-12">
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
         <section className="mb-12">
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

      {/* No Hackathons Found */}
      {filteredHackathons.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold">No Hackathons Found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      )}
    </main>
  );
});

export default HackathonsPage;
