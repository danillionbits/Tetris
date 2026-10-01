export const STAGE_WIDTH = 10;
export const STAGE_HEIGHT = 20;

// Each cell gets its own array. `new Array(n).fill([0, 'clear'])` would store
// the same reference n times, so mutating one cell would mutate the whole row.
export const createRow = (width = STAGE_WIDTH) =>
	Array.from({ length: width }, () => [0, 'clear']);

export const createStage = () =>
	Array.from({ length: STAGE_HEIGHT }, () => createRow());

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
	for (let y = 0; y < player.tetromino.length; y++) {
		for (let x = 0; x < player.tetromino[y].length; x++) {

			// Only the filled cells of the tetromino can collide.
			if (player.tetromino[y][x] === 0) continue;

			const nextY = y + player.pos.y + moveY;
			const nextX = x + player.pos.x + moveX;

			// Off the board (floor or side), or into a cell that is locked.
			// Only 'merged' blocks: the piece in play is itself painted into
			// the stage, as is its landing preview, and neither is a wall.
			if (
				!stage[nextY] ||
				!stage[nextY][nextX] ||
				stage[nextY][nextX][1] === 'merged'
			) {
				return true;
			}
		}
	}

	return false;
}

// How far the piece can fall before it lands. Used both by the hard drop and
// by the landing preview, so the preview is drawn exactly where a hard drop
// would put the piece.
export const dropDistance = (player, stage) => {
	let moveY = 0;

	// The bound is a backstop: an empty tetromino never collides, and an
	// unbounded loop here freezes the tab rather than failing.
	while (moveY <= STAGE_HEIGHT && !checkCollision(player, stage, { x: 0, y: moveY + 1 })) {
		moveY += 1;
	}

	return moveY;
}
