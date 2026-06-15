/**
 * Validates whether a given File is a valid equirectangular (2:1 aspect ratio) image.
 * Equirectangular images must have width/height ratio of exactly 2.0 (±0.1 margin).
 *
 * @param file - The image File object to validate.
 * @returns Promise<boolean> - true if valid equirectangular, false otherwise.
 */
export function validateEquirectangularRatio(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // Guard: only accept image MIME types
    if (!file.type.startsWith('image/')) {
      resolve(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = img.naturalWidth / img.naturalHeight;
      // Valid equirectangular range: 1.9 to 2.1
      const isValid = Math.abs(ratio - 2.0) <= 0.1;
      resolve(isValid);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };

    img.src = objectUrl;
  });
}
