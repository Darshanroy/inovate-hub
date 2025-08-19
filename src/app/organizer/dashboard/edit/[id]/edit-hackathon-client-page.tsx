
"use client";

import type { Hackathon } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./_components/basic-info-tab";
import { JudgingPanelTab } from "./_components/judging-panel-tab";
import { ResultsTab } from "./_components/results-tab";
import { ParticipantsTab } from "./_components/participants-tab";
import { SubmissionsTab } from "./_components/submissions-tab";


export default function EditHackathonClientPage({ hackathon }: { hackathon: Hackathon }) {

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage "{hackathon.name}"</h1>
        <p className="text-muted-foreground">Update event details, manage participants, and more.</p>
      </div>
      
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="judging">Judging Panel</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
            <BasicInfoTab hackathon={hackathon} />
        </TabsContent>
         <TabsContent value="participants">
            <ParticipantsTab />
        </TabsContent>
         <TabsContent value="submissions">
            <SubmissionsTab />
        </TabsContent>
        <TabsContent value="judging">
            <JudgingPanelTab />
        </TabsContent>
         <TabsContent value="results">
            <ResultsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
