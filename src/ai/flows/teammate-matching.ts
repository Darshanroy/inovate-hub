'use server';

/**
 * @fileOverview An AI-powered teammate matching flow.
 *
 * - teammateMatch - A function that matches users with potential teammates based on their skills and interests.
 * - TeammateMatchInput - The input type for the teammateMatch function.
 * - TeammateMatchOutput - The return type for the teammateMatch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TeammateMatchInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe('A list of the user\'s skills.'),
  userInterests: z
    .array(z.string())
    .describe('A list of the user\'s interests.'),
  hackathonCategory: z
    .string()
    .describe('The category of the hackathon the user is participating in.'),
});
export type TeammateMatchInput = z.infer<typeof TeammateMatchInputSchema>;

const TeammateMatchOutputSchema = z.object({
  teammateMatches: z
    .array(z.object({
      name: z.string().describe('The name of the potential teammate.'),
      skills: z.array(z.string()).describe('A list of the potential teammate\'s skills.'),
      interests: z.array(z.string()).describe('A list of the potential teammate\'s interests.'),
      matchScore: z.number().describe('A score indicating how well the potential teammate matches the user.'),
    }))
    .describe('A list of potential teammates and their match scores.'),
});
export type TeammateMatchOutput = z.infer<typeof TeammateMatchOutputSchema>;

export async function teammateMatch(input: TeammateMatchInput): Promise<TeammateMatchOutput> {
  return teammateMatchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'teammateMatchPrompt',
  input: {schema: TeammateMatchInputSchema},
  output: {schema: TeammateMatchOutputSchema},
  prompt: `You are an AI assistant that matches users with potential teammates for hackathons.

  Match users based on their skills and interests, and the category of the hackathon they are participating in.

  Consider these teammate options:

  {{#each teammateOptions}}
  Name: {{this.name}}
  Skills: {{this.skills}}
  Interests: {{this.interests}}
  ---
  {{/each}}

  User Skills: {{userSkills}}
  User Interests: {{userInterests}}
  Hackathon Category: {{hackathonCategory}}

  Return a list of potential teammates and their match scores.
  `,
});

const teammateMatchFlow = ai.defineFlow(
  {
    name: 'teammateMatchFlow',
    inputSchema: TeammateMatchInputSchema,
    outputSchema: TeammateMatchOutputSchema,
  },
  async input => {
    // TODO: Replace with actual teammate options from a database or other source.
    const teammateOptions = [
      {
        name: 'Alice',
        skills: ['JavaScript', 'React', 'Firebase'],
        interests: ['Web Development', 'AI', 'Machine Learning'],
      },
      {
        name: 'Bob',
        skills: ['Python', 'Data Science', 'TensorFlow'],
        interests: ['AI', 'Machine Learning', 'Data Analysis'],
      },
      {
        name: 'Charlie',
        skills: ['C++', 'Embedded Systems', 'Robotics'],
        interests: ['Robotics', 'AI', 'Hardware'],
      },
    ];

    const {output} = await prompt({...input, teammateOptions});
    return output!;
  }
);
