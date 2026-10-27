import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

export interface Skill {
  id: string;
  title: string;
  description: string;
  ageMin: number;
  ageMax: number;
  image: string;
  color: string;
  route: string;
}

interface SkillsFile {
  skills: Skill[];
}

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private http = inject(HttpClient);

  private allSkills$: Observable<Skill[]> = this.http
    .get<SkillsFile>('assets/skills.json')
    .pipe(
      map((file) => file.skills),
      shareReplay(1)
    );

  getAll(): Observable<Skill[]> {
    return this.allSkills$;
  }

  getForAge(age: number): Observable<Skill[]> {
    return this.allSkills$.pipe(
      map((skills) => skills.filter((s) => age >= s.ageMin && age <= s.ageMax))
    );
  }

  getById(id: string): Observable<Skill | undefined> {
    return this.allSkills$.pipe(
      map((skills) => skills.find((s) => s.id === id))
    );
  }
}