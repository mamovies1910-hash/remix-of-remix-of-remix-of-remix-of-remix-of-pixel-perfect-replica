import gold from "@/assets/invest-gold.jpg";
import silver from "@/assets/invest-silver.jpg";
import diamond from "@/assets/invest-diamond.jpg";
import oil from "@/assets/invest-oil.jpg";
import realEstate from "@/assets/invest-realestate.jpg";

// Admin-uploaded image wins; otherwise pick a built-in picture by plan name.
export function planImage(p: { name: string; image_url?: string | null }) {
  if (p.image_url) return p.image_url;
  const n = p.name.toLowerCase();
  if (n.includes("silver")) return silver;
  if (n.includes("diamond")) return diamond;
  if (n.includes("oil") || n.includes("crude")) return oil;
  if (n.includes("estate") || n.includes("property") || n.includes("land")) return realEstate;
  return gold;
}
