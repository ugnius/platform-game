import { BlocksGameScreen } from './BlocksGameScreen';
import { IScreen } from '../IScreen';
import { Screen } from '../Screen';


export class WelcomeScreen extends Screen {

	constructor(screens: IScreen[]) {
		super(screens)
	}

	handleKeyDown(event: KeyboardEvent) {
		const actionByKey: { [key: string]: string } = {
			Enter: 'start',
		}
		const action = actionByKey[event.code] || ''
		if (action) { this.handleAction(action) }
	}
	
	handleClick(event: MouseEvent) {
		this.handleAction('start')
	}

	handleGamepadClick(code: string) {
		const actionByCode: { [key: string]: string } = {
			Start: 'start',
			A: 'start',
		}
		const action = actionByCode[code] || ''
		if (action) { this.handleAction(action) }
	}

	handleAction(action: string) {
		if (action === 'start') {
			this.screens.pop()
			this.screens.push(new BlocksGameScreen(this.screens))
		}
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, scale: number) {

		context.fillStyle = '#eee'
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		context.font = `${50 * scale}px Arial`;
		context.fillStyle = '#111'
		context.fillText(`PLATFORM`, canvas.width / 2 - context.measureText(`PLATFORM`).width / 2, 0.3 * canvas.height)
		context.font = `${20 * scale}px Arial`;
		context.fillText(`Click to start`,
			canvas.width / 2 - context.measureText(`Click to start`).width / 2, 0.4 * canvas.height)
	}

}