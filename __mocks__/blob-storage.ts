export const mockBlobUrl = "https://blob.vercel-storage.com/mock/test.pdf";

export async function uploadBlob(file: File | Buffer, filename: string): Promise<{ url: string; id: string }> {
  return Promise.resolve({
    url: mockBlobUrl,
    id: `mock-${Date.now()}`,
  });
}

export async function deleteBlob(url: string): Promise<boolean> {
  return Promise.resolve(true);
}

export async function getBlobMetadata(url: string): Promise<{ size: number; contentType: string; uploadedAt: Date }> {
  return Promise.resolve({
    size: 1024,
    contentType: "application/pdf",
    uploadedAt: new Date(),
  });
}

export const blobStorage = {
  upload: uploadBlob,
  delete: deleteBlob,
  getMetadata: getBlobMetadata,
};