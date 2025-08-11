/** @type {import("tailwindcss").Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./App.tsx",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                inter: ["Inter-Regular", "sans-serif"],
                "inter-medium": ["Inter-Medium", "sans-serif"],
                satoshi: ["Satoshi", "sans-serif"],
                "satoshi-italic": ["Satoshi-Italic", "sans-serif"],
            },
            colors: {
                primary: "var(--color-primary)",
                onPrimary: "var(--color-onPrimary)",
                secondary: "var(--color-secondary)",
                surface: "var(--color-surface)",
                onSurface: "var(--color-onSurface)",
                background: "var(--color-background)",
                text: "var(--color-text)",
                error: "var(--color-error)",
                border: "var(--color-border)",
                muted: "var(--color-muted)",
                highlight: "var(--color-highlight)",
                textPrimary: "var(--color-text-primary)",
                textSecondary: "var(--color-text-secondary)",
            },
        },
    },
    plugins: [],
}
