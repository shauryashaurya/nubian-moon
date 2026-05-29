import { toPng, toJpeg } from 'html-to-image';

const MAX_WIDTH = 800;

// Capture a node and download as png or jpg, scaling so the output width
// never exceeds MAX_WIDTH. We wait for document.fonts.ready so the
// hieroglyph font is guaranteed loaded before rasterization.
export async function downloadImage(
  node: HTMLElement,
  format: 'png' | 'jpg',
  filename: string
): Promise<void> {
  await document.fonts.ready;
  const rect = node.getBoundingClientRect();
  const pixelRatio = rect.width > MAX_WIDTH ? MAX_WIDTH / rect.width : 1;

  const opts = {
    pixelRatio,
    cacheBust: true,
    backgroundColor: undefined,
  };

  const dataUrl =
    format === 'png' ? await toPng(node, opts) : await toJpeg(node, { ...opts, quality: 0.95 });

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
