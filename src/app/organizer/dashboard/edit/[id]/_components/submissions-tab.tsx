
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

// Mock data, in a real app this would be fetched
const submissions = [
    {
        projectTitle: "EcoSort AI",
        teamName: "AI Avengers",
        date: "2024-08-17",
        status: "Reviewed"
    },
    {
        projectTitle: "FinPredict",
        teamName: "Data Dynamos",
        date: "2024-08-17",
        status: "Submitted"
    },
    {
        projectTitle: "HealthTrack",
        teamName: "Code Crusaders",
        date: "2024-08-16",
        status: "Submitted"
    },
    {
        projectTitle: "Intelligent Code Assistant",
        teamName: "Team QuantumLeap AI",
        date: "2024-08-16",
        status: "Draft"
    }
]

export function SubmissionsTab() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Review and manage all project submissions for this event.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions.map(sub => (
                        <TableRow key={sub.projectTitle}>
                            <TableCell className="font-medium">{sub.projectTitle}</TableCell>
                            <TableCell>{sub.teamName}</TableCell>
                            <TableCell>{sub.date}</TableCell>
                            <TableCell><Badge variant={sub.status === 'Draft' ? 'secondary' : 'default'}>{sub.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                    <Eye className="mr-2 h-4 w-4"/>
                                    View Submission
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  )
}
