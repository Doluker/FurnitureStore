tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#8B4513',
                secondary: '#4A3520',
                accent: '#D2B48C',
                light: '#F5F5DC',
                dark: '#2F4F4F',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        }
    }
}