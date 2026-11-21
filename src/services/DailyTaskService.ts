import { RolePlayScenario, Message } from '../types';
import { StorageService } from './StorageService';
import { AiService } from './AiService';
import { CloudStatsService } from './CloudStatsService';
import { getLanguageConfig } from '../config/languages';

export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD
  languageCode: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  minDurationMinutes: number;
  scenario: RolePlayScenario;
}

export interface DailyTaskEvaluation {
  taskId: string;
  date: string;
  languageCode: string;
  completedAt: number;
  overallScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  confidenceScore: number;
  grammarScore: number;
  messagesCount: number;
  durationMinutes: number;
  metTenMinGoal: boolean;
  keyTakeaway: string;
  strengths: string[];
  improvements: string[];
}

const SEED_DAILY_TASKS: Omit<DailyTask, 'date' | 'languageCode' | 'minDurationMinutes'>[] = [
  {
    id: 'thug-confrontation',
    title: 'De-escalate a Street Confrontation',
    tagline: '10-Min Negotiation Challenge',
    description: 'You are intimidated by a local thug near a train station demanding your phone. Engage in at least 10 minutes of active conversation using calm, firm, and diplomatic language to talk your way out without getting aggressive.',
    difficulty: 'Intermediate',
    goal: 'Maintain at least 10 minutes of active roleplay conversation, asserting your boundaries politely to de-escalate tension.',
    scenario: {
      id: 'daily-thug-confrontation',
      title: 'De-escalate a Street Confrontation',
      description: 'Negotiate calmly with a local thug threatening a confrontation.',
      context: 'You are walking near a train station late at night. An intimidating local confronts you aggressively. Maintain an engaging 10-minute dialogue using clear, polite yet firm spoken sentences to de-escalate the tension safely.'
    }
  },
  {
    id: 'bazaar-bargain',
    title: 'Open-Air Market Bargain Challenge',
    tagline: '10-Min Negotiation Challenge',
    description: 'Negotiate the price of an authentic handcrafted antique with a witty bazaar vendor who starts at double the fair price over an active 10-minute conversation session.',
    difficulty: 'Intermediate',
    goal: 'Sustain a 10-minute bargaining conversation and persuade the vendor to drop the price by at least 30%.',
    scenario: {
      id: 'daily-bazaar-bargain',
      title: 'Open-Air Market Bargain',
      description: 'Negotiate a price with a street vendor.',
      context: 'You are in a bustling outdoor market looking at an antique watch. The vendor asks for an exorbitant price. Hold an active 10-minute conversational bargaining exchange using persuasive language and humor.'
    }
  },
  {
    id: 'job-twist',
    title: 'The Uncomfortable Interview Question',
    tagline: '10-Min In-Depth Interview',
    description: 'A strict hiring manager conducts a thorough 10-minute interview asking you to explain past project mistakes and career challenges.',
    difficulty: 'Advanced',
    goal: 'Maintain a 10-minute thoughtful interview dialogue, framing past project failures as valuable learning experiences.',
    scenario: {
      id: 'daily-job-twist',
      title: 'The Uncomfortable Interview Question',
      description: 'Explain a past mistake to a hiring manager.',
      context: 'You are interviewing for your dream job. The interviewer asks probing questions about past mistakes. Engage in an in-depth 10-minute conversation demonstrating accountability and problem-solving maturity.'
    }
  },
  {
    id: 'lost-baggage',
    title: 'Lost Baggage Airport Emergency',
    tagline: '10-Min High-Stakes Crisis',
    description: 'Your bag containing essential documents went missing before a connecting flight. Conduct a 10-minute detailed conversation with airport agents to dispatch priority tracking.',
    difficulty: 'Intermediate',
    goal: 'Engage in at least 10 minutes of active crisis-resolution dialogue providing detailed baggage descriptions.',
    scenario: {
      id: 'daily-lost-baggage',
      title: 'Lost Baggage Airport Emergency',
      description: 'Get urgent baggage tracking help at airport customs.',
      context: 'Your baggage is missing at the transfer terminal. The airline agent is exhausted. Engage in a 10-minute persuasive conversation explaining the urgency to inspect the baggage bay immediately.'
    }
  },
  {
    id: 'neighbor-dispute',
    title: 'Midnight Neighbor Trumpet Dispute',
    tagline: '10-Min Diplomacy Session',
    description: 'Your eccentric upstairs neighbor is practicing trumpet at 1:00 AM. Conduct a 10-minute polite discussion to negotiate quiet hours without damaging relations.',
    difficulty: 'Beginner',
    goal: 'Sustain a 10-minute friendly conversation expressing your need for sleep while remaining empathetic.',
    scenario: {
      id: 'daily-neighbor-dispute',
      title: 'Midnight Neighbor Trumpet Dispute',
      description: 'Politely resolve a late-night noise complaint with a neighbor.',
      context: 'Knock on your neighbor\'s door at 1 AM. Hold a 10-minute warm conversation explaining your early morning meeting and negotiating quiet hours.'
    }
  }
];

export class DailyTaskService {
  private static TASK_STORAGE_KEY = 'langeasy_daily_task_v1';
  private static EVAL_STORAGE_KEY = 'langeasy_daily_eval_v1';

  private static getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retrieves today's daily task for the given language.
   * Deterministically rotates through curated tasks based on the date seed.
   */
  static getTodayTask(languageCode: string, level: string = 'A1'): DailyTask {
    const today = this.getTodayDateString();
    const storageKey = `${this.TASK_STORAGE_KEY}_${languageCode}_${today}`;
    
    const cached = StorageService.load<DailyTask | null>(storageKey, undefined, null);
    if (cached && cached.date === today && cached.languageCode === languageCode) {
      return cached;
    }

    // Deterministic selection based on day timestamp
    const daySeed = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
    const langConfig = getLanguageConfig(languageCode);
    const seedIndex = daySeed % SEED_DAILY_TASKS.length;
    const baseSeed = SEED_DAILY_TASKS[seedIndex];

    const dailyTask: DailyTask = {
      id: `task-${today}-${languageCode}-${baseSeed.id}`,
      date: today,
      languageCode,
      title: baseSeed.title,
      tagline: baseSeed.tagline,
      description: baseSeed.description,
      difficulty: baseSeed.difficulty,
      goal: baseSeed.goal,
      minDurationMinutes: 10,
      scenario: {
        id: `scenario-daily-${today}-${languageCode}`,
        title: baseSeed.title,
        description: baseSeed.description,
        context: `${baseSeed.scenario.context} Please speak in ${langConfig.name} appropriate for CEFR ${level} level.`
      }
    };

    StorageService.save(storageKey, dailyTask);
    return dailyTask;
  }

  /**
   * Retrieves today's completed evaluation if existing.
   */
  static getTodayEvaluation(languageCode: string): DailyTaskEvaluation | null {
    const today = this.getTodayDateString();
    const storageKey = `${this.EVAL_STORAGE_KEY}_${languageCode}_${today}`;
    return StorageService.load<DailyTaskEvaluation | null>(storageKey, undefined, null);
  }

  /**
   * Evaluates the user's performance in the daily task and saves the result.
   */
  static async evaluateAndSaveTask(
    languageCode: string,
    level: string,
    task: DailyTask,
    messages: Message[],
    sessionDurationMins?: number
  ): Promise<DailyTaskEvaluation> {
    const userMessages = messages.filter(m => m.sender === 'user');
    const userText = userMessages.map(m => m.text).join(' ');
    const langConfig = getLanguageConfig(languageCode);

    // Calculate actual conversation duration
    const msgCount = userMessages.length;
    const actualDuration = sessionDurationMins && sessionDurationMins > 0 
      ? sessionDurationMins 
      : Math.max(1, Math.round(msgCount * 0.8));
    const metTenMinGoal = actualDuration >= 10;

    let evaluationResult: Partial<DailyTaskEvaluation> = {};

    if (userMessages.length > 0) {
      try {
        const ai = AiService.getClient();
        const prompt = `
          You are an expert language evaluator evaluating a user's completion of a Daily Scenario Task in ${langConfig.name}.
          
          TASK CONTEXT:
          Title: ${task.title}
          Goal: ${task.goal}
          Required Target Duration: At least 10 minutes of active conversation.
          Actual Session Duration: ${actualDuration.toFixed(1)} minutes.
          Met 10-Minute Target: ${metTenMinGoal ? 'YES' : 'NO'}

          USER'S MESSAGES TRANSCRIPT:
          ${JSON.stringify(userMessages.map(m => m.text))}

          Evaluate the user's performance on 4 metrics (0-100 scale):
          1. overallScore: Overall success in achieving the scenario goal.
          2. fluencyScore: Flow, naturalness, sentence length.
          3. vocabularyScore: Richness and appropriateness of words used.
          4. confidenceScore: Directness, confidence, lack of hesitation markers.
          5. grammarScore: Structural and grammatical correctness.
          6. keyTakeaway: A encouraging 1-sentence feedback summary in English.
          7. strengths: Array of 2 concise bullet points (English).
          8. improvements: Array of 2 concise tips for improvement (English).

          Return PURE JSON.
        `;

        const response = await ai.models.generateContent({
          model: AiService.getModelName(),
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object' as any,
              properties: {
                overallScore: { type: 'number' as any },
                fluencyScore: { type: 'number' as any },
                vocabularyScore: { type: 'number' as any },
                confidenceScore: { type: 'number' as any },
                grammarScore: { type: 'number' as any },
                keyTakeaway: { type: 'string' as any },
                strengths: { type: 'array' as any, items: { type: 'string' as any } },
                improvements: { type: 'array' as any, items: { type: 'string' as any } }
              },
              required: ['overallScore', 'fluencyScore', 'vocabularyScore', 'confidenceScore', 'grammarScore', 'keyTakeaway', 'strengths', 'improvements']
            }
          }
        });

        const jsonText = (response.text || '')
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '')
          .trim();

        evaluationResult = JSON.parse(jsonText);
      } catch (e) {
        console.warn("[DailyTaskService] AI evaluation fallback activated:", e);
      }
    }

    // Heuristic Fallback if AI call didn't finish or text was too short
    const wordCount = userText.split(/\s+/).filter(Boolean).length;
    
    const baseScore = Math.min(95, Math.max(65, 70 + Math.min(25, msgCount * 5 + wordCount * 0.5)));

    const evaluation: DailyTaskEvaluation = {
      taskId: task.id,
      date: task.date,
      languageCode,
      completedAt: Date.now(),
      overallScore: Math.round(evaluationResult.overallScore ?? baseScore),
      fluencyScore: Math.round(evaluationResult.fluencyScore ?? (baseScore - 3)),
      vocabularyScore: Math.round(evaluationResult.vocabularyScore ?? (baseScore + 2)),
      confidenceScore: Math.round(evaluationResult.confidenceScore ?? (baseScore + 1)),
      grammarScore: Math.round(evaluationResult.grammarScore ?? (baseScore - 2)),
      messagesCount: msgCount,
      durationMinutes: Math.round(actualDuration * 10) / 10,
      metTenMinGoal,
      keyTakeaway: evaluationResult.keyTakeaway || `Great effort in today's scenario! ${metTenMinGoal ? 'You completed the 10-minute active conversation goal.' : 'Try aiming for a full 10-minute session next time for maximum fluency gains.'}`,
      strengths: evaluationResult.strengths || [
        `Maintained active conversation in ${langConfig.name}`,
        `Responded promptly to scenario cues`
      ],
      improvements: evaluationResult.improvements || [
        `Aim for at least 10 minutes of active speaking time`,
        `Practice using varied connector words and expressions`
      ]
    };

    const today = this.getTodayDateString();
    const storageKey = `${this.EVAL_STORAGE_KEY}_${languageCode}_${today}`;
    StorageService.save(storageKey, evaluation);

    // Sync stats with language-keyed map
    try {
      const existing = StorageService.load<Record<string, any>>('progress_by_lang', undefined, {});
      const langProgress = Array.isArray(existing[languageCode]) ? existing[languageCode] : [];
      const localIndex = langProgress.findIndex((d: any) => d && d.date === today);
      const newEntry = {
        date: today,
        wordsLearned: Math.min(20, Math.ceil(wordCount / 5)),
        speakingTimeMinutes: Math.max(1, Math.ceil(msgCount * 0.8)),
        exercisesCompleted: 1,
        averageScore: evaluation.overallScore
      };
      const updatedLangProgress = localIndex > -1 
        ? langProgress.map((d: any, idx: number) => idx === localIndex ? { ...d, ...newEntry } : d)
        : [...langProgress, newEntry];

      CloudStatsService.syncProgress({
        ...existing,
        [languageCode]: updatedLangProgress
      });
    } catch (syncErr) {
      console.warn('[DailyTaskService] Progress sync notice:', syncErr);
    }

    window.dispatchEvent(new CustomEvent('daily-task-completed', { detail: { evaluation } }));
    return evaluation;
  }

  /**
   * Resets today's task evaluation (useful for testing or re-attempting).
   */
  static resetTodayTask(languageCode: string) {
    const today = this.getTodayDateString();
    const storageKey = `${this.EVAL_STORAGE_KEY}_${languageCode}_${today}`;
    StorageService.save(storageKey, null);
    window.dispatchEvent(new CustomEvent('daily-task-reset', { detail: { languageCode } }));
  }
}
