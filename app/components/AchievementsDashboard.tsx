'use client';

import { useState } from 'react';
import { Trophy, X, Award, Calendar, Zap } from 'lucide-react';
import { achievementsManager } from '../lib/achievementsManager';
import { Achievement } from '../lib/types';

interface AchievementsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementsDashboard({ isOpen, onClose }: AchievementsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const achievements = achievementsManager.getAchievements();
  const stats = achievementsManager.getStats();

  const filteredAchievements = achievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[800px] max-h-[90vh] border border-[#ff0000] bg-black p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#ff0000] text-lg font-mono flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements & Badges
          </h2>
          <button 
            onClick={onClose}
            className="text-[#ff0000] hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-[#ff0000] p-4">
            <div className="flex items-center gap-2 text-[#ff0000] font-mono mb-2">
              <Zap size={16} />
              Total Messages
            </div>
            <div className="text-2xl text-[#ff0000] font-mono">
              {stats.totalMessages}
            </div>
          </div>
          <div className="border border-[#ff0000] p-4">
            <div className="flex items-center gap-2 text-[#ff0000] font-mono mb-2">
              <Calendar size={16} />
              Login Streak
            </div>
            <div className="text-2xl text-[#ff0000] font-mono">
              {stats.consecutiveLogins} days
            </div>
          </div>
          <div className="border border-[#ff0000] p-4">
            <div className="flex items-center gap-2 text-[#ff0000] font-mono mb-2">
              <Award size={16} />
              Badges Earned
            </div>
            <div className="text-2xl text-[#ff0000] font-mono">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 ${
              selectedCategory === 'all' ? 'bg-[#ff0000]/20' : ''
            }`}
          >
            All
          </button>
          {['usage', 'performance', 'social'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as Achievement['category'])}
              className={`px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 ${
                selectedCategory === category ? 'bg-[#ff0000]/20' : ''
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#ff0000] scrollbar-track-transparent">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              className={`border border-[#ff0000] p-4 ${
                achievement.unlocked ? 'bg-[#ff0000]/10' : 'opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <div className="text-[#ff0000] font-mono font-bold">
                    {achievement.name}
                  </div>
                  <div className="text-[#ff0000]/70 text-sm font-mono">
                    {achievement.description}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-[#ff0000]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ff0000]"
                    style={{
                      width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%`
                    }}
                  />
                </div>
                <div className="text-[#ff0000]/70 text-xs font-mono mt-1">
                  Progress: {achievement.progress}/{achievement.requirement}
                </div>
              </div>
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-[#ff0000]/50 text-xs font-mono mt-2">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}