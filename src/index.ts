
import { addJoystickCLickListener } from './helpers'
import { IScreen } from './IScreen'
import { LevelSelectScreen } from './screens/LevelSelectScreen'

console.info('Platform game by Ugnius Kavaliauskas 2020 https://github.com/ugnius/platform-game')
let canvas: HTMLCanvasElement
let context: CanvasRenderingContext2D
const scale = Math.random() > 0.5 ? 0.5 : 1

let screens: IScreen[] = []

init()

function init() {
	const _canvas = document.getElementById('main-canvas') as HTMLCanvasElement | null
	if (!_canvas) { alert('Can not get canvas element'); return }
	canvas = _canvas
	const _context = canvas.getContext('2d')
	if (!_context) { alert('Can not get canvas context'); return }
	context = _context

	function resize() {
		canvas.width = Math.floor(window.innerWidth * scale)
		canvas.height = Math.floor(window.innerHeight * scale)
		canvas.style.width = Math.floor(canvas.width / scale) + 'px'
		canvas.style.height = Math.floor(canvas.height / scale) + 'px'
	}

	resize()
	window.addEventListener('resize', resize)

	screens.push(new LevelSelectScreen(screens))

	const topScreen = () => screens[screens.length - 1]

	window.addEventListener('keydown', (event: KeyboardEvent) => topScreen().handleKeyDown(event))
	canvas.addEventListener('click', (event: MouseEvent) => topScreen().handleClick(event))

	addJoystickCLickListener((code: string) => topScreen().handleGamepadClick(code))
	
	window.requestAnimationFrame(tick)
}



let lastUpdate = Date.now()

function tick() {

	const now = Date.now()
	const dt = Math.min((now - lastUpdate) * 0.001, 1)
	lastUpdate = now

	for (const screen of screens) {
		screen.update(dt, screen === screens[screens.length - 1])
	}

	let lastNonTransparentScreenIndex = 0
	for (let i = screens.length - 1; i >= 0; i--) {
		lastNonTransparentScreenIndex = i
		if (!screens[i].transparent) {
			break;
		}
	}
	for (let i = lastNonTransparentScreenIndex; i < screens.length; i++) {
		screens[i].render(canvas, context, scale)
	}

	window.requestAnimationFrame(tick)
}
