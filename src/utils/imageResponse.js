/**
 * Answer values that should render as an image.
 *
 * Inspection photos used to be stored only as base64 data URIs inside the
 * answer value. They are now uploaded and stored as hosted URLs instead, so
 * every render site has to accept both shapes: existing inspections keep their
 * base64 answers indefinitely and must keep displaying.
 */

const IMAGE_EXTENSION = /\.(png|jpe?g|webp|gif|heic|heif)(\?|#|$)/i;

export const isBase64Image = (value) => (
  typeof value === 'string' && value.startsWith('data:image/')
);

export const isHostedImageUrl = (value) => (
  typeof value === 'string'
  && /^https?:\/\//i.test(value)
  && (IMAGE_EXTENSION.test(value) || value.includes('/image/upload/'))
);

export const isImageResponse = (value) => isBase64Image(value) || isHostedImageUrl(value);

export default isImageResponse;
