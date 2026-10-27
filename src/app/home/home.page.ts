import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AgeService } from '../core/services/age.service';
import { SkillsService, Skill } from '../core/services/skills.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, CommonModule],
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private ageService = inject(AgeService);
  private skillsService = inject(SkillsService);
  private cdr = inject(ChangeDetectorRef);

  age: number | null = null;
  skills: Skill[] = [];
  loading = true;

  ngOnInit() {
    this.age = this.ageService.getAge();
    if (this.age === null) {
      this.router.navigateByUrl('/age', { replaceUrl: true });
      return;
    }
    this.skillsService.getForAge(this.age).subscribe((skills) => {
      this.skills = skills;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  changeAge() {
    this.ageService.clearAge();
    this.router.navigateByUrl('/age', { replaceUrl: true });
  }

  openSkill(skill: Skill) {
    this.router.navigateByUrl(skill.route);
  }
}