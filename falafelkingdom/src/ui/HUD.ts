export class HUD {
  private root: HTMLElement;
  private hummusEl!: HTMLElement;
  private promptEl!: HTMLElement;
  private messageEl!: HTMLElement;
  private zoneEl!: HTMLElement;
  private msgTimer = 0;

  constructor() {
    this.root = document.getElementById('hud')!;
    this.buildDOM();
  }

  private buildDOM(): void {
    this.root.innerHTML = `
      <div id="hud-zone" style="position:absolute;top:16px;left:50%;transform:translateX(-50%);
        color:#fff;font:bold 18px sans-serif;text-shadow:1px 1px 3px #000;"></div>
      <div id="hud-hummus" style="position:absolute;top:16px;left:16px;
        color:#fff;font:bold 20px sans-serif;text-shadow:1px 1px 3px #000;"></div>
      <div id="hud-prompt" style="position:absolute;bottom:120px;left:50%;transform:translateX(-50%);
        color:#fff;font:16px sans-serif;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:8px;
        display:none;pointer-events:none;text-align:center;max-width:80vw;"></div>
      <div id="hud-message" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        color:#fff;font:bold 22px sans-serif;background:rgba(0,0,0,0.7);padding:12px 24px;
        border-radius:10px;display:none;pointer-events:none;text-align:center;max-width:80vw;"></div>
    `;
    this.hummusEl = document.getElementById('hud-hummus')!;
    this.promptEl = document.getElementById('hud-prompt')!;
    this.messageEl = document.getElementById('hud-message')!;
    this.zoneEl = document.getElementById('hud-zone')!;
  }

  update(dt: number): void {
    if (this.msgTimer > 0) {
      this.msgTimer -= dt;
      if (this.msgTimer <= 0) this.messageEl.style.display = 'none';
    }
  }

  setHummus(n: number, cap: number): void {
    this.hummusEl.textContent = `🧆 ${n} / ${cap}`;
  }

  showPrompt(text: string): void {
    this.promptEl.textContent = text;
    this.promptEl.style.display = 'block';
  }

  hidePrompt(): void {
    this.promptEl.style.display = 'none';
  }

  showMessage(text: string, duration = 2): void {
    this.messageEl.textContent = text;
    this.messageEl.style.display = 'block';
    this.msgTimer = duration;
  }

  setZone(name: string): void {
    this.zoneEl.textContent = name;
  }
}
