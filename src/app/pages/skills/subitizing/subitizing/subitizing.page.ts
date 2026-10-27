import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AudioService } from '../../../../core/services/audio.service';


interface DiceDot {
  cx: number;
  cy: number;
}

@Component({
  selector: 'app-subitizing',
  templateUrl: './subitizing.page.html',
  styleUrls: ['./subitizing.page.scss'],
  imports: [IonContent, CommonModule],
})
export class SubitizingPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private audio = inject(AudioService);

  private readonly patternVariants: Record<number, DiceDot[][]> = {
    1: [
      [{ cx: 50, cy: 50 }],
    ],
    2: [
      [{ cx: 30, cy: 50 }, { cx: 70, cy: 50 }],
      [{ cx: 50, cy: 30 }, { cx: 50, cy: 70 }],
    ],
    3: [
      [{ cx: 30, cy: 30 }, { cx: 50, cy: 50 }, { cx: 70, cy: 70 }],
      [{ cx: 50, cy: 20 }, { cx: 30, cy: 75 }, { cx: 70, cy: 75 }],
    ],
    4: [
      [{ cx: 30, cy: 30 }, { cx: 70, cy: 30 }, { cx: 30, cy: 70 }, { cx: 70, cy: 70 }],
      [{ cx: 50, cy: 20 }, { cx: 25, cy: 70 }, { cx: 50, cy: 70 }, { cx: 75, cy: 70 }],
      [{ cx: 50, cy: 20 }, { cx: 25, cy: 50 }, { cx: 75, cy: 50 }, { cx: 50, cy: 80 }],
    ],
    5: [
      [{ cx: 30, cy: 30 }, { cx: 70, cy: 30 }, { cx: 50, cy: 50 }, { cx: 30, cy: 70 }, { cx: 70, cy: 70 }],
      [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 50, cy: 50 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
      [{ cx: 50, cy: 20 }, { cx: 20, cy: 50 }, { cx: 50, cy: 50 }, { cx: 80, cy: 50 }, { cx: 50, cy: 80 }],
    ],
    6: [
      [{ cx: 30, cy: 25 }, { cx: 70, cy: 25 }, { cx: 30, cy: 50 }, { cx: 70, cy: 50 }, { cx: 30, cy: 75 }, { cx: 70, cy: 75 }],
      [{ cx: 25, cy: 30 }, { cx: 50, cy: 30 }, { cx: 75, cy: 30 }, { cx: 25, cy: 70 }, { cx: 50, cy: 70 }, { cx: 75, cy: 70 }],
      [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 25, cy: 50 }, { cx: 75, cy: 50 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
    ],
    7: [
      [{ cx: 30, cy: 20 }, { cx: 70, cy: 20 }, { cx: 30, cy: 42 }, { cx: 70, cy: 42 }, { cx: 30, cy: 64 }, { cx: 70, cy: 64 }, { cx: 50, cy: 84 }],
      [{ cx: 50, cy: 20 }, { cx: 25, cy: 40 }, { cx: 75, cy: 40 }, { cx: 25, cy: 60 }, { cx: 75, cy: 60 }, { cx: 25, cy: 80 }, { cx: 75, cy: 80 }],
      [{ cx: 25, cy: 25 }, { cx: 50, cy: 25 }, { cx: 75, cy: 25 }, { cx: 25, cy: 50 }, { cx: 75, cy: 50 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
    ],
    8: [
      [{ cx: 25, cy: 20 }, { cx: 50, cy: 20 }, { cx: 75, cy: 20 }, { cx: 25, cy: 45 }, { cx: 75, cy: 45 }, { cx: 25, cy: 70 }, { cx: 50, cy: 70 }, { cx: 75, cy: 70 }],
      [{ cx: 25, cy: 25 }, { cx: 75, cy: 25 }, { cx: 25, cy: 42 }, { cx: 75, cy: 42 }, { cx: 25, cy: 58 }, { cx: 75, cy: 58 }, { cx: 25, cy: 75 }, { cx: 75, cy: 75 }],
      [{ cx: 25, cy: 30 }, { cx: 50, cy: 30 }, { cx: 75, cy: 30 }, { cx: 25, cy: 50 }, { cx: 50, cy: 50 }, { cx: 75, cy: 50 }, { cx: 25, cy: 70 }, { cx: 50, cy: 70 }],
    ],
    9: [
      [{ cx: 25, cy: 20 }, { cx: 50, cy: 20 }, { cx: 75, cy: 20 }, { cx: 25, cy: 45 }, { cx: 50, cy: 45 }, { cx: 75, cy: 45 }, { cx: 25, cy: 70 }, { cx: 50, cy: 70 }, { cx: 75, cy: 70 }],
      [{ cx: 20, cy: 20 }, { cx: 50, cy: 20 }, { cx: 80, cy: 20 }, { cx: 20, cy: 50 }, { cx: 50, cy: 50 }, { cx: 80, cy: 50 }, { cx: 20, cy: 80 }, { cx: 50, cy: 80 }, { cx: 80, cy: 80 }],
    ],
  };

  currentValue = 4;
  currentDots: DiceDot[] = [];
  choices: number[] = [];

  showDots = true;
  answered = false;
  isCorrect = false;
  correctStreak = 0;
  isFinished = false;
  message = '';
  pickedValue: number | null = null;

  // Adaptive state
  private learningTarget = 4;
  private variantIndex = 0;
  private learningRoundCount = 0;
  private passedNumbers: number[] = [];
  private isReviewRound = false;
  private reviewValue = 0;
  dotColor = '#2b6cb0';

  private flashTimer?: ReturnType<typeof setTimeout>;
  private nextTimer?: ReturnType<typeof setTimeout>;
  private idleTimer?: ReturnType<typeof setTimeout>;




  ngOnInit() {
    this.startRound(this.learningTarget);
  }

  ngOnDestroy() {
    if (this.flashTimer) clearTimeout(this.flashTimer);
    if (this.nextTimer) clearTimeout(this.nextTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.audio.stopBackground();
  }

  private startRound(value: number) {
    this.currentValue = value;
    const palette = ['#2b6cb0', '#e63946', '#2a9d8f', '#f4a261', '#8338ec', '#06d6a0'];
    this.dotColor = palette[Math.floor(Math.random() * palette.length)];
    this.currentDots = this.getPattern(value);
    this.choices = this.buildChoices(value);
    this.showDots = true;
    this.answered = false;
    this.isCorrect = false;
    this.pickedValue = null;
    this.message = '';
    this.cdr.markForCheck();

    if (this.flashTimer) clearTimeout(this.flashTimer);
    if (this.idleTimer) clearTimeout(this.idleTimer);

    this.flashTimer = setTimeout(() => {
      this.showDots = false;
      this.cdr.markForCheck();
      this.startIdleTimer();
    }, 4000);
  }

  private getPattern(value: number): DiceDot[] {
    const variants = this.patternVariants[value] ?? [];
    if (variants.length === 0) return [];

    if (this.isReviewRound) {
      // Random variant for review
      return variants[Math.floor(Math.random() * variants.length)];
    }

    // Learning round: cycle through variants by variantIndex
    const idx = this.variantIndex % variants.length;
    return variants[idx];
  }

  private startIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.answered) return;
      this.startRound(this.currentValue);
    }, 5000);
  }

  private buildChoices(correct: number): number[] {
    const set = new Set<number>([correct]);
    const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3];

    for (const c of candidates) {
      if (c >= 1 && c <= 9 && set.size < 4) {
        set.add(c);
      }
    }

    const arr = Array.from(set);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  pick(choice: number) {
    if (this.answered || this.showDots) return;

    this.audio.playBackground(
    'subitizing',
    'assets/audio/subitizing-bg.mp3',
    0.2
  );   // ← add this line

    if (this.idleTimer) clearTimeout(this.idleTimer);

    this.answered = true;
    this.pickedValue = choice;
    this.isCorrect = choice === this.currentValue;

    if (this.isCorrect) {
      this.message = this.isReviewRound ? 'Yes! You remembered! 🎉' : 'Yes! 🎉';
      this.cdr.markForCheck();

      this.nextTimer = setTimeout(() => this.advanceAfterCorrect(), 1500);
    } else {
      this.correctStreak = 0;
      this.message = 'Try again — look closely!';
      this.cdr.markForCheck();

      this.nextTimer = setTimeout(() => {
        if (this.isReviewRound) {
          // Wrong on review → back to learning, no penalty
          this.isReviewRound = false;
          this.startRound(this.learningTarget);
        } else {
          // Wrong on learning → restart same target, same variant
          this.startRound(this.learningTarget);
        }
      }, 2000);
    }
  }

  private advanceAfterCorrect() {
    if (this.isReviewRound) {
      // Done with review, back to learning
      this.isReviewRound = false;
      this.learningRoundCount++;
      this.startRound(this.learningTarget);
      return;
    }

    // Learning round
    this.learningRoundCount++;
    this.correctStreak++;

    const variants = this.patternVariants[this.learningTarget] ?? [];
    const variantsCount = Math.max(variants.length, 1);

    // Every 3rd learning round after the first variant cycle, try a review
    if (
      this.learningRoundCount % 3 === 0 &&
      this.passedNumbers.length > 0 &&
      this.learningRoundCount > variantsCount
    ) {
      this.isReviewRound = true;
      this.reviewValue = this.passedNumbers[
        Math.floor(Math.random() * this.passedNumbers.length)
      ];
      this.startRound(this.reviewValue);
      return;
    }

    // Still cycling variants of the current target?
    this.variantIndex++;
    if (this.variantIndex >= variantsCount) {
      // Passed all variants → advance to next number
      this.variantIndex = 0;
      this.correctStreak = 0;
      this.passedNumbers.push(this.learningTarget);

      if (this.learningTarget >= 9) {
        this.isFinished = true;
        this.message = "Wow! You're a number star! ⭐";
        this.cdr.markForCheck();
        return;
      }

      this.learningTarget++;
      this.startRound(this.learningTarget);
      return;
    }

    this.startRound(this.learningTarget);
  }

  goHome() {
     this.audio.stopBackground();
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }



}