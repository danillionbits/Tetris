// Spawn orientations follow the Tetris Guideline: I lies flat across the
// second row of its 4x4 box, and every other piece spawns flat-side-down.
export const TETROMINOS = {
	0: { shape: [[0]], color: ['47, 47, 47', '43, 43, 43'] },
	I: {
		shape: [
			[0, 0, 0, 0],
			['I', 'I', 'I', 'I'],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		],
		color: '80, 227, 230'
	},
	J: {
		shape: [
			['J', 0, 0],
			['J', 'J', 'J'],
			[0, 0, 0]
		],
		color: '36, 95, 223'
	},
	L: {
		shape: [
			[0, 0, 'L'],
			['L', 'L', 'L'],
			[0, 0, 0]
		],
		color: '223, 173, 36'
	},
	O: {
		shape: [
			['O', 'O'],
			['O', 'O']
		],
		color: '223, 217, 36'
	},
	S: {
		shape: [
			[0, 'S', 'S'],
			['S', 'S', 0],
			[0, 0, 0]
		],
		color: '48, 211, 36'
	},
	T: {
		shape: [
			[0, 'T', 0],
			['T', 'T', 'T'],
			[0, 0, 0]
		],
		color: '132, 61, 198'
	},
	Z: {
		shape: [
			['Z', 'Z', 0],
			[0, 'Z', 'Z'],
			[0, 0, 0]
		],
		color: '227, 78, 78'
	}
}

const TETROMINO_KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// 7-bag randomiser: deal all seven pieces in a shuffled order before reshuffling.
// Plain Math.random() lets you go a dozen pieces without an I; a bag caps the
// worst-case drought at 12 and is what the official game does.
let bag = [];

const refillBag = () => {
	bag = [...TETROMINO_KEYS];
	for (let i = bag.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[ bag[i], bag[j] ] = [ bag[j], bag[i] ];
	}
}

export const randomTetromino = () => {
	if (bag.length === 0) refillBag();
	return TETROMINOS[bag.pop()];
}

// Called when a new game starts so each run gets a fresh bag.
export const resetBag = () => {
	bag = [];
}
