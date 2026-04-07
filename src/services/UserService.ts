import { UserProfile } from "../types";
import { AiService } from "./AiService";

export class UserService {
  private static STORAGE_KEY = 'easy_lang_user_profile';

  static getProfile(): UserProfile | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }

  static saveProfile(profile: UserProfile) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
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
      contents: prompt,
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
