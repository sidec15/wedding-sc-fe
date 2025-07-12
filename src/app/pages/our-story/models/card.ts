export interface CardModel {
  title?: string;
  description: string;
  image?: string; // optional for intro/outro
  type?: 'card' | 'intro' | 'outro';
  comic?: string; // comic image
  status: 'appearing-from-left' | 'appearing-from-right' | 'disappearing-to-left' | 'disappearing-to-right' | 'visible' | 'before' | 'after';
}
