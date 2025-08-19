
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react";
import type { Round } from "@/lib/data";
import { apiService } from "@/lib/api";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function CreateHackathonPage() {
  const [locationType, setLocationType] = useState<string | undefined>();
  const [rounds, setRounds] = useState<Partial<Round>[]>([{}]);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tracks, setTracks] = useState("");
  const [rules, setRules] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [prize, setPrize] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [prizesDetail, setPrizesDetail] = useState("");
  const [sponsors, setSponsors] = useState("");
  const [faq, setFaq] = useState("");

  const handleAddRound = () => {
    setRounds([...rounds, {}]);
  }
  
  const handleRemoveRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  }
  
  const handleRoundChange = (index: number, field: keyof Round, value: string) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  }

  const handlePublish = async () => {
    const token = getCookie('authToken');
    if (!token) { toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' }); return; }
    try {
      const payload = {
        name,
        description,
        theme: "General",
        locationType: locationType || 'online',
        location: locationType === 'offline' ? location : undefined,
        date,
        rounds: rounds.filter(r => r.name && r.date).map(r => ({ name: r.name!, date: r.date!, description: r.description || '' })),
        prize: Number(prize || 0),
        image: image || undefined,
        hint: 'hackathon banner',
        tracks: tracks ? tracks.split(',').map(t => t.trim()).filter(Boolean) : [],
        rules,
        prizes: prizesDetail,
        sponsors: sponsors ? sponsors.split(',').map(s => s.trim()).filter(Boolean) : [],
        faq: faq ? faq.split('\n').map(q => q.trim()).filter(Boolean) : [],
        team_size: Number(teamSize || 0),
      };
      await apiService.createHackathon(token, payload);
      toast({ title: 'Success', description: 'Hackathon published.' });
      setName(""); setDescription(""); setLocation(""); setTracks(""); setRules(""); setTeamSize(""); setPrize(""); setDate(""); setImage(""); setLocationType(undefined); setRounds([{}]); setPrizesDetail(""); setSponsors(""); setFaq("");
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to publish hackathon.' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Create a New Hackathon</h1>
      <p className="text-muted-foreground mb-8">Fill in the details below to launch your next event.</p>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Give your hackathon a name and a brief description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hackathon Name</Label>
              <Input id="name" placeholder="e.g. AI for Good Challenge" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the main goals and theme of your hackathon." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location-type">Location Type</Label>
                    <Select onValueChange={setLocationType}>
                        <SelectTrigger id="location-type">
                            <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {locationType === 'offline' && (
                  <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="e.g. San Francisco, CA" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date</Label>
                  <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize Pool (USD)</Label>
                  <Input id="prize" type="number" placeholder="e.g. 10000" value={prize} onChange={e => setPrize(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Banner Image URL</Label>
                  <Input id="image" placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-size">Team Size Limit</Label>
                  <Input id="team-size" type="number" placeholder="e.g. 4" value={teamSize} onChange={e => setTeamSize(e.target.value)} />
                </div>
             </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Rounds & Timeline</CardTitle>
                <CardDescription>Define the structure of your event. Single-round hackathons have just one date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {rounds.map((round, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                        <Label className="font-semibold">Round {index + 1}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor={`round-name-${index}`}>Round Name</Label>
                                <Input id={`round-name-${index}`} placeholder="e.g., Final Presentations" value={round.name || ''} onChange={e => handleRoundChange(index, 'name', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`round-date-${index}`}>Date</Label>
                                <Input id={`round-date-${index}`} type="date" value={round.date || ''} onChange={e => handleRoundChange(index, 'date', e.target.value)}/>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`round-desc-${index}`}>Description</Label>
                            <Textarea id={`round-desc-${index}`} placeholder="Describe this round" value={round.description || ''} onChange={e => handleRoundChange(index, 'description', e.target.value)} />
                        </div>
                        {rounds.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveRound(index)}>
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddRound}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Round
                </Button>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules & Guidelines</CardTitle>
            <CardDescription>Set the rules and team size limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <Textarea id="rules" placeholder="Detail the rules of participation, submission guidelines, etc." rows={6} value={rules} onChange={e => setRules(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracks & Categories</CardTitle>
            <CardDescription>Define the different tracks or categories for submissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="tracks">Tracks</Label>
              <Input id="tracks" placeholder="e.g. Healthcare, FinTech, Sustainability (comma-separated)" value={tracks} onChange={e => setTracks(e.target.value)} />
              <p className="text-xs text-muted-foreground">Separate multiple tracks with a comma.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prizes & Rewards</CardTitle>
            <CardDescription>Showcase the exciting prizes for winners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prizes">Prizes Description</Label>
              <Textarea id="prizes" placeholder="Describe the prize structure, e.g., 1st Place: $10,000, 2nd Place: $5,000" rows={4} value={prizesDetail} onChange={e => setPrizesDetail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sponsors">Sponsors (comma-separated)</Label>
              <Input id="sponsors" placeholder="Acme Corp, Globex, Initech" value={sponsors} onChange={e => setSponsors(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq">FAQ (one question per line)</Label>
              <Textarea id="faq" placeholder={"What is the team size?\nHow do I submit?"} rows={4} value={faq} onChange={e => setFaq(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-2">
            <Button variant="ghost">Save Draft</Button>
            <Button onClick={handlePublish}>Publish Hackathon</Button>
        </div>
      </div>
    </div>
  )
}
