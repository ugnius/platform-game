import { IScreen } from '../IScreen';
import { Screen } from '../Screen';


export class BlocksPauseScreen extends Screen {

	constructor(screens: IScreen[]) {
		super(screens)
		this.transparent = true
	}

	handleKeyDown(event: KeyboardEvent) {
		const actionByKey: { [key: string]: string } = {
			Escape: 'unpause',
			Enter: 'unpause',
		}
		const action = actionByKey[event.code] || ''
		if (action) { this.handleAction(action) }
	}

	handleClick(event: MouseEvent) {
		this.handleAction('unpause')
	}

	handleGamepadClick(code: string) {
		const actionByCode: { [key: string]: string } = {
			Start: 'unpause',
		}
		const action = actionByCode[code] || ''
		if (action) { this.handleAction(action) }
	}

	handleAction(action: string) {
		if (action === 'unpause') {
			this.screens.pop()
		}
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		context.fillStyle = '#1119'
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = '#eee'
		context.font = '50px Arial';
		context.fillText(`Paused`,
			canvas.width / 2 - context.measureText(`Paused`).width / 2, 200)
	}
}
