import http from 'http';

function resolveM3U8(content, baseUrl) {
  return content.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      if (trimmed.startsWith('#EXT-X-MEDIA:') && trimmed.includes('URI="')) {
        return trimmed.replace(/URI="([^"]+)"/, (m, uri) => {
          const resolved = new URL(uri, baseUrl).href;
          return `URI="/api/proxy?url=${encodeURIComponent(resolved)}"`;
        });
      }
      return line;
    }
    const resolved = new URL(trimmed, baseUrl).href;
    return `/api/proxy?url=${encodeURIComponent(resolved)}`;
  }).join('\n');
}

console.log('Testing m3u8 rewriter...');
const sample = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Japanese",URI="audio/0/playlist.m3u8"
video/720/playlist.m3u8`;

const out = resolveM3U8(sample, 'https://seiryuu.vid-cdn.xyz/test/');
console.log(out);
