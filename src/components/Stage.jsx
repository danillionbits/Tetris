import { StyledStage } from './styles/StyledStage';
import Cell from './Cell.jsx';

const Stage = ({ stage }) => (
  <StyledStage $width={stage[0].length} $height={stage.length}>
    {stage.map((row, y) =>
      row.map((cell, x) => (
        // Every cell is a sibling in one flat grid, so the key has to be unique
        // across the whole board, not just within its row.
        <Cell key={`${y}-${x}`} type={cell[0]} colorValue={(x + y) % 2} />
      ))
    )}
  </StyledStage>
);

export default Stage;
