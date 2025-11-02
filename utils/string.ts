export const maskName = (name: string): string => {
  if (!name) return '';

  // Handle common honorifics
  const honorifics = ['様', 'さん', '君', 'ちゃん'];
  let suffix = '';
  let mainName = name;

  for (const h of honorifics) {
    if (name.endsWith(h)) {
      suffix = ` ${h}`;
      mainName = name.substring(0, name.length - h.length).trim();
      break;
    }
  }

  const parts = mainName.split(/[\s　]+/); // Supports full-width and half-width spaces

  const maskedParts = parts.map(part => {
    if (part.length <= 1) {
      return part;
    }
    return part.charAt(0) + '〇'.repeat(part.length - 1);
  });

  return maskedParts.join(' ') + suffix;
};
