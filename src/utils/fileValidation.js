/**
 * File validation utility
 * Validates file size (900KB limit) and provides error messages
 */

const MAX_FILE_SIZE = 900 * 1024; // 900KB in bytes

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
    const fileSizeKB = (file.size / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeKB} KB) exceeds the maximum allowed size of 900 KB. Please choose a smaller file.`
    };
  }

  return { valid: true };
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
 * Handles 413 Content Too Large error
 * @param {Error} error - The error object
 * @param {Function} toast - Toast function to show info
 * @param {Function} t - Translation function (optional)
 */
export const handleFileSizeError = (error, toast, t = null) => {
  if (error.response?.status === 413 || error.status === 413) {
    const errorMessage = t
      ? t('tasks.fileSizeExceedsLimit', { defaultValue: 'File size exceeds the maximum allowed size of 900 KB. Please choose a smaller file.' })
      : 'File size exceeds the maximum allowed size of 900 KB. Please choose a smaller file.';
    toast(errorMessage, { icon: 'ℹ️' });
    return true;
  }
  return false;
};

export { MAX_FILE_SIZE };

