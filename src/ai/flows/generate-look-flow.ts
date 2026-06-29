'use server';
/**
 * @fileOverview A flow to generate a visual representation of a beauty look.
 *
 * - generateLook - A function that generates a beauty portrait based on a description.
 * - GenerateLookInput - The input type for the generateLook function.
 * - GenerateLookOutput - The return type for the generateLook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLookInputSchema = z.object({
  description: z
    .string()
    .describe('A detailed description of the beauty look, including style, makeup, and mood.'),
});
export type GenerateLookInput = z.infer<typeof GenerateLookInputSchema>;

const GenerateLookOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateLookOutput = z.infer<typeof GenerateLookOutputSchema>;

export async function generateLook(input: GenerateLookInput): Promise<GenerateLookOutput> {
  return generateLookFlow(input);
}

const generateLookFlow = ai.defineFlow(
  {
    name: 'generateLookFlow',
    inputSchema: GenerateLookInputSchema,
    outputSchema: GenerateLookOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A professional, high-end beauty portrait for a luxury salon. The subject has a ${input.description}. Sophisticated aesthetic, cinematic lighting, 8k resolution, elegant composition.`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate image');
    }

    return {imageUrl: media.url};
  }
);
