import React from 'react';
import { StyledCell } from './styles/StyledCell';
import { TETROMINOS } from '../tetrominos';

const Cell = ({ type, colorValue }) => (
  <StyledCell 
  	type={type} 
  	color={ (type === 0) ? TETROMINOS[type].color[colorValue] : TETROMINOS[type].color } 
  />
)

export default React.memo(Cell);