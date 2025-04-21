import { DateModel } from "./date";

export interface StoryBlock {
  title: string;
  date: DateModel;
  description: string;
  image: string; // relative path to /public/images/...
}
