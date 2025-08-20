
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { getCookie } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type Submission = {
  id: string;
  team_name: string;
  project_title: string;
  status: string;
  submitted_at: string;
}

export function SubmissionsTab({ hackathonId }: { hackathonId: string }) {
  const [subs, setSubs] = useState<Submission[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const token = getCookie('authToken');
        if (!token) return;
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${base}/hackathons/submissions/list/${hackathonId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        if (!res.ok) throw new Error('Failed to load submissions');
        const data = await res.json();
        setSubs((data.submissions || []).map((s: any) => ({
          id: s.id,
          team_name: s.team_name,
          project_title: s.project_title,
          status: s.status,
          submitted_at: s.submitted_at,
        })));
      } catch (e: any) {
        toast({ title: 'Failed to load submissions', description: e.message || String(e) });
      }
    })();
  }, [hackathonId, toast]);

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
            {subs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No submissions yet.</TableCell>
              </TableRow>
            ) : (
              subs.map(sub => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.project_title}</TableCell>
                  <TableCell>{sub.team_name}</TableCell>
                  <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={sub.status === 'draft' ? 'secondary' : 'default'} className="capitalize">{sub.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/hackathons/${hackathonId}/submission/view/${sub.id}`}>
                        <Eye className="mr-2 h-4 w-4"/>
                        View Submission
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
