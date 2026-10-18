// Home page slider. Each slide has an image and a matching background theme
// (Flipkart-style: the colored band extends below the image and changes with it).
import slide1 from "@/assets/slide-1.png.asset.json";
import slide2 from "@/assets/slide-2.png.asset.json";
import slide3 from "@/assets/slide-3.png.asset.json";

export type Slide = {
  image: string;
  alt: string;
  // Background band colors (gradient top -> bottom) matching the image.
  bg: [string, string];
  // Decorative doodle tint drawn on the band.
  doodle: string;
  // Dot/accent color for the active indicator.
  accent: string;
  // Very light tint for the whole page background while this slide is active.
  pageBg: string;
};

export const SLIDES: Slide[] = [
  {
    image: slide1.url,
    alt: "Earn to Each Other — watch ads, complete tasks, withdraw via UPI",
    bg: ["#f7ead0", "#efdcae"],
    doodle: "#a8791a",
    accent: "#b98a1e",
    pageBg: "#fbf4e4",
  },
  {
    image: slide2.url,
    alt: "Earn to Each Other — complete tasks, track rewards, grow together",
    bg: ["#0f5132", "#0a3b24"],
    doodle: "#3fae72",
    accent: "#34d399",
    pageBg: "#e4f3ea",
  },
  {
    image: slide3.url,
    alt: "Earn to Each Other — grow your earnings",
    bg: ["#bcd9f7", "#8fbef0"],
    doodle: "#1d4ed8",
    accent: "#2563eb",
    pageBg: "#e7f1fd",
  },
];
