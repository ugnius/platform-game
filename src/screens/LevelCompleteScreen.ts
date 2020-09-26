import { IScreen } from '../IScreen';
import { levels } from '../levels';
import { Screen } from '../Screen';
import { PlatformScreen } from './LevelScreen';
import { LevelSelectScreen } from './LevelSelectScreen';


export class LevelCompleteScreen extends Screen {

	levelNo: number
	time: number
	activeItem: number = 0

	constructor(screens: IScreen[], levelNo: number, time: number) {
		super(screens)
		this.transparent = true
		this.levelNo = levelNo
		this.time = time
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
			case 'up': 
				this.activeItem = (this.activeItem + 2) % 3
				break
			case 'down': 
				this.activeItem = (this.activeItem + 1) % 3
				break
			case 'select':
				if (this.activeItem === 0) {
					this.handleAction('nextLevel')
				}
				if (this.activeItem === 1) {
					this.handleAction('selectLevel')
				}
				if (this.activeItem === 2) {
					this.handleAction('restart')
				}
				break
			case 'nextLevel':
				this.screens.shift()
				this.screens.shift()
				console.log(this.levelNo)
				this.screens.push(new PlatformScreen(this.screens, ((this.levelNo) % Object.keys(levels).length) + 1))
				break
			case 'selectLevel':
				this.screens.shift()
				this.screens.shift()
				this.screens.push(new LevelSelectScreen(this.screens))
				break
			case 'restart':
				this.screens.shift()
				this.screens.shift()
				this.screens.push(new PlatformScreen(this.screens, this.levelNo))
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

		context.fillStyle = '#1119'
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		this.renderText(context, `Level completed`, 1, '#eee', 0.3, 0.3)
		
		const time = ('00' + Math.floor(this.time / 60)).substr(-2)
		+ ':' + ('00' + Math.floor(this.time % 60)).substr(-2)
		this.renderText(context, time, 0.5, '#eee', 1.2, 0.3)

		this.renderText(context, `Next level`, 0.7, this.activeItem === 0 ? '#eee' : '#bbb', 0.3, 0.4)
		this.renderText(context, `Select level`, 0.7, this.activeItem === 1 ? '#eee' : '#bbb', 0.3, 0.47)
		this.renderText(context, `Restart level`, 0.7, this.activeItem === 2 ? '#eee' : '#bbb', 0.3, 0.54)
	}
}
