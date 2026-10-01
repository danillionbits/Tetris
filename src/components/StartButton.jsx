import { StyledStartButton } from './styles/StyledStartButton';

const StartButton = ({ callback, text = 'Start Game' }) => (
  <StyledStartButton onClick={callback}>{text}</StyledStartButton>
);

export default StartButton;
