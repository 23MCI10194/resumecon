
'use server';

import { parseResume, ParseResumeInput, ParseResumeOutput } from '@/ai/flows/parse-resume';

export async function handleParseResume(
  resumeText: string
): Promise<{ success: true; data: ParseResumeOutput } | { success: false; error: string }> {
  if (!resumeText.trim()) {
    return { success: false, error: 'Resume text cannot be empty.' };
  }

  try {
    const input: ParseResumeInput = { resumeText };
    const result = await parseResume(input);
    return { success: true, data: result };
  } catch (e) {
    console.error('AI parsing failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to parse resume. ${errorMessage}` };
  }
}
