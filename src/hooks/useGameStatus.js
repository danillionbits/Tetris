import { useState, useEffect, useRef } from 'react';

// Original Nintendo scoring: points for 1/2/3/4 lines, scaled by the current level.
const LINE_POINTS = [40, 100, 300, 1200];

export const useGameStatus = rowsCleared => {
	const [ score, setScore ] = useState(0);
	const [ rows, setRows ] = useState(0);
	const [ level, setLevel ] = useState(0);

	// Read the level without depending on it. If `level` were a dependency, a
	// line clear that triggers a level-up would re-run this effect with the same
	// rowsCleared and award the points a second time.
	const levelRef = useRef(level);
	levelRef.current = level;

	useEffect(() => {
		if (rowsCleared === 0) return;
		setScore(prev => prev + LINE_POINTS[rowsCleared - 1] * (levelRef.current + 1));
		setRows(prev => prev + rowsCleared);
	}, [rowsCleared]);

	return [ score, setScore, rows, setRows, level, setLevel ];
}
