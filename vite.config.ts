import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Streaming Proxy Plugin to bypass CORS and Referer restrictions for HLS video playback
function streamingProxyPlugin(): Plugin {
  return {
    name: 'streaming-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }

          // Determine appropriate Referer based on destination host
          let referer = 'https://anizone.to/';
          if (targetUrl.includes('flixcloud.cc')) {
            referer = 'https://flixcloud.cc/';
          } else if (targetUrl.includes('krussdomi.com')) {
            referer = 'https://krussdomi.com/';
          } else if (targetUrl.includes('vid-cdn.xyz')) {
            referer = 'https://anizone.to/';
          }

          const fetchResponse = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Referer: referer,
              Origin: referer.slice(0, -1),
            },
          });

          if (!fetchResponse.ok) {
            res.statusCode = fetchResponse.status;
            res.end(`Upstream error: ${fetchResponse.status}`);
            return;
          }

          const contentType = fetchResponse.headers.get('content-type') || 'application/vnd.apple.mpegurl';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader('Cache-Control', 'no-cache');

          // If this is an m3u8 playlist, rewrite relative and absolute URLs so they route through this proxy
          if (
            contentType.includes('mpegurl') ||
            contentType.includes('m3u8') ||
            targetUrl.includes('.m3u8')
          ) {
            const rawText = await fetchResponse.text();
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

            const rewritten = rawText
              .split('\n')
              .map((line) => {
                const trimmed = line.trim();
                if (!trimmed) return line;

                if (trimmed.startsWith('#EXT-X-MEDIA:') && trimmed.includes('URI="')) {
                  return trimmed.replace(/URI="([^"]+)"/, (_m, uri) => {
                    const resolved = new URL(uri, baseUrl).href;
                    return `URI="/api/proxy?url=${encodeURIComponent(resolved)}"`;
                  });
                }

                if (trimmed.startsWith('#EXT-X-KEY:') && trimmed.includes('URI="')) {
                  return trimmed.replace(/URI="([^"]+)"/, (_m, uri) => {
                    const resolved = new URL(uri, baseUrl).href;
                    return `URI="/api/proxy?url=${encodeURIComponent(resolved)}"`;
                  });
                }

                if (trimmed.startsWith('#')) {
                  return line;
                }

                const resolved = new URL(trimmed, baseUrl).href;
                return `/api/proxy?url=${encodeURIComponent(resolved)}`;
              })
              .join('\n');

            res.end(rewritten);
          } else {
            // Binary segment (.ts, etc.) -> stream buffer directly
            const arrayBuffer = await fetchResponse.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          }
        } catch (err: any) {
          console.error('Proxy Error:', err.message);
          res.statusCode = 500;
          res.end('Proxy internal error: ' + err.message);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), streamingProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
