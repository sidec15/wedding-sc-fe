export interface StoryBlock {
  title: string;
  date: {
    year: number;
    month?: number;
    day?: number;
  };
  description: string;
  image: string; // relative path to /public/images/...
}
