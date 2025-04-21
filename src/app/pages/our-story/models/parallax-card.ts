import { DateModel } from "./date";

export interface ParallaxCardModel {
  title: string;
  description: string;
  image?: string; // optional for intro/outro
  date?: DateModel; // optional for intro/outro
  type?: 'card' | 'intro' | 'outro';
  textPosition?: 'left' | 'right'; // optional for intro/outro
}
