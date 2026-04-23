import { describe, it, expect, vi, beforeEach } from "vitest";
import { ocrPreprocessor } from "@/lib/ocr/preprocessor";
import sharp from "sharp";

vi.mock("sharp", () => {
  const m = {
    grayscale: vi.fn().mockReturnThis(),
    normalize: vi.fn().mockReturnThis(),
    sharpen: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("optimized")),
  };
  return { default: vi.fn(() => m) };
});

describe("OCRPreprocessor", () => {
  it("should use sharp to optimize images", async () => {
    const input = Buffer.from("original");
    const output = await ocrPreprocessor.optimize(input);
    
    expect(sharp).toHaveBeenCalledWith(input);
    expect(output.toString()).toBe("optimized");
  });

  it("should detect likely scanned PDFs by size", () => {
    const small = Buffer.alloc(1024 * 10);
    const large = Buffer.alloc(1024 * 600);
    
    expect(ocrPreprocessor.isLikelyScanned(small)).toBe(false);
    expect(ocrPreprocessor.isLikelyScanned(large)).toBe(true);
  });
});
