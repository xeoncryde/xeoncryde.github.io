export class ResourceSystem {
  hummus = 0;
  cap = 12;
  private baseline = 0;
  onChanged?: (n: number) => void;

  add(amount: number): void {
    this.hummus = Math.min(this.cap, this.hummus + amount);
    this.onChanged?.(this.hummus);
  }

  spend(amount: number): boolean {
    if (this.hummus < amount) return false;
    this.hummus -= amount;
    this.onChanged?.(this.hummus);
    return true;
  }

  setBaseline(n: number): void {
    this.baseline = n;
  }

  restoreToBaseline(): void {
    if (this.hummus < this.baseline) {
      this.hummus = this.baseline;
      this.onChanged?.(this.hummus);
    }
  }
}
