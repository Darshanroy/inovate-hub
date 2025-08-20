"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRightCircle, Save, Eye, EyeOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BasicInfoTab } from "./_components/basic-info-tab";
import { ParticipantsTab } from "./_components/participants-tab";
import { JudgingPanelTab } from "./_components/judging-panel-tab";
import { ResultsTab } from "./_components/results-tab";
import { SubmissionsTab } from "./_components/submissions-tab";

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  date: string;
  rounds?: Array<{ name: string; date: string; description: string }>;
  prize: number;
  locationType: 'online' | 'offline';
  location?: string;
  image: string;
  hint: string;
  description: string;
  tracks: string[];
  rules: string;
  prizes: string;
  sponsors: any[];
  faq: any[];
  team_size: number;
  registration_count: number;
  team_count: number;
  created_at: string;
  status?: 'draft' | 'published';
}

export default function EditHackathonPage() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;

  useEffect(() => {
    loadHackathon();
  }, [hackathonId]);

  const loadHackathon = async () => {
    try {
      setLoading(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to edit hackathons.' });
        return;
      }

      // Load organizer's hackathons to find this specific one
      const organizerHackathonsRes = await apiService.getOrganizerHackathons(token);
      const hackathonData = organizerHackathonsRes.hackathons.find(h => h.id === hackathonId);
      
      if (!hackathonData) {
        toast({ title: 'Hackathon not found', description: 'This hackathon does not exist or you do not have permission to edit it.' });
        router.push('/organizer/dashboard');
        return;
      }

      // Load full hackathon details
      const fullHackathonRes = await apiService.getHackathon(hackathonId);
      setHackathon({
        ...hackathonData,
        ...fullHackathonRes
      });
    } catch (error: any) {
      console.error('Failed to load hackathon:', error);
      toast({ title: 'Error', description: error.message || 'Failed to load hackathon' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Hackathon>) => {
    try {
      setSaving(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to save changes.' });
        return;
      }

      // This would be a real API call to update the hackathon
      // For now, we'll just update the local state
      setHackathon(prev => prev ? { ...prev, ...data } : null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ title: 'Hackathon updated', description: 'Your changes have been saved successfully.' });
    } catch (error: any) {
      console.error('Failed to save hackathon:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save hackathon' });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async (data: Partial<Hackathon>) => {
    try {
      setSavingDraft(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to save draft.' });
        return;
      }

      // This would be a real API call to save as draft
      // For now, we'll just update the local state
      setHackathon(prev => prev ? { ...prev, ...data, status: 'draft' } : null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ title: 'Draft saved', description: 'Your draft has been saved successfully.' });
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save draft' });
      throw error;
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async (data: Partial<Hackathon>) => {
    try {
      setPublishing(true);
      const token = getCookie('authToken');
      if (!token) {
        toast({ title: 'Please log in', description: 'You need to be logged in to publish hackathon.' });
        return;
      }

      // This would be a real API call to publish the hackathon
      // For now, we'll just update the local state
      setHackathon(prev => prev ? { ...prev, ...data, status: 'published' } : null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ title: 'Hackathon published', description: 'Your hackathon has been published successfully!' });
    } catch (error: any) {
      console.error('Failed to publish hackathon:', error);
      toast({ title: 'Error', description: error.message || 'Failed to publish hackathon' });
      throw error;
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Hackathon not found</h3>
          <p className="text-muted-foreground mb-4">The hackathon you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/organizer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <Button variant="ghost" size="sm" onClick={() => router.forward()}>
          <ArrowRightCircle className="mr-2 h-4 w-4" />
          Forward
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edit {hackathon.name}</h1>
          <p className="text-muted-foreground mt-2">Update your hackathon information and settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/organizer/dashboard/view/${hackathon.id}`)}>
            View Stats
          </Button>
          <Button variant="outline" onClick={() => router.push(`/organizer/dashboard/manage/${hackathon.id}`)}>
            Manage Event
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
        <span className="text-sm font-medium">Status:</span>
        <Badge variant={hackathon.status === 'published' ? 'default' : 'secondary'}>
          {hackathon.status === 'published' ? (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Published
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Draft
            </>
          )}
        </Badge>
        {hackathon.status === 'published' && (
          <span className="text-sm text-muted-foreground ml-2">
            This hackathon is live and visible to participants
          </span>
        )}
      </div>

      {/* Edit Tabs */}
      <Tabs defaultValue="basic-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="judging">Judging</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-4">
          <BasicInfoTab 
            hackathon={hackathon}
            onSave={handleSave}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantsTab hackathon={hackathon} />
        </TabsContent>

        <TabsContent value="judging" className="space-y-4">
          <JudgingPanelTab hackathon={hackathon} />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <SubmissionsTab hackathon={hackathon} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsTab hackathon={hackathon} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
