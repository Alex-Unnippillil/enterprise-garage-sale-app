export type GamepadProfile = Record<number, string>;

export const DEFAULT_PROFILE: GamepadProfile = {
  0: 'buttonA',
  1: 'buttonB',
  2: 'buttonX',
  3: 'buttonY',
  4: 'bumperLeft',
  5: 'bumperRight',
  6: 'triggerLeft',
  7: 'triggerRight',
  8: 'select',
  9: 'start',
  10: 'stickLeft',
  11: 'stickRight',
  12: 'dpadUp',
  13: 'dpadDown',
  14: 'dpadLeft',
  15: 'dpadRight',
  16: 'home',
};

export class GamepadInput {
  private emitter = new EventTarget();
  private profile: GamepadProfile;
  private prevButtons: Record<number, boolean> = {};
  private rafId?: number;

  constructor(profile: GamepadProfile = DEFAULT_PROFILE) {
    this.profile = profile;
  }

  start() {
    const loop = () => {
      const pads = navigator.getGamepads();
      for (const pad of pads) {
        if (!pad) continue;
        pad.buttons.forEach((btn, idx) => {
          const pressed = btn.pressed;
          const prev = this.prevButtons[idx];
          if (pressed && !prev) {
            const action = this.profile[idx];
            if (action) {
              this.emitter.dispatchEvent(new Event(action));
              if (pad.vibrationActuator) {
                void pad.vibrationActuator.playEffect('dual-rumble', {
                  duration: 50,
                  strongMagnitude: 1.0,
                  weakMagnitude: 1.0,
                });
              }
            }
          }
          this.prevButtons[idx] = pressed;
        });
      }
      this.rafId = window.requestAnimationFrame(loop);
    };
    this.rafId = window.requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  on(action: string, handler: EventListener) {
    this.emitter.addEventListener(action, handler);
  }

  off(action: string, handler: EventListener) {
    this.emitter.removeEventListener(action, handler);
  }

  remap(profile: GamepadProfile) {
    this.profile = profile;
  }

  getProfile() {
    return this.profile;
  }
}
