import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ContactFormDTO {
  name: string;
  surname?: string;
  phone?: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) {}

  sendContactForm(data: ContactFormDTO): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    // // mock loading and success response
    // return of(true).pipe(
    //   delay(4000),
    //   catchError(error => {
    //     console.error('Contact form submission failed', error);
    //     return throwError(() => error);
    //   })
    // );
    return this.http.post(this.apiUrl, data, { headers })
      .pipe(
        catchError(error => {
          console.error('Contact form submission failed', error);
          return throwError(() => error);
        })
      );
  }
}
