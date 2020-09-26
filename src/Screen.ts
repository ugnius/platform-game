import { IScreen } from "./IScreen";


export class Screen implements IScreen {
	transparent: boolean;
	screens: IScreen[]

	constructor(screens: IScreen[]) {
		this.screens = screens
		this.transparent = false
	}

	handleKeyDown(event: KeyboardEvent) {}
	handleClick(event: MouseEvent) {}
	handleGamepadClick(code: string) {}
	handleAction(action: string) {}
	update(dt: number, top: boolean) {}
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, scale: number) {
		throw new Error('NotImplemented')
	}
}