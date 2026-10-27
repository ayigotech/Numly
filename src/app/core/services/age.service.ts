import { Injectable } from '@angular/core';

const STORAGE_KEY = 'numly:age';

@Injectable({ providedIn: 'root' })
export class AgeService {
  getAge(): number | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  setAge(age: number): void {
    localStorage.setItem(STORAGE_KEY, age.toString());
  }

  clearAge(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}