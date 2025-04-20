import { Injectable } from '@angular/core';
import { DateModel } from '../pages/our-story/models/date.models';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }

  formatDate(date?: DateModel): string {
    if (!date) return '';
    const parts: string[] = [];
    if (date.day) parts.push(date.day.toString().padStart(2, '0'));
    if (date.month) parts.push(date.month.toString().padStart(2, '0'));
    parts.push(date.year.toString());
    return parts.join('/');
  }

}
