import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private summarySource = new BehaviorSubject<boolean>(false);
  currentSummary = this.summarySource.asObservable();

  constructor() {
    const storedState = localStorage.getItem('summaryState');
    if (storedState !== null) {
      this.summarySource.next(JSON.parse(storedState));
    }
  }

  setSummary(value: boolean): void {
    this.summarySource.next(value);
    localStorage.setItem('summaryState', JSON.stringify(value));
  }
}