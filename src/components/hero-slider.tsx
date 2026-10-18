import { useEffect, useState } from "react";
import { SLIDES } from "@/lib/slides";
import { cn } from "@/lib/utils";

// Decorative doodles (flowers, leaves, coins, stars) drawn on the colored band
// behind the slide image, tinted to match each slide's theme.
function Doodles({ tint }: { tint: string }) {
  const s = { stroke: tint, fill: "none", strokeWidth: 2.5, strokeLinecap: "round" as const };
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-70" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* flower */}
      <g {...s} transform="translate(28 78)">
        <circle r="4" />
        <ellipse rx="4" ry="9" transform="translate(0 -11)" />
        <ellipse rx="4" ry="9" transform="rotate(72) translate(0 -11)" />
        <ellipse rx="4" ry="9" transform="rotate(144) translate(0 -11)" />
        <ellipse rx="4" ry="9" transform="rotate(216) translate(0 -11)" />
        <ellipse rx="4" ry="9" transform="rotate(288) translate(0 -11)" />
      </g>
      {/* leaf sprig */}
      <g {...s} transform="translate(90 96)">
        <path d="M0 14 C0 4 4 -4 12 -10" />
        <path d="M3 6 C8 6 11 3 12 -1" />
        <path d="M1 11 C6 12 10 10 12 6" />
      </g>
      {/* coin */}
      <g {...s} transform="translate(150 84)">
        <circle r="11" />
        <path d="M-4 -3 L0 4 L5 -4" />
      </g>
      {/* star */}
      <g {...s} transform="translate(205 66)">
        <path d="M0 -8 L2.3 -2.3 L8 -2 L3.5 2 L5 8 L0 4.6 L-5 8 L-3.5 2 L-8 -2 L-2.3 -2.3 Z" />
      </g>
      {/* tree */}
      <g {...s} transform="translate(262 92)">
        <path d="M0 12 L0 -2" />
        <path d="M0 -2 C-10 -2 -12 -12 0 -20 C12 -12 10 -2 0 -2" />
      </g>
      {/* small flower */}
      <g {...s} transform="translate(320 80)">
        <circle r="3" />
        <circle cx="0" cy="-7" r="3" />
        <circle cx="6" cy="3.5" r="3" />
        <circle cx="-6" cy="3.5" r="3" />
      </g>
      {/* butterfly-ish */}
      <g {...s} transform="translate(368 70)">
        <path d="M0 0 C-8 -10 -16 -6 -10 2 C-16 8 -8 12 0 4 C8 12 16 8 10 2 C16 -6 8 -10 0 0" />
      </g>
    </svg>
  );
}

export function HeroSlider({ onSlideChange }: { onSlideChange?: (index: number) => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setI((x) => (x + 1) % SLIDES.length), 5000);
    return () => clearTimeout(id);
  }, [i]);
  useEffect(() => {
    onSlideChange?.(i);
  }, [i, onSlideChange]);

  const active = SLIDES[i]!;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-elegant">
      {/* Colored band: extends below the image, color changes with the slide */}
      {SLIDES.map((s, n) => (
        <div
          key={n}
          aria-hidden
          className={cn("absolute inset-0 transition-opacity duration-700", n === i ? "opacity-100" : "opacity-0")}
          style={{ background: `linear-gradient(180deg, ${s.bg[0]}, ${s.bg[1]})` }}
        />
      ))}
      <div className="relative px-3 pt-3 sm:px-4 sm:pt-4">
        {SLIDES.map((s, n) => (
          <div
            key={n}
            className={cn(
              "transition-all duration-700",
              n === i ? "relative opacity-100" : "pointer-events-none absolute inset-x-3 top-3 opacity-0 sm:inset-x-4 sm:top-4",
            )}
          >
            <img
              src={s.image}
              alt={s.alt}
              loading={n === 0 ? "eager" : "lazy"}
              className="aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
            />
          </div>
        ))}
      </div>

      {/* Colored band below the image: doodles + dots, color changes with the slide */}
      <div className="relative h-20">
        <Doodles key={i} tint={active.doodle} />
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {SLIDES.map((s, n) => (
          <button
            key={n}
            aria-label={`Slide ${n + 1}`}
            onClick={() => setI(n)}
            className="h-2 rounded-full transition-all"
            style={{
              width: n === i ? 24 : 8,
              backgroundColor: n === i ? s.accent : `${s.doodle}66`,
            }}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
