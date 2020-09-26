


export type LevelConfig = {
	file: string
}

export const levels: { [no: number]: LevelConfig } = {
	1: {
    file: require('./public/level.png').default,
	},
	2: {
		file: require('./public/level2.png').default,
	},
	3: {
		file: require('./public/level2.png').default,
	}
}

console.log(levels)
