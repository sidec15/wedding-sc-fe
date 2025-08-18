import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CommentResponse, ListOptions, PaginatedResult } from '../models/dtos';
import { environment } from '../../../../../../environments/environment';
import { Comment } from '../models/comment';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  /**
   * List comments for a photo with optional pagination.
   * GET /photos/{photoId}/comments?limit=&order=&cursor=
   */
  list(
    photoId: string,
    opts: ListOptions = {}
  ): Observable<PaginatedResult<Comment>> {
    let params = new HttpParams();
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.order) params = params.set('order', opts.order);
    if (opts.cursor) params = params.set('cursor', opts.cursor);

    const url = `${this.apiUrl}/photos/${encodeURIComponent(photoId)}/comments`;

    return this.http
      .get<PaginatedResult<CommentResponse>>(url, { params })
      .pipe(
        map((res) => ({
          elements: res.elements.map(this.mapDtoToModel),
          cursor: res.cursor,
          hasNext: res.hasNext,
          totalElements: res.totalElements,
          totalPagesCount: res.totalPagesCount,
        }))
      );
  }

  /**
   * Create a new comment.
   * POST /photos/{photoId}/comments
   * body: { authorName, content }
   */
  create(
    photoId: string,
    input: { nickname: string; message: string }
  ): Observable<Comment> {
    const url = `${this.apiUrl}/photos/${encodeURIComponent(photoId)}/comments`;
    const body = {
      authorName: input.nickname,
      content: input.message,
    };

    return this.http
      .post<CommentResponse>(url, body)
      .pipe(map(this.mapDtoToModel));
  }

  // ==== Mapping helpers ====

  private mapDtoToModel = (dto: CommentResponse): Comment => ({
    commentId: dto.commentId,
    photoId: dto.photoId,
    authorName: dto.authorName,
    content: dto.content,
    createdAt: DateTime.fromISO(dto.createdAt),
  });
}
