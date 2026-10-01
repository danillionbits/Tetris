import { useState, useCallback } from 'react';

import { TETROMINOS, randomTetromino } from '../tetrominos';
import { STAGE_WIDTH, checkCollision, dropDistance } from '../gameHelpers';

const rotate = (matrix, dir) => {
	// Transpose: rows become columns. `map` builds new rows, so the piece we
	// were handed is never mutated.
	const rotatedTetro = matrix.map((_, index) =>
		matrix.map(col => col[index]));

	// Then reverse, in the direction of the turn.
	if (dir > 0) return rotatedTetro.map(row => row.reverse());
	return rotatedTetro.reverse();
}

export const usePlayer = () => {
	const [ player, setPlayer ] = useState({
		id: 0,
		pos: { x: 0, y: 0 },
		tetromino: TETROMINOS[0].shape,
		collided: false
	});

	// Every action decides *and* applies inside the updater, against `prev`.
	// Checking collision against the render's `player` and then applying the
	// move through a functional update reads two different versions of state:
	// five left-presses batched into one tick would each see x = 3, agree the
	// move is legal, and stack up to x = -2, straight through the wall.
	//
	// `pieceId` is the piece as of the render this action was created in. A
	// gravity tick or keypress computed before a lock can land after the next
	// piece has spawned, and must not be applied to that piece instead.
	const pieceId = player.id;
	const isStale = prev => prev.id !== pieceId || prev.collided;

	const movePlayer = (stage, { x, y }) => {
		setPlayer(prev => {
			if (isStale(prev)) return prev;
			if (checkCollision(prev, stage, { x, y })) return prev;

			return { ...prev, pos: { x: prev.pos.x + x, y: prev.pos.y + y } };
		});
	}

	// One step of gravity: down a row, or locked in place if it cannot.
	const stepDown = stage => {
		setPlayer(prev => {
			if (isStale(prev)) return prev;
			if (!checkCollision(prev, stage, { x: 0, y: 1 })) {
				return { ...prev, pos: { x: prev.pos.x, y: prev.pos.y + 1 } };
			}

			return { ...prev, collided: true };
		});
	}

	const hardDropPlayer = stage => {
		setPlayer(prev => {
			if (isStale(prev)) return prev;

			// The same distance the landing preview is drawn at, so the piece
			// lands exactly where the preview said it would.
			const moveY = dropDistance(prev, stage);

			return {
				...prev,
				pos: { x: prev.pos.x, y: prev.pos.y + moveY },
				collided: true
			};
		});
	}

	const playerRotate = (stage, dir) => {
		setPlayer(prev => {
			if (isStale(prev)) return prev;

			const rotated = {
				...prev,
				pos: { ...prev.pos },
				tetromino: rotate(prev.tetromino, dir)
			};

			// Nudge sideways until it fits: 1 right, 2 left, 3 right...
			let offset = 1;

			while (checkCollision(rotated, stage, { x: 0, y: 0 })) {
				rotated.pos.x += offset;
				offset = -(offset + (offset > 0 ? 1 : -1));

				// Nothing within a piece's width works, so the turn is refused
				// and the untouched `prev` stands.
				if (offset > rotated.tetromino[0].length) return prev;
			}

			return rotated;
		});
	}

	const resetPlayer = useCallback(() => {
		setPlayer(prev => ({
			id: prev.id + 1,
			pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
			tetromino: randomTetromino().shape,
			collided: false,
		}));
	}, []);

	return [ player, { movePlayer, stepDown, hardDropPlayer, playerRotate }, resetPlayer ];
}
