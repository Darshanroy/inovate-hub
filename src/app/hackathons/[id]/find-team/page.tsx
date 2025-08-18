
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { soloParticipants, openTeams } from "@/lib/data"
import Image from "next/image"
import { Search, UserPlus, Users, Check, Mail, KeyRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useParams, useRouter } from "next/navigation"

const CreateTeamDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const hackathonId = params.id;

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Team Created!",
            description: "You can now invite members and start collaborating.",
        })
        onOpenChange(false);
        router.push(`/hackathons/${hackathonId}/team`);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to form your own team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input id="team-name" placeholder="e.g., The Code Crusaders" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="team-description">Team Description</Label>
                        <Textarea id="team-description" placeholder="Our mission is to build..." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Create Team</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function FindTeamPage() {
    const [filter, setFilter] = useState("teams");
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
    const [requestedTeams, setRequestedTeams] = useState<string[]>([]);
    const [invitedParticipants, setInvitedParticipants] = useState<string[]>([]);
    const router = useRouter();
    const params = useParams();

    const handleRequestToJoin = (teamName: string) => {
        setRequestedTeams(prev => [...prev, teamName]);
        toast({
            title: "Request Sent",
            description: `Your request to join ${teamName} has been sent.`
        })
    }
    
     const handleInviteParticipant = (participantName: string) => {
        setInvitedParticipants(prev => [...prev, participantName]);
        toast({
            title: "Invitation Sent",
            description: `Your invitation to ${participantName} has been sent.`
        })
    }

    const handleJoinWithCode = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const code = formData.get("team-code");
        toast({
            title: "Joined Team!",
            description: `You have successfully joined the team with code: ${code}.`
        });
        router.push(`/hackathons/${params.id}/team`);
    }

    const filteredTeams = openTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredParticipants = soloParticipants.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
        <main className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tighter">Find Your Team</h1>
                <p className="text-muted-foreground mt-2">Connect with other participants or join an existing team.</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                     <Button onClick={() => setIsCreateTeamOpen(true)} size="lg" className="w-full">
                        <UserPlus className="mr-2 h-5 w-5" /> Create a New Team
                    </Button>
                    <Card className="bg-secondary/50">
                        <CardContent className="p-4">
                            <form className="flex items-center gap-2" onSubmit={handleJoinWithCode}>
                                <KeyRound className="h-5 w-5 text-muted-foreground" />
                                <Input name="team-code" placeholder="Enter team code to join..." className="bg-transparent border-0 focus-visible:ring-0" required/>
                                <Button type="submit">Join</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>


                 <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg mb-6 max-w-sm mx-auto">
                    <Button 
                        variant={filter === 'teams' ? 'default' : 'ghost'} 
                        className="flex-1"
                        onClick={() => setFilter('teams')}
                    >
                        <Users className="mr-2 h-4 w-4"/>
                        Browse Teams
                    </Button>
                     <Button 
                        variant={filter === 'participants' ? 'default' : 'ghost'} 
                        className="flex-1"
                        onClick={() => setFilter('participants')}
                    >
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Browse Participants
                    </Button>
                </div>

                 <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder={filter === 'teams' ? "Search for teams..." : "Search by name or skill..."} 
                        className="pl-10 h-12 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filter === 'teams' && (
                    <div className="space-y-4">
                        {filteredTeams.map(team => (
                            <Card key={team.name} className="bg-secondary/50">
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold">{team.name}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>{team.members.length} members</span>
                                        </div>
                                         <div className="flex items-center gap-2 mt-2">
                                            {team.members.map(member => (
                                                <Image key={member.name} src={member.avatar} alt={member.name} width={32} height={32} className="rounded-full border-2 border-background" data-ai-hint="person face" />
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={() => handleRequestToJoin(team.name)} disabled={requestedTeams.includes(team.name)}>
                                        {requestedTeams.includes(team.name) ? <><Check className="mr-2 h-4 w-4"/>Requested</> : "Request to Join"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                 {filter === 'participants' && (
                    <div className="space-y-4">
                        {filteredParticipants.map(participant => (
                           <Card key={participant.name} className="bg-secondary/50">
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Image src={participant.avatar} alt={participant.name} width={56} height={56} className="rounded-full" data-ai-hint="person face" />
                                        <div>
                                            <h3 className="text-xl font-bold">{participant.name}</h3>
                                             <div className="flex flex-wrap gap-1 mt-2">
                                                {participant.skills.map(skill => (
                                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                   <Button onClick={() => handleInviteParticipant(participant.name)} disabled={invitedParticipants.includes(participant.name)}>
                                        {invitedParticipants.includes(participant.name) ? <><Check className="mr-2 h-4 w-4"/>Invited</> : <><Mail className="mr-2 h-4 w-4"/>Invite</>}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
        <CreateTeamDialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen} />
        </>
    );
}
