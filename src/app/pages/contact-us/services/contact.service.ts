import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl =
    'https://kkcb4d0m88.execute-api.eu-west-1.amazonaws.com/prod/api/contact';

  constructor(private http: HttpClient) {}

  sendContactForm(data: ContactFormDTO): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
