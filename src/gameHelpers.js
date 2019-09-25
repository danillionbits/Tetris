export const STAGE_WIDTH = 10;
export const STAGE_HEIGHT = 20;


export const createStage = () => (
	Array.from(Array(STAGE_HEIGHT), () => 
		new Array(STAGE_WIDTH).fill([0, 'clear']))
	)

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
	for (var y = 0; y < player.tetromino.length; y++) {
		for (var x = 0; x < player.tetromino[y].length; x++) {

			// Check whether on Tetromino cell
			if (player.tetromino[y][x] !== 0) {
				// Check move inside game areas height
				if (
					!stage[y + player.pos.y + moveY] ||
					!stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
					stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
				) {
					return true;
				}
			}
		}
	}
}