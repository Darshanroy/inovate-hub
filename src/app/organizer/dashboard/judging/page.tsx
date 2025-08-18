import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const judges = [
    { name: "Alice Expert", email: "alice@example.com", status: "Accepted" },
    { name: "Bob Mentor", email: "bob@example.com", status: "Invited" },
]

export default function JudgingPanelPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Judging Panel Setup</h1>
       <p className="text-muted-foreground mb-8">
        Define your judging criteria and manage your panel of judges.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
             <CardHeader>
                <CardTitle>Judging Criteria</CardTitle>
                <CardDescription>Define the criteria judges will use to score submissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="innovation">Innovation & Creativity (1-10)</Label>
                    <Textarea id="innovation" placeholder="Description of what to look for in terms of innovation." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="feasibility">Technical Feasibility (1-10)</Label>
                    <Textarea id="feasibility" placeholder="Description of what to look for in terms of feasibility." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="impact">Impact & Potential (1-10)</Label>
                    <Textarea id="impact" placeholder="Description of what to look for in terms of impact." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="presentation">Presentation & Demo (1-5)</Label>
                    <Textarea id="presentation" placeholder="Description of what to look for in the presentation." />
                </div>
            </CardContent>
            <CardFooter>
                <Button>Save Criteria</Button>
            </CardFooter>
        </Card>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Invite Judges</CardTitle>
                    <CardDescription>Invite judges to your panel by email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="judge-email">Judge's Email</Label>
                        <Input id="judge-email" type="email" placeholder="judge@example.com" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Send Invitation</Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Current Panel</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                        {judges.map(judge => (
                            <div key={judge.email} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{judge.name}</p>
                                    <p className="text-sm text-muted-foreground">{judge.email}</p>
                                </div>
                                <Badge variant={judge.status === "Accepted" ? "default" : "secondary"}>{judge.status}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
