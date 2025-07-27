// src/ai/flows/parse-resume.ts
'use server';
/**
 * @fileOverview A resume parsing AI agent.
 *
 * - parseResume - A function that handles the resume parsing process.
 * - ParseResumeInput - The input type for the parseResume function.
 * - ParseResumeOutput - The return type for the parseResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume to parse.'),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const ParseResumeOutputSchema = z.object({
  name: z.string().describe("The full name of the resume owner."),
  designation: z.string().describe("The job title or designation of the resume owner."),
  nationality: z.string().describe('The nationality of the resume owner.'),
  totalExperience: z.string().describe("The candidate's total years of professional experience."),
  relevantExperience: z.string().describe("The candidate's years of experience relevant to their designation/skills."),
  education: z.string().describe('The education history of the resume owner.'),
  keyCompetencies: z.string().describe('A comma-separated string of the key technical and soft skills relevant to the designation.'),
  personalScorecard: z.array(z.string()).describe('A list of personal scorecard items.'),
  professionalExperiences: z.array(z.string()).describe('A list of professional experiences. For each experience, describe the role and responsibilities without mentioning the company name or employment dates.'),
  projectExperiences: z.array(z.string()).describe('A list of project experiences.'),
});
export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return parseResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: {schema: ParseResumeInputSchema},
  output: {schema: ParseResumeOutputSchema},
  prompt: `You are an AI expert in parsing resumes.

  Extract and organize the content of the following resume into structured fields:
  Name, Designation/Title, Nationality, Total Experience (e.g., "13+ years"), Relevant Experience (e.g., "4+ years"), Education, Key Competencies, Personal Scorecard (max 5 bullet points),
  Professional Experiences (max 5 bullet points), and Relevant Project Experiences (max 5 bullet points).

  Calculate the total years of professional experience from the employment dates provided in the resume.
  Calculate the relevant years of experience based on the skills and roles that match the candidate's primary designation.

  For Key Competencies, identify the candidate's designation/title first. Then, list only the key technical and soft skills from the resume that are most relevant to that specific job title.

  For Professional Experiences, describe the role and responsibilities for each position but do not include the company name or the dates of employment.

  Resume Text: {{{resumeText}}}

  Return the output in JSON format.
  Make sure the personalScorecard, professionalExperiences, and projectExperiences fields are returned as lists.
  `,
});

const parseResumeFlow = ai.defineFlow(
  {
    name: 'parseResumeFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
