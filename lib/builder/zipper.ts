import JSZip from 'jszip';

export async function zipAppSource(files: Record<string, string>): Promise<Buffer> {
  const zip = new JSZip();

  // Add all files into the zip archive
  for (const [filePath, content] of Object.entries(files)) {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    zip.file(cleanPath, content);
  }

  // Generate buffer
  const contentBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  return contentBuffer;
}
