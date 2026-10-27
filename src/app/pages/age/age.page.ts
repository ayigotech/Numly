import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AgeService } from '../../core/services/age.service';
import { IonHeader } from "@ionic/angular";

@Component({
  selector: 'app-age',
  templateUrl: './age.page.html',
  styleUrls: ['./age.page.scss'],
  imports: [IonHeader, IonContent, CommonModule],
})
export class AgePage {
  private router = inject(Router);
  private ageService = inject(AgeService);

  ages = [4, 5, 6, 7, 8, 9, 10, 11];

  pick(age: number) {
    this.ageService.setAge(age);
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}