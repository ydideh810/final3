'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Achievement } from '../lib/types';

export function AchievementNotification() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      setAchievement(event.detail);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };

    window.addEventListener('achievementUnlocked', handleAchievement as EventListener);
    return () => window.removeEventListener('achievementUnlocked', handleAchievement as EventListener);
  }, []);

  if (!isVisible || !achievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-black border border-[#ff0000] p-4 shadow-lg flex items-center gap-3">
        <div className="text-2xl">{achievement.icon}</div>
        <div>
          <div className="flex items-center gap-2 text-[#ff0000] font-mono">
            <Trophy size={16} />
            Achievement Unlocked!
          </div>
          <div className="text-[#ff0000] font-mono font-bold">
            {achievement.name}
          </div>
          <div className="text-[#ff0000]/70 text-sm font-mono">
            {achievement.description}
          </div>
        </div>
      </div>
    </div>
  );
}