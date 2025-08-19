
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { findTeammates } from "@/app/actions";
import type { TeammateMatchOutput } from "@/ai/flows/teammate-matching";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wand2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LoadingOverlay } from "../ui/loading-overlay";

const formSchema = z.object({
  skills: z.string().min(2, {
    message: "Please enter at least one skill.",
  }),
  interests: z.string().min(2, {
    message: "Please enter at least one interest.",
  }),
  category: z.string({
    required_error: "Please select a hackathon category.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function TeammateMatcherModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TeammateMatchOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: "",
      interests: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResults(null);
    try {
      const result = await findTeammates(data);
      if (result.data) {
        setResults(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "An unexpected error occurred."
        })
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Error",
          description: "Could not connect to the AI service."
        })
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    form.reset();
    setResults(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" /> Try the AI Matcher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        {loading && <LoadingOverlay message="Our AI is finding your perfect match..." />}
        <DialogHeader>
          <DialogTitle>AI Teammate Matcher</DialogTitle>
          <DialogDescription>
            Enter your skills and interests to find the perfect teammates for your next hackathon project.
          </DialogDescription>
        </DialogHeader>
        
        {!results ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. React, Python, Firebase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Interests</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AI, Web Dev, Sustainability" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hackathon Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AI">AI</SelectItem>
                          <SelectItem value="Sustainability">Sustainability</SelectItem>
                          <SelectItem value="FinTech">FinTech</SelectItem>
                          <SelectItem value="HealthTech">HealthTech</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Matching...
                    </>
                  ) : (
                    "Find Teammates"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-4">Your Top Matches!</h3>
            <ScrollArea className="h-72">
            <div className="space-y-4 pr-6">
              {results.teammateMatches.map((teammate) => (
                <div key={teammate.name} className="p-4 border rounded-lg bg-secondary">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-base">{teammate.name}</h4>
                    <Badge>Match: {Math.round(teammate.matchScore * 100)}%</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teammate.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Interests:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teammate.interests.map(interest => <Badge key={interest} variant="outline">{interest}</Badge>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </ScrollArea>
             <DialogFooter className="mt-4">
                <Button onClick={handleReset}>Find New Matches</Button>
              </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
