import styled, { css } from 'styled-components';

// The landing preview: an outline in the piece's own colour, faint enough to
// read as a hint rather than as part of the stack.
const ghost = css`
  background: rgba(${props => props.$color}, 0.12);
  border: 2px solid rgba(${props => props.$color}, 0.5);
`;

const solid = css`
  background: rgba(${props => props.$color}, 0.8);
  border: ${props => (props.$type === 0 ? '0px solid' : '5px solid')};
  border-bottom-color: rgba(${props => props.$color}, 0.1);
  border-right-color: rgba(${props => props.$color}, 1);
  border-top-color: rgba(${props => props.$color}, 1);
  border-left-color: rgba(${props => props.$color}, 0.3);
`;

// Transient props ($-prefixed) are consumed by styled-components v6 and never
// forwarded to the DOM, which would otherwise warn about unknown attributes.
export const StyledCell = styled.div`
  box-sizing: border-box;
  width: auto;
  ${props => (props.$ghost ? ghost : solid)}
`;
