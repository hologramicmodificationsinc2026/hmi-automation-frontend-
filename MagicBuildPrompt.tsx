import React, { useState } from 'react';

interface MagicBuildPromptProps {
  onGenerate: (prompt: string) => Promise<void>;
}

export const MagicBuildPrompt: React.FC<MagicBuildPromptProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onGenerate(prompt);
      setPrompt(''); // Clear input on success
    } catch (error) {
      console.error("Failed to execute Magic Build:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-zinc-950/80 backdrop-blur-md border rounded-xl p-1.5 transition-all duration-300 ${
          isLoading 
            ? 'border-magenta-500 shadow-[0_0_20px_rgba(255,0,128,0.4)] animate-pulse' 
            : 'border-zinc-800 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.3)]'
        }`}
      >
        {/* Animated Sparkle Icon */}
        <div className="pl-3 pr-2 text-cyan-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'animate-spin' : ''}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          placeholder={isLoading ? "Hologramic Engine is weaving your nodes..." : "Describe a workflow (e.g., 'Listen for Stripe webhooks and parse payload')"}
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none py-2 px-1 disabled:cursor-not-allowed"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-cyan-400 disabled:opacity-40 disabled:hover:text-zinc-300 disabled:bg-zinc-900 size-9 flex items-center justify-center rounded-lg transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </button>
      </form>
    </div>
  );
};
