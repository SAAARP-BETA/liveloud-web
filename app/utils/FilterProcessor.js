
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Applies transformations to images using Expo ImageManipulator
 * Since Expo ImageManipulator doesn't support direct filter effects,
 * we store the filter type and apply visual effects at render time
 */
export const processImage = async (imageUri, editOptions) => {
  try {
    // Parse the edit options
    const { rotate, flip, crop, filter } = editOptions;
    
    // Build the manipulator actions
    const actions = [];
    
    // Add rotation if specified
    if (rotate && rotate !== 0) {
      actions.push({ rotate });
    }
    
    // Add horizontal flip if specified
    if (flip?.horizontal) {
      actions.push({ flip: ImageManipulator.FlipType.Horizontal });
    }
    
    // Add vertical flip if specified
    if (flip?.vertical) {
      actions.push({ flip: ImageManipulator.FlipType.Vertical });
    }
    
    // Add crop if specified
    if (crop) {
      actions.push({ crop });
    }
    
    // Save options
    const saveOptions = { 
      compress: 0.85, 
      format: ImageManipulator.SaveFormat.JPEG 
    };
    
    // Apply manipulations if there are any
    if (actions.length > 0) {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        saveOptions
      );
      
      // Return the processed image URI and filter type
      return {
        uri: result.uri,
        filter: filter
      };
    }
    
    // Return the original image URI and filter type if no manipulations
    return {
      uri: imageUri,
      filter: filter
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      uri: imageUri,
      filter: null
    };
  }
};

/**
 * Get CSS-style background color for filter preview
 */
export const getFilterBackgroundColor = (filterType) => {
  switch (filterType) {
    case 'grayscale':
      return 'rgba(0,0,0,0.1)';
    case 'sepia':
      return 'rgba(255,188,107,0.2)';
    case 'highContrast':
      return 'transparent';
    case 'vintage':
      return 'rgba(255,235,205,0.2)';
    case 'cool':
      return 'rgba(173,216,230,0.15)';
    case 'warm':
      return 'rgba(255,160,122,0.15)';
    default:
      return 'transparent';
  }
};