export interface ParallaxCardModel {
  title: string;
  description: string;
  image?: string; // optional for intro/outro
  date?: {
    year: number;
    month?: number;
    day?: number;
  };
  type?: 'card' | 'intro' | 'outro';
  textPosition?: 'left' | 'right'; // optional for intro/outro
}
