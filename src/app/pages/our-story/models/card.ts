export interface CardModel {
  title?: string;
  description: string;
  image?: string; // optional for intro/outro
  type?: 'card' | 'intro' | 'outro';
  comic?: string; // comic image
}
