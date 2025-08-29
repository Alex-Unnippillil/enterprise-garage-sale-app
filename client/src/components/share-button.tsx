"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  /**
   * Title of the resource being shared. Used for both the
   * Web Share API and X fallbacks.
   */
  title: string;
  /**
   * Optional text description for the share payload. If not provided,
   * the title will be reused.
   */
  text?: string;
}

/**
 * A reusable button that attempts to share the current page using the
 * [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
 * If the API is unavailable, the page URL is copied to the clipboard and the
 * X share dialog is opened as a fallback.
 */
const ShareButton = ({ title, text }: ShareButtonProps) => {
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareText = text || title;

    const shareData = { title, text: shareText, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // fall through to clipboard/X fallback if share is aborted or fails
        console.error("Share failed", err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }

    const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, "_blank");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="share"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
};

export default ShareButton;

