import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    cream: "#F4F8F2", ice: "#EAF6F9", mint: "#E8F2EA", lilac: "#EFEEF8", ink: "#0F1B26", indigo: "#4f46e5", sage: "#BAC095", lavender: "#8686AC", mist: "#CBCBCB",
    navy: "#07121C", teal: "#005C73", cyan: "#22D3EE", sun: "#FFC107",
  }, fontFamily: { display: ["var(--font-display)", "Georgia", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] } } },
  plugins: [],
} satisfies Config;
