import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const participants = [
  { id: 1, name: "Alice Johnson", team: "AI Avengers", status: "Approved" },
  { id: 2, name: "Bob Williams", team: "AI Avengers", status: "Approved" },
  { id: 3, name: "Charlie Brown", team: "Code Crusaders", status: "Pending" },
  { id: 4, name: "Diana Miller", team: "Data Dynamos", status: "Approved" },
]

export default function ParticipantsPage() {
  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Participants</h1>
        <div className="flex items-center space-x-2">
            <Switch id="auto-approve" />
            <Label htmlFor="auto-approve">Auto-approve new participants</Label>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">
        View and manage all participants for your current hackathon.
      </p>

      <Card>
        <CardHeader>
            <CardTitle>Participant List</CardTitle>
            <CardDescription>A list of all registered participants.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {participants.map(p => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>{p.team}</TableCell>
                            <TableCell>
                                <Badge variant={p.status === "Approved" ? "default" : "secondary"}>{p.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {p.status === "Pending" && <Button size="sm" className="mr-2">Approve</Button>}
                                <Button variant="destructive" size="sm">Remove</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
