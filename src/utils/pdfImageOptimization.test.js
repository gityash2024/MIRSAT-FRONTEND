import { afterEach, describe, expect, it, vi } from 'vitest';
import { PDF_IMAGE_PRESETS, getPdfImageDimensions, optimizePdfImage } from './pdfImageOptimization';

describe('PDF image optimisation dimensions', () => {
  it('keeps print-quality header logos within their intended output size', () => {
    expect(getPdfImageDimensions(2098, 730, PDF_IMAGE_PRESETS.srsaLogo)).toEqual({ width: 720, height: 251 });
    expect(getPdfImageDimensions(160, 160, PDF_IMAGE_PRESETS.mirsatLogo)).toEqual({ width: 160, height: 160 });
  });

  it('downsizes oversized evidence without upscaling small images', () => {
    expect(getPdfImageDimensions(1600, 1200, PDF_IMAGE_PRESETS.evidence)).toEqual({ width: 800, height: 600 });
    expect(getPdfImageDimensions(320, 180, PDF_IMAGE_PRESETS.evidence)).toEqual({ width: 320, height: 180 });
  });

  it('rejects invalid image dimensions', () => {
    expect(getPdfImageDimensions(0, 100, PDF_IMAGE_PRESETS.evidence)).toBeNull();
  });
});

describe('PDF image optimisation encoding', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const mockCanvasEnvironment = ({ transparent }) => {
    const context = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([0, 0, 0, transparent ? 0 : 255]) })),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      globalCompositeOperation: 'source-over',
      fillStyle: ''
    };
    const canvas = {
      getContext: vi.fn(() => context),
      toDataURL: vi.fn((mime) => `data:${mime};base64,optimized`)
    };

    vi.stubGlobal('Image', class {
      naturalWidth = 2098;
      naturalHeight = 730;
      set src(_value) { queueMicrotask(() => this.onload()); }
    });
    vi.spyOn(document, 'createElement').mockReturnValue(canvas);
    return { canvas, context };
  };

  it('uses JPEG for opaque report assets and retains the supplied alias', async () => {
    const { canvas } = mockCanvasEnvironment({ transparent: false });
    const asset = await optimizePdfImage('data:image/png;base64,source', {
      ...PDF_IMAGE_PRESETS.srsaLogo,
      alias: 'srsa-header'
    });

    expect(asset).toEqual({
      data: 'data:image/jpeg;base64,optimized',
      format: 'JPEG',
      alias: 'srsa-header'
    });
    expect(canvas.width).toBe(720);
    expect(canvas.height).toBe(251);
  });

  it('keeps transparent signatures as PNG', async () => {
    mockCanvasEnvironment({ transparent: true });
    const asset = await optimizePdfImage('data:image/png;base64,signature', PDF_IMAGE_PRESETS.signature);

    expect(asset.format).toBe('PNG');
    expect(asset.data).toBe('data:image/png;base64,optimized');
  });
});
