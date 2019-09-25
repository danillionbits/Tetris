import styled from 'styled-components';

export const StyledStage = styled.div`
  display: grid;
  grid-template-rows: repeat(
    ${props => props.height},
    calc(75vh / ${props => props.height})
  );
  grid-template-columns: repeat(${props => props.width}, calc(75vh / ${props => props.height}));
  grid-gap: 3px;
  border: 2px solid #333;
  background: rgb(34,34,34);
  height: 100%;
  max-height: 90vh;

`;