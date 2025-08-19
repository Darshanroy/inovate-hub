
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hackathon, Round } from "@/lib/data";
import { PlusCircle, Trash2 } from "lucide-react";

export function BasicInfoTab({ hackathon }: { hackathon: Hackathon }) {
  const [locationType, setLocationType] = useState<string | undefined>(hackathon.locationType);
  const [rounds, setRounds] = useState<Partial<Round>[]>(hackathon.rounds || [{ name: hackathon.name, date: hackathon.date, description: hackathon.description }]);

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


  return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your hackathon's name and description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hackathon Name</Label>
              <Input id="name" placeholder="e.g. AI for Good Challenge" defaultValue={hackathon.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the main goals and theme of your hackathon." defaultValue={hackathon.description} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location-type">Location Type</Label>
                    <Select onValueChange={setLocationType} defaultValue={hackathon.locationType}>
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
                      <Input id="location" placeholder="e.g. San Francisco, CA" />
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Rounds & Timeline</CardTitle>
                <CardDescription>Define the structure of your event. Add or remove rounds as needed.</CardDescription>
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
                                <Input id={`round-date-${index}`} type="date" value={round.date ? new Date(round.date).toISOString().split('T')[0] : ''} onChange={e => handleRoundChange(index, 'date', e.target.value)}/>
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
            <CardDescription>Update the rules and team size limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <Textarea id="rules" placeholder="Detail the rules of participation, submission guidelines, etc." rows={6}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="team-size">Team Size Limit</Label>
              <Input id="team-size" type="number" placeholder="e.g. 4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracks & Categories</CardTitle>
            <CardDescription>Update the different tracks or categories for submissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="tracks">Tracks</Label>
              <Input id="tracks" placeholder="e.g. Healthcare, FinTech, Sustainability (comma-separated)" defaultValue={hackathon.theme} />
              <p className="text-xs text-muted-foreground">Separate multiple tracks with a comma.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Prizes & Rewards</CardTitle>
            <CardDescription>Update the exciting prizes for winners.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="total-prize">Total Prize Pool ($)</Label>
              <Input id="total-prize" type="number" placeholder="e.g. 20000" defaultValue={hackathon.prize} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizes">Prizes Description</Label>
              <Textarea id="prizes" placeholder="Describe the prize structure, e.g., 1st Place: $10,000, 2nd Place: $5,000" rows={4}/>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
        </div>
      </div>
  )
}
