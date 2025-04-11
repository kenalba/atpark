import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!identifier) {
      setLocalError('Please enter your handle or email');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    console.log('Submitting login form with:', { identifier });
    
    try {
      const success = await login(identifier, password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, navigating to home page');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        // Navigate to home page
        navigate('/');
      } else {
        console.log('Login failed in component');
        // Error will be set by the useAuth hook
      }
    } catch (err) {
      console.error('Error during login:', err);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#000000'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400,
          bgcolor: '#121212',
          color: 'white',
          borderRadius: 4
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          AT Park
        </Typography>
        
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Sign in with your ATPROTO account
        </Typography>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
            {error || localError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Handle or Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
            inputProps={{ 
              autoComplete: "username" 
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              }
            }}
          />
          
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
            inputProps={{ 
              autoComplete: "current-password" 
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              }
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              py: 1.5, 
              bgcolor: '#8B5CF6', 
              '&:hover': {
                bgcolor: '#7C3AED',
              },
              borderRadius: 8
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </form>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an ATPROTO account?{' '}
            <a 
              href="https://bsky.app/signup" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#8B5CF6' }}
            >
              Sign up here
            </a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
