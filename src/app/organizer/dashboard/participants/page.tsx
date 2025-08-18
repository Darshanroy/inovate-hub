"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const participantsData = [
  { id: 1, name: "Alice Johnson", email: "alice.j@example.com", team: "AI Avengers", status: "Approved" },
  { id: 2, name: "Bob Williams", email: "bob.w@example.com", team: "AI Avengers", status: "Approved" },
  { id: 3, name: "Charlie Brown", email: "charlie.b@example.com", team: "Code Crusaders", status: "Pending" },
  { id: 4, name: "Diana Miller", email: "diana.m@example.com", team: "Data Dynamos", status: "Approved" },
]

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredParticipants = participantsData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="mb-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by name or email..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredParticipants.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-sm text-muted-foreground">{p.email}</div>
                            </TableCell>
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
