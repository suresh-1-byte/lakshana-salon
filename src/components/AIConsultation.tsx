'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { aiVisualConsultation, type AiVisualConsultationOutput } from '@/ai/flows/ai-visual-consultation-flow';
import { generateLook } from '@/ai/flows/generate-look-flow';
import Image from 'next/image';

export function AIConsultation() {
  const [style, setStyle] = useState('');
  const [features, setFeatures] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [result, setResult] = useState<AiVisualConsultationOutput | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedImageUrl(null);
    try {
      const output = await aiVisualConsultation({
        desiredStyle: style,
        facialFeaturesDescription: features,
      });
      setResult(output);
    } catch (error) {
      console.error('Consultation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualizeLook = async () => {
    if (!result) return;
    setIsGeneratingImage(true);
    try {
      const description = `${style} look with ${result.recommendedMakeupPalettes.join(', ')} palettes and ${result.recommendedTreatments.slice(0, 2).join(', ')}`;
      const output = await generateLook({ description });
      setGeneratedImageUrl(output.imageUrl);
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <section className="py-24 bg-[#0D0A14] relative overflow-hidden">
      {/* Background Sparkle Effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />

      <div className="container mx-auto px-6">
<div className="max-w-6xl mx-auto glass-card border-[#C9A84C]/20 p-8 md:p-16">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-headline leading-tight text-white">
              Discover Your <br />
              <span className="luxury-cursive text-[#C9A84C]">Perfect Aesthetic</span>
            </h2>
            <p className="text-[#E7D6B8] font-light leading-relaxed max-w-2xl mx-auto">
              Our intelligent beauty consultant analyzes your dream look and facial features to provide curated treatments and palettes using advanced AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-xs uppercase tracking-widest text-[#C9A84C]">Desired Style</label>
                  <Input
                    placeholder="e.g., Natural Glow, Dramatic Evening..."
                    className="bg-black/20 border-[#C9A84C]/40 rounded-none h-12 focus:border-[#C9A84C]/50 transition-all text-white"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs uppercase tracking-widest text-[#C9A84C]">Facial Features</label>
                  <Textarea
                    placeholder="e.g., Warm undertones, almond eyes, round face..."
                    className="bg-black/20 border-[#C9A84C]/40 rounded-none min-h-[100px] focus:border-[#C9A84C]/50 transition-all text-white"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    required
                  />
                </div>
                <Button
                  disabled={isLoading}
                  className="w-full bg-[#C9A84C] text-[#0D0A14] hover:bg-[#D4B963] hover:text-[#0D0A14] h-14 rounded-none tracking-widest uppercase font-bold btn-luxury shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
                  Generate My Consultation
                </Button>
              </form>
            </div>

            <div className="relative min-h-[400px] border-l border-white/5 pl-8 md:pl-16 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!result && !isLoading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-[#E7D6B8]"
                  >
                    <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mb-4">
                      <Sparkles size={32} className="opacity-20 text-[#C9A84C]" />
                    </div>
                    <p className="font-light italic">Enter your details to reveal your <br /> personalized recommendations.</p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-4"
                  >
                    <Loader2 className="animate-spin text-[#C9A84C]" size={48} />
                    <p className="text-[#C9A84C] animate-pulse tracking-widest uppercase text-xs">AI is analyzing your features...</p>
                  </motion.div>
                )}

                {result && !isLoading && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 flex-1 text-left"
                  >
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4 flex items-center">
                          <CheckCircle2 size={14} className="mr-2" /> Recommended Treatments
                        </h4>
                        <ul className="space-y-3">
                          {result.recommendedTreatments.map((t, idx) => (
                            <li key={idx} className="text-sm font-light text-[#E7D6B8] border-l border-[#C9A84C]/30 pl-4 py-1">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4 flex items-center">
                          <CheckCircle2 size={14} className="mr-2" /> Suggested Palettes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.recommendedMakeupPalettes.map((p, idx) => (
                            <span key={idx} className="text-[10px] uppercase tracking-widest bg-[#C9A84C]/10 text-[#E7D6B8] px-3 py-1 border border-[#C9A84C]/20">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                      {!generatedImageUrl && !isGeneratingImage && (
                        <Button 
                          onClick={handleVisualizeLook}
                          className="w-full variant-outline border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-none tracking-widest uppercase text-xs h-12"
                        >
                          <ImageIcon size={16} className="mr-2" /> Visualize Your New Look
                        </Button>
                      )}

                      {isGeneratingImage && (
                        <div className="flex flex-col items-center justify-center space-y-3 py-10">
                          <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
                          <p className="text-[10px] uppercase tracking-widest text-[#FFD97F]">Generating visual representation...</p>
                        </div>
                      )}

                      {generatedImageUrl && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-4"
                        >
                          <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Your Visual Transformation</h4>
                          <div className="relative aspect-square w-full border border-[#C9A84C]/20 overflow-hidden">
                            <Image 
                              src={generatedImageUrl} 
                              alt="AI Generated Look" 
                              fill 
                              className="object-cover"
                            />
                          </div>
                          <p className="text-[10px] italic text-[#E7D6B8] text-center">
                            AI-generated visual concept based on your consultation.
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className="text-center pt-4">
                      <Button variant="link" onClick={() => { setResult(null); setGeneratedImageUrl(null); }} className="text-xs text-[#E7D6B8] p-0 underline decoration-[#C9A84C]/30 h-auto">
                        Start New Consultation
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
