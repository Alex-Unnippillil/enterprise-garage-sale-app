'use client';

import { useCallback } from 'react';

// Types for experimental Document Picture-in-Picture API
interface DocumentPictureInPicture {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export const useDocPiP = () => {
  return useCallback(async () => {
    if (!window.documentPictureInPicture) return;

    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 400,
      height: 300,
    });

    const doc = pipWindow.document;
    doc.body.style.margin = '0';
    doc.body.style.fontFamily = 'sans-serif';

    // Mini omnibox
    const omnibox = doc.createElement('input');
    omnibox.type = 'text';
    omnibox.placeholder = 'Search or enter address';
    omnibox.style.width = '100%';
    omnibox.style.boxSizing = 'border-box';
    doc.body.appendChild(omnibox);

    const controls = doc.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '4px';
    controls.style.marginTop = '8px';
    doc.body.appendChild(controls);

    const mediaControls = new Map<HTMLMediaElement, HTMLButtonElement>();

    const scanIframes = () => {
      controls.innerHTML = '';
      mediaControls.clear();

      const iframes = Array.from(document.querySelectorAll('iframe')).filter((frame) => {
        const rect = frame.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      iframes.forEach((frame) => {
        try {
          const mediaElements = Array.from(
            frame.contentDocument?.querySelectorAll('video, audio') ?? [],
          ) as HTMLMediaElement[];

          mediaElements.forEach((media) => {
            const button = doc.createElement('button');
            button.textContent = media.paused ? 'Play' : 'Pause';
            button.onclick = () => {
              if (media.paused) media.play();
              else media.pause();
            };

            const sync = () => {
              button.textContent = media.paused ? 'Play' : 'Pause';
            };
            media.addEventListener('play', sync);
            media.addEventListener('pause', sync);

            mediaControls.set(media, button);
            controls.appendChild(button);
          });
        } catch {
          // Ignore cross-origin frames
        }
      });
    };

    scanIframes();

    const observer = new MutationObserver(scanIframes);
    observer.observe(document.body, { childList: true, subtree: true });

    const syncTabState = () => {
      pipWindow.document.body.dataset.tabHidden = String(document.hidden);
    };
    document.addEventListener('visibilitychange', syncTabState);
    syncTabState();
  }, []);
};

export default useDocPiP;
