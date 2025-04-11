import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress, 
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import usePhotos from '../../hooks/usePhotos';
import imageService from '../../services/imageService';

const PhotoUpload: React.FC = () => {
  const { createPhoto, isLoading, error } = usePhotos({ autoFetch: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'shared'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset states
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  // Trigger file input click
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle visibility change
  const handleVisibilityChange = (event: SelectChangeEvent) => {
    setVisibility(event.target.value as 'public' | 'private' | 'shared');
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

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadError(null);
    
    if (!selectedFile) {
      setUploadError('Please select a photo to upload');
      return;
    }

    try {
      // First, upload the image to Cloudflare R2
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
        });
      }, 300);
      
      console.log('Starting image upload process...');
      
      // Upload the image
      const uploadResponse = await imageService.uploadImage(selectedFile);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!uploadResponse.success || !uploadResponse.data) {
        console.error('Image upload failed:', uploadResponse.error);
        setUploadError(uploadResponse.error || 'Failed to upload image');
        setIsUploading(false);
        return;
      }
      
      console.log('Image uploaded successfully:', uploadResponse.data.url);
      
      // Generate a thumbnail (or use the same image for now)
      const thumbnailResponse = await imageService.generateThumbnail(selectedFile);
      
      if (!thumbnailResponse.success || !thumbnailResponse.data) {
        // If thumbnail generation fails, we can still proceed with the original image
        console.warn('Failed to generate thumbnail:', thumbnailResponse.error);
      }
      
      // Now create the photo record with the image URL
      const response = await createPhoto({
        image: uploadResponse.data.url,
        thumbnail: thumbnailResponse.success && thumbnailResponse.data ? thumbnailResponse.data.url : uploadResponse.data.url,
        description,
        location,
        visibility,
        tags,
        createdAt: new Date().toISOString()
      });
      
      setIsUploading(false);
      
      if (response.success) {
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setDescription('');
        setLocation('');
        setVisibility('public');
        setTags([]);
        setUploadSuccess(true);
      } else {
        setUploadError(response.error || 'Failed to create photo record');
      }
    } catch (err) {
      setIsUploading(false);
      setUploadError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <Box 
      sx={{ 
        p: 3, 
        maxWidth: 600, 
        mx: 'auto', 
        mt: 8,
        color: 'white'
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Upload a Photo
      </Typography>
      
      {uploadSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            bgcolor: 'rgba(46, 125, 50, 0.1)',
            color: '#81c784'
          }}
        >
          Photo uploaded successfully!
        </Alert>
      )}
      
      {(error || uploadError) && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            color: '#f44336'
          }}
        >
          {error || uploadError}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          bgcolor: '#121212',
          borderRadius: 4
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Photo Upload Area */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 3
            }}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {previewUrl ? (
              <Box 
                sx={{ 
                  position: 'relative',
                  width: '100%',
                  mb: 2
                }}
              >
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid #333'
                  }}
                />
                <IconButton
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={handleSelectFile}
                startIcon={<PhotoCameraIcon />}
                sx={{ 
                  p: 5, 
                  mb: 2, 
                  width: '100%',
                  borderColor: '#333',
                  color: 'white',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#8B5CF6',
                    bgcolor: 'rgba(139, 92, 246, 0.1)'
                  }
                }}
              >
                Select a Photo
              </Button>
            )}
          </Box>
          
          {/* Description */}
          <TextField
            label="Description"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          
          {/* Location */}
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
          
          {/* Visibility */}
          <FormControl 
            fullWidth 
            margin="normal"
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
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              }
            }}
          >
            <InputLabel id="visibility-label">Visibility</InputLabel>
            <Select
              labelId="visibility-label"
              value={visibility}
              label="Visibility"
              onChange={handleVisibilityChange}
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="shared">Shared</MenuItem>
            </Select>
          </FormControl>
          
          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                sx={{ 
                  flexGrow: 1,
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
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ 
                    bgcolor: '#8B5CF6', 
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
          
          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 1 }}>
                Uploading image... {uploadProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#8B5CF6',
                  }
                }}
              />
            </Box>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || isUploading || !selectedFile}
            startIcon={!isLoading && !isUploading ? <CloudUploadIcon /> : undefined}
            sx={{ 
              py: 1.5, 
              bgcolor: '#8B5CF6', 
              '&:hover': {
                bgcolor: '#7C3AED',
              },
              borderRadius: 8
            }}
          >
            {isLoading || isUploading ? <CircularProgress size={24} color="inherit" /> : 'Upload Photo'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PhotoUpload;
