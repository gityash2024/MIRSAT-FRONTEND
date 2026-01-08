/**
 * File validation utility
 * Validates file size (1MB limit) and file formats
 */

const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes

// Allowed file formats - ONLY IMAGES (jpg, jpeg, png)
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png'
];

// Allowed file extensions - ONLY IMAGES (for fallback validation)
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];

/**
 * Gets file extension from filename
 * @param {string} filename - The filename
 * @returns {string} - File extension in lowercase
 */
const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  // Handle files with multiple dots and whitespace
  const trimmedName = filename.trim();
  const parts = trimmedName.split('.');
  if (parts.length < 2) {
    return '';
  }
  // Get the last part (extension) and convert to lowercase
  const extension = parts[parts.length - 1].toLowerCase().trim();
  return extension;
};

/**
 * Validates file format
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export const validateFileFormat = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Get file extension (always check this - primary validation)
  const fileExtension = getFileExtension(file.name);
  
  // Log file details for debugging
  console.log('🔍 Frontend Validation - File details:', {
    name: file.name,
    extension: fileExtension,
    mimeType: file.type,
    size: file.size,
    sizeKB: (file.size / 1024).toFixed(2) + ' KB'
  });
  
  // Check if file has an extension
  if (!fileExtension || fileExtension === '') {
    console.error('❌ File validation failed - no extension found:', file.name);
    return {
      valid: false,
      error: 'File has no extension. Please upload an image file (JPG, JPEG, or PNG).'
    };
  }
  
  // Check if extension is in allowed list (primary check - STRICT)
  const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension);
  
  if (!isValidExtension) {
    console.error('❌ File validation failed - invalid extension:', {
      extension: fileExtension,
      allowed: ALLOWED_EXTENSIONS,
      file: file.name
    });
    return {
      valid: false,
      error: `File format "${fileExtension.toUpperCase()}" is not allowed. Please upload an image file (JPG, JPEG, or PNG).`
    };
  }
  
  console.log('✅ File extension validation passed:', fileExtension);

  // Also validate MIME type if available (secondary check for extra security)
  // Some browsers may have incorrect MIME types, so we allow if extension is valid
  // But if MIME type is provided and doesn't match, log a warning but still allow if extension is valid
  if (file.type && file.type !== '') {
    const normalizedMimeType = file.type.toLowerCase();
    const isValidMimeType = ALLOWED_FILE_TYPES.includes(normalizedMimeType);
    
    // If MIME type doesn't match but extension does, still allow (some browsers have incorrect MIME types)
    // But log for debugging
    if (!isValidMimeType) {
      console.warn(`File "${file.name}" has MIME type "${file.type}" which doesn't match allowed types, but extension "${fileExtension}" is valid. Allowing upload.`);
    }
  } else {
    // No MIME type provided - rely on extension check only
    console.log(`File "${file.name}" has no MIME type, relying on extension check (${fileExtension})`);
  }

  console.log('File validation passed:', file.name);
  return { valid: true };
};

/**
 * Validates file size
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export const validateFileSize = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB} MB) exceeds the maximum allowed size of 1 MB. Please choose a smaller file.`
    };
  }

  return { valid: true };
};

/**
 * Validates both file size and format
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Validate format first
  const formatValidation = validateFileFormat(file);
  if (!formatValidation.valid) {
    return formatValidation;
  }

  // Validate size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
};

/**
 * Validates file format and shows toast if invalid
 * @param {File} file - The file to validate
 * @param {Function} toast - Toast function to show info
 * @param {Function} t - Translation function (optional)
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateFileFormatWithToast = (file, toast, t = null) => {
  const validation = validateFileFormat(file);
  
  if (!validation.valid) {
    const errorMessage = t 
      ? t('tasks.invalidFileFormat', { defaultValue: validation.error })
      : validation.error;
    toast(errorMessage, { icon: 'ℹ️' });
    return false;
  }
  
  return true;
};

/**
 * Validates file size and shows info toast if invalid
 * @param {File} file - The file to validate
 * @param {Function} toast - Toast function to show info
 * @param {Function} t - Translation function (optional)
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateFileSizeWithToast = (file, toast, t = null) => {
  const validation = validateFileSize(file);
  
  if (!validation.valid) {
    const errorMessage = t 
      ? t('tasks.fileSizeExceedsLimit', { defaultValue: validation.error })
      : validation.error;
    toast(errorMessage, { icon: 'ℹ️' });
    return false;
  }
  
  return true;
};

/**
 * Validates both file size and format with toast notifications
 * @param {File} file - The file to validate
 * @param {Function} toast - Toast function to show info
 * @param {Function} t - Translation function (optional)
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateFileWithToast = (file, toast, t = null) => {
  if (!file) {
    const errorMessage = 'No file provided';
    toast(errorMessage, { icon: 'ℹ️' });
    return false;
  }

  // Validate format first - if this fails, STOP immediately
  const formatValidation = validateFileFormat(file);
  if (!formatValidation.valid) {
    const errorMessage = t 
      ? t('tasks.invalidFileFormat', { defaultValue: formatValidation.error })
      : formatValidation.error;
    toast(errorMessage, { icon: 'ℹ️' });
    console.error('❌ File format validation FAILED - blocking upload:', formatValidation.error);
    return false; // CRITICAL: Return false to block upload
  }

  // Validate size - if this fails, STOP immediately
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    const errorMessage = t 
      ? t('tasks.fileSizeExceedsLimit', { defaultValue: sizeValidation.error })
      : sizeValidation.error;
    toast(errorMessage, { icon: 'ℹ️' });
    console.error('❌ File size validation FAILED - blocking upload:', sizeValidation.error);
    return false; // CRITICAL: Return false to block upload
  }

  console.log('✅ File validation PASSED - file is valid for upload');
  return true; // Only return true if BOTH validations pass
};

/**
 * Handles 413 Content Too Large error
 * @param {Error} error - The error object
 * @param {Function} toast - Toast function to show info
 * @param {Function} t - Translation function (optional)
 */
export const handleFileSizeError = (error, toast, t = null) => {
  if (error.response?.status === 413 || error.status === 413) {
    const errorMessage = t
      ? t('tasks.fileSizeExceedsLimit', { defaultValue: 'File size exceeds the maximum allowed size of 1 MB. Please choose a smaller file.' })
      : 'File size exceeds the maximum allowed size of 1 MB. Please choose a smaller file.';
    toast(errorMessage, { icon: 'ℹ️' });
    return true;
  }
  return false;
};

export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS };

