import { execSync } from 'child_process';

async function main() {
  const watchUrl = 'https://anivexa-api-production-e783.up.railway.app/watch/reanime/16498/sub/reanime-1';
  console.log('Fetching watch endpoint:', watchUrl);
  const res = await fetch(watchUrl);
  const data = await res.json();
  console.log('Keys in watch response:', Object.keys(data));
  console.log('stream_url:', data.stream_url);
  console.log('streams:', JSON.stringify(data.streams)?.slice(0, 300));
  console.log('embed:', data.embed);
  console.log('embeds:', JSON.stringify(data.embeds));

  const targetStream = data.stream_url || data.streams?.[0]?.url;
  if (!targetStream) {
    console.log('No stream URL found!');
    return;
  }

  console.log('\n--- TEST 1: Plain curl HEAD request ---');
  try {
    const out1 = execSync(`curl -I -s --max-time 6 "${targetStream}"`).toString();
    console.log(out1.split('\n').slice(0, 8).join('\n'));
  } catch (e) {
    console.log('Error 1:', e.message);
  }

  console.log('\n--- TEST 2: With Referer https://flixcloud.cc/ ---');
  try {
    const out2 = execSync(`curl -I -s --max-time 6 -H "Referer: https://flixcloud.cc/" "${targetStream}"`).toString();
    console.log(out2.split('\n').slice(0, 8).join('\n'));
  } catch (e) {
    console.log('Error 2:', e.message);
  }

  console.log('\n--- TEST 3: Browser CORS check (Access-Control-Allow-Origin) ---');
  try {
    const out3 = execSync(`curl -I -s --max-time 6 -H "Origin: http://localhost:3000" "${targetStream}"`).toString();
    console.log(out3.split('\n').slice(0, 10).join('\n'));
  } catch (e) {
    console.log('Error 3:', e.message);
  }

  // Also test other anime/providers, e.g. Solo Leveling 151807 or other providers
  console.log('\n--- TEST 4: Solo Leveling 151807 ---');
  try {
    const resSL = await fetch('https://anivexa-api-production-e783.up.railway.app/episodes/reanime/151807');
    const dataSL = await resSL.json();
    console.log('SL episodes count:', dataSL.reanime?.episodes?.sub?.length);
    if (dataSL.reanime?.episodes?.sub?.[0]?.id) {
      const epId = dataSL.reanime.episodes.sub[0].id;
      const resStream = await fetch(`https://anivexa-api-production-e783.up.railway.app/${epId}`);
      const sJson = await resStream.json();
      console.log('SL stream URL:', sJson.stream_url);
    }
  } catch (e) {
    console.log('SL error:', e.message);
  }
}

main().catch(console.error);
