import { useState, useEffect } from "react";
import { X } from "lucide-react";
import OldMastersPreloader, { Apollo, Hercules, Flowers } from "./old-masters-preloader";

interface IntroOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  hasSeenIntro: boolean;
}

export function IntroOverlay({ isOpen, onClose, hasSeenIntro }: IntroOverlayProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobileOrTouch, setIsMobileOrTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaReduced.matches);
    const handleReducedChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaReduced.addEventListener("change", handleReducedChange);

    const checkTouch = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth < 768;
      setIsMobileOrTouch(hasTouch || isSmall);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);

    return () => {
      mediaReduced.removeEventListener("change", handleReducedChange);
      window.removeEventListener("resize", checkTouch);
    };
  }, []);

  // Lock body scroll while intro is open, restore on close
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] h-[100svh] w-full overflow-hidden bg-[#1a0706]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-black/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-100 backdrop-blur-md transition hover:bg-black/90 hover:border-amber-300"
        aria-label="Close intro overlay"
      >
        <X size={15} />
        <span>Close</span>
      </button>

      <OldMastersPreloader
        tone="carmine"
        face="didone"
        duotone
        rays={!isReducedMotion}
        dust={!isReducedMotion}
        wordmark="LOCALCONNECT"
        tagline="Tourism Made Easy · Rent what you need, locally."
        cta={{ label: "Enter Marketplace" }}
        labels={["Pilgrim Essentials", "Local Rentals"]}
        eyebrow="Gaya Ji · Bihar"
        loadingLabel="Gathering local rentals"
        brand="LocalConnect"
        nav={[]}
        asides={[]}
        annotations={[]}
        wordDepth={2}
        exposure={0.9}
        tilt={isReducedMotion || isMobileOrTouch ? 0 : 2.5}
        figures={[
          { ...Hercules, x: 16, y: 100, h: 58, depth: 1.25 },
          { ...Apollo, x: 50, y: 100, h: 50, depth: 1 },
          { ...Flowers, x: 86, y: 100, h: 56, depth: 0.75, flip: true, phone: false },
        ]}
        onEnter={onClose}
        skipIntro={hasSeenIntro}
        skippable={true}
        height="100svh"
      />
    </div>
  );
}

export default IntroOverlay;

