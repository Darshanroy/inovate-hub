
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Hackathon, Team, TeamMessage, soloParticipants as allSoloParticipants, SoloParticipant } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Paperclip, Send, UserPlus, Pencil, X, Save, Trash2, Expand, Minimize, Mail, Check, Copy, Search, FileText, Edit3, Users, Settings } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// Enhanced Invite Dialog with better participant management
const InviteDialog = ({ open, onOpenChange, onInvite }: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  onInvite: (participant: SoloParticipant) => void 
}) => {
    const { toast } = useToast();
    const [invited, setInvited] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSkill, setFilterSkill] = useState("all");
    
    const handleInvite = (participant: SoloParticipant) => {
        setInvited(prev => [...prev, participant.name]);
        onInvite(participant);
        toast({
            title: "Invitation Sent!",
            description: `${participant.name} has been invited to join your team.`
        })
    }

    // Get unique skills for filtering
    const allSkills = Array.from(new Set(allSoloParticipants.flatMap(p => p.skills))).sort();

    const filteredParticipants = allSoloParticipants.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSkill = filterSkill === "all" || p.skills.includes(filterSkill);
        return matchesSearch && matchesSkill;
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Invite Team Members</DialogTitle>
                    <DialogDescription>
                        Browse participants who are looking for a team and send them an invitation.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name or skill..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterSkill} onValueChange={setFilterSkill}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by skill" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Skills</SelectItem>
                                {allSkills.map(skill => (
                                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                        Found {filteredParticipants.length} participants
                    </div>
                </div>

                <ScrollArea className="h-96">
                <div className="space-y-4 pr-6">
                    {filteredParticipants.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No participants found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredParticipants.map(participant => (
                            <div key={participant.name} className="flex items-center justify-between p-4 border rounded-lg bg-background hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Image src={participant.avatar} alt={participant.name} width={48} height={48} className="rounded-full" data-ai-hint="person face" />
                                    <div>
                                        <h4 className="font-semibold">{participant.name}</h4>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {participant.skills.map(skill => (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleInvite(participant)} 
                                    disabled={invited.includes(participant.name)}
                                    variant={invited.includes(participant.name) ? "outline" : "default"}
                                >
                                    {invited.includes(participant.name) ? (
                                        <> <Check className="mr-2 h-4 w-4" /> Invited</>
                                    ) : (
                                        <> <Mail className="mr-2 h-4 w-4"/> Send Invitation</>
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

// Team Settings Dialog for advanced team management
const TeamSettingsDialog = ({ 
  open, 
  onOpenChange, 
  team, 
  onUpdateTeam 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  team: Team,
  onUpdateTeam: (updates: Partial<Team>) => void
}) => {
    const { toast } = useToast();
    const [editedTeam, setEditedTeam] = useState<Team>(team);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onUpdateTeam(editedTeam);
        setIsEditing(false);
        toast({
            title: "Team Updated",
            description: "Team settings have been saved successfully.",
        });
    };

    const handleCancel = () => {
        setEditedTeam(team);
        setIsEditing(false);
    };

    const updateMemberRole = (memberName: string, newRole: string) => {
        setEditedTeam(prev => ({
            ...prev,
            members: prev.members.map(m => 
                m.name === memberName ? { ...m, role: newRole as any } : m
            )
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Team Settings</DialogTitle>
                    <DialogDescription>
                        Manage your team details, member roles, and permissions.
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Team Name</label>
                                {isEditing ? (
                                    <Input 
                                        value={editedTeam.name} 
                                        onChange={(e) => setEditedTeam(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-1"
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-1">{team.name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                {isEditing ? (
                                    <Textarea 
                                        value={editedTeam.description} 
                                        onChange={(e) => setEditedTeam(prev => ({ ...prev, description: e.target.value }))}
                                        className="mt-1"
                                        rows={3}
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="members" className="space-y-4">
                        <div className="space-y-3">
                            {team.members.map((member) => (
                                <div key={member.name} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Image src={member.avatar} alt={member.name} width={32} height={32} className="rounded-full" />
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            {isEditing ? (
                                                <Select 
                                                    value={editedTeam.members.find(m => m.name === member.name)?.role || member.role}
                                                    onValueChange={(value) => updateMemberRole(member.name, value)}
                                                >
                                                    <SelectTrigger className="w-32 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Leader">Leader</SelectItem>
                                                        <SelectItem value="Developer">Developer</SelectItem>
                                                        <SelectItem value="Designer">Designer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="permissions" className="space-y-4">
                        <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                                <h4 className="font-medium mb-2">Team Permissions</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Edit team details</span>
                                        <Badge variant="secondary">Leader only</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Invite new members</span>
                                        <Badge variant="secondary">Leader only</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Remove members</span>
                                        <Badge variant="secondary">Leader only</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Submit project</span>
                                        <Badge variant="secondary">All members</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <DialogFooter>
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit Team
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function TeamClientPage({
  hackathon,
  team: initialTeam,
  messages: initialMessages,
}: {
  hackathon: Hackathon;
  team: Team;
  messages: TeamMessage[];
}) {
  const [messages, setMessages] = useState<TeamMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [team, setTeam] = useState<Team>(initialTeam);
  const [editedName, setEditedName] = useState(initialTeam.name);
  const [editedDescription, setEditedDescription] = useState(initialTeam.description);
  const [isChatFullScreen, setIsChatFullScreen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    const message: TeamMessage = {
      id: messages.length + 1,
      author: "Alex Chen",
      avatar: "https://placehold.co/24x24.png", // This would be the current user's avatar
      content: newMessage,
      isSelf: true,
    };
    setMessages([...messages, message]);
    setNewMessage("");
  };
  
  const handleInvite = () => {
    setIsInviteDialogOpen(true);
  }

  const handleInviteParticipant = (participant: SoloParticipant) => {
    // In a real app, this would send an API request to invite the participant
    toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${participant.name}`,
    });
  }

  const handleUpdateTeam = (updates: Partial<Team>) => {
    setTeam(prev => ({ ...prev, ...updates }));
    setEditedName(updates.name || team.name);
    setEditedDescription(updates.description || team.description);
  }

  const handleCopyInviteCode = () => {
    const inviteCode = team.id.slice(0, 8).toUpperCase();
    navigator.clipboard.writeText(inviteCode);
    toast({
        title: "Invite Code Copied!",
        description: "The team invite code has been copied to your clipboard."
    })
  }

  const handleMoreOptions = () => {
     toast({
      title: "Coming Soon",
      description: "More chat options are on the way!",
    });
  }

  const handleAttachment = () => {
     toast({
      title: "Coming Soon",
      description: "File attachments will be available in a future update.",
    });
  }

  const handleSave = () => {
    setTeam(prev => ({...prev, name: editedName, description: editedDescription}));
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Team details updated!",
    })
  }
  
  const handleCancel = () => {
    setEditedName(team.name);
    setEditedDescription(team.description);
    setIsEditing(false);
  }
  
  const removeMember = (memberName: string) => {
    setTeam(prev => {
        if (!prev) return prev;
        return {...prev, members: prev.members.filter(m => m.name !== memberName)}
    });
    toast({
        title: "Member Removed",
        description: `${memberName} has been removed from the team.`,
    })
  }

  return (
    <>
     <main className={`container mx-auto px-4 py-8 grid ${isChatFullScreen ? 'grid-cols-1' : 'md:grid-cols-12'} gap-8 items-start`}>
      <div className={`${isChatFullScreen ? 'hidden' : 'col-span-12 lg:col-span-8'}`}>
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-6">
                <div className="flex-shrink-0 size-24 bg-secondary rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 text-primary">
                    <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 3h6.43c-.18.64-.44 1.25-.79 1.82l-1.42-1.42c.1-.29.18-.59.22-.9h-4.44v.01zM11 5.07V5h.13c-1.1.22-2.1.66-2.98 1.28L9.6 7.72c.45-.33.95-.59 1.5-.75zM5.26 8.74L6.7 10.18c-.2.48-.35 1-.45 1.54H5.22c.04-.52.14-1.03.24-1.54zM7.21 16c.36.42.77.79 1.23 1.1l-1.47 1.47C6.05 17.65 5.25 16.39 5.07 15H7.21v1zm8.01.21c.21-.69.32-1.41.32-2.14s-.11-1.45-.32-2.14l1.45-1.45c.4.88.67 1.85.71 2.87s-.2 2.01-.6 2.89l-1.55-1.17z"></path>
                    </svg>
                </div>
                </div>
                <div>
                {isEditing ? (
                    <div className="space-y-2">
                        <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-3xl font-bold h-auto p-0 border-0 bg-transparent focus-visible:ring-0" />
                        <Textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="text-muted-foreground p-0 border-0 bg-transparent focus-visible:ring-0" />
                    </div>
                ) : (
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{team.name}</h1>
                        <p className="text-muted-foreground">{team.description}</p>
                    </div>
                )}
                </div>
            </div>
             <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-5 h-5"/></Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}><X className="w-5 h-5"/></Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Pencil className="w-5 h-5"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsSettingsDialogOpen(true)}>
                            <Settings className="w-5 h-5"/>
                        </Button>
                    </>
                )}
             </div>
          </div>
          <div className="mb-4 p-3 bg-secondary rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">INVITE CODE:</span>
              <span className="font-mono text-sm font-bold text-accent">{team.id.slice(0,8).toUpperCase()}</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopyInviteCode}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Team Members ({team.members.length})</h2>
              <Button size="sm" onClick={handleInvite} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              {team.members.map((member) => (
                <div key={member.name} className="text-center relative group">
                  <Image
                    alt={member.name}
                    className={`size-16 rounded-full mx-auto mb-2 ${
                      member.role === "Leader"
                        ? "border-2 border-accent"
                        : ""
                    }`}
                    height={64}
                    src={member.avatar}
                    width={64}
                    data-ai-hint="person face"
                  />
                  {isEditing && member.role !== 'Leader' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="absolute top-0 right-0 p-1 bg-destructive rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3" />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove {member.name} from the team.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeMember(member.name)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <p className="font-semibold text-sm">{member.name}</p>
                  <p
                    className={`text-xs font-medium ${
                      member.role === "Leader"
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
           <div className="border-t border-border pt-6">
             <Button asChild className="w-full" size="lg">
                <Link href={`/hackathons/${hackathon.id}/submission`}>
                    <FileText className="mr-2 h-5 w-5" />
                    Submit Project
                </Link>
             </Button>
          </div>
        </div>
      </div>
      <div className={`${isChatFullScreen ? 'col-span-12 h-[calc(100vh-10rem)]' : 'col-span-12 lg:col-span-4'}`}>
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Chat</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatFullScreen(!isChatFullScreen)}
              >
                {isChatFullScreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 items-start ${
                    message.isSelf ? "flex-row-reverse" : ""
                  }`}
                >
                  {!message.isSelf && (
                    <Image
                      src={message.avatar}
                      alt={message.author}
                      width={32}
                      height={32}
                      className="rounded-full"
                      data-ai-hint="person face"
                    />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                      message.isSelf
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary rounded-bl-none"
                    }`}
                  >
                    <div className="font-semibold text-xs mb-1">
                      {message.author}
                    </div>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAttachment}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>

    {/* Enhanced Invite Dialog */}
    <InviteDialog 
      open={isInviteDialogOpen} 
      onOpenChange={setIsInviteDialogOpen}
      onInvite={handleInviteParticipant}
    />

    {/* Team Settings Dialog */}
    <TeamSettingsDialog 
      open={isSettingsDialogOpen} 
      onOpenChange={setIsSettingsDialogOpen}
      team={team}
      onUpdateTeam={handleUpdateTeam}
    />
    </>
  );
}
