"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { apiService, Team, TeamRequest } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
}

interface TeamMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
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
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadTeamData();
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
        setMessages(messagesRes.messages || []);
      } catch (error) {
        console.error('Failed to load team messages:', error);
      }

    } catch (error: any) {
      console.error('Failed to load team data:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load team data' });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    // This should get the current user ID from auth context
    // For now, we'll use a placeholder - in a real app, this would come from auth context
    return "current-user-id";
  };

  const handleRespondToRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const token = getCookie('authToken');
      if (!token) return;

      await apiService.respondToTeamRequest(token, requestId, action);
      
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({ 
        title: `Request ${action === 'approve' ? 'approved' : 'rejected'}`, 
        description: `The join request has been ${action === 'approve' ? 'approved' : 'rejected'}.` 
      });

      // Reload team data to show updated member list
      await loadTeamData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to respond to request' });
    }
  };

  const handleUpdateTeamDescription = async () => {
    try {
      setSubmitting(true);
      const token = getCookie('authToken');
      if (!token) return;

      await apiService.updateTeam(token, hackathonId, { description: editDescription });
      setTeam(prev => prev ? { ...prev, description: editDescription } : null);
      setIsEditDialogOpen(false);
      
      toast({ title: 'Team updated', description: 'Team description has been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update team' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const token = getCookie('authToken');
      if (!token) return;

      const res = await apiService.sendTeamMessage(token, hackathonId, newMessage.trim());
      
      // Add the new message to the local state
      const message: TeamMessage = {
        id: res.id,
        sender_id: getCurrentUserId(),
        sender_name: team?.members.find(m => m.id === getCurrentUserId())?.name || 'You',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [message, ...prev]);
      setNewMessage("");
      
      toast({ title: 'Message sent', description: 'Your message has been sent to the team.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send message' });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      const token = getCookie('authToken');
      if (!token) return;

      await apiService.removeTeamMember(token, hackathonId, memberId);
      
      // Update local team state
      setTeam(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      } : null);
      
      toast({ title: 'Member removed', description: `${memberName} has been removed from the team.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to remove member' });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your team...</p>
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
          <Button onClick={() => router.push(`/hackathons/${hackathonId}/find-team`)}>
            Find a Team
          </Button>
        </div>
      </div>
    );
  }

  const isLeader = team.leader_id === getCurrentUserId();

  return (
    <div className="container mx-auto max-w-6xl flex-1 px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground">Team Code: {team.code}</p>
          </div>
          {isLeader && (
            <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Team
            </Button>
          )}
        </div>
        
        {team.description && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-muted-foreground">{team.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members ({team.members.length}/{team.max_members})</TabsTrigger>
          {isLeader && <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>}
          <TabsTrigger value="chat">Team Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          {member.id === team.leader_id && (
                            <Badge variant="secondary">
                              <Crown className="mr-1 h-3 w-3" />
                              Leader
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-3 w-3" />
                        Message
                      </Button>
                      {isLeader && member.id !== team.leader_id && (
                        <Button variant="outline" size="sm" onClick={() => handleRemoveMember(member.id, member.name)}>
                          <Trash2 className="mr-2 h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isLeader && (
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>Review and respond to team join requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">All join requests have been handled.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>{getInitials(request.user_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.user_name}</h3>
                            <p className="text-sm text-muted-foreground">{request.user_email}</p>
                            {request.message && (
                              <p className="text-sm text-muted-foreground mt-1">
                                "{request.message}"
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleRespondToRequest(request.id, 'approve')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-2 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRespondToRequest(request.id, 'reject')}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="mr-2 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>Communicate with your team members.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                  {messages.map(message => (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.sender_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={sendingMessage || !newMessage.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>Manage your team configuration and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Team Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Name:</span>
                      <span>{team.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Code:</span>
                      <span className="font-mono">{team.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members:</span>
                      <span>{team.members.length} / {team.max_members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(team.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {isLeader && (
                  <div>
                    <h3 className="font-semibold mb-2">Team Management</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite New Member
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team Description
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Team
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update your team's description and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Team Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your team's focus or goals..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTeamDescription} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
