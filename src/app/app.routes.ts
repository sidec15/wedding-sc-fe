import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { OurStoryComponent } from './pages/our-story/our-story.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route
  { path: 'our-story', component: OurStoryComponent }, // Our Story route
  { path: 'parallax', component: OurStoryComponent }
];