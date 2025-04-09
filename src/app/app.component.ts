import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'wedding-sc-fe';
  menuOpen = false;
  currentYear = 2025;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}

