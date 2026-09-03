// PDF reports display images at small, fixed dimensions.  Passing original
// camera/logo pixels to jsPDF unnecessarily inflates the final document, so
// resize once at a print-quality resolution before embedding the image.
export const PDF_IMAGE_PRESETS = Object.freeze({
  mirsatLogo: Object.freeze({ maxWidth: 240, maxHeight: 240, jpegQuality: 0.9 }),
  srsaLogo: Object.freeze({ maxWidth: 720, maxHeight: 260, jpegQuality: 0.9 }),
  evidence: Object.freeze({ maxWidth: 800, maxHeight: 800, jpegQuality: 0.84 }),
  signature: Object.freeze({ maxWidth: 900, maxHeight: 360, jpegQuality: 0.9 })
});

export const getPdfImageDimensions = (width, height, { maxWidth, maxHeight }) => {
  const sourceWidth = Number(width);
  const sourceHeight = Number(height);

  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
    return null;
  }

  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale))
  };
};

const inferPdfImageFormat = (source) => (
  /^data:image\/(?:jpeg|jpg)/i.test(String(source || '')) ? 'JPEG' : 'PNG'
);

const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = source;
});

const hasTransparency = (context, width, height) => {
  const pixels = context.getImageData(0, 0, width, height).data;
  // Sampling every fourth pixel is sufficient to identify a transparent
  // background without unnecessarily walking every large source bitmap.
  for (let offset = 3; offset < pixels.length; offset += 16) {
    if (pixels[offset] < 255) return true;
  }
  return false;
};

/**
 * Returns an image asset ready for jsPDF. If the browser cannot decode a
 * source, retain the original image so report generation never loses data.
 */
export const optimizePdfImage = async (source, options = {}) => {
  if (!source || typeof source !== 'string') return null;

  const { alias, ...preset } = options;
  const settings = { ...PDF_IMAGE_PRESETS.evidence, ...preset };

  try {
    const image = await loadImage(source);
    const dimensions = getPdfImageDimensions(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      settings
    );
    if (!dimensions) throw new Error('Image dimensions are invalid');

    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Canvas is unavailable');

    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    const transparent = hasTransparency(context, dimensions.width, dimensions.height);
    const format = transparent ? 'PNG' : 'JPEG';

    if (!transparent) {
      context.save();
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, dimensions.width, dimensions.height);
      context.restore();
    }

    return {
      data: canvas.toDataURL(format === 'PNG' ? 'image/png' : 'image/jpeg', settings.jpegQuality),
      format,
      alias
    };
  } catch {
    return { data: source, format: inferPdfImageFormat(source), alias };
  }
};
