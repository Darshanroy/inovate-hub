
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Criterion = {
  id: number;
  name: string;
  weight: number;
  maxScore: number;
};

type Judge = {
  id: number;
  name: string;
  email: string;
  status: "Accepted" | "Invited";
};

export function JudgingPanelTab() {
    const { toast } = useToast();
    const [criteria, setCriteria] = useState<Criterion[]>([
        { id: 1, name: "Innovation & Creativity", weight: 2, maxScore: 10 },
        { id: 2, name: "Technical Feasibility", weight: 2, maxScore: 10 },
        { id: 3, name: "Impact & Potential", weight: 3, maxScore: 10 },
        { id: 4, name: "Presentation & Demo", weight: 1, maxScore: 5 },
    ]);
    const [judges, setJudges] = useState<Judge[]>([
        { id: 1, name: "Alice Expert", email: "alice@example.com", status: "Accepted" },
        { id: 2, name: "Bob Mentor", email: "bob@example.com", status: "Invited" },
    ]);

    const [newCriterionName, setNewCriterionName] = useState("");
    const [newCriterionWeight, setNewCriterionWeight] = useState(1);
    const [newCriterionMaxScore, setNewCriterionMaxScore] = useState(10);
    const [newJudgeEmail, setNewJudgeEmail] = useState("");

    const handleAddCriterion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCriterionName) return;
        const newCriterion: Criterion = {
            id: criteria.length + 1,
            name: newCriterionName,
            weight: newCriterionWeight,
            maxScore: newCriterionMaxScore,
        };
        setCriteria([...criteria, newCriterion]);
        setNewCriterionName("");
        setNewCriterionWeight(1);
        setNewCriterionMaxScore(10);
        toast({ title: "Criterion Added", description: `"${newCriterionName}" has been added to the criteria.` });
    };

    const handleInviteJudge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJudgeEmail) return;

        const newJudge: Judge = {
            id: judges.length + 1,
            name: "New Judge", // This would be fetched from user data in a real app
            email: newJudgeEmail,
            status: "Invited",
        };
        setJudges([...judges, newJudge]);
        setNewJudgeEmail("");
        toast({ title: "Invitation Sent", description: `An invitation has been sent to ${newJudgeEmail}.` });
    };

  return (
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
             <Card>
                 <CardHeader>
                    <CardTitle>Judging Criteria</CardTitle>
                    <CardDescription>Define the criteria judges will use to score submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-[80px] text-center">Weight</TableHead>
                                <TableHead className="w-[100px] text-center">Max Score</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criteria.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-center">{c.weight}</TableCell>
                                    <TableCell className="text-center">{c.maxScore}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="bg-muted/50 p-6 border-t">
                    <form onSubmit={handleAddCriterion} className="w-full">
                        <h4 className="text-sm font-semibold mb-4">Add New Criterion</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="criterion-name">Name</Label>
                                <Input id="criterion-name" value={newCriterionName} onChange={e => setNewCriterionName(e.target.value)} placeholder="e.g. User Experience" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="criterion-weight">Weight</Label>
                                <Input id="criterion-weight" type="number" value={newCriterionWeight} onChange={e => setNewCriterionWeight(Number(e.target.value))} min={1} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="criterion-max-score">Max Score</Label>
                                <Input id="criterion-max-score" type="number" value={newCriterionMaxScore} onChange={e => setNewCriterionMaxScore(Number(e.target.value))} min={1} required/>
                            </div>
                        </div>
                         <Button type="submit" className="mt-4">Add Criterion</Button>
                    </form>
                 </CardFooter>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Invite Judges</CardTitle>
                    <CardDescription>Invite judges to your panel by email.</CardDescription>
                </CardHeader>
                 <form onSubmit={handleInviteJudge}>
                    <CardContent className="space-y-2">
                        <Label htmlFor="judge-email">Judge's Email</Label>
                        <Input id="judge-email" type="email" placeholder="judge@example.com" value={newJudgeEmail} onChange={e => setNewJudgeEmail(e.target.value)} required/>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Send Invitation</Button>
                    </CardFooter>
                 </form>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Current Panel</CardTitle>
                    <CardDescription>
                        {judges.length} {judges.length === 1 ? 'judge' : 'judges'} have been invited.
                    </CardDescription>
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
  )
}
