import { memo } from 'react';
import { StyledCell } from './styles/StyledCell';
import { TETROMINOS } from '../tetrominos';

const Cell = ({ type, status, colorValue }) => (
  <StyledCell
    $type={type}
    $ghost={status === 'ghost'}
    $color={type === 0 ? TETROMINOS[type].color[colorValue] : TETROMINOS[type].color}
  />
);

export default memo(Cell);
