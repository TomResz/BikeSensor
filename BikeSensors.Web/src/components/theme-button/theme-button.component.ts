import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-button',
  imports: [CommonModule],
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.css'
})
export class ThemeButtonComponent {
  themeService = inject(ThemeService);
}
