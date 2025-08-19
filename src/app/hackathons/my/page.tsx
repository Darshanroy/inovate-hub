
"use client";

import { useState, useMemo } from "react";
import { myHackathons as allMyHackathons, Hackathon, Round } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter, Calendar, Users, FileText, Trophy, ExternalLink, XCircle, Eye, Edit, Check } from "lucide-react";
import { format, isPast, isFuture, parseISO } from 'date-fns';

const getEventStatus = (hackathon: Hackathon) => {
    const now = new Date();
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
    eventEndDate.setDate(eventEndDate.getDate() + 2); // Assume 2 days duration for old format

    if (isPast(eventEndDate)) return "Ended";
    if (isFuture(eventDate)) return "Not Started";
    return "Ongoing";
}


export default function MyHackathonsPage() {
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredHackathons = useMemo(() => {
        let hackathons = allMyHackathons;
        if (statusFilter !== "All") {
            hackathons = hackathons.filter(h => getEventStatus(h) === statusFilter);
        }
        return hackathons.sort((a,b) => {
            const dateA = a.rounds ? new Date(a.rounds[0].date) : new Date(a.date);
            const dateB = b.rounds ? new Date(b.rounds[0].date) : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });

    }, [statusFilter]);

    const ActionButtons = ({ hackathon }: { hackathon: Hackathon }) => {
        const status = getEventStatus(hackathon);
        
        return (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/hackathons/${hackathon.id}`}>
                        <Eye className="mr-2 h-4 w-4"/>
                        View Details
                    </Link>
                </Button>
                {status === 'Not Started' && hackathon.teamId && (
                     <Button asChild variant="outline" size="sm">
                        <Link href={`/hackathons/${hackathon.id}/team`}>
                            <Users className="mr-2 h-4 w-4"/>
                            Manage Team
                        </Link>
                    </Button>
                )}
                 {status === 'Not Started' && !hackathon.teamId && (
                     <Button asChild variant="secondary" size="sm">
                        <Link href={`/hackathons/${hackathon.id}/find-team`}>
                            <Users className="mr-2 h-4 w-4"/>
                            Join a Team
                        </Link>
                    </Button>
                )}
                 {status === 'Ongoing' && (!hackathon.submissionStatus || hackathon.submissionStatus === 'Not Started') && (
                     <Button asChild size="sm">
                        <Link href={`/hackathons/${hackathon.id}/submission`}>
                            <FileText className="mr-2 h-4 w-4"/>
                            Submit Project
                        </Link>
                    </Button>
                )}
                 {status === 'Ongoing' && hackathon.submissionStatus === 'Draft' && (
                     <Button asChild size="sm" variant="secondary">
                        <Link href={`/hackathons/${hackathon.id}/submission`}>
                            <Edit className="mr-2 h-4 w-4"/>
                            View/Edit Draft
                        </Link>
                    </Button>
                )}
                {status === 'Ongoing' && hackathon.submissionStatus === 'Submitted' && (
                     <Button asChild size="sm" variant="outline" className="text-green-400 border-green-400 hover:bg-green-400/10 hover:text-green-300">
                        <Link href={`/hackathons/${hackathon.id}/submission`}>
                            <Check className="mr-2 h-4 w-4"/>
                            View Submission
                        </Link>
                    </Button>
                )}
                 {status === 'Ended' && (
                     <Button asChild variant="secondary" size="sm">
                        <Link href={`/hackathons/${hackathon.id}/results`}>
                            <Trophy className="mr-2 h-4 w-4"/>
                            View Results
                        </Link>
                    </Button>
                )}
            </div>
        )
    }

    const RegistrationBadge = ({ status }: { status: Hackathon['registrationStatus']}) => {
        const variant = status === 'Confirmed' ? 'default' : status === 'Pending' ? 'secondary' : 'destructive';
        return <Badge variant={variant}>{status}</Badge>
    }

    return (
        <main className="container mx-auto flex-1 px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter">My Hackathons</h1>
                    <p className="text-muted-foreground mt-2">All your registered events in one place.</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="mt-4 sm:mt-0">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filter by status: {statusFilter}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                        {["All", "Not Started", "Ongoing", "Ended"].map(s => (
                             <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {filteredHackathons.length > 0 ? (
                 <div className="space-y-6">
                    {filteredHackathons.map(hackathon => {
                        const status = getEventStatus(hackathon);
                        const displayDate = hackathon.rounds && hackathon.rounds.length > 0 ? hackathon.rounds[0].date : hackathon.date;

                        return (
                         <Card key={hackathon.id} className="bg-secondary border-white/10 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <Image 
                                        src={hackathon.image}
                                        alt={hackathon.name}
                                        width={200}
                                        height={120}
                                        className="rounded-lg object-cover w-full md:w-48 h-auto"
                                        data-ai-hint={hackathon.hint}
                                    />
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row justify-between items-start">
                                            <h2 className="text-2xl font-bold">{hackathon.name}</h2>
                                            <Badge variant={
                                                status === 'Ongoing' ? 'destructive' :
                                                status === 'Ended' ? 'secondary' : 'default'
                                            }>
                                                {status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                                            <span>{format(new Date(displayDate), 'PPP')}</span>
                                            <span>|</span>
                                            <span>{hackathon.locationType === 'online' ? 'Online' : 'Offline'}</span>
                                             <span>|</span>
                                             <div className="flex items-center gap-2">
                                                <span>Registration:</span>
                                                <RegistrationBadge status={hackathon.registrationStatus} />
                                             </div>
                                        </div>
                                        <p className="text-muted-foreground mt-3 text-sm max-w-prose">{hackathon.description.substring(0, 150)}...</p>
                                        <ActionButtons hackathon={hackathon} />
                                    </div>
                                    {hackathon.registrationStatus === 'Confirmed' && (
                                        <Button variant="ghost" size="sm" className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                                            <XCircle className="h-4 w-4 mr-2"/>
                                            Unregister
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                         </Card>
                        )
                    })}
                 </div>
            ) : (
                <div className="text-center py-20 bg-secondary rounded-lg border-2 border-dashed border-border">
                    <h2 className="text-2xl font-bold">You haven't joined any events yet.</h2>
                    <p className="text-muted-foreground mt-2">Explore hackathons and start your next project!</p>
                    <Button asChild className="mt-6">
                        <Link href="/hackathons">
                            <ExternalLink className="mr-2 h-4 w-4"/>
                            Explore Hackathons
                        </Link>
                    </Button>
                </div>
            )}
        </main>
    )
}
