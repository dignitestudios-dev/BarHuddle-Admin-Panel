"use client";

import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";

interface LightboxProofViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
}

export function LightboxProofViewer({
  open,
  onClose,
  imageUrl,
  title,
}: LightboxProofViewerProps) {
  if (!imageUrl) return null;

  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={[{ src: imageUrl }]}
      plugins={[Fullscreen, Zoom, Download]}
      zoom={{
        maxZoomPixelRatio: 5,
        zoomInMultiplier: 2,
        scrollToZoom: true,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
    />
  );
}
