export interface Card {
  title: string;
  description: string;
  image?: string; // optional for intro/outro
  type?: 'card' | 'intro' | 'outro';
  comics?: string[]; // comic image
  showComments?: boolean; // enable comments section

  status?: 'visible' | 'hidden' | 'transitioning-out' | 'transitioning-in';
  position?: 'before' | 'after' | 'current' | 'slide-in-from-left' | 'slide-in-from-right';

  textPosition?: 'left' | 'right'; // optional for intro/outro
}
