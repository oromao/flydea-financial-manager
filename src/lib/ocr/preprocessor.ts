import sharp from "sharp";
import { logger } from "@/lib/logger";

export class OCRPreprocessor {
  /**
   * Enhances image quality for OCR.
   * Grayscale + High Contrast + Resize.
   */
  async optimize(buffer: Buffer): Promise<Buffer> {
    logger.info("OCRPreprocessor: optimizing image");
    try {
      return await sharp(buffer)
        .grayscale()
        .normalize() // Enhances contrast
        .sharpen()
        .toBuffer();
    } catch (error) {
      logger.warn("OCRPreprocessor: failed to optimize, using original", { error });
      return buffer;
    }
  }

  /**
   * Simple heuristic to detect if PDF is text-based or scanned.
   * This is usually better handled in the main pipeline.
   */
  isLikelyScanned(buffer: Buffer): boolean {
    // Basic check: if very small but valid PDF, likely text.
    // If large (>500kb per page), likely image.
    return buffer.length > 1024 * 500;
  }
}

export const ocrPreprocessor = new OCRPreprocessor();
