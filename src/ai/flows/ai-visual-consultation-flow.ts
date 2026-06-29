'use server';
/**
 * @fileOverview An AI visual consultation tool that recommends beauty treatments and makeup palettes.
 *
 * - aiVisualConsultation - A function that handles the AI visual consultation process.
 * - AiVisualConsultationInput - The input type for the aiVisualConsultation function.
 * - AiVisualConsultationOutput - The return type for the aiVisualConsultation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiVisualConsultationInputSchema = z.object({
  desiredStyle: z
    .string()
    .describe(
      'A detailed description of the user\u2019s desired beauty style (e.g., \"natural glow,\" \"dramatic evening,\" \"classic elegance\").'
    ),
  facialFeaturesDescription: z
    .string()
    .describe(
      'A detailed description of the user\u2019s facial features (e.g., \"round face, brown eyes, fair skin,\" \"oval face, green eyes, warm undertones\").'
    ),
});
export type AiVisualConsultationInput = z.infer<
  typeof AiVisualConsultationInputSchema
>;

const AiVisualConsultationOutputSchema = z.object({
  recommendedTreatments: z
    .array(z.string())
    .describe(
      'An array of recommended beauty treatments based on the user\u2019s style and features. Each item should be a concise description of a treatment.'
    ),
  recommendedMakeupPalettes: z
    .array(z.string())
    .describe(
      'An array of recommended makeup palettes (e.g., \"warm earth tones,\" \"cool berry shades,\" \"smoky neutrals\").'
    ),
});
export type AiVisualConsultationOutput = z.infer<
  typeof AiVisualConsultationOutputSchema
>;

export async function aiVisualConsultation(
  input: AiVisualConsultationInput
): Promise<AiVisualConsultationOutput> {
  return aiVisualConsultationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiVisualConsultationPrompt',
  input: {schema: AiVisualConsultationInputSchema},
  output: {schema: AiVisualConsultationOutputSchema},
  prompt: `You are an expert beauty consultant for Lakshana Beauty Salon. Your goal is to provide personalized recommendations for beauty treatments and makeup palettes based on a client's desired style and facial features.

Desired Style: {{{desiredStyle}}}
Facial Features: {{{facialFeaturesDescription}}}

Based on the above information, provide a list of recommended beauty treatments and makeup palettes that align with the client's preferences and features. Ensure your recommendations are specific and actionable, tailored for a premium beauty experience.

Recommendations should be presented in JSON format, following the specified schema for 'recommendedTreatments' and 'recommendedMakeupPalettes'.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const aiVisualConsultationFlow = ai.defineFlow(
  {
    name: 'aiVisualConsultationFlow',
    inputSchema: AiVisualConsultationInputSchema,
    outputSchema: AiVisualConsultationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output received from the AI consultation.');
    }
    return output;
  }
);
