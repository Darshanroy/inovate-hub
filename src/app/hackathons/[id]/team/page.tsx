"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Crown, 
  Mail, 
  Check, 
  X, 
  MessageSquare, 
  Settings, 
  UserPlus,
  Trash2,
  Edit,
  Send,
  Clock,
  Plus,
  MoreVertical,
  Search,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { apiService, Team, TeamRequest } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isLeader: boolean;
}

interface TeamMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  message: string;
  timestamp: string;
  isSelf: boolean;
}

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [soloParticipants, setSoloParticipants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [invitedParticipants, setInvitedParticipants] = useState<string[]>([]);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadTeamData();
  }, [hackathonId]);

  // Add a refresh mechanism for when the page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Reload team data when page becomes visible (e.g., after creating a team)
        loadTeamData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hackathonId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to view your team.' });
        return;
      }

      // Load user's team
      const teamRes = await apiService.getMyTeam(token, hackathonId);
      
      if (!teamRes.team) {
        toast({ title: 'No team found', description: 'You are not part of any team for this hackathon.' });
        router.push(`/hackathons/${hackathonId}/find-team`);
        return;
      }

      setTeam(teamRes.team);
      setEditDescription(teamRes.team.description || "");

      // Load team requests if user is leader
      if (teamRes.team.leader_id === getCurrentUserId()) {
        try {
          const requestsRes = await apiService.getTeamRequests(token, hackathonId);
          setRequests(requestsRes.requests || []);
        } catch (error) {
          console.error('Failed to load team requests:', error);
        }
      }

      // Load team messages
      try {
        const messagesRes = await apiService.getTeamMessages(token, hackathonId);
        const formattedMessages = (messagesRes.messages || []).map(msg => ({
          ...msg,
          isSelf: msg.sender_id === getCurrentUserId()
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load team messages:', error);
      }

      // Load solo participants for invite dialog
      try {
        const participantsRes = await apiService.getHackathonParticipants(token, hackathonId);
        const solo = (participantsRes.participants || []).filter(p => !p.team);
        setSoloParticipants(solo);
      } catch (error) {
        console.error('Failed to load participants:', error);
      }
    } catch (error: any) {
      console.error('Failed to load team data:', error);
      // Don't show error toast if it's just a "no team found" error
      if (!error.message?.includes('No team found')) {
        toast({ title: 'Error', description: error.message || 'Failed to load team data' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    // This should get the current user ID from your auth system
    // For now, we'll try to get it from the team data or use a placeholder
    try {
      const token = getCookie('authToken');
      if (token && team) {
        // If we have team data, check if current user is the leader
        if (team.leader_id) {
          return team.leader_id;
        }
        // Or check if current user is a member
        const currentMember = team.members.find(member => member.id);
        if (currentMember) {
          return currentMember.id;
        }
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
    // Fallback to a placeholder - in a real app, this would come from auth context
    return "current-user-id";
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to send messages.' });
        return;
      }

      const res = await apiService.sendTeamMessage(token, hackathonId, newMessage.trim());
      
      // Add the new message to the list
      const newMsg: TeamMessage = {
        id: res.id,
        sender_id: getCurrentUserId(),
        sender_name: "You", // This should come from user profile
        sender_avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8Omil4JR3-avFJyxqAzOz4QnDJfV2g8lzBbwXZu6XslT4K1HBH2vEgTpqNzLd6AhP_4UNtBenfPD-pW2YEraXiLGdwvX48A_tDEkP5bqubIY4iV19HXdDkinyKK6tbWRXHrBY6xwR3uYIn1hlCiT5b3soW6ylsUvM-sA0peYP4OAaiBsT_cTfBEnzL-nw9qA7P0DqQyUwLbHvR4JFTzFaSB9NTFxDDef5xqb6xXiTEPtW2i_gz5iscHRg-82fvppOlyz7rJoAQzUI",
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isSelf: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({ title: 'Failed to send message', description: error.message || 'Something went wrong' });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditDescription = async () => {
    try {
      setSubmitting(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to update team.' });
        return;
      }

      await apiService.updateTeam(token, hackathonId, { description: editDescription });
      
      setTeam(prev => prev ? { ...prev, description: editDescription } : null);
      setIsEditDialogOpen(false);
      toast({ title: 'Team updated', description: 'Team description has been updated successfully.' });
    } catch (error: any) {
      console.error('Failed to update team:', error);
      toast({ title: 'Failed to update team', description: error.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to remove members.' });
        return;
      }

      await apiService.removeTeamMember(token, hackathonId, memberId);
      
      // Update local state
      setTeam(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      } : null);
      
      toast({ title: 'Member removed', description: 'Team member has been removed successfully.' });
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast({ title: 'Failed to remove member', description: error.message || 'Something went wrong' });
    }
  };

  const handleRespondToRequest = async (requestId: string, response: 'accept' | 'reject') => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to respond to requests.' });
        return;
      }

      await apiService.respondToTeamRequest(token, hackathonId, requestId, response);
      
      // Remove the request from the list
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      if (response === 'accept') {
        toast({ title: 'Request accepted', description: 'Team member has been added successfully.' });
        // Reload team data to show new member
        loadTeamData();
      } else {
        toast({ title: 'Request rejected', description: 'Team request has been rejected.' });
      }
    } catch (error: any) {
      console.error('Failed to respond to request:', error);
      toast({ title: 'Failed to respond', description: error.message || 'Something went wrong' });
    }
  };

  const handleInviteParticipant = async (participantId: string) => {
    try {
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to invite participants.' });
        return;
      }

      // This would be a new API call to invite a participant
      // For now, we'll just show a toast
      setInvitedParticipants(prev => [...prev, participantId]);
      toast({ title: 'Invitation sent', description: 'Invitation has been sent to the participant.' });
    } catch (error: any) {
      console.error('Failed to invite participant:', error);
      toast({ title: 'Failed to invite', description: error.message || 'Something went wrong' });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLeader = team?.leader_id === getCurrentUserId();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No team found</h3>
          <p className="text-muted-foreground mb-4">You are not part of any team for this hackathon.</p>
          <Button asChild>
            <Link href={`/hackathons/${hackathonId}/find-team`}>
              Find a Team
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden team-interface">
        <div className="flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-800 px-10 py-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 text-[var(--text-primary)]">
                <div className="size-6 text-[var(--primary-color)]">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold tracking-tight">InnovateHub</h2>
              </div>
              <nav className="flex items-center gap-9">
                <Link href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Dashboard</Link>
                <Link href="#" className="text-sm font-medium text-[var(--text-primary)]">Teams</Link>
                <Link href="/hackathons" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Events</Link>
                <Link href="#" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Leaderboard</Link>
              </nav>
            </div>
            <div className="flex flex-1 justify-end gap-6 items-center">
              <label className="relative flex items-center h-10 max-w-64">
                <div className="absolute left-3 text-[var(--text-secondary)]">
                  <Search className="h-5 w-5" />
                </div>
                <input className="input w-full pl-10 pr-4" placeholder="Search" value="" />
              </label>
              <button className="flex items-center justify-center rounded-full size-10 bg-[var(--card-background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <Bell className="h-5 w-5" />
              </button>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB8Omil4JR3-avFJyxqAzOz4QnDJfV2g8lzBbwXZu6XslT4K1HBH2vEgTpqNzLd6AhP_4UNtBenfPD-pW2YEraXiLGdwvX48A_tDEkP5bqubIY4iV19HXdDkinyKK6tbWRXHrBY6xwR3uYIn1hlCiT5b3soW6ylsUvM-sA0peYP4OAaiBsT_cTfBEnzL-nw9qA7P0DqQyUwLbHvR4JFTzFaSB9NTFxDDef5xqb6xXiTEPtW2i_gz5iscHRg-82fvppOlyz7rJoAQzUI")'}}></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="main_container grid grid-cols-12 gap-8 items-start">
            {/* Team Info Card */}
            <div className="col-span-8">
              <div className="card relative overflow-hidden">
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex-shrink-0 size-24 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Users className="text-[var(--primary-color)] w-12 h-12" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{team.name}</h1>
                    <p className="typography_body">{team.description || "Building amazing solutions together."}</p>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Team Members</h2>
                  <div className="flex items-center gap-6">
                    {team.members.map((member, index) => (
                      <div key={member.id} className="text-center">
                        <img 
                          alt={member.name} 
                          className={`size-16 rounded-full mx-auto mb-2 ${member.id === team.leader_id ? 'border-2 border-[var(--accent-color)]' : ''}`}
                          src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                        />
                        <p className="font-semibold text-sm text-white">{member.name}</p>
                        <p className={`text-xs ${member.id === team.leader_id ? 'text-[var(--accent-color)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                          {member.id === team.leader_id ? 'Leader' : member.role || 'Member'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite Button */}
                {isLeader && (
                  <button 
                    onClick={() => setIsInviteDialogOpen(true)}
                    className="absolute bottom-6 right-6 flex items-center justify-center size-14 rounded-2xl bg-[var(--fab-background)] text-[var(--fab-text)] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Team Chat */}
            <div className="col-span-4">
              <div className="card h-[calc(100vh-10rem)] flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">Team Chat</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-700 text-[var(--text-secondary)]">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-700 text-[var(--text-secondary)]">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 items-end ${message.isSelf ? 'flex-row-reverse max-w-[85%] ml-auto' : 'max-w-[85%]'}`}>
                      <img 
                        alt={message.sender_name} 
                        className="size-6 rounded-full" 
                        src={message.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender_name)}&background=random`}
                      />
                      <div className={`p-3 rounded-2xl ${message.isSelf ? 'rounded-br-none bg-[var(--chat-bubble-self)]' : 'rounded-bl-none bg-[var(--chat-bubble-other)]'}`}>
                        <p className={`text-sm ${message.isSelf ? 'text-[var(--chat-text-self)]' : 'text-[var(--chat-text-other)]'}`}>
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="pt-4 mt-auto border-t border-gray-700">
                  <div className="relative">
                    <textarea 
                      className="input w-full pr-12 resize-none" 
                      placeholder="Type a message..." 
                      rows={1}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--primary-color)] text-white hover:bg-[var(--accent-color)] disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Browse participants who are looking for a team and send them an invitation.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or skill..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {soloParticipants
              .filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map(participant => (
                <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{participant.name}</h4>
                      {participant.skills && participant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {participant.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleInviteParticipant(participant.id)}
                    disabled={invitedParticipants.includes(participant.id)}
                  >
                    {invitedParticipants.includes(participant.id) ? (
                      <> <Check className="mr-2 h-4 w-4" /> Invited</>
                    ) : (
                      <> <Mail className="mr-2 h-4 w-4"/> Send Invitation</>
                    )}
                  </Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update your team information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your team's focus or goals..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDescription} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
