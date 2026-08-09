const MIN_WIDTH = 100;
const MIN_HEIGHT = 40;
const MAX_DIMENSION = 4096;
const MIN_INK_PIXELS = 50;
const MIN_INK_RATIO = 0.001;

export const validateSignatureDataUrl = (dataUrl) => new Promise((resolve) => {
  if (
    typeof dataUrl !== 'string'
    || !/^data:image\/(png|jpeg|jpg);base64,/i.test(dataUrl)
  ) {
    resolve({ valid: false, message: 'Please select a PNG or JPEG signature image.' });
    return;
  }

  const image = new Image();
  image.onload = () => {
    if (
      image.naturalWidth < MIN_WIDTH
      || image.naturalHeight < MIN_HEIGHT
      || image.naturalWidth > MAX_DIMENSION
      || image.naturalHeight > MAX_DIMENSION
    ) {
      resolve({ valid: false, message: 'Signature image dimensions are invalid.' });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
      resolve({ valid: false, message: 'Signature image could not be validated.' });
      return;
    }

    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const totalPixels = canvas.width * canvas.height;
    let inkPixels = 0;

    for (let offset = 0; offset < pixels.length; offset += 4) {
      const visible = pixels[offset + 3] >= 32;
      const darkerThanBackground = Math.min(
        pixels[offset],
        pixels[offset + 1],
        pixels[offset + 2]
      ) <= 245;
      if (visible && darkerThanBackground) inkPixels += 1;
    }

    if (inkPixels < MIN_INK_PIXELS || (inkPixels / totalPixels) < MIN_INK_RATIO) {
      resolve({ valid: false, message: 'Signature cannot be blank.' });
      return;
    }

    resolve({ valid: true });
  };
  image.onerror = () => {
    resolve({ valid: false, message: 'Signature image could not be decoded.' });
  };
  image.src = dataUrl;
});

