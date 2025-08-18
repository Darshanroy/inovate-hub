
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateHackathonPage() {
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
              <Input id="name" placeholder="e.g. AI for Good Challenge" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the main goals and theme of your hackathon." />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location-type">Location Type</Label>
                    <Select>
                        <SelectTrigger id="location-type">
                            <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. San Francisco, CA" />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rules & Guidelines</CardTitle>
            <CardDescription>Set the rules and team size limits.</CardDescription>
          </Header>
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
            <CardDescription>Define the different tracks or categories for submissions.</CardDescription>
          </Header>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="tracks">Tracks</Label>
              <Input id="tracks" placeholder="e.g. Healthcare, FinTech, Sustainability (comma-separated)" />
              <p className="text-xs text-muted-foreground">Separate multiple tracks with a comma.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Prizes & Rewards</CardTitle>
            <CardDescription>Showcase the exciting prizes for winners.</CardDescription>
          </Header>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prizes">Prizes Description</Label>
              <Textarea id="prizes" placeholder="Describe the prize structure, e.g., 1st Place: $10,000, 2nd Place: $5,000" rows={4}/>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button variant="ghost">Save Draft</Button>
            <Button>Publish Hackathon</Button>
        </div>
      </div>
    </div>
  )
}
