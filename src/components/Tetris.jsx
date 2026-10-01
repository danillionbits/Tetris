import { useCallback, useEffect, useRef, useState } from 'react';

import { createStage, checkCollision } from '../gameHelpers';
import { resetBag } from '../tetrominos';

// Styled Components
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';

// Custom Hooks
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

// Components
import Stage from './Stage.jsx';
import Display from './Display.jsx';
import StartButton from './StartButton.jsx';

// One formula for the gravity timer, used everywhere it is (re)started. When
// the start value and the soft-drop-release value were written out separately
// they disagreed, so letting go of Down at level 0 left the game slower than it
// began.
const dropInterval = level => 1000 / (level + 1) + 200;

// Keys the game owns while it is running.
const GAME_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ArrowUp',
  'KeyC',
  'Space'
]);

// Auto-repeat is fine for sliding and soft-dropping, but a held rotate or hard
// drop would fire dozens of times a second.
const NO_REPEAT_KEYS = new Set(['ArrowUp', 'KeyC', 'Space']);

const Tetris = () => {
  const [ dropTime, setDropTime ] = useState(null);
  const [ gameOver, setGameOver ] = useState(false);
  const [ started, setStarted ] = useState(false);

  const [ player, { movePlayer, stepDown, hardDropPlayer, playerRotate }, resetPlayer ] = usePlayer();
  const [ stage, setStage, rowsCleared ] = useStage(player, resetPlayer);
  const [ score, setScore, rows, setRows, level, setLevel ] = useGameStatus(rowsCleared);

  const wrapperRef = useRef(null);

  // Key events only reach the game when the wrapper has focus. Claim it on
  // mount so the first arrow press works without clicking the board first.
  useEffect(() => {
    wrapperRef.current?.focus();
  }, []);

  const endGame = useCallback(() => {
    setGameOver(true);
    setDropTime(null);
  }, []);

  // Top-out, detected as block-out: the piece that just spawned overlaps the
  // stack, so there is nowhere left to put it. The old check ran at lock time
  // and only caught pieces that happened to lock on row 0, which let the game
  // run on with pieces piling up off the top of the board.
  useEffect(() => {
    if (!started || gameOver || player.collided) return;
    if (checkCollision(player, stage, { x: 0, y: 0 })) endGame();
  }, [player, stage, started, gameOver, endGame]);

  const startGame = () => {
    // Fresh bag, so a new game never inherits the tail of the last one's.
    resetBag();

    setStage(createStage());
    resetPlayer();
    setScore(0);
    setRows(0);
    setLevel(0);
    setGameOver(false);
    setStarted(true);
    setDropTime(dropInterval(0));

    // Clicking the button moved focus off the board; take it back.
    wrapperRef.current?.focus();
  }

  const drop = () => {
    // Ten rows per level. `rows` is the total *after* the clear, so row 10 is
    // already level 2's worth of work -- hence >=, not >. The new speed has to
    // come from the level we are moving to; `level` in scope is still the old
    // one until the next render.
    if (rows >= (level + 1) * 10) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setDropTime(dropInterval(nextLevel));
    }

    // Moving down and landing are one decision, made against the live piece.
    stepDown(stage);
  }

  // Hold Down to drop a row at a time with the gravity timer paused; it comes
  // back on key up.
  const softDrop = () => {
    setDropTime(null);
    drop();
  }

  const handleKeyDown = event => {
    if (!started || gameOver) return;
    if (!GAME_KEYS.has(event.code)) return;

    // Arrows scroll the page and Space activates the focused control.
    event.preventDefault();

    if (event.repeat && NO_REPEAT_KEYS.has(event.code)) return;

    switch (event.code) {
      case 'ArrowLeft':
        movePlayer(stage, { x: -1, y: 0 });
        break;
      case 'ArrowRight':
        movePlayer(stage, { x: 1, y: 0 });
        break;
      case 'ArrowDown':
        softDrop();
        break;
      case 'ArrowUp':
        playerRotate(stage, 1);
        break;
      case 'KeyC':
      case 'Space':
        hardDropPlayer(stage);
        break;
      default:
        break;
    }
  }

  const handleKeyUp = event => {
    if (!started || gameOver) return;

    if (event.code === 'ArrowDown') {
      setDropTime(dropInterval(level));
    }
  }

  useInterval(() => {
    drop();
  }, dropTime);

  return (
    <StyledTetrisWrapper
      ref={wrapperRef}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <StyledTetris>
        <Stage stage={stage} />
        <aside>
          { gameOver ? (
              <Display gameOver={gameOver} text="Game Over" />
            ) : (
              <div>
                <Display text={`Score: ${score}`} />
                <Display text={`Rows: ${rows}`} />
                <Display text={`Level: ${level}`} />
                <Display text="Hard-Drop: C / Space" />
              </div>
            )
          }
          <StartButton callback={startGame} />
        </aside>
      </StyledTetris>
    </StyledTetrisWrapper>
  );
};

export default Tetris;
