
"use client";

import { useState, useMemo } from "react";
import { myHackathons as allMyHackathons, Hackathon } from "@/lib/data";
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
import { ListFilter, Calendar, Users, FileText, Trophy, ExternalLink, XCircle, Eye, Edit } from "lucide-react";
import { format, isPast, isFuture } from 'date-fns';

const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();

    // The event is considered "Ongoing" if the start date is in the past,
    // but the end date (start date + 2 days, for example) is in the future.
    if (isPast(eventDate) && isFuture(new Date(eventDate).setDate(eventDate.getDate() + 2))) {
        return "Ongoing";
    }
    if (isPast(eventDate)) {
        return "Ended";
    }
    if (isFuture(eventDate)) {
        return "Not Started";
    }
    return "Ongoing"; // Fallback
}


export default function MyHackathonsPage() {
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredHackathons = useMemo(() => {
        let hackathons = allMyHackathons;
        if (statusFilter !== "All") {
            hackathons = hackathons.filter(h => getEventStatus(h.date) === statusFilter);
        }
        return hackathons.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [statusFilter]);

    const ActionButtons = ({ hackathon }: { hackathon: Hackathon }) => {
        const status = getEventStatus(hackathon.date);
        
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
                    {filteredHackathons.map(hackathon => (
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
                                                getEventStatus(hackathon.date) === 'Ongoing' ? 'destructive' :
                                                getEventStatus(hackathon.date) === 'Ended' ? 'secondary' : 'default'
                                            }>
                                                {getEventStatus(hackathon.date)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                                            <span>{format(new Date(hackathon.date), 'PPP')}</span>
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
                    ))}
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
