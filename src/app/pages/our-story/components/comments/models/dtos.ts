export interface CommentResponse {
  photoId: string;
  commentId: string;
  createdAt: string;
  authorName: string;
  content: string;
}

export interface PaginatedResult<T> {
  elements: T[];
  cursor?: string; // opaque next-page token (base64-encoded LEK)
  hasNext: boolean;
  totalElements: number; // full count for this photoId
  totalPagesCount: number;
}

export interface ListOptions {
  limit?: number;
  order?: 'asc' | 'desc';
  cursor?: string;
}
