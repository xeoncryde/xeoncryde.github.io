export class Input {
  left = false;
  right = false;
  jump = false;
  interact = false;
  private _jumpPressed = false;
  private _interactPressed = false;

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    this.setupTouchControls(canvas);
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA': this.left = down; break;
      case 'ArrowRight': case 'KeyD': this.right = down; break;
      case 'Space': case 'KeyW': case 'ArrowUp':
        if (down && !this.jump) this._jumpPressed = true;
        this.jump = down;
        break;
      case 'KeyE':
        if (down && !this.interact) this._interactPressed = true;
        this.interact = down;
        break;
    }
  }

  get jumpPressed(): boolean { return this._jumpPressed; }
  get interactPressed(): boolean { return this._interactPressed; }

  consumeJump(): void { this._jumpPressed = false; }
  consumeInteract(): void { this._interactPressed = false; }

  private setupTouchControls(_canvas: HTMLCanvasElement): void {
    const style = `
      position:fixed; width:70px; height:70px; border-radius:50%;
      background:rgba(255,255,255,0.25); border:2px solid rgba(255,255,255,0.5);
      display:flex; align-items:center; justify-content:center;
      font-size:28px; user-select:none; touch-action:none; pointer-events:auto;
      z-index:1000;
    `;
    const makeBtn = (label: string, bottom: string, left: string | null, right: string | null) => {
      const btn = document.createElement('div');
      btn.style.cssText = style + `bottom:${bottom};` + (left ? `left:${left};` : `right:${right};`);
      btn.textContent = label;
      document.body.appendChild(btn);
      return btn;
    };

    const btnLeft = makeBtn('◀', '90px', '20px', null);
    const btnRight = makeBtn('▶', '90px', '110px', null);
    const btnJump = makeBtn('⬆', '90px', null, '110px');
    const btnInteract = makeBtn('🤝', '90px', null, '20px');

    const setFlag = (flag: 'left'|'right'|'jump'|'interact', down: boolean) => {
      if (flag === 'jump') {
        if (down && !this.jump) this._jumpPressed = true;
      }
      if (flag === 'interact') {
        if (down && !this.interact) this._interactPressed = true;
      }
      (this as Record<string, unknown>)[flag] = down;
    };

    const bind = (el: HTMLElement, flag: 'left'|'right'|'jump'|'interact') => {
      el.addEventListener('touchstart', e => { e.preventDefault(); setFlag(flag, true); }, { passive: false });
      el.addEventListener('touchend', e => { e.preventDefault(); setFlag(flag, false); }, { passive: false });
    };

    bind(btnLeft, 'left');
    bind(btnRight, 'right');
    bind(btnJump, 'jump');
    bind(btnInteract, 'interact');
  }
}
