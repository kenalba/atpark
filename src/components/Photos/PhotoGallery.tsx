import React, { useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  CircularProgress, 
  IconButton,
  Chip,
  Divider,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import usePhotos from '../../hooks/usePhotos';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';

const PhotoGallery: React.FC = () => {
  const { 
    photos, 
    isLoading, 
    error, 
    hasMore, 
    fetchPhotos, 
    loadMorePhotos 
  } = usePhotos({ limit: 10 });
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPhotoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    // Disconnect the previous observer if it exists
    if (observer.current) observer.current.disconnect();
    
    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible and we have more photos to load
      if (entries[0].isIntersecting && hasMore) {
        loadMorePhotos();
      }
    });
    
    // Observe the last element
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMorePhotos]);

  useEffect(() => {
    // Add console logs to help debug photo fetching
    console.log('PhotoGallery: Fetching photos on mount');
    fetchPhotos().then(success => {
      console.log('PhotoGallery: Initial fetch completed, success:', success);
      console.log('PhotoGallery: Current photos:', photos);
    });
  }, [fetchPhotos]);

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

  // Initial loading state
  if (isLoading && photos.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'white'
        }}
      >
        <CircularProgress sx={{ color: '#8B5CF6' }} />
      </Box>
    );
  }

  // Error state
  if (error && photos.length === 0) {
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
          Error loading photos: {error}
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

  // Empty state
  if (photos.length === 0) {
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
          No photos found. Upload some photos to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 1, sm: 2, md: 3 }, 
        mt: 8,
        bgcolor: '#000000',
        minHeight: '100vh'
      }}
    >
      {/* Refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
          sx={{ 
            color: 'white',
            borderColor: '#8B5CF6',
            '&:hover': {
              borderColor: '#7C3AED',
              bgcolor: 'rgba(139, 92, 246, 0.1)'
            }
          }}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Photo grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' }, gap: 2 }}>
        {photos.map((photo, index) => {
          const isLastElement = index === photos.length - 1;
          
          return (
            <Box 
              key={photo.uri} 
              ref={isLastElement ? lastPhotoElementRef : null}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  bgcolor: '#121212',
                  color: 'white',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }
                }}
              >
                {/* Photo */}
                <Box 
                  component={Link} 
                  to={`/photo/${encodeURIComponent(photo.uri)}`}
                  sx={{ 
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <Box
                    component="img"
                    src={photo.image}
                    alt={photo.description || 'Photo'}
                    sx={{
                      width: '100%',
                      height: 300,
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                
                {/* Photo Info */}
                <Box sx={{ p: 2 }}>
                  {/* User Info */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1,
                        bgcolor: '#8B5CF6'
                      }}
                    >
                      {photo.authorDid.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {photo.authorDid.split(':')[1]?.substring(0, 8) || photo.authorDid}
                    </Typography>
                  </Box>
                  
                  {/* Location and Date */}
                  {photo.location && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 1,
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {photo.location}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 1 }}>
                    {formatDate(photo.createdAt)}
                  </Typography>
                  
                  {/* Description */}
                  {photo.description && (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {photo.description}
                    </Typography>
                  )}
                  
                  {/* Tags */}
                  {photo.tags && photo.tags.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {photo.tags.map((tag) => (
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
                  )}
                  
                  <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                  
                  {/* Interaction Buttons */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      pt: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        sx={{ color: '#f44336', mr: 1 }}
                      >
                        <FavoriteIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">26</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white', mr: 1 }}
                      >
                        <ChatBubbleOutlineIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">2</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white', mr: 1 }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">3</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          );
        })}
      </Box>
      
      {/* Loading indicator for pagination */}
      {isLoading && photos.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <CircularProgress size={30} sx={{ color: '#8B5CF6' }} />
        </Box>
      )}
      
      {/* Load more button (fallback for when intersection observer doesn't work) */}
      {hasMore && !isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button 
            variant="contained"
            onClick={() => loadMorePhotos()}
            sx={{ 
              bgcolor: '#8B5CF6', 
              '&:hover': {
                bgcolor: '#7C3AED',
              }
            }}
          >
            Load More
          </Button>
        </Box>
      )}
      
      {/* End of results message */}
      {!hasMore && photos.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4, mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          <Typography variant="body2">
            You've reached the end of the photos
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PhotoGallery;
