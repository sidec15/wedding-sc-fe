// src/app/services/comments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// ==== App model (given) ====
export interface Comment {
  id: string;
  nickname: string;
  email?: string;
  message: string;
  createdAt: Date;
}

// ==== Backend DTOs (given / inferred) ====
export interface CommentResponse {
  photoId: string;
  commentId: string;
  createdAt: string;   // ISO string
  authorName: string;
  content: string;
}

interface BackendPaginatedResult<T> {
  elements: T[];
  cursor?: string;          // opaque token to request the next page
  hasNext: boolean;
  totalElements: number;
  totalPagesCount: number;
}

// ==== Client-side pagination model ====
export interface CommentsPage {
  items: Comment[];
  cursor?: string;
  hasNext: boolean;
  total: number;
  totalPages: number;
}

export interface ListOptions {
  limit?: number;                  // default handled server-side
  order?: 'asc' | 'desc';          // default handled server-side
  cursor?: string;                 // pass back cursor from previous page
}

// If you already have an environment, import it instead:
const API_BASE_URL = (window as any).__env?.API_BASE_URL ?? 'https://your-api.example.com';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  constructor(private http: HttpClient) {}

  /**
   * List comments for a photo with optional pagination.
   * GET /photos/{photoId}/comments?limit=&order=&cursor=
   */
  list(photoId: string, opts: ListOptions = {}): Observable<CommentsPage> {
    let params = new HttpParams();
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.order) params = params.set('order', opts.order);
    if (opts.cursor) params = params.set('cursor', opts.cursor);

    const url = `${API_BASE_URL}/photos/${encodeURIComponent(photoId)}/comments`;

    return this.http
      .get<BackendPaginatedResult<CommentResponse>>(url, { params })
      .pipe(
        map((res) => ({
          items: res.elements.map(this.mapDtoToModel),
          cursor: res.cursor,
          hasNext: res.hasNext,
          total: res.totalElements,
          totalPages: res.totalPagesCount,
        }))
      );
  }

  /**
   * Create a new comment.
   * POST /photos/{photoId}/comments
   * body: { authorName, content }
   */
  create(photoId: string, input: { nickname: string; message: string }): Observable<Comment> {
    const url = `${API_BASE_URL}/photos/${encodeURIComponent(photoId)}/comments`;
    const body = {
      authorName: input.nickname,
      content: input.message,
    };

    return this.http.post<CommentResponse>(url, body).pipe(map(this.mapDtoToModel));
  }

  // ==== Mapping helpers ====

  private mapDtoToModel = (dto: CommentResponse): Comment => ({
    id: dto.commentId,
    nickname: dto.authorName,
    // email is not provided by the backend DTO — leaving undefined
    message: dto.content,
    createdAt: new Date(dto.createdAt),
  });
}
