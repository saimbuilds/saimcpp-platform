# SaimCPP React - Modern Conversion

This is the **React version** of SaimCPP platform with modern UI/UX.

## Tech Stack

- ⚡ **Vite** - Lightning-fast build tool
- ⚛️ **React 18** - UI library
- 🎨 **shadcn/ui** - Premium component library
- 🎯 **TailwindCSS** - Utility-first CSS  
- ✨ **Framer Motion** - Smooth animations
- 🔄 **React Query** - Data fetching & caching
- 📦 **Zustand** - State management
- 🖥️ **Monaco Editor** - Code editor

## Setup

1. **Install dependencies** (requires Node 14.18+)
   ```bash
   npm install
   ```

2. **Configure Supabase**
   Update `src/lib/supabase.js` with your credentials:
   ```js
   const supabaseUrl = 'YOUR_SUPABASE_URL'
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn components
│   └── layout/      # Layout components
├── pages/           # Page components
├── lib/             # Utils & API
├── hooks/           # Custom hooks
├── store/           # Zustand stores
└── App.jsx          # Main app
```

## Deployment

Deploy to Netlify or Vercel:
- Build command: `npm run build`
- Publish directory: `dist`

---

**Made with 💙 by Saim**
