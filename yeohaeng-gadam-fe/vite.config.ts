import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },

      '/maps': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        // rewrite: path => path.replace(/^/googleApi /, ''),
      },

      '/lambda': {
        // target: 'https://3h7nxm3dci.execute-api.ap-northeast-2.amazonaws.com/prod/',
        target: `https://f7gyyscagj.execute-api.ap-northeast-2.amazonaws.com/stage-v1/`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/lambda/, ''),
      },
    }
  }
})
