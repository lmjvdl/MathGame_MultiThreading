import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { EquationCard, FeedbackAlert, GameContainer, ScoreDisplay, TimerBar } from './styles';

const DEFAULT_TIME_LIMIT = 60; // Default time in seconds

type Operation = '+' | '-' | '*' | '/' | '^' | '√';

interface GameState {
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  gameOver: boolean;
  timeRemaining: number;
  currentEquation: string;
  correctX: number;
  userAnswer: string;
  showFeedback: boolean;
  isCorrect: boolean | null;
  customTimeInput: string;
  isSettingTime: boolean;
}

const MathGame: React.FC = () => {
  const [state, setState] = useState<GameState>({
    correctAnswers: 0,
    wrongAnswers: 0,
    score: 0,
    gameOver: false,
    timeRemaining: DEFAULT_TIME_LIMIT,
    currentEquation: '',
    correctX: 0,
    userAnswer: '',
    showFeedback: false,
    isCorrect: null,
    customTimeInput: '',
    isSettingTime: true,
  });

  const generateEquation = useCallback((): { equation: string; correctX: number } => {
    const ops: Operation[] = ['+', '-', '*', '/', '^', '√'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    switch (op) {
      case '+': {
        const x = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        return { equation: `x + ${b} = ${x + b}`, correctX: x };
      }
      case '-': {
        const x = Math.floor(Math.random() * 81) + 20;
        const b = Math.floor(Math.random() * 50) + 1;
        return { equation: `x - ${b} = ${x - b}`, correctX: x };
      }
      case '*': {
        const x = Math.floor(Math.random() * 15) + 1;
        const b = Math.floor(Math.random() * 9) + 2;
        return { equation: `${b} × x = ${b * x}`, correctX: x };
      }
      case '/': {
        const x = Math.floor(Math.random() * 15) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        return { equation: `${x * b} ÷ x = ${b}`, correctX: x };
      }
      case '^': {
        const x = Math.floor(Math.random() * 4) + 2;
        return { equation: `x² = ${x ** 2}`, correctX: x };
      }
      case '√': {
        const x = Math.floor(Math.random() * 9) + 2;
        return { equation: `√x = ${Math.sqrt(x ** 2).toFixed(2)}`, correctX: x ** 2 };
      }
      default:
        return { equation: 'x = 0', correctX: 0 };
    }
  }, []);

  const startNewQuestion = useCallback(() => {
    const { equation, correctX } = generateEquation();
    setState(prev => ({
      ...prev,
      currentEquation: equation,
      correctX,
      userAnswer: '',
      showFeedback: false,
      isCorrect: null,
    }));
  }, [generateEquation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.gameOver || !state.userAnswer) return;

    try {
      const userVal = parseFloat(state.userAnswer);
      const isCorrect = Math.abs(userVal - state.correctX) < 0.01;

      setState(prev => {
        const newWrongAnswers = isCorrect ? prev.wrongAnswers : prev.wrongAnswers + 1;
        let newScore = isCorrect ? prev.score + 1 : prev.score;
        
        if (newWrongAnswers % 3 === 0 && !isCorrect) {
          newScore = Math.max(0, newScore - 1);
        }

        return {
          ...prev,
          correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
          wrongAnswers: newWrongAnswers,
          score: newScore,
          showFeedback: true,
          isCorrect,
        };
      });

      setTimeout(startNewQuestion, 1500);
    } catch {
      setState(prev => ({
        ...prev,
        showFeedback: true,
        isCorrect: false,
      }));
    }
  };

  const handleStartGame = () => {
    const timeLimit = parseInt(state.customTimeInput) || DEFAULT_TIME_LIMIT;
    setState(prev => ({
      ...prev,
      isSettingTime: false,
      timeRemaining: timeLimit,
      gameOver: false,
      correctAnswers: 0,
      wrongAnswers: 0,
      score: 0,
    }));
    startNewQuestion();
  };

  useEffect(() => {
    if (state.isSettingTime || state.gameOver) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return { ...prev, timeRemaining: 0, gameOver: true };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isSettingTime, state.gameOver]);

  const timeLimit = parseInt(state.customTimeInput) || DEFAULT_TIME_LIMIT;
  const progressPercentage = (state.timeRemaining / timeLimit) * 100;

  return (
    <GameContainer>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Math Equation Game
      </Typography>

      {state.isSettingTime ? (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom align="center">
              ⏳ Set Game Time
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Enter the game duration in seconds (10-600)
            </Typography>
            <TextField
              fullWidth
              label="Game duration (seconds)"
              variant="outlined"
              type="number"
              value={state.customTimeInput}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 10 && parseInt(value) <= 600)) {
                  setState(prev => ({ ...prev, customTimeInput: value }));
                }
              }}
              inputProps={{ min: 10, max: 600 }}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartGame}
              disabled={!state.customTimeInput || parseInt(state.customTimeInput) < 10}
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <ScoreDisplay>
            <Typography variant="h6">✅ Correct: {state.correctAnswers}</Typography>
            <Typography variant="h6">⏳ Time: {state.timeRemaining}s</Typography>
            <Typography variant="h6">❌ Wrong: {state.wrongAnswers}</Typography>
            <Typography variant="h6">🏆 Score: {state.score}</Typography>
          </ScoreDisplay>

          <TimerBar 
            variant="determinate" 
            value={progressPercentage} 
            color={progressPercentage > 30 ? 'primary' : 'error'}
          />

          {state.gameOver ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom align="center">
                  ⏰ Time's Up!
                </Typography>
                <Typography variant="h6" gutterBottom>
                  🎮 Game Over
                </Typography>
                <Typography>✅ Correct answers: {state.correctAnswers}</Typography>
                <Typography>❌ Wrong answers: {state.wrongAnswers}</Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  🏆 Final Score: {state.score}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={() => setState(prev => ({
                    ...prev,
                    isSettingTime: true,
                    customTimeInput: '',
                  }))}
                >
                  Play Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <EquationCard>
                <CardContent>
                  <Typography variant="h5" component="div" align="center" gutterBottom>
                    📘 Solve for x:
                  </Typography>
                  <Typography variant="h3" component="div" align="center" sx={{ my: 3 }}>
                    {state.currentEquation}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Your answer for x"
                    variant="outlined"
                    type="number"
                    value={state.userAnswer}
                    onChange={(e) => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
                    disabled={state.showFeedback}
                    autoFocus
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    disabled={state.showFeedback}
                  >
                    Submit
                  </Button>

                  {state.showFeedback && (
                    <FeedbackAlert severity={state.isCorrect ? 'success' : 'error'}>
                      {state.isCorrect ? (
                        '🎉 Correct Answer!'
                      ) : (
                        `❌ Wrong Answer! The correct answer is: ${state.correctX}`
                      )}
                    </FeedbackAlert>
                  )}
                </CardContent>
              </EquationCard>
            </form>
          )}
        </>
      )}
    </GameContainer>
  );
};

export default MathGame;