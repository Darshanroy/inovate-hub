
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hackathons as allHackathons } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    theme: "All",
    date: "All",
    prize: "All",
    location: "All",
  });

  const filteredHackathons = useMemo(() => {
    let hackathons = allHackathons;

    // Search filter
    if (searchTerm) {
      hackathons = hackathons.filter((h) =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.theme.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Theme filter
    if (filters.theme !== "All") {
      hackathons = hackathons.filter((h) => h.theme === filters.theme);
    }
    
    // Location filter
    if (filters.location !== "All") {
      hackathons = hackathons.filter((h) => h.locationType === filters.location.toLowerCase());
    }

    // Prize filter
    if (filters.prize !== "All") {
       hackathons = hackathons.sort((a, b) => {
        if (filters.prize === 'Highest') return b.prize - a.prize;
        if (filters.prize === 'Lowest') return a.prize - b.prize;
        return 0;
      });
    }
    
     // Date filter
    if (filters.date !== 'All') {
      hackathons = hackathons.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (filters.date === 'Newest') return dateB - dateA;
        if (filters.date === 'Oldest') return dateA - dateB;
        return 0;
      });
    }

    return hackathons;
  }, [searchTerm, filters]);

  const handleFilterChange = (type: string, value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const themes = ["All", "Artificial Intelligence", "Sustainability", "Financial Technology", "Healthcare", "Creative Coding", "Data Science"];
  const dates = ["All", "Newest", "Oldest"];
  const prizes = ["All", "Highest", "Lowest"];
  const locations = ["All", "Online", "Offline"];

  return (
    <main className="container mx-auto flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Input
          placeholder="Search for hackathons by name or theme..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 text-base"
        />
        <div className="flex flex-wrap gap-3 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full">Theme: {filters.theme} <ListFilter className="ml-2 h-4 w-4" /></Button>
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
              <Button variant="secondary" className="rounded-full">Date: {filters.date} <ListFilter className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by Date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filters.date} onValueChange={(v) => handleFilterChange("date", v)}>
                 {dates.map(d => <DropdownMenuRadioItem key={d} value={d}>{d}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-full">Prize Pool: {filters.prize} <ListFilter className="ml-2 h-4 w-4" /></Button>
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
              <Button variant="secondary" className="rounded-full">Location: {filters.location} <ListFilter className="ml-2 h-4 w-4" /></Button>
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
       {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredHackathons.map((hackathon, index) => (
            <Card key={index} className="bg-secondary border-white/10 flex transform flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                <CardContent className="p-4 flex flex-col gap-3">
                <Image
                    src={hackathon.image}
                    alt={hackathon.name}
                    width={600}
                    height={400}
                    className="mb-4 w-full h-auto aspect-video rounded-lg object-cover"
                    data-ai-hint={hackathon.hint}
                />
                <div>
                    <h3 className="text-lg font-bold leading-tight">{hackathon.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Theme: {hackathon.theme}</p>
                    <p className="text-xs text-muted-foreground mt-1">Date: {new Date(hackathon.date).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-accent mt-2">Prize: ${hackathon.prize.toLocaleString()}</p>
                </div>
                </CardContent>
                <div className="p-4 pt-0">
                    <Button className="w-full">View Details</Button>
                </div>
            </Card>
            ))}
        </div>
        ) : (
             <div className="text-center py-16">
                <h3 className="text-2xl font-bold">No Hackathons Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
        )}
    </main>
  );
}
