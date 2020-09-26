import { IScreen } from '../IScreen';
import { levels } from '../levels';
import { Screen } from '../Screen';
import { PlatformScreen } from './LevelScreen';


export class LevelSelectScreen extends Screen {

	activeItem: number = 0

	constructor(screens: IScreen[]) {
		super(screens)
	}

	handleKeyDown(event: KeyboardEvent) {
		const actionByKey: { [key: string]: string } = {
			Enter: 'select',
			Space: 'select',
			KeyS: 'down',
			KeyW: 'up',
			ArrowDown: 'down',
			ArrowUp: 'up',
		}
		const action = actionByKey[event.code] || ''
		if (action) { this.handleAction(action) }
	}

	handleClick(event: MouseEvent) {
		// this.handleAction('unpause')
	}

	handleGamepadClick(code: string) {
		// const actionByCode: { [key: string]: string } = {
		// 	Start: 'unpause',
		// }
		// const action = actionByCode[code] || ''
		// if (action) { this.handleAction(action) }
	}

	handleAction(action: string) {
		switch (action) {
			case 'down': 
				this.activeItem = (this.activeItem + 1) % Object.keys(levels).length
				break
			case 'up': 
				this.activeItem = (this.activeItem - 1 + Object.keys(levels).length) % Object.keys(levels).length
				break
			case 'select':
				this.screens.shift()
				this.screens.shift()
				this.screens.push(new PlatformScreen(this.screens, this.activeItem + 1))
				break
		}
	}

	renderText(ctx: CanvasRenderingContext2D, text: string, size: number, color: string, x: number, y: number) {
		const cScale = ctx.canvas.height / 12

		ctx.fillStyle = color
		ctx.font = `${cScale * size}px Arial`;

		if (!x) {
			x = ctx.canvas.width / 2 - ctx.measureText(text).width / 2
		}
		else {
			x *= ctx.canvas.height
		}
		y *= ctx.canvas.height

		ctx.fillText(text, x, y)
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {

		context.fillStyle = '#211F30'
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		this.renderText(context, `Select level`, 1, '#eee', 0.3, 0.3)

		for (const index in levels) {
			this.renderText(context, `Level ${index}`, 0.7, this.activeItem === (Number(index) - 1) ? '#eee' : '#bbb', 0.3, 0.4 + (Number(index) - 1) * 0.07)
		}

	}
}
