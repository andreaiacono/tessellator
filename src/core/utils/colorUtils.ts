// Convert Java-style signed int color to hex string
export const intColorToHex = (color: number): string => {
  // Handle signed int (negative numbers)
  const unsigned = color >>> 0;
  const hex = (unsigned & 0xffffff).toString(16).padStart(6, '0');
  return `#${hex}`;
};

// Convert hex string to Java-style signed int
export const hexToIntColor = (hex: string): number => {
  const cleaned = hex.replace('#', '');
  const value = parseInt(cleaned, 16);
  // Convert to signed 32-bit int like Java (with alpha channel)
  return value | 0xff000000;
};

// Parse hex color to RGB object
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};
