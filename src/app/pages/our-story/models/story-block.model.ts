import { DateModel } from "./date.models";

export interface StoryBlock {
  title: string;
  date: DateModel;
  description: string;
  image: string; // relative path to /public/images/...
}
