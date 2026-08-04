declare module "spin-wheel" {
  export class Wheel {
    constructor(container: HTMLElement, options: any);
    spinToItem(index: number, duration: number, easing?: boolean, spins?: number, resistance?: number): void;
  }
}
