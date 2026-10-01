import { useState, useEffect, useRef, useCallback } from 'react';
import { createStage, createRow } from '../gameHelpers';

// Remove every full row, dropping the rows above down into the gap.
// Pure: returns the swept stage and the number of rows removed.
const sweepRows = stage => {
	let cleared = 0;

	const swept = stage.reduce((acc, row) => {
		if (row.findIndex(cell => cell[0] === 0) === -1) {
			cleared += 1;
			acc.unshift(createRow(row.length));
			return acc;
		}
		acc.push(row);
		return acc;
	}, []);

	return [ swept, cleared ];
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
		// Flush: clear everything that isn't locked in place, then redraw.
		const newStage = stageRef.current.map(row =>
			row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
		);

		// Draw the active tetromino.
		player.tetromino.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value === 0) return;

				const stageY = y + player.pos.y;
				const stageX = x + player.pos.x;

				// A topped-out piece can overhang the board. Never write out of
				// bounds, and never overwrite a cell that is already locked.
				if (!newStage[stageY] || !newStage[stageY][stageX]) return;
				if (newStage[stageY][stageX][1] === 'merged') return;

				newStage[stageY][stageX] = [ value, player.collided ? 'merged' : 'clear' ];
			})
		})

		if (!player.collided) {
			setRowsCleared(0);
			replaceStage(newStage);
			return;
		}

		const [ sweptStage, cleared ] = sweepRows(newStage);
		setRowsCleared(cleared);
		replaceStage(sweptStage);
		resetPlayer();
	}, [player, resetPlayer, replaceStage]);

	return [ stage, replaceStage, rowsCleared ];
}
