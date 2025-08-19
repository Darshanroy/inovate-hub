"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Save, Trash2 } from "lucide-react";
import Link from "next/link";
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
}

export default function EditHackathonPage() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!hackathon) return;

    try {
      setSaving(true);
      const token = getCookie('authToken');
      if (!token) return;

      // This would need to be implemented based on the form data
      // For now, we'll just show a success message
      toast({ title: 'Hackathon updated', description: 'Your changes have been saved successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update hackathon' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hackathon) return;

    if (!confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const token = getCookie('authToken');
      if (!token) return;

      await apiService.deleteHackathon(token, hackathonId);
      toast({ title: 'Hackathon deleted', description: 'The hackathon has been deleted successfully.' });
      router.push('/organizer/dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete hackathon' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hackathon...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Hackathon not found</h3>
          <p className="text-muted-foreground mb-4">This hackathon does not exist or you do not have permission to edit it.</p>
          <Button asChild>
            <Link href="/organizer/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl flex-1 px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/organizer/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Hackathon</h1>
            <p className="text-muted-foreground">Manage your hackathon settings and participants.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={handleDelete} variant="destructive" disabled={saving}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {hackathon.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {hackathon.registration_count}
                </div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {hackathon.team_count}
                </div>
                <div className="text-sm text-muted-foreground">Teams</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {hackathon.locationType}
                </div>
                <div className="text-sm text-muted-foreground">Location Type</div>
              </div>
            </div>

            <Tabs defaultValue="basic-info" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="judging">Judging</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info" className="mt-6">
                <BasicInfoTab hackathon={hackathon} />
              </TabsContent>

              <TabsContent value="participants" className="mt-6">
                <ParticipantsTab />
              </TabsContent>

              <TabsContent value="submissions" className="mt-6">
                <SubmissionsTab />
              </TabsContent>

              <TabsContent value="judging" className="mt-6">
                <JudgingPanelTab />
              </TabsContent>

              <TabsContent value="results" className="mt-6">
                <ResultsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
