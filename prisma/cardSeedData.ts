/** Two example content cards per service (each with its OWN before/after pair, separate from the hero pair). */
export const CARDS: Record<string, [string, string][]> = {
 "clipping-path": [
  [
   "Basic clipping path",
   "A simple product with smooth curves: a clean cutout on a transparent background."
  ],
  [
   "Complex clipping path",
   "A product with many curves and fine detail, outlined point by point."
  ]
 ],
 "photo-retouching": [
  [
   "Dust and scratch cleanup",
   "Specks and surface marks removed while the label and shape stay untouched."
  ],
  [
   "Tone and color refinement",
   "Exposure and color balanced so the product looks the way it does in person."
  ]
 ],
 "ghost-mannequin": [
  [
   "Standard garment",
   "Mannequin removed and the inside of the neck rebuilt for a natural 3D shape."
  ],
  [
   "Layered garment",
   "A garment with more volume, cleaned up and composited from several shots."
  ]
 ],
 "image-masking": [
  [
   "Hair and flyaway strands",
   "Fine strands kept soft against a new background instead of a harsh cutout."
  ],
  [
   "Soft edge portrait",
   "A subject with soft edges isolated and placed on a clean backdrop."
  ]
 ],
 "color-correction": [
  [
   "Color cast removal",
   "A blue-gray cast neutralised so reds look red again."
  ],
  [
   "Catalog color matching",
   "Items matched to a reference swatch for consistent colors across a catalog."
  ]
 ],
 "jewelry-photo-retouching": [
  [
   "Metal and gem cleanup",
   "Dust, scratches and dull spots removed; gold tone and facets refined."
  ],
  [
   "Highlight control",
   "Glare tamed while keeping the sparkle that sells the piece."
  ]
 ],
 "shadow-creation": [
  [
   "Natural shadow",
   "A soft contact shadow that grounds the product on the surface."
  ],
  [
   "Reflection shadow",
   "A subtle reflection for a polished, studio-style presentation."
  ]
 ],
 "ecommerce-photo-editing": [
  [
   "Marketplace-ready image",
   "Straightened, centered and placed on a clean white background."
  ],
  [
   "Consistent catalog set",
   "The same framing, margins and tone applied across a whole product range."
  ]
 ],
 "alpha-masking": [
  [
   "Glass and liquid",
   "Transparency preserved so the new background shows through naturally."
  ],
  [
   "Translucent edges",
   "Soft, partly transparent edges masked without halos."
  ]
 ],
 "multi-path": [
  [
   "Component separation",
   "Each part of the product gets its own path for independent edits."
  ],
  [
   "Colorway variations",
   "Regions recolored separately to produce multiple color options."
  ]
 ]
};
