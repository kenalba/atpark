import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  IconButton, 
  TextField,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import usePhotos from '../../hooks/usePhotos';
import atProtoService from '../../services/atproto';
import { Photo } from '../../types';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

const PhotoDetail: React.FC = () => {
  const { photoUri } = useParams<{ photoUri: string }>();
  const { photos, isLoading, error, fetchPhotos } = usePhotos();
  const navigate = useNavigate();
  
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isTagging, setIsTagging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find the photo based on the URI parameter
  useEffect(() => {
    if (photoUri && photos.length > 0) {
      const decodedUri = decodeURIComponent(photoUri);
      console.log('PhotoDetail: Looking for photo with URI:', decodedUri);
      console.log('PhotoDetail: Available photos:', photos);
      
      const foundPhoto = photos.find(p => p.uri === decodedUri);
      
      if (foundPhoto) {
        console.log('PhotoDetail: Found photo:', foundPhoto);
        setPhoto(foundPhoto);
        setTags(foundPhoto.tags || []);
      } else {
        console.log('PhotoDetail: Photo not found in current photos array');
        // If photo not found in current photos array, try to fetch it
        // This could happen if the user navigates directly to the photo detail page
        fetchPhotos();
      }
    }
  }, [photoUri, photos, fetchPhotos]);

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Toggle tagging mode
  const toggleTagging = () => {
    if (isTagging) {
      // If we're exiting tagging mode, reset tags to original
      setTags(photo?.tags || []);
    }
    setIsTagging(!isTagging);
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input keypress (add tag on Enter)
  const handleTagKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  // Save tags
  const handleSaveTags = async () => {
    if (!photo) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create a new photo record with updated tags
      const updatedPhotoData = {
        image: photo.image,
        thumbnail: photo.thumbnail,
        tags: tags,
        location: photo.location,
        visibility: photo.visibility,
        description: photo.description,
        createdAt: photo.createdAt
      };
      
      // Create a new record in the repository
      const response = await atProtoService.createPhoto(updatedPhotoData);
      
      if (response.success && response.data) {
        // Update the photo in state
        setPhoto({
          ...photo,
          tags: tags
        });
        
        // Exit tagging mode
        setIsTagging(false);
        
        // Show success message
        setSaveSuccess(true);
        
        // Refresh photos to get the updated list
        fetchPhotos();
      } else {
        setSaveError(response.error || 'Failed to save tags');
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unknown error saving tags');
    } finally {
      setIsSaving(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPhotos();
  };

  // Close success snackbar
  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  if (isLoading && !photo) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white'
        }}
      >
        <CircularProgress sx={{ color: '#8B5CF6' }} />
      </Box>
    );
  }

  if (error && !photo) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          color: '#f44336',
          mt: 8
        }}
      >
        <Typography variant="h6" gutterBottom>
          Error loading photo: {error}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ 
            mt: 2,
            bgcolor: '#8B5CF6', 
            '&:hover': {
              bgcolor: '#7C3AED',
            }
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!photo) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          color: 'white',
          mt: 8
        }}
      >
        <Typography variant="h6">
          Photo not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/gallery')}
          sx={{ 
            mt: 2,
            bgcolor: '#8B5CF6', 
            '&:hover': {
              bgcolor: '#7C3AED',
            }
          }}
        >
          Back to Gallery
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        bgcolor: '#000000', 
        minHeight: '100vh',
        pt: 8
      }}
    >
      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ width: '100%', bgcolor: 'rgba(46, 125, 50, 0.9)' }}
        >
          Tags saved successfully!
        </Alert>
      </Snackbar>
      {/* Header */}
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          bgcolor: '#000000',
          borderBottom: '1px solid #333',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <IconButton 
          onClick={handleBack}
          sx={{ color: 'white' }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {isTagging ? 'Tag Friends' : 'Photo'}
        </Typography>
        
        <Box sx={{ width: 40 }} /> {/* Spacer for alignment */}
      </Box>
      
      {/* Main Content */}
      <Box 
        sx={{ 
          maxWidth: 800, 
          mx: 'auto', 
          p: { xs: 2, sm: 3 },
          color: 'white'
        }}
      >
        {/* Photo */}
        <Paper 
          elevation={3} 
          sx={{ 
            bgcolor: '#121212',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 3
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={photo.image}
              alt={photo.description || 'Photo'}
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                bgcolor: '#000'
              }}
            />
            
            {/* Tagging UI */}
            {isTagging && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  bottom: 16,
                  left: 0,
                  right: 0,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Tap anywhere on the photo to add a tag!
                </Typography>
                
                <Box 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      avatar={
                        <Avatar 
                          sx={{ 
                            bgcolor: '#8B5CF6',
                            color: 'white'
                          }}
                        >
                          {tag.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{ 
                        bgcolor: 'rgba(0, 0, 0, 0.7)', 
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                          '&:hover': {
                            color: '#f44336',
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Photo Info */}
          <Box sx={{ p: 2 }}>
            {/* User Info */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 2
              }}
            >
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  mr: 1.5,
                  bgcolor: '#8B5CF6'
                }}
              >
                {photo.authorDid.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {photo.authorDid.split(':')[1]?.substring(0, 8) || photo.authorDid}
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                  {formatDate(photo.createdAt)}
                </Typography>
              </Box>
            </Box>
            
            {/* Location */}
            {photo.location && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {photo.location}
                </Typography>
              </Box>
            )}
            
            {/* Description */}
            {photo.description && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {photo.description}
              </Typography>
            )}
            
            {/* Tags */}
            {!isTagging && tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(139, 92, 246, 0.2)', 
                        color: '#8B5CF6',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Tagging Interface */}
            {isTagging && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    label="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    fullWidth
                    sx={{ 
                      mr: 1,
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
                    onClick={handleAddTag}
                    variant="contained"
                    sx={{ 
                      bgcolor: '#8B5CF6', 
                      '&:hover': {
                        bgcolor: '#7C3AED',
                      }
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Box>
                
                {/* Error message */}
                {saveError && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2, 
                      bgcolor: 'rgba(211, 47, 47, 0.1)',
                      color: '#f44336'
                    }}
                  >
                    {saveError}
                  </Alert>
                )}
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveTags}
                  disabled={isSaving}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: '#8B5CF6', 
                    '&:hover': {
                      bgcolor: '#7C3AED',
                    },
                    borderRadius: 8
                  }}
                >
                  {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Tags'}
                </Button>
              </Box>
            )}
            
            <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            
            {/* Action Buttons */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                pt: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  sx={{ color: '#f44336', mr: 1 }}
                >
                  <FavoriteIcon />
                </IconButton>
                <Typography variant="body2">26</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  sx={{ color: 'white', mr: 1 }}
                >
                  <ChatBubbleOutlineIcon />
                </IconButton>
                <Typography variant="body2">2</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  sx={{ color: 'white', mr: 1 }}
                  onClick={toggleTagging}
                >
                  {isTagging ? <CloseIcon /> : <AddIcon />}
                </IconButton>
                <Typography variant="body2">
                  {isTagging ? 'Cancel' : 'Tag'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  sx={{ color: 'white', mr: 1 }}
                >
                  <ShareIcon />
                </IconButton>
                <Typography variant="body2">Share</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default PhotoDetail;
