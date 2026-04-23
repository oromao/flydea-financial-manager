import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadFileToBlobStorage, deleteFileFromBlobStorage, checkBlobFileExists } from "@/lib/blob-storage";
import * as vercelBlob from "@vercel/blob";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  head: vi.fn(),
  del: vi.fn(),
}));

describe("Blob Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFileToBlobStorage", () => {
    it("should upload a file and return the URL", async () => {
      const mockUrl = "https://mock-url.com/file.pdf";
      vi.mocked(vercelBlob.put).mockResolvedValue({ url: mockUrl } as any);

      const buffer = Buffer.from("mock content");
      const url = await uploadFileToBlobStorage("test.pdf", buffer, "application/pdf");

      expect(url).toBe(mockUrl);
      expect(vercelBlob.put).toHaveBeenCalledTimes(1);
      
      const args = vi.mocked(vercelBlob.put).mock.calls[0];
      expect(args[0]).toMatch(/^documents\/\d+-test\.pdf$/); // filename check
      expect(args[1]).toBe(buffer);
      expect(args[2]).toEqual({ contentType: "application/pdf", access: "private" });
    });

    it("should throw an error if upload fails", async () => {
      vi.mocked(vercelBlob.put).mockRejectedValue(new Error("Upload failed"));

      const buffer = Buffer.from("mock content");
      await expect(uploadFileToBlobStorage("test.pdf", buffer, "application/pdf")).rejects.toThrow("Falha ao salvar arquivo: Upload failed");
    });
  });

  describe("deleteFileFromBlobStorage", () => {
    it("should delete a file if URL is provided", async () => {
      await deleteFileFromBlobStorage("https://mock-url.com/file.pdf");
      expect(vercelBlob.del).toHaveBeenCalledWith("https://mock-url.com/file.pdf");
    });

    it("should do nothing if URL is empty", async () => {
      await deleteFileFromBlobStorage("");
      expect(vercelBlob.del).not.toHaveBeenCalled();
    });

    it("should not throw if delete fails (warns only)", async () => {
      vi.mocked(vercelBlob.del).mockRejectedValue(new Error("Delete failed"));
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await expect(deleteFileFromBlobStorage("https://mock-url.com/file.pdf")).resolves.not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith("Blob deletion error (non-critical):", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("checkBlobFileExists", () => {
    it("should return true if fetch is ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });
      const exists = await checkBlobFileExists("https://mock-url.com/file.pdf");
      expect(exists).toBe(true);
      expect(fetch).toHaveBeenCalledWith("https://mock-url.com/file.pdf", { method: "HEAD" });
    });

    it("should return false if fetch is not ok", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      const exists = await checkBlobFileExists("https://mock-url.com/file.pdf");
      expect(exists).toBe(false);
    });

    it("should return false if fetch throws", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const exists = await checkBlobFileExists("https://mock-url.com/file.pdf");
      expect(exists).toBe(false);
    });
  });
});
