
"use client";

import type { Hackathon } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./_components/basic-info-tab";
import { JudgingPanelTab } from "./_components/judging-panel-tab";


export default function EditHackathonClientPage({ hackathon }: { hackathon: Hackathon }) {

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage "{hackathon.name}"</h1>
        <p className="text-muted-foreground">Update event details, manage judges, and more.</p>
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
            <p>Participant management coming soon.</p>
        </TabsContent>
         <TabsContent value="submissions">
            <p>Submission management coming soon.</p>
        </TabsContent>
        <TabsContent value="judging">
            <JudgingPanelTab />
        </TabsContent>
        <TabsContent value="results">
            <p>Results management coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
