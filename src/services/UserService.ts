import { UserProfile } from "../types";
import { AiService } from "./AiService";
import { CloudStatsService } from "./CloudStatsService";

export class UserService {
  private static STORAGE_KEY = 'user_profile';

  static getProfile(): UserProfile | null {
    const saved = localStorage.getItem('langeasy_user_profile'); // Legacy fallback
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.saveProfile(parsed);
        localStorage.removeItem('langeasy_user_profile');
        return parsed;
      } catch (e) {}
    }

    const current = localStorage.getItem('langeasy_user_profile_v2');
    if (current) return JSON.parse(current);
    return null;
  }

  static saveProfile(profile: UserProfile) {
    localStorage.setItem('langeasy_user_profile_v2', JSON.stringify(profile));
    CloudStatsService.syncProfile(profile);
  }

  static async updateGoals(goals: string): Promise<UserProfile> {
    const currentProfile = this.getProfile() || {
      name: 'User',
      email: '',
      goals: '',
      lastUpdated: Date.now()
    };

    const ai = AiService.getClient();
    const prompt = `Based on the user's goals for learning a language, create a short, professional assessment note (under 100 words).
    User's Goals: "${goals}"
    
    The note should summarize what they want to achieve and their motivation. This will be used to personalize their learning experience.`;

    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const updatedProfile: UserProfile = {
      ...currentProfile,
      goals,
      aiAssessment: response.text,
      lastUpdated: Date.now()
    };

    this.saveProfile(updatedProfile);
    return updatedProfile;
  }
}
