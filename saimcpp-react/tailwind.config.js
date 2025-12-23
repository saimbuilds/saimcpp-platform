/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // GitHub Dark Theme
                background: '#0d1117',
                foreground: '#c9d1d9',
                card: {
                    DEFAULT: '#161b22',
                    foreground: '#c9d1d9',
                },
                popover: {
                    DEFAULT: '#161b22',
                    foreground: '#c9d1d9',
                },
                primary: {
                    DEFAULT: '#58a6ff',
                    foreground: '#000000',
                },
                secondary: {
                    DEFAULT: '#1c2128',
                    foreground: '#c9d1d9',
                },
                muted: {
                    DEFAULT: '#21262d',
                    foreground: '#8b949e',
                },
                accent: {
                    DEFAULT: '#58a6ff',
                    foreground: '#000000',
                    blue: '#58a6ff',
                    green: '#3fb950',
                    yellow: '#d29922',
                    red: '#f85149',
                },
                destructive: {
                    DEFAULT: '#f85149',
                    foreground: '#ffffff',
                },
                border: '#30363d',
                input: '#30363d',
                ring: '#58a6ff',
                // Difficulty colors
                easy: '#3fb950',
                medium: '#d29922',
                hard: '#f85149',
            },
            borderRadius: {
                lg: '0.5rem',
                md: '0.375rem',
                sm: '0.25rem',
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: 0 },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: 0 },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [],
}
