
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Hackathon, Team, TeamMessage, soloParticipants as allSoloParticipants, SoloParticipant } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Paperclip, Send, UserPlus, Pencil, X, Save, Trash2, Expand, Minimize, SendHorizonal, Mail, Check } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";


const InviteDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const [invited, setInvited] = useState<string[]>([]);
    
    const handleInvite = (participant: SoloParticipant) => {
        setInvited(prev => [...prev, participant.name]);
        toast({
            title: "Invitation Sent!",
            description: `${participant.name} has been invited to join your team.`
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Invite Members</DialogTitle>
                    <DialogDescription>
                        Browse participants who are looking for a team and send them an invitation.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96">
                <div className="space-y-4 pr-6">
                    {allSoloParticipants.map(participant => (
                        <div key={participant.name} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                            <div className="flex items-center gap-4">
                                <Image src={participant.avatar} alt={participant.name} width={40} height={40} className="rounded-full" data-ai-hint="person face" />
                                <div>
                                    <h4 className="font-semibold">{participant.name}</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {participant.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleInvite(participant)} disabled={invited.includes(participant.name)}>
                                {invited.includes(participant.name) ? (
                                    <> <Check className="mr-2 h-4 w-4" /> Invited</>
                                ) : (
                                    <> <Mail className="mr-2 h-4 w-4"/> Send Invitation</>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
                </ScrollArea>
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
     <main className={`container mx-auto px-4 py-8 grid ${isChatFullScreen ? 'grid-cols-12' : 'grid-cols-1 md:grid-cols-12'} gap-8 items-start`}>
      <div className={`${isChatFullScreen ? 'hidden' : 'col-span-12 lg:col-span-8'}`}>
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-8">
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
             {isEditing ? (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-5 h-5"/></Button>
                    <Button variant="ghost" size="icon" onClick={handleCancel}><X className="w-5 h-5"/></Button>
                </div>
             ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-5 h-5"/>
                </Button>
             )}
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
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
               {isEditing && (
                 <button onClick={handleInvite} className="flex flex-col items-center justify-center size-16 rounded-full border-2 border-dashed border-border hover:bg-secondary transition-colors">
                    <UserPlus className="w-6 h-6 text-muted-foreground" />
                 </button>
               )}
            </div>
          </div>
         {!isEditing && <Button 
            onClick={handleInvite}
            className="absolute bottom-6 right-6 flex items-center justify-center size-14 rounded-2xl bg-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <UserPlus className="w-6 h-6" />
            <span className="sr-only">Invite Member</span>
          </Button>}
        </div>
      </div>
      <div className={`${isChatFullScreen ? 'col-span-12 h-[calc(100vh-10rem)]' : 'col-span-12 lg:col-span-4'}`}>
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg h-full flex flex-col p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-xl font-semibold">Team Chat</h2>
            <div className="flex items-center">
                 <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsChatFullScreen(!isChatFullScreen)}>
                    {isChatFullScreen ? <Minimize className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleMoreOptions}>
                <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 items-end max-w-[85%] ${
                  message.isSelf ? "flex-row-reverse ml-auto" : ""
                }`}
              >
                <Image
                  alt={message.author}
                  className="size-6 rounded-full"
                  height={24}
                  src={message.avatar}
                  width={24}
                />
                <div
                  className={`p-3 rounded-2xl ${
                    message.isSelf
                      ? "bg-primary/20 rounded-br-none"
                      : "bg-secondary rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-auto border-t border-border">
            <div className="relative">
              <Textarea
                className="w-full pr-20 resize-none bg-background"
                placeholder="Type a message..."
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
               <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleAttachment}>
                    <Paperclip className="w-5 h-5"/>
                 </Button>
                <Button className="p-2 rounded-full h-8 w-12 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSendMessage}>
                    <Send className="w-5 h-5" />
                </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <InviteDialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen} />
    </>
  );
}
