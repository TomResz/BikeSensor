import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public themeSignal = signal<string>(localStorage.getItem('theme') || 'light');

  constructor() {
    effect(() => {
      const theme = this.themeSignal();
      this.applyTheme(theme);
    });
    
    if(!localStorage.getItem('theme')){
      localStorage.setItem('theme', 'light');
    }
    this.applyTheme(this.themeSignal());
  }

  toggleTheme() {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  private applyTheme(theme: string) {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }
}
