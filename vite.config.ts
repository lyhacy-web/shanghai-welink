import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
<<<<<<< HEAD
    const GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
=======
>>>>>>> 3e4b0844055cf85b6030b1319d90e1196695fd23
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
<<<<<<< HEAD
        'process.env.API_KEY': JSON.stringify(GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_API_KEY)
=======
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
>>>>>>> 3e4b0844055cf85b6030b1319d90e1196695fd23
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
