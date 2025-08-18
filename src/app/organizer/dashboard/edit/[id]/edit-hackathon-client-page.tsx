
"use client";

import { useState } from "react";
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
      
      <Tabs defaultValue="basic-info">
        <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="judging">Judging Panel</TabsTrigger>
            <TabsTrigger value="participants" disabled>Participants</TabsTrigger>
            <TabsTrigger value="submissions" disabled>Submissions</TabsTrigger>
            <TabsTrigger value="results" disabled>Results</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
            <BasicInfoTab hackathon={hackathon} />
        </TabsContent>
        <TabsContent value="judging">
            <JudgingPanelTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
