import { PerformanceRecord, VocabularyWord, GrammarTip } from '../types';

const STORAGE_KEY = 'deutschbuddy_performance_history';

export class PerformanceService {
  static getHistory(): PerformanceRecord[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static saveHistory(history: PerformanceRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  static recordAttempt(itemId: string, type: 'vocabulary' | 'grammar', success: boolean) {
    const history = this.getHistory();
    const index = history.findIndex(h => h.itemId === itemId);
    
    if (index !== -1) {
      const record = history[index];
      if (success) {
        record.successCount++;
      } else {
        record.failCount++;
      }
      record.lastAttempted = Date.now();
      
      // Dynamic difficulty adjustment: 
      // More fails = higher difficulty score (needs more practice)
      // More successes = lower difficulty score (mastered)
      const total = record.successCount + record.failCount;
      record.difficultyScore = Math.max(0, Math.min(1, record.failCount / total + (1 / (total + 1))));
      
      history[index] = record;
    } else {
      history.push({
        itemId,
        type,
        successCount: success ? 1 : 0,
        failCount: success ? 0 : 1,
        lastAttempted: Date.now(),
        difficultyScore: success ? 0.3 : 0.7
      });
    }
    
    this.saveHistory(history);
  }

  static getItemsNeedingPractice(type: 'vocabulary' | 'grammar', count: number = 5): string[] {
    const history = this.getHistory();
    return history
      .filter(h => h.type === type)
      .sort((a, b) => b.difficultyScore - a.difficultyScore) // Highest difficulty first
      .slice(0, count)
      .map(h => h.itemId);
  }

  static getOverallPerformance(): number {
    const history = this.getHistory();
    if (history.length === 0) return 1.0; // Default to 1.0 (start fresh)
    const totalSuccess = history.reduce((sum, h) => sum + h.successCount, 0);
    const totalAttempts = history.reduce((sum, h) => sum + h.successCount + h.failCount, 0);
    return totalSuccess / totalAttempts;
  }
}
