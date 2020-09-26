

export interface IScreen {
  handleKeyDown(event: KeyboardEvent): void
  handleClick(event: MouseEvent): void
  handleGamepadClick(code: string): void
  handleAction(action: string): void
  update(dt: number, top: boolean): void
  render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, scale: number): void
  transparent: boolean
}