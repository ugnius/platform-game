import { BlocksGameScreen } from './BlocksGameScreen';
import { IScreen } from '../IScreen';
import { Screen } from '../Screen';


export class BlocksGameOverScreen extends Screen {

	score: number

	constructor(screens: IScreen[], score: number) {
		super(screens)
		this.score = score
		this.transparent = true
	}

	handleKeyDown(event: KeyboardEvent) {
		const actionByKey: { [key: string]: string } = {
			Enter: 'start',
		}
		const action = actionByKey[event.code] || ''
		if (action) { this.handleAction(action) }
	}

	handleGamepadClick(code: string) {
		const actionByCode: { [key: string]: string } = {
			Start: 'start',
			A: 'start',
		}
		const action = actionByCode[code] || ''
		if (action) { this.handleAction(action) }
	}

	handleClick(event: MouseEvent) {
		this.handleAction('start')
	}

	handleAction(action: string) {
		if (action === 'start') {
			this.screens.pop()
			this.screens.pop()
			this.screens.push(new BlocksGameScreen(this.screens))
		}
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		context.fillStyle = '#1119'
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = '#eee'
		context.font = '50px Arial';
		context.fillText(`Game over`,
			canvas.width / 2 - context.measureText(`Game over`).width / 2, 100)

		context.font = '20px Arial';
		context.fillText(`Your score is`,
			canvas.width / 2 - context.measureText(`Your score is`).width / 2, 160)

		context.font = '40px Arial';
		context.fillText(`${this.score}`,
			canvas.width / 2 - context.measureText(`${this.score}`).width / 2, 200)

		context.font = '20px Arial';
		context.fillText(`Click to start new game`,
			canvas.width / 2 - context.measureText(`Click to start new game`).width / 2, 350)
	}

}