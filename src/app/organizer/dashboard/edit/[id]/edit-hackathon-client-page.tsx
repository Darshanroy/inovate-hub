
"use client";

import type { Hackathon } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./_components/basic-info-tab";
import { JudgingPanelTab } from "./_components/judging-panel-tab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlaceholderTab = ({ title }: { title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p>This is a placeholder for the {title} management section. Functionality will be added in a future step.</p>
        </CardContent>
    </Card>
)

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
            <PlaceholderTab title="Participants" />
        </TabsContent>
         <TabsContent value="submissions">
            <PlaceholderTab title="Submissions" />
        </TabsContent>
        <TabsContent value="judging">
            <JudgingPanelTab />
        </TabsContent>
         <TabsContent value="results">
            <PlaceholderTab title="Results" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
