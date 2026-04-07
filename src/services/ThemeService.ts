
export type AppTheme = 'light' | 'dark' | 'midnight-neon' | 'street-graphite' | 'y2k-kawaii';

export class ThemeService {
  private static THEME_KEY = 'deutschbuddy_theme';

  static getTheme(): AppTheme {
    return (localStorage.getItem(this.THEME_KEY) as AppTheme) || 'dark';
  }

  static setTheme(theme: AppTheme) {
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme class to html element
    document.documentElement.classList.remove('light', 'dark', 'midnight-neon', 'street-graphite', 'y2k-kawaii');
    document.documentElement.classList.add(theme);
    window.dispatchEvent(new CustomEvent('theme-changed'));
  }

  static toggleTheme() {
    const current = this.getTheme();
    const themes: AppTheme[] = ['light', 'dark', 'midnight-neon', 'street-graphite', 'y2k-kawaii'];
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    const next = themes[nextIndex];
    this.setTheme(next);
    return next;
  }

  static init() {
    const theme = this.getTheme();
    this.setTheme(theme);
  }
}
