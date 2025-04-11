import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import './App.css';

// Components
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import PhotoGallery from './components/Photos/PhotoGallery';
import PhotoUpload from './components/Photos/PhotoUpload';
import PhotoDetail from './components/Photos/PhotoDetail';

function App() {
  // We'll use this state later for more complex auth flows
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    // Navigate to home page after login
    // Currently handled by the Login component
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<PhotoGallery />} />
              <Route path="/explore" element={<div>Explore Page (Coming Soon)</div>} />
              <Route path="/upload" element={<PhotoUpload />} />
              <Route path="/gallery" element={<PhotoGallery />} />
              <Route path="/photo/:photoUri" element={<PhotoDetail />} />
              <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
