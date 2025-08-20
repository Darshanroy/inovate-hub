
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Round {
  name: string;
  date: string;
  description: string;
}

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  date: string;
  rounds?: Round[];
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
  status?: 'draft' | 'published';
}

interface BasicInfoTabProps {
  hackathon: Hackathon;
  onSave: (data: Partial<Hackathon>) => Promise<void>;
  onSaveDraft: (data: Partial<Hackathon>) => Promise<void>;
  onPublish: (data: Partial<Hackathon>) => Promise<void>;
}

export function BasicInfoTab({ hackathon, onSave, onSaveDraft, onPublish }: BasicInfoTabProps) {
  const [formData, setFormData] = useState<Partial<Hackathon>>({
    name: hackathon.name,
    description: hackathon.description,
    theme: hackathon.theme,
    locationType: hackathon.locationType,
    location: hackathon.location,
    date: hackathon.date,
    prize: hackathon.prize,
    team_size: hackathon.team_size,
    status: hackathon.status || 'draft'
  });
  const [rounds, setRounds] = useState<Round[]>(hackathon.rounds || []);
  const [isPublished, setIsPublished] = useState(hackathon.status === 'published');
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: hackathon.name,
      description: hackathon.description,
      theme: hackathon.theme,
      locationType: hackathon.locationType,
      location: hackathon.location,
      date: hackathon.date,
      prize: hackathon.prize,
      team_size: hackathon.team_size,
      status: hackathon.status || 'draft'
    });
    setRounds(hackathon.rounds || []);
    setIsPublished(hackathon.status === 'published');
  }, [hackathon]);

  const handleFormChange = (field: keyof Hackathon, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRound = () => {
    setRounds([...rounds, { name: '', date: '', description: '' }]);
  };
  
  const handleRemoveRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };
  
  const handleRoundChange = (index: number, field: keyof Round, value: string) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        rounds
      };
      await onSave(dataToSave);
      toast({ title: 'Saved', description: 'Hackathon information has been saved successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save hackathon' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const dataToSave = {
        ...formData,
        rounds,
        status: 'draft'
      };
      await onSaveDraft(dataToSave);
      toast({ title: 'Draft Saved', description: 'Draft has been saved successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save draft' });
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const dataToSave = {
        ...formData,
        rounds,
        status: 'published'
      };
      await onPublish(dataToSave);
      setIsPublished(true);
      toast({ title: 'Published', description: 'Hackathon has been published successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to publish hackathon' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? (
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
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveDraft}
            disabled={savingDraft}
          >
            <Save className="w-4 h-4 mr-2" />
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {!isPublished && (
            <Button 
              size="sm" 
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your hackathon's name and description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hackathon Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. AI for Good Challenge" 
              value={formData.name || ''} 
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Input 
              id="theme" 
              placeholder="e.g. Artificial Intelligence for Social Impact" 
              value={formData.theme || ''} 
              onChange={(e) => handleFormChange('theme', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the main goals and theme of your hackathon." 
              value={formData.description || ''} 
              onChange={(e) => handleFormChange('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location-type">Location Type</Label>
              <Select 
                value={formData.locationType} 
                onValueChange={(value) => handleFormChange('locationType', value)}
              >
                <SelectTrigger id="location-type">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.locationType === 'offline' && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. San Francisco, CA" 
                  value={formData.location || ''} 
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} 
                onChange={(e) => handleFormChange('date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize">Prize Pool ($)</Label>
              <Input 
                id="prize" 
                type="number" 
                placeholder="10000" 
                value={formData.prize || ''} 
                onChange={(e) => handleFormChange('prize', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-size">Maximum Team Size</Label>
            <Input 
              id="team-size" 
              type="number" 
              placeholder="4" 
              value={formData.team_size || ''} 
              onChange={(e) => handleFormChange('team_size', parseInt(e.target.value) || 1)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Rounds & Timeline</CardTitle>
          <CardDescription>Define the structure of your event. Add or remove rounds as needed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rounds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No rounds defined yet.</p>
              <Button onClick={handleAddRound}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add First Round
              </Button>
            </div>
          ) : (
            rounds.map((round, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                <Label className="font-semibold">Round {index + 1}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`round-name-${index}`}>Round Name</Label>
                    <Input 
                      id={`round-name-${index}`} 
                      placeholder="e.g., Final Presentations" 
                      value={round.name} 
                      onChange={e => handleRoundChange(index, 'name', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`round-date-${index}`}>Date</Label>
                    <Input 
                      id={`round-date-${index}`} 
                      type="date" 
                      value={round.date ? new Date(round.date).toISOString().split('T')[0] : ''} 
                      onChange={e => handleRoundChange(index, 'date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`round-desc-${index}`}>Description</Label>
                  <Textarea 
                    id={`round-desc-${index}`} 
                    placeholder="Describe this round" 
                    value={round.description} 
                    onChange={e => handleRoundChange(index, 'description', e.target.value)} 
                  />
                </div>
                {rounds.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2" 
                    onClick={() => handleRemoveRound(index)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))
          )}
          {rounds.length > 0 && (
            <Button onClick={handleAddRound} variant="outline">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Another Round
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
