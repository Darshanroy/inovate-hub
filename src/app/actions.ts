"use server";

import { teammateMatch, TeammateMatchInput } from "@/ai/flows/teammate-matching";
import { z } from "zod";

const formSchema = z.object({
  skills: z.string().min(1, "Please enter at least one skill."),
  interests: z.string().min(1, "Please enter at least one interest."),
  category: z.string().min(1, "Please select a category."),
});

type FormValues = z.infer<typeof formSchema>;

export async function findTeammates(values: FormValues) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }
  
  const { skills, interests, category } = validatedFields.data;
  
  const input: TeammateMatchInput = {
    userSkills: skills.split(",").map(s => s.trim()).filter(Boolean),
    userInterests: interests.split(",").map(i => i.trim()).filter(Boolean),
    hackathonCategory: category,
  };

  try {
    const result = await teammateMatch(input);
    return { data: result };
  } catch (error) {
    console.error("Error in teammateMatch flow:", error);
    return { error: "An error occurred while matching teammates." };
  }
}
