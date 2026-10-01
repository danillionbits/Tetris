import { useState, useEffect, useRef, useCallback } from 'react';
import { createStage, createRow, dropDistance } from '../gameHelpers';

// Remove every full row, dropping the rows above down into the gap.
// Pure: returns the swept stage and the number of rows removed.
const sweepRows = stage => {
	let cleared = 0;

	const swept = stage.reduce((acc, row) => {
		if (row.every(cell => cell[1] === 'merged')) {
			cleared += 1;
			acc.unshift(createRow(row.length));
			return acc;
		}
		acc.push(row);
		return acc;
	}, []);

	return [ swept, cleared ];
}

// Paint a tetromino into a stage that is still being built. `status` tags the
// cells: 'merged' for a piece that has locked, 'ghost' for the landing
// preview, 'clear' for the piece in play -- that one has to stay 'clear', or
// the piece would collide with itself.
const draw = (stage, { tetromino, pos }, status, offsetY = 0) => {
	tetromino.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value === 0) return;

			const stageY = y + pos.y + offsetY;
			const stageX = x + pos.x;

			// A topped-out piece can overhang the board. Never write out of
			// bounds, and never overwrite a cell that is already locked.
			if (!stage[stageY] || !stage[stageY][stageX]) return;
			if (stage[stageY][stageX][1] === 'merged') return;

			stage[stageY][stageX] = [ value, status ];
		})
	})
}

export const useStage = (player, resetPlayer) => {
	const [ stage, setStage ] = useState(createStage());
	const [ rowsCleared, setRowsCleared ] = useState(0);

	// The effect needs the current stage but must not depend on it, or writing
	// the stage would re-trigger the effect forever. A ref gives us the latest
	// value while keeping the dependency list to just `player`.
	const stageRef = useRef(stage);

	const replaceStage = useCallback(next => {
		stageRef.current = next;
		setStage(next);
	}, []);

	useEffect(() => {
		// Flush: keep the locked cells and clear the rest. The piece in play and
		// last frame's preview are both redrawn from scratch every time.
		const newStage = stageRef.current.map(row =>
			row.map(cell => (cell[1] === 'merged' ? cell : [0, 'clear']))
		);

		if (!player.collided) {
			// The preview is drawn first so the piece paints over it where the
			// two overlap -- near the floor they are the same cells.
			draw(newStage, player, 'ghost', dropDistance(player, newStage));
			draw(newStage, player, 'clear');

			setRowsCleared(0);
			replaceStage(newStage);
			return;
		}

		draw(newStage, player, 'merged');

		const [ sweptStage, cleared ] = sweepRows(newStage);
		setRowsCleared(cleared);
		replaceStage(sweptStage);
		resetPlayer();
	}, [player, resetPlayer, replaceStage]);

	return [ stage, replaceStage, rowsCleared ];
}
