"use server";

import { teammateMatch, TeammateMatchInput } from "@/ai/flows/teammate-matching";
import { z } from "zod";

const findTeammatesFormSchema = z.object({
  skills: z.string().min(1, "Please enter at least one skill."),
  interests: z.string().min(1, "Please enter at least one interest."),
  category: z.string().min(1, "Please select a category."),
});

type FindTeammatesFormValues = z.infer<typeof findTeammatesFormSchema>;

export async function findTeammates(values: FindTeammatesFormValues) {
  const validatedFields = findTeammatesFormSchema.safeParse(values);

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


const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  tagline: z.string().min(1, "Tagline is required."),
  location: z.string().min(1, "Location is required."),
  bio: z.string().min(1, "Bio is required."),
  skills: z.string().min(1, "Please enter at least one skill."),
  linkedin: z.string().url("Please enter a valid LinkedIn URL."),
  github: z.string().url("Please enter a valid GitHub URL."),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export async function updateProfile(values: ProfileFormValues) {
  const validatedFields = profileFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }

  // In a real application, you would save this data to a database.
  // For now, we'll just log it to the console.
  console.log("Profile updated:", validatedFields.data);

  return { success: "Profile updated successfully!" };
}
