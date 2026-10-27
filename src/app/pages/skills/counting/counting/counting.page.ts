import {
  Component, OnInit, OnDestroy, inject,
  ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AudioService } from '../../../../core/services/audio.service';

interface BasketItem {
  id: number;
  row: number;
  col: number;
  emoji: string;
  delay: number;
}

@Component({
  selector: 'app-counting',
  templateUrl: './counting.page.html',
  styleUrls: ['./counting.page.scss'],
  imports: [IonContent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountingPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private audio = inject(AudioService);

  /** Curated, visually distinct emojis — no near-duplicates. */
  private readonly emojiPool = [
    // fruits
    '🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝', '🍍', '🥥',
    // vegetables
    '🥕', '🌽', '🍅', '🥦', '🍆', '🌶️', '🥔', '🧄',
    // animals
    '🐟', '🐢', '🦋', '🐝', '🐞', '🐤', '🦆', '🐸', '🦉', '🐙',
    // objects & toys
    '⭐', '🎈', '⚽', '🧸', '🚗', '🚀', '🎁', '🔔', '🌻', '🍄',
  ];

  private readonly gridFor: Record<number, { rows: number; cols: number }> = {
    5:  { rows: 1, cols: 5 },
    6:  { rows: 2, cols: 3 },
    7:  { rows: 2, cols: 4 },
    8:  { rows: 2, cols: 4 },
    9:  { rows: 2, cols: 5 },
    10: { rows: 2, cols: 5 },
    11: { rows: 3, cols: 4 },
    12: { rows: 3, cols: 4 },
    13: { rows: 3, cols: 5 },
    14: { rows: 3, cols: 5 },
    15: { rows: 3, cols: 5 },
  };

  readonly MIN = 5;
  readonly MAX = 15;
  private readonly ADVANCE_AFTER = 2;
  private readonly CHOICES_DELAY_MS = 1500;

  currentValue = 5;
  items: BasketItem[] = [];
  gridCols = 5;

  choices: number[] = [];
  showChoices = false;
  answered = false;
  isCorrect = false;
  pickedValue: number | null = null;
  message = '';
  isFinished = false;

  private correctStreak = 0;
  private choicesTimer?: ReturnType<typeof setTimeout>;
  private nextTimer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.audio.playBackground('counting', 'assets/audio/counting-bg.mp3', 0.2);
    this.startRound(this.currentValue);
  }

  ngOnDestroy() {
    if (this.choicesTimer) clearTimeout(this.choicesTimer);
    if (this.nextTimer) clearTimeout(this.nextTimer);
  }

  private startRound(value: number) {
    this.currentValue = value;

    const grid = this.gridFor[value] ?? { rows: 2, cols: 5 };
    this.gridCols = grid.cols;

    const totalCells = grid.rows * grid.cols;
    const cellIndices = this.shuffle(
      Array.from({ length: totalCells }, (_, i) => i)
    ).slice(0, value);

    cellIndices.sort((a, b) => a - b);

    const types = this.pickEmojiTypes(Math.min(value, 3 + Math.floor(Math.random() * 3)));

    this.items = cellIndices.map((idx, i) => ({
      id: i,
      row: Math.floor(idx / grid.cols),
      col: idx % grid.cols,
      emoji: types[i % types.length],
      delay: i * 60,
    }));

    this.choices = this.buildChoices(value);
    this.showChoices = false;
    this.answered = false;
    this.isCorrect = false;
    this.pickedValue = null;
    this.message = '';
    this.cdr.markForCheck();

    if (this.choicesTimer) clearTimeout(this.choicesTimer);
    this.choicesTimer = setTimeout(() => {
      this.showChoices = true;
      this.cdr.markForCheck();
    }, this.CHOICES_DELAY_MS);
  }

  private pickEmojiTypes(count: number): string[] {
    const pool = [...this.emojiPool];
    this.shuffle(pool);
    return pool.slice(0, count);
  }

  private buildChoices(correct: number): number[] {
    const set = new Set<number>([correct]);
    const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3, correct - 3];

    for (const c of candidates) {
      if (c >= 1 && c <= this.MAX && set.size < 4) set.add(c);
    }

    const arr = Array.from(set);
    this.shuffle(arr);
    return arr;
  }

  pick(choice: number) {
    if (this.answered || !this.showChoices) return;

    this.answered = true;
    this.pickedValue = choice;
    this.isCorrect = choice === this.currentValue;

    if (this.isCorrect) {
      this.correctStreak++;
      this.message = this.correctStreak >= this.ADVANCE_AFTER
        ? 'Great counting! Let’s try more! 🌟'
        : 'Yes! You counted them all! 🎉';
      this.audio.play('assets/audio/correct.mp3', 0.6);
      this.cdr.markForCheck();

      this.nextTimer = setTimeout(() => this.advance(), 1800);
    } else {
      this.correctStreak = 0;
      this.message = 'Almost! Count again. 👀';
      this.audio.play('assets/audio/wrong.mp3', 0.4);
      this.cdr.markForCheck();

      this.nextTimer = setTimeout(() => this.startRound(this.currentValue), 2500);
    }
  }

  private advance() {
    if (this.correctStreak >= this.ADVANCE_AFTER) {
      this.correctStreak = 0;
      if (this.currentValue >= this.MAX) {
        this.isFinished = true;
        this.cdr.markForCheck();
        return;
      }
      this.currentValue++;
    }
    this.startRound(this.currentValue);
  }

  goHome() {
    this.audio.stopBackground();
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}