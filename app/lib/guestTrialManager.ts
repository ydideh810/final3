'use client';

class GuestTrialManager {
  private readonly STORAGE_KEY = 'nidam_guest_trial';
  private readonly TRIAL_DURATION = 10 * 60; // 10 minutes in seconds
  private readonly COOLDOWN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  public getTrialInfo(): { isAvailable: boolean; remainingCooldown: number } {
    if (typeof window === 'undefined') {
      return { isAvailable: false, remainingCooldown: this.COOLDOWN_DURATION };
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      return { isAvailable: true, remainingCooldown: 0 };
    }

    const lastUsed = parseInt(saved, 10);
    const now = Date.now();
    const timeSinceLastUse = now - lastUsed;
    const remainingCooldown = Math.max(0, this.COOLDOWN_DURATION - timeSinceLastUse);
    
    return {
      isAvailable: timeSinceLastUse >= this.COOLDOWN_DURATION,
      remainingCooldown
    };
  }

  public startTrial(): number {
    if (typeof window === 'undefined') return 0;
    
    localStorage.setItem(this.STORAGE_KEY, Date.now().toString());
    return this.TRIAL_DURATION;
  }

  public formatCooldown(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const guestTrialManager = new GuestTrialManager();