import { BlocksGameOverScreen } from './BlocksGameOverScreen';
import { BlocksPauseScreen } from './BlocksPauseScreen';
import { IScreen } from '../IScreen';
import { Screen } from '../Screen';

const gridWidth = 10
const gridHeight = 20

const shapes = new Int8Array([
	// rotations 0, 1, 2, 3
	// none
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	// triangle
	0, 1, 0, 0,  0, 1, 0, 0,  0, 0, 0, 0,  0, 1, 0, 0,
	1, 1, 1, 0,  0, 1, 1, 0,  1, 1, 1, 0,  1, 1, 0, 0,
	0, 0, 0, 0,  0, 1, 0, 0,  0, 1, 0, 0,  0, 1, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	// Z
	1, 1, 0, 0,  0, 0, 1, 0,  1, 1, 0, 0,  0, 0, 1, 0,
	0, 1, 1, 0,  0, 1, 1, 0,  0, 1, 1, 0,  0, 1, 1, 0,
	0, 0, 0, 0,  0, 1, 0, 0,  0, 0, 0, 0,  0, 1, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	// S
	0, 1, 1, 0,  0, 1, 0, 0,  0, 1, 1, 0,  0, 1, 0, 0,
	1, 1, 0, 0,  0, 1, 1, 0,  1, 1, 0, 0,  0, 1, 1, 0,
	0, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	// L
	0, 0, 1, 0,  0, 1, 0, 0,  0, 0, 0, 0,  1, 1, 0, 0,
	1, 1, 1, 0,  0, 1, 0, 0,  1, 1, 1, 0,  0, 1, 0, 0,
	0, 0, 0, 0,  0, 1, 1, 0,  1, 0, 0, 0,  0, 1, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	// reverse L
	1, 0, 0, 0,  0, 1, 1, 0,  0, 0, 0, 0,  0, 1, 0, 0,
	1, 1, 1, 0,  0, 1, 0, 0,  1, 1, 1, 0,  0, 1, 0, 0,
	0, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  1, 1, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	// long
	1, 1, 1, 1,  1, 0, 0, 0,  1, 1, 1, 1,  1, 0, 0, 0,
	0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,
	0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,
	0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,
	// box
	0, 1, 1, 0,  0, 1, 1, 0,  0, 1, 1, 0,  0, 1, 1, 0,
	0, 1, 1, 0,  0, 1, 1, 0,  0, 1, 1, 0,  0, 1, 1, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
	0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
])

const shapeColors = [
	'#000000',
	'#EF476F',
	'#F78C6B',
	'#FFD166',
	'#83D483',
	'#06D6A0',
	'#118AB2',
	'#073B4C',
]

const fallTimeByLevel = [1000, 800, 600, 400]

export class BlocksGameScreen extends Screen {

	grid: Int8Array
	timeToFall: number
	nextShape: number
	currentShape: number
	shapeX: number
	shapeY: number
	shapeRotation: number
	level: number
	score: number
	blocksPlaced: number

	constructor(screens: IScreen[]) {
		super(screens)

		this.grid = new Int8Array(gridWidth * gridHeight)
		this.nextShape = ((Math.random() * 7) | 0) + 1
		this.score = 0
		this.blocksPlaced = 0
		this.level = 0
		this.timeToFall = fallTimeByLevel[this.level]

		this.addShape()
	}


	handleKeyDown(event: KeyboardEvent) {
		const actionByKey: { [key: string]: string } = {
			ArrowLeft: 'left',
			ArrowRight: 'right',
			ArrowDown: 'down',
			ArrowUp: 'rotate',
			KeyA: 'left',
			KeyD: 'right',
			KeyS: 'down',
			KeyW: 'rotate',
			Escape: 'pause',
			Enter: 'pause',
		}
		const action = actionByKey[event.code] || ''
		if (action) { this.handleAction(action) }
	}

	handleGamepadClick(code: string) {
		const actionByCode: { [key: string]: string } = {
			Left: 'left',
			Right: 'right',
			Down: 'down',
			A: 'rotate',
			LB: 'rotateBack',
			RB: 'rotate',
			Start: 'pause',
		}
		const action = actionByCode[code] || ''
		if (action) { this.handleAction(action) }
	}

	handleClick(event: MouseEvent) {
		this.handleAction('pause')
	}

	handleAction(action: string) {
		if (action === 'left') {
			this.moveShape(-1, 0)
		}
		if (action === 'right') {
			this.moveShape(1, 0)
		}
		if (action === 'down') {
			this.timeToFall = fallTimeByLevel[this.level]
			this.score += this.level + 1
			this.moveShape(0, 1)
		}
		if (action === 'rotate') {
			this.rotateShape(1)
		}
		if (action === 'rotateBack') {
			this.rotateShape(-1)
		}
		if (action === 'pause') {
			this.screens.push(new BlocksPauseScreen(this.screens))
		}
	}

	update(dt: number, top: boolean) {
		if (!top) { return }

		this.timeToFall -= dt
		if (this.timeToFall < 0) {
			this.moveShape(0, 1)
			this.timeToFall = fallTimeByLevel[this.level]
		}	
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		context.fillStyle = '#eee'
		context.fillRect(0, 0, canvas.width, canvas.height);

		const cellSize = 20
		const startX = 20
		const startY = 20
	
		context.fillStyle = '#111'
		context.strokeRect(
			startX, startY, gridWidth * cellSize, gridHeight * cellSize
		)
	
		for (let x = 0; x < gridWidth; x++) {
			for (let y = 0; y < gridHeight; y++) {
				const cell = this.grid[x + y * gridWidth]
				const shape = this.getCellShape(cell)
				if (shape === 0) { continue; }
	
				context.fillStyle = '#111'
				context.strokeRect(
					startX + (x * cellSize),
					startY + (y * cellSize),
					cellSize,
					cellSize
				)
	
				context.fillStyle = shapeColors[shape] || shapeColors[0]
				context.fillRect(
					startX + (x * cellSize) + 1,
					startY + (y * cellSize) + 1,
					cellSize - 2,
					cellSize - 2
				)
			}
		}

		const scoreX = 250
		const scoreY = 40
		
		context.fillStyle = '#111'
		context.font = '20px Arial';
		context.fillText(`Score`, scoreX - 10, scoreY)
		context.fillText(this.score.toString(), scoreX - 10, scoreY + 30)

		const nextShapeX = 250
		const nextShapeY = 130

		context.fillStyle = '#111'
		context.font = '20px Arial';
		context.fillText(`Next shape`, nextShapeX - 10, nextShapeY - 20)

		for (let x = 0; x < 4; x++) {
			for (let y = 0; y < 4; y++) {
				const shapeCell = shapes[x + y * 16 + this.nextShape * 64]
				if (!shapeCell) { continue }
				
				context.fillStyle = '#111'
				context.strokeRect(
					nextShapeX + (x * cellSize),
					nextShapeY + (y * cellSize),
					cellSize,
					cellSize
				)
	
				context.fillStyle = shapeColors[this.nextShape] || shapeColors[0]
				context.fillRect(
					nextShapeX + (x * cellSize) + 1,
					nextShapeY + (y * cellSize) + 1,
					cellSize - 2,
					cellSize - 2
				)
			}
		}
	}

	isCellActive(cell: number): boolean {
		return !!(cell & 1)
	}
	
	getCellShape(cell: number): number {
		return cell >> 1
	}

	addShape() {
		let wasPlaceEmpty = true
		const startX = gridWidth / 2 - 2
		const startY = 0
		const shape = this.nextShape || ((Math.random() * 7) | 0) + 1
		this.nextShape = ((Math.random() * 7) | 0) + 1
		for (let x = 0; x < 4; x++) {
			for (let y = 0; y < 2; y++) {
				const cellShape = this.getCellShape(this.grid[startX + x + (startY + y) * gridWidth])
				if (cellShape) { wasPlaceEmpty = false }
				if (shapes[x + y * 16 + shape * 64]) {
					this.grid[startX + x + (startY + y) * gridWidth] = (shape << 1) | 1
				}
			}
		}
		this.currentShape = shape
		this.shapeX = startX
		this.shapeY = startY
		this.shapeRotation = 0

		if (!wasPlaceEmpty) {
		  this.screens.push(new BlocksGameOverScreen(this.screens, this.score))
		}
	}

	canShapeMove(dx: number, dy: number) {
		for (let x = 0; x < gridWidth; x++) {
			for (let y = gridHeight - 1; y >= 0; y--) {
				const cell = this.grid[x + y * gridWidth]
				if (this.isCellActive(cell)) {
					if (dy > 0 && y + dy >= gridHeight) { return false } 
					if (dx > 0 && x + dx >= gridWidth) { return false } 
					if (dx < 0 && x + dx < 0) { return false }
					const dCell =	this.grid[x + dx + (y + dy) * gridWidth]
					if (this.getCellShape(dCell) && !this.isCellActive(dCell)) { return false }
				}
			}
		}
		return true
	}

	placeShape() {
		for (let x = 0; x < gridWidth; x++) {
			for (let y = gridHeight - 1; y >= 0; y--) {
				const cell = this.grid[x + y * gridWidth]
				if (this.isCellActive(cell)) {
					this.grid[x + y * gridWidth] = cell & 0b11111110
				}
			}
		}
	}


	clearCompletedLines() {
		let linesCleared = 0;
		for (let y = 0; y < gridHeight; y++) {
			let lineComplete = true
			for (let x = 0; x < gridWidth; x++) {
				if (!this.grid[x + y * gridWidth]) {
					lineComplete = false
					break;
				}
			}
			if (lineComplete) {
				for (let dy = y; dy > 0; dy--) {
					for (let x = 0; x < gridWidth; x++) {
						this.grid[x + dy * gridWidth] = this.grid[x + (dy - 1) * gridWidth]
					}
				}
				linesCleared++
			}
		}
		this.score += [0, 50, 150, 350, 1000][linesCleared] * (this.level + 1)
	}


	moveShape(dx: number, dy: number) {
		let canMove = this.canShapeMove(dx, dy)
	
		if (canMove) {
			for (let x = dx > 0 ? gridWidth - 1 : 0; x !== (dx > 0 ? -1 : gridWidth); x += (dx > 0 ? -1 : 1)) {
				for (let y = gridHeight - 1; y >= 0; y--) {
					const cell = this.grid[x + y * gridWidth]
					if (this.isCellActive(cell)) {
						this.grid[x + dx + (y + dy) * gridWidth] = cell
						this.grid[x + y * gridWidth] = 0
					}
				}
			}
			this.shapeX += dx
			this.shapeY += dy
		}
		if (!canMove && dy > 0) {
			this.placeShape()
			this.clearCompletedLines()
			this.blocksPlaced++
			this.level = Math.min(Math.floor(this.blocksPlaced / 50), 3)
			this.addShape()
		}
	}

	canShapeRotate(rotation: number): boolean {
		for (let x = 0; x < 4; x++) {
			for (let y = 0; y < 4; y++) {
				const shapeCell = shapes[x + rotation * 4 + y * 16 + this.currentShape * 64]
				if (shapeCell) {
					const rx = this.shapeX + x
					const ry = this.shapeY + y
					if (ry >= gridHeight) { return false } 
					if (rx >= gridWidth) { return false } 
					if (rx < 0) { return false }
					const cell = this.grid[rx + ry * gridWidth]
					if (this.getCellShape(cell) && !this.isCellActive(cell)) { return false }
				}
			}
		}

		return true
	}


	rotateShape(dr: number) {

		const rotation = (this.shapeRotation + dr + 4) % 4
		if (this.canShapeRotate(rotation)) {
			// clear current shape
			for (let x = 0; x < 4; x++) {
				for (let y = 0; y < 4; y++) {
					const shapeCell = shapes[x + this.shapeRotation * 4 + y * 16 + this.currentShape * 64]
					if (shapeCell) {
						const rx = this.shapeX + x
						const ry = this.shapeY + y
						this.grid[rx + ry * gridWidth] = 0;
					}
				}
			}

			// add rotated shape
			for (let x = 0; x < 4; x++) {
				for (let y = 0; y < 4; y++) {
					const shapeCell = shapes[x + rotation * 4 + y * 16 + this.currentShape * 64]
					if (shapeCell) {
						const rx = this.shapeX + x
						const ry = this.shapeY + y
						this.grid[rx + ry * gridWidth] = (this.currentShape << 1) | 1
					}
				}
			}

			this.shapeRotation = rotation
		}
	}

}