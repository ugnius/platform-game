
function nukeEvent(event: Event) {
	event.preventDefault && event.preventDefault();
	event.stopPropagation && event.stopPropagation();
	event.cancelBubble = true;
	event.returnValue = false;
	return false;
}

export function useButtonForAction(className: string, handler: () => void) {
	const element = document.getElementsByClassName(className)[0] as HTMLElement
	element.addEventListener('click', (event: MouseEvent) => {
		handler()
		nukeEvent(event)
	})

	let touchTimeout: number
	let touchInterval: number

	element.addEventListener('touchstart', (event: TouchEvent) => {
		handler()
		nukeEvent(event)
		touchTimeout = window.setTimeout(() => {
			touchInterval = window.setInterval(() => {
				handler()
			}, 50)
		}, 300 - 50)
	})
	element.addEventListener('touchend', (event: TouchEvent) => {
		nukeEvent(event)
		clearTimeout(touchTimeout)
		clearInterval(touchInterval)
	})
}


export function addJoystickCLickListener(handler: (code: string) => void) {
	const buttonTimeouts: number[] = (new Array(16)).fill(0)
	const buttonIntervals: number[] = (new Array(16)).fill(0)
	const buttonCodes = [
		'A',
		'B',
		'X',
		'Y',
		'LB',
		'RB',
		'LT',
		'RT',
		'Select',
		'Start',
		'LS',
		'RS',
		'Up',
		'Down',
		'Left',
		'Right',
	]

	let interval: number

	function pool() {
		const gamepad: Gamepad | null = navigator.getGamepads()[0]
		if (!gamepad) {
			clearInterval(interval)
			return
		}
		for (let i = 0; i < gamepad.buttons.length; i++) {
			if (gamepad.buttons[i].pressed) {
				if (!buttonTimeouts[i] && !buttonIntervals[i]) {

					handler(buttonCodes[i])
					buttonTimeouts[i] = window.setTimeout(() => {
						buttonIntervals[i] = window.setInterval(() => {
							handler(buttonCodes[i])
						}, 50)
					}, 300 - 50)
				}
			}
			else if (buttonTimeouts[i] || buttonIntervals[i]) {
				window.clearTimeout(buttonTimeouts[i])
				window.clearInterval(buttonIntervals[i])
				buttonTimeouts[i] = 0
				buttonIntervals[i] = 0
			}
		}
	}

	window.addEventListener('gamepadconnected', event => {
		console.log('gamepadconnected')
		clearInterval(interval)
		pool()
		interval = window.setInterval(pool, 50)
	})
	window.addEventListener('gamepaddisconnected', event => {
		clearInterval(interval)
	})
}
