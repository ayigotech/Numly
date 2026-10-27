import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import confetti from 'canvas-confetti';
import { Howl } from 'howler';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  imports: [IonContent, CommonModule],
})
export class SplashPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  numbers: number[] = [];
  swappingIndices: number[] = [];
  cardColors: string[] = [];
  isSorted = false;

  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit() {
    this.numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    this.cardColors = this.numbers.map(() => '#ffffff');
    console.log('Shuffled:', this.numbers);
    this.runSortAnimation();
  }

  ngOnDestroy() {
    this.timers.forEach((t) => clearTimeout(t));
  }

  skip() {
    this.timers.forEach((t) => clearTimeout(t));
    this.router.navigateByUrl('/age', { replaceUrl: true });
  }

  isSwapping(index: number): boolean {
    return this.swappingIndices.includes(index);
  }

  private shuffle(arr: number[]): number[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    if (copy.every((v, i) => v === i + 1)) {
      return this.shuffle(arr);
    }
    return copy;
  }



  private runSortAnimation() {
  const arr = [...this.numbers];
  const n = arr.length;

  type SwapStep = { a: number; b: number };
  const steps: SwapStep[] = [];

  const temp = [...arr];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (temp[j] > temp[j + 1]) {
        steps.push({ a: j, b: j + 1 });
        [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
      }
    }
  }

  const stepDelay = 700;
  let delay = 1000;

  const palette = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#8338ec', '#ff9f1c'];

  steps.forEach((step) => {
    // Highlight + random colors
    this.timers.push(
      setTimeout(() => {
        this.swappingIndices = [step.a, step.b];

        const colorCopy = [...this.cardColors];
        colorCopy[step.a] = palette[Math.floor(Math.random() * palette.length)];
        colorCopy[step.b] = palette[Math.floor(Math.random() * palette.length)];
        this.cardColors = colorCopy;

        // Play the lower number in the pair
    const smaller = Math.min(this.numbers[step.a], this.numbers[step.b]);
    this.playNumber(smaller);

        this.cdr.markForCheck();
      }, delay)
    );

    // Swap + reset colors
    this.timers.push(
      setTimeout(() => {
        const copy = [...this.numbers];
        [copy[step.a], copy[step.b]] = [copy[step.b], copy[step.a]];
        this.numbers = copy;

        const colorCopy = [...this.cardColors];
        colorCopy[step.a] = '#ffffff';
        colorCopy[step.b] = '#ffffff';
        this.cardColors = colorCopy;

        this.swappingIndices = [];
        this.cdr.markForCheck();
      }, delay + 350)
    );

    delay += stepDelay;
  });

  // Complete
  this.timers.push(
    setTimeout(() => {
      this.isSorted = true;
      this.fireConfetti();
      this.speakPraise();   
      this.cdr.markForCheck();
    }, delay + 400)
  );

  // Navigate
  this.timers.push(
    setTimeout(() => this.router.navigateByUrl('/age', { replaceUrl: true }), delay + 3000)
  );
}


  private fireConfetti() {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7bd389', '#a0e7a0', '#c8f7c5', '#ffd166', '#ef476f'],
    });
  }


  private playNumber(n: number) {
  const sound = new Howl({
    src: [`assets/audio/${n}.mp3`],
    volume: 0.8,
    onloaderror: () => {
      // Silently skip if file doesn't exist yet
    },
  });
  sound.play();
}

private speakPraise() {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance('Well done!');
  utter.rate = 0.9;
  utter.pitch = 1.2;
  window.speechSynthesis.speak(utter);
}
}