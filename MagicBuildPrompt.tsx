"use client";

import React, { useState } from 'react';

interface MagicBuildPromptProps {
  onGenerate: (prompt: string) => Promise<void>;
}

export const MagicBuildPrompt: React.FC<MagicBuildPromptProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      await onGenerate(prompt);
      setPrompt('');
    } catch (err) {
      console.error('Failed to generate workflow layout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-[#141423]/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.5)] focus-within:border-[#00f0ff] transition-all"
      >
        <div className="pl-3 text-[#00f0ff]">✨</div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your workflow (e.g. 'Webhook trigger that runs JS script')..."
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#ff007f] text-black text-xs font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Weaving...' : 'Magic Build'}
        </button>
      </form>
    </div>
  );
};
