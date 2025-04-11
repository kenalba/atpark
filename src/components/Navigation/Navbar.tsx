import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Icons
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#000000', boxShadow: 'none', borderBottom: '1px solid #333' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo/Brand */}
        <Box component={Link} to="/" sx={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
            AT Park
          </Typography>
        </Box>

        {/* Navigation Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <IconButton 
            component={Link} 
            to="/" 
            color={location.pathname === '/' ? 'primary' : 'default'}
            sx={{ 
              color: location.pathname === '/' ? '#8B5CF6' : 'white',
              mx: { xs: 1, sm: 2 }
            }}
          >
            <HomeIcon />
          </IconButton>
          
          <IconButton 
            component={Link} 
            to="/explore" 
            color={location.pathname === '/explore' ? 'primary' : 'default'}
            sx={{ 
              color: location.pathname === '/explore' ? '#8B5CF6' : 'white',
              mx: { xs: 1, sm: 2 }
            }}
          >
            <SearchIcon />
          </IconButton>
          
          <IconButton 
            component={Link} 
            to="/upload" 
            color={location.pathname === '/upload' ? 'primary' : 'default'}
            sx={{ 
              color: location.pathname === '/upload' ? '#8B5CF6' : 'white',
              mx: { xs: 1, sm: 2 }
            }}
          >
            <AddAPhotoIcon />
          </IconButton>
          
          <IconButton 
            component={Link} 
            to="/gallery" 
            color={location.pathname === '/gallery' ? 'primary' : 'default'}
            sx={{ 
              color: location.pathname === '/gallery' ? '#8B5CF6' : 'white',
              mx: { xs: 1, sm: 2 }
            }}
          >
            <PhotoLibraryIcon />
          </IconButton>
        </Box>

        {/* User Menu */}
        <Box>
          <IconButton 
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            {user?.avatar ? (
              <Avatar 
                src={user.avatar} 
                alt={user.displayName || user.handle}
                sx={{ width: 32, height: 32, border: '2px solid #8B5CF6' }}
              />
            ) : (
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: '#8B5CF6',
                  color: 'white'
                }}
              >
                {user?.handle?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            )}
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                bgcolor: '#121212',
                color: 'white',
                border: '1px solid #333',
                mt: 1.5,
                '& .MuiMenuItem-root:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem 
              component={Link} 
              to="/profile" 
              onClick={handleClose}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
