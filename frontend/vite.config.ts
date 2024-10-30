import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permet d'accepter les connexions externes
    port: 3000,       // Choisissez le port que vous souhaitez, ici 3000
  },
})
