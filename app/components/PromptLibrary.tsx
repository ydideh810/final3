'use client';

import { useState, useEffect } from 'react';
import { Book, X, Search, Plus, ThumbsUp } from 'lucide-react';
import { dbOperations } from '../lib/db';
import { Prompt } from '../lib/types';

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (content: string) => void;
}

export function PromptLibrary({ isOpen, onClose, onSelectPrompt }: PromptLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory]);

  const loadPrompts = async () => {
    try {
      const loadedPrompts = await dbOperations.getPrompts(selectedCategory || undefined);
      setPrompts(loadedPrompts);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPrompts();
      return;
    }

    try {
      const results = await dbOperations.searchPrompts(searchQuery);
      setPrompts(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleUpvote = async (promptId: string) => {
    try {
      await dbOperations.upvotePrompt(promptId);
      loadPrompts();
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[800px] max-h-[90vh] border border-[#ff0000] bg-black p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#ff0000] text-lg font-mono flex items-center gap-2">
            <Book className="w-5 h-5" />
            Prompt Library
          </h2>
          <button 
            onClick={onClose}
            className="text-[#ff0000] hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="flex-1 bg-transparent border border-[#ff0000] p-2 text-[#ff0000] font-mono placeholder-[#ff0000]/50"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10"
            >
              <Search size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowAddPrompt(true)}
            className="px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Prompt
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 ${
              !selectedCategory ? 'bg-[#ff0000]/20' : ''
            }`}
          >
            All
          </button>
          {['creative', 'technical', 'brainstorming', 'roleplay'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 ${
                selectedCategory === category ? 'bg-[#ff0000]/20' : ''
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#ff0000] scrollbar-track-transparent">
          {prompts.map(prompt => (
            <div key={prompt.id} className="border border-[#ff0000] p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[#ff0000] font-mono">{prompt.title}</h3>
                <button
                  onClick={() => handleUpvote(prompt.id)}
                  className="flex items-center gap-1 text-[#ff0000]/70 hover:text-[#ff0000]"
                >
                  <ThumbsUp size={14} />
                  {prompt.upvotes}
                </button>
              </div>
              <p className="text-[#ff0000]/70 font-mono mb-2">{prompt.content}</p>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 border border-[#ff0000]/50 text-[#ff0000]/50 text-xs font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onSelectPrompt(prompt.content)}
                className="mt-2 px-4 py-1 border border-[#ff0000] text-[#ff0000] text-sm font-mono hover:bg-[#ff0000]/10"
              >
                Use Prompt
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}