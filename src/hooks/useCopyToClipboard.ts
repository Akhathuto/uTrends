
import { useState, useCallback } from 'react';

export function useCopyToClipboard(text?: string): {
  copied: boolean;
  copy: (textToCopy?: string) => Promise<boolean>;
} {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (textToCopy?: string) => {
    const targetText = textToCopy || text;
    if (!targetText) {
      console.warn('No text provided to copy to clipboard');
      return false;
    }

    try {
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      setCopied(false);
      return false;
    }
  }, [text]);

  return { copied, copy };
}
