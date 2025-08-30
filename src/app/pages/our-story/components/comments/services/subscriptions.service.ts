import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private apiUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}

  /**
   * Subscribe an email to a photo's comment notifications.
   * POST /photos/{photoId}/subscriptions
   * body: { email }
   * Returns: {} (empty object) on success.
   */
  create(photoId: string, email: string, recaptchaToken: string): Observable<void> {
    const url = `${this.apiUrl}/${encodeURIComponent(
      photoId
    )}/subscriptions`;
    return this.http
      .post<Record<string, never>>(url, { email, recaptchaToken })
      .pipe(map(() => void 0));
  }

  /**
   * Unsubscribe an email from a photo's comment notifications.
   * DELETE /photos/{photoId}/subscriptions/{email}
   * Returns: { photoId, email, unsubscribed: true, existed: boolean }
   */
  delete(photoId: string, email: string): Observable<void> {
    const url = `${this.apiUrl}/${encodeURIComponent(
      photoId
    )}/subscriptions/${encodeURIComponent(email)}`;
    return this.http.delete<void>(url);
  }
}
