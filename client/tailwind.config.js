/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "surface-dim": "#334155",
                "primary": "#818cf8",
                "on-tertiary-fixed-variant": "#cbd5e1",
                "on-error-container": "#ffe4e6",
                "tertiary-container": "#4f46e5",
                "surface-bright": "#1e293b",
                "on-surface": "#f8fafc",
                "on-secondary": "#f1f5f9",
                "secondary-fixed-dim": "#64748b",
                "on-secondary-fixed-variant": "#475569",
                "on-primary-fixed": "#e0e7ff",
                "surface-variant": "#1e293b",
                "on-secondary-fixed": "#e2e8f0",
                "on-background": "#f8fafc",
                "inverse-on-surface": "#0f172a",
                "tertiary-fixed": "#c7d2fe",
                "inverse-surface": "#f1f5f9",
                "on-tertiary-fixed": "#1e1b4b",
                "surface": "#0f172a",
                "primary-fixed-dim": "#6366f1",
                "surface-container-high": "#1e293b",
                "on-primary-fixed-variant": "#312e81",
                "on-secondary-container": "#94a3b8",
                "on-primary-container": "#e0e7ff",
                "surface-container-lowest": "#1e293b", /* Slate-800 */
                "secondary-container": "#334155",
                "secondary-fixed": "#cbd5e1",
                "primary-container": "#818cf8", /* Indigo-400 */
                "surface-container-highest": "#334155",
                "tertiary": "#a5b4fc",
                "secondary": "#94a3b8",
                "on-error": "#fff1f2",
                "on-tertiary": "#312e81",
                "surface-container-low": "#0f172a",
                "primary-fixed": "#a5b4fc",
                "surface-container": "#0f172a",
                "on-tertiary-container": "#e0e7ff",
                "outline": "#475569",
                "on-primary": "#e0e7ff",
                "background": "#0f172a", /* Slate-900 */
                "tertiary-fixed-dim": "#818cf8",
                "outline-variant": "#334155",
                "error-container": "#be123c",
                "surface-tint": "#6366f1",
                "on-surface-variant": "#cbd5e1",
                "inverse-primary": "#4f46e5",
                "error": "#fb7185" /* Rose-400 */
            },
            fontFamily: {
                "headline": ["Inter", "sans-serif"],
                "body": ["Inter", "sans-serif"],
                "label": ["Inter", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.5rem", "lg": "0.75rem", "xl": "1rem", "full": "9999px" },
        },
    },
    plugins: [],
}
