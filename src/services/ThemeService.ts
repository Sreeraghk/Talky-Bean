
export type AppTheme = 'light' | 'dark';

export class ThemeService {
  private static THEME_KEY = 'langeasy_theme';

  static getTheme(): AppTheme {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'dark';
  }

  static setTheme(theme: AppTheme) {
    const validTheme: AppTheme = (theme === 'light' || theme === 'dark') ? theme : 'dark';
    localStorage.setItem(this.THEME_KEY, validTheme);
    document.documentElement.setAttribute('data-theme', validTheme);
    
    // Apply theme class to html element
    document.documentElement.classList.remove('light', 'dark', 'midnight-neon', 'street-graphite', 'y2k-kawaii');
    document.documentElement.classList.add(validTheme);
    window.dispatchEvent(new CustomEvent('theme-changed'));
  }

  static toggleTheme(): AppTheme {
    const current = this.getTheme();
    const next: AppTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  static init() {
    const theme = this.getTheme();
    this.setTheme(theme);
  }
}
