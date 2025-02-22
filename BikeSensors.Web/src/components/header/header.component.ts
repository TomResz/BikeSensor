import { Component, inject } from '@angular/core';
import { ThemeButtonComponent } from "../theme-button/theme-button.component";

@Component({
  selector: 'app-header',
  imports: [ThemeButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
}
