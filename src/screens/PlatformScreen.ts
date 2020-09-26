import { vec2 } from 'gl-matrix';
import { IScreen } from '../IScreen';
import { Screen } from '../Screen';
import { Engine, World, Bodies, Body, Events, Vector } from 'matter-js'


type Tile = {
	x: number
	y: number
	w: number
	h: number
	entity: string
	type: string,
}

type PlayerState = {
	wall: boolean,
	ground: boolean,
	falling: boolean,
	jumping: boolean,
	canDoubleJump: boolean,
	wallHang: boolean,
}

const gravity = 8
const jumpForce = -2.5
const moveForce = 0.10

const playerFriction = 0
const playerFrictionAir = 0.02
const playerRestitution = 0
const playerXResistance = 0.01


export class PlatformScreen extends Screen {

	playerPos: Vector = { x: 0, y: 0 }
	levelSize: Vector = { x: 0, y: 0 }
	offset: Vector = { x: 0, y: 0 }
	tiles: Tile[] = []
	engine: Engine
	player: Body
	goal: Body
	imagesByTitle: { [title: string]: HTMLImageElement } = {}
	totalMs: number = 0

	playerState: PlayerState = {
		wall: false,
		ground: false,
		falling: false,
		jumping: false,
		canDoubleJump: false,
		wallHang: false,
	}

	actionStates: { [key: string]: boolean } = {}
	actionByKey: { [key: string]: string } = {
		KeyA: 'left',
		ArrowLeft: 'left',
		KeyD: 'right',
		ArrowRight: 'right',
		KeyW: 'jump',
		ArrowUp: 'jump',
		Space: 'jump',
	}

	lastDirection: string = 'right'


	constructor(screens: IScreen[]) {
		super(screens)

		window.addEventListener('keydown', (event: KeyboardEvent) => {
			const action = this.actionByKey[event.code]
			if (!action) { return }
			if (!this.actionStates[action]) {
				this.actionStates[action] = true
				if (action) { this.handleAction(action) }
			}
		})
		window.addEventListener('keyup', (event: KeyboardEvent) => {
			const action = this.actionByKey[event.code]
			if (!action) { return }
			this.actionStates[action] = false
		})

		this.engine = Engine.create()
		this.engine.world.gravity.y = gravity

		Events.on(this.engine, 'collisionActive', (e: Matter.IEventCollision<Engine>) => {
			if (!e.pairs.length) { return }

			let left = false;
			let right = false;

			for (const pair of e.pairs) {
				let body: Body | null = null
				if (pair.bodyA === this.player) { body = pair.bodyB }
				if (pair.bodyB === this.player) {	body = pair.bodyA }
				if (body) {
					if (pair.activeContacts.every((x: any) => x.vertex.x < this.player.position.x - 40)) {
						left = true
					}
					else if (pair.activeContacts.every((x: any) => x.vertex.x > this.player.position.x + 40)) {
						right = true
					}
					else if (pair.activeContacts.every((x: any) => x.vertex.y > this.player.position.y)) {
						this.playerState.ground = true;
					}
				}
			}
			this.playerState.wall = left || right;
			if (this.playerState.wall && !this.playerState.ground) {
				this.lastDirection = left ? 'right' : 'left'
			}
		})


		this.loadImage('terrain.png').then(image => this.imagesByTitle['terrain'] = image)
		this.loadImage('md_idle.png').then(image => this.imagesByTitle['md_idle'] = image)
		this.loadImage('vg_idle.png').then(image => this.imagesByTitle['vg_idle'] = image)
		this.loadImage('bg.png').then(image => this.imagesByTitle['bg'] = image)

		this.loadLevel('level.png')
	}

	async loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise(resolve => {
			const image = new Image()
			image.onload = () => resolve(image)
			image.src = src
		})
	}

	loadLevel(src: string) {
		this.loadImage(src).then(image => {
			const canvas = document.createElement('canvas')
			canvas.width = image.width
			canvas.height = image.height
			const context = canvas.getContext('2d')
			if (!context) { throw new Error('NO CONTEXT') }
			context.drawImage(image, 0, 0)
			const data = context.getImageData(0, 0, canvas.width, canvas.height).data

			this.levelSize.x = image.width
			this.levelSize.y = image.height

			const entitiesByColor: { [color: string]: string } = {
				'808080': 'wall',
				'ffffff': 'nothing',
				'b6ff00': 'player',
				'ff6a00': 'goal',
			}

			const walls: Body[] = []

			function getEntityFor(x: number, y: number): string {
				x = Math.min(Math.max(x, 0), image.width - 1)
				y = Math.min(Math.max(y, 0), image.height - 1)
				const i = x * 4 + y * 4 * image.width
				const pixel = (data[i] << 16 | data[i+1] << 8 | data[i+2]).toString(16)
				const entity = entitiesByColor[pixel]
				if (!entity) { console.error(`unknown pixel ${pixel}`) }
				return entity
			}

			for (let y = 0; y < image.height; y++) {
				let startWall: { x: number, y: number } | null = null

				for (let x = 0; x < image.width; x++) {
					const entity = getEntityFor(x, y)

					if (entity === 'wall') {
						if (!startWall) { startWall = { x, y } }
					}
					else {
						if (startWall) {
							let w = x - startWall.x
							walls.push(Bodies.rectangle((startWall.x + w / 2) * 100, (y + 0.5) * 100, w * 100, 1 * 100))
							startWall = null
						}
					}

					switch(entity) {
						case 'wall':
							let type = 'wall_'
							if (getEntityFor(x, y - 1) !== 'wall') { type += 't' }
							if (getEntityFor(x, y + 1) !== 'wall') { type += 'b' }
							if (getEntityFor(x - 1, y) !== 'wall') { type += 'l' }
							if (getEntityFor(x + 1, y) !== 'wall') { type += 'r' }
							if (type === 'wall_') {
								if (getEntityFor(x + 1, y + 1) !== 'wall') { type = 'wall_cbr' }
								if (getEntityFor(x - 1, y + 1) !== 'wall') { type = 'wall_cbl' }
								if (getEntityFor(x - 1, y - 1) !== 'wall') { type = 'wall_ctl' }
								if (getEntityFor(x + 1, y - 1) !== 'wall') { type = 'wall_ctr' }
							}
							this.tiles.push({ x, y, entity, w: 1, h: 1, type });
							walls.push(Bodies.rectangle(x + 0.5, y + 0.5, 1, 1))
							break;
						case 'goal':
							this.goal = Bodies.rectangle(x * 100 + 50, y * 100 + 50, 100, 100)
							this.goal.isSensor = true
							this.goal.isStatic = true
							World.add(this.engine.world, [this.goal])

							break
						case 'player':
							this.player = Bodies.rectangle(x * 100 + 50, y * 100 + 50, 100, 100)
							this.player.friction = playerFriction
							this.player.frictionAir = playerFrictionAir
							this.player.restitution = playerRestitution

							Body.setInertia(this.player, Infinity)
							World.add(this.engine.world, [this.player])

							break
					}
				}

				if (startWall) {
					let x = image.width
					let w = x - startWall.x
					walls.push(Bodies.rectangle((startWall.x + w / 2) * 100, (y + 0.5) * 100, w * 100, 1 * 100))
				}
			}
	
			const level = Body.create({
				parts: walls,
				isStatic: true,
			})
			World.add(this.engine.world, [level]);

		})
	}

	isAction(action: string): boolean {
		return this.actionStates[action] || false
	}


	handleAction(action: string) {
		switch(action) {
			case 'jump':
				if (this.playerState.wallHang) {
					this.player.force.y = jumpForce
					this.player.force.x = (this.lastDirection === 'left' ? 1 : -1) * jumpForce * 0.3
				}
				else if (this.playerState.ground) {
					this.player.force.y = jumpForce
					this.playerState.ground = false
				} else if (this.playerState.canDoubleJump) {
					this.player.force.y = jumpForce + this.player.velocity.y * -0.1
					this.playerState.canDoubleJump = false
				}
				break;
			case 'left': this.lastDirection = 'left'
				break
			case 'right': this.lastDirection = 'right'
				break
		}
	}

	elapsed: number = 0

	update(dt: number) {

		if (!this.player) { return }

		if (this.isAction('left')) {
				this.player.force.x = -moveForce
		}
		if (this.isAction('right')) {
			if (this.player) {
				this.player.force.x = moveForce
			}
		}

		if (this.player.velocity.x > 10) { this.player.force.x = 0 }
		if (this.player.velocity.x < -10) { this.player.force.x = 0 }

		this.elapsed += Math.round(dt * 1000)
		while (this.elapsed > 10) {
			this.playerState.ground = false
			this.playerState.wall = false

			Engine.update(this.engine, 10, 1)
			
			this.playerState.jumping = !this.playerState.ground && this.player.velocity.y < -0.1
			this.playerState.falling = !this.playerState.ground && this.player.velocity.y > 0.1
			
			if (this.player.velocity.x > 0.1) { this.lastDirection = 'right' }
			if (this.player.velocity.x < -0.1) { this.lastDirection = 'left' }

			this.playerState.wallHang = this.playerState.wall && !this.playerState.ground && this.playerState.falling
			this.player.friction = this.playerState.wallHang ? 0.3 : 0

			if (this.playerState.ground || this.playerState.wallHang) {
				this.playerState.canDoubleJump = true
			}

			this.player.force.x = -this.player.velocity.x * playerXResistance
			
			this.totalMs += 10
			this.elapsed -= 10
		}
	}


	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, scale: number) {

		context.fillStyle = '#211F30'
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		const cScale = canvas.height / 12
		const width = canvas.width / cScale
		const height = canvas.height / cScale


		if (!this.player) { return }

		this.offset.x = width / 2 - this.player.position.x / 100
		this.offset.y = height / 2 - this.player.position.y / 100

		if (this.offset.x < width - this.levelSize.x) { this.offset.x = width - this.levelSize.x }
		if (this.offset.x > 0) { this.offset.x = 0 }

		if (this.offset.y < height - this.levelSize.y) { this.offset.y = height - this.levelSize.y }
		if (this.offset.y > 0) { this.offset.y = 0 }

		if (this.imagesByTitle['bg']) {
			for (let x = 0; x < width + 2; x += 2) {
				for (let y = 0; y < height + 2; y += 2) {
					context.drawImage(
						this.imagesByTitle['bg'],
						0,
						0,
						32,
						32,
						((this.offset.x * 0.5) % 2 + x) * cScale,
						((this.offset.y * 0.5) % 2 + y)  * cScale,
						2 * cScale,
						2 * cScale
					)
				}
			}
		}

		const tilePosByTileType: { [type: string]: { x: number, y: number } } = {
			'wall_': { x: 1 * 16, y: 1 * 16 },
			'wall_t': { x: 1 * 16, y: 0 * 16 },
			'wall_tl': { x: 0 * 16, y: 0 * 16 },
			'wall_tr': { x: 2 * 16, y: 0 * 16 },
			'wall_b': { x: 1 * 16, y: 2 * 16 },
			'wall_bl': { x: 0 * 16, y: 2 * 16 },
			'wall_br': { x: 2 * 16, y: 2 * 16 },
			'wall_l': { x: 0 * 16, y: 1 * 16 },
			'wall_r': { x: 2 * 16, y: 1 * 16 },
			'wall_ctr': { x: 3 * 16, y: 1 * 16 },
			'wall_ctl': { x: 4 * 16, y: 1 * 16 },
			'wall_cbl': { x: 4 * 16, y: 0 * 16 },
			'wall_cbr': { x: 3 * 16, y: 0 * 16 },
		}

		for (const tile of this.tiles) {
			const cx = (this.offset.x + tile.x)
			const cy = (this.offset.y + tile.y)
			if (cx < -1 || cx > width) { continue }
			if (cy < -1 || cy > height) { continue }
			if (this.imagesByTitle['terrain']) {
				const pos = tilePosByTileType[tile.type] || { x: 1 * 16, y: 1 * 16}
				context.drawImage(
					this.imagesByTitle['terrain'],
					pos.x,
					pos.y + 128,
					16,
					16,
					cx * cScale,
					cy * cScale,
					tile.w * cScale,
					tile.h * cScale
				)
			}
		}


		if (this.imagesByTitle['vg_idle']) {
			context.save()
			context.translate(
				(this.offset.x + this.goal.position.x / 100) * cScale,
				(this.offset.y + this.goal.position.y / 100) * cScale
			)
			context.drawImage(
				this.imagesByTitle['vg_idle'],
				(Math.round(this.totalMs / 50) % 11) * 32,
				0,
				32,
				32,
				-0.5 * cScale,
				-0.5 * cScale,
				1 * cScale,
				1 * cScale
			)
			context.restore()
		}

		if (this.imagesByTitle['md_idle']) {
			context.save()
			context.translate(
				(this.offset.x + this.player.position.x / 100) * cScale,
				(this.offset.y + this.player.position.y / 100) * cScale
			)
			context.rotate(this.player.angle)
			context.scale(this.lastDirection === 'right' ? 1 : -1, 1)

			let sx = (Math.round(this.totalMs / 50) % 11) * 32
			let sy = 0

			if (Math.abs(this.player.velocity.x) > 0.1) {
				sx = (Math.round(this.totalMs / 50) % 12) * 32
				sy = 64
			}

			if (this.playerState.jumping) {
				sx = 0
				sy = 32
			}
			if (this.playerState.falling) {
				sx = 32
				sy = 32
			}
			if (this.playerState.wallHang) {
				sx = 0
				sy = 96
			}

			context.drawImage(
				this.imagesByTitle['md_idle'],
				sx,
				sy,
				32,
				32,
				-0.5 * cScale,
				-0.5 * cScale,
				1 * cScale,
				1 * cScale
			)

			context.restore()
		}
	}

}
