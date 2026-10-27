import { Injectable, OnDestroy } from '@angular/core';
import { Howl } from 'howler';

@Injectable({ providedIn: 'root' })
export class AudioService implements OnDestroy {
  private bgMusic?: Howl;
  private bgKey?: string;
  private cache = new Map<string, Howl>();
  private muted = false;

  // ---------- Background music ----------

  playBackground(key: string, src: string, volume = 0.2) {
    if (this.muted) return;

    // If the same track is already playing, do nothing
    if (this.bgKey === key && this.bgMusic && this.bgMusic.playing()) {
      return;
    }

    this.stopBackground();

    const music = new Howl({
      src: [src],
      loop: true,
      volume,
      html5: false,
      onloaderror: (_id, err) => console.error(`[Audio] bg load failed: ${src}`, err),
    });

    music.play();
    this.bgMusic = music;
    this.bgKey = key;
  }

  stopBackground(fadeMs = 300) {
    if (!this.bgMusic) return;

    const music = this.bgMusic;
    const currentVolume = music.volume() as number;

    if (fadeMs > 0) {
      music.fade(currentVolume, 0, fadeMs);
      setTimeout(() => {
        music.stop();
        music.unload();
      }, fadeMs + 50);
    } else {
      music.stop();
      music.unload();
    }

    this.bgMusic = undefined;
    this.bgKey = undefined;
  }

  // ---------- One-shot sound effects ----------

  play(src: string, volume = 0.6) {
    if (this.muted) return;

    let sound = this.cache.get(src);

    if (!sound) {
      sound = new Howl({
        src: [src],
        volume,
        preload: true,
        onloaderror: (_id, err) => console.error(`[Audio] sfx load failed: ${src}`, err),
      });
      this.cache.set(src, sound);
    }

    sound.volume(volume);
    sound.play();
  }

  // ---------- Global mute ----------

  setMuted(value: boolean) {
    this.muted = value;
    if (value) {
      this.stopBackground(150);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  // ---------- Cleanup ----------

  ngOnDestroy() {
    this.stopBackground(0);
    this.cache.forEach((sound) => sound.unload());
    this.cache.clear();
  }
}