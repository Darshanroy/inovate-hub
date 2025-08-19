
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Check, X, User, ExternalLink, Users } from "lucide-react";
import { soloParticipants } from "@/lib/data";
import { openTeams } from "@/lib/data";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const individualParticipants = soloParticipants.map((p, i) => ({
    ...p,
    email: `${p.name.toLowerCase().replace(' ', '.')}@example.com`,
    status: i % 3 === 0 ? 'Pending' : i % 3 === 1 ? 'Confirmed' : 'Waitlisted',
    registeredDate: new Date(new Date().setDate(new Date().getDate() - (i*2))).toLocaleDateString()
}))

const teamParticipants = openTeams.map(t => ({
    ...t,
    leader: t.members[0],
    maxMembers: 4,
    status: 'Confirmed'
}));


export function ParticipantsTab() {
  const { toast } = useToast();

  const handleApprove = (name: string) => {
    toast({ title: "Registration Approved", description: `${name} is now confirmed for the event.` });
  }

  const handleReject = (name: string) => {
    toast({ variant: "destructive", title: "Registration Rejected", description: `${name}'s registration has been rejected.` });
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>View and manage all registered participants and teams for your hackathon.</CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="individuals">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individuals">
                        <User className="mr-2 h-4 w-4" />
                        Individual Participants
                    </TabsTrigger>
                    <TabsTrigger value="teams">
                         <Users className="mr-2 h-4 w-4" />
                        Teams
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="individuals" className="mt-4">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Registered</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {individualParticipants.map(p => (
                                <TableRow key={p.name}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>{p.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={p.status === 'Confirmed' ? 'default' : 'secondary'}>{p.status}</Badge>
                                    </TableCell>
                                    <TableCell>{p.registeredDate}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <ExternalLink className="mr-2 h-4 w-4" /> View Profile
                                                </DropdownMenuItem>
                                                {p.status === 'Pending' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleApprove(p.name)}>
                                                            <Check className="mr-2 h-4 w-4" /> Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleReject(p.name)} className="text-destructive">
                                                            <X className="mr-2 h-4 w-4" /> Reject
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="teams" className="mt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamParticipants.map(team => (
                            <Card key={team.name} className="bg-background">
                                <CardHeader>
                                    <CardTitle className="text-lg">{team.name}</CardTitle>
                                     <CardDescription>Leader: {team.leader.name}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <div className="flex -space-x-2 overflow-hidden">
                                        {team.members.map(m => (
                                            <Image key={m.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src={m.avatar} alt={m.name} width={32} height={32} data-ai-hint="person face" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{team.members.length} / {team.maxMembers} members</p>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-end gap-2">
                                     <Button variant="outline" size="sm">View Details</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  )
}
