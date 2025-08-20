import { DateTime } from "luxon";

export interface Comment {
  photoId?: string;
  commentId?: string;
  createdAt: DateTime;
  authorName: string;
  content: string;
}
