import { Box, Card, LinearProgress, Alert } from '@mui/material';
import { styled } from '@mui/system';

export const GameContainer = styled(Box)({
  maxWidth: 600,
  margin: '0 auto',
  padding: '2rem',
});

export const EquationCard = styled(Card)({
  marginBottom: '2rem',
  backgroundColor: '#f5f5f5',
});

export const ScoreDisplay = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '1rem',
});

export const TimerBar = styled(LinearProgress)({
  height: 10,
  borderRadius: 5,
  marginBottom: '1rem',
});

export const FeedbackAlert = styled(Alert)({
  marginTop: '1rem',
});