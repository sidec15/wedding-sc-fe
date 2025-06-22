import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post(this.apiUrl, data);
  }
}
