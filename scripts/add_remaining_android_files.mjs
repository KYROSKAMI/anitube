import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = path.resolve('anitube-android');

function writeFile(relPath, content) {
  const fullPath = path.join(rootDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`Added: ${relPath}`);
}

// 1. DetailsScreen.kt
writeFile('app/src/main/java/com/anitube/app/ui/details/DetailsScreen.kt', `
package com.anitube.app.ui.details

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.DarkBackground
import com.anitube.app.core.designsystem.DarkSurface
import com.anitube.app.core.designsystem.DarkSurfaceVariant
import com.anitube.app.domain.model.Anime
import com.anitube.app.domain.model.Episode

@Composable
fun DetailsScreen(
    anime: Anime,
    episodes: List<Episode>,
    isLoadingEpisodes: Boolean,
    isInWatchlist: Boolean,
    onToggleWatchlist: () -> Unit,
    onPlayEpisode: (Episode) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedAudio by remember { mutableStateOf("sub") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        // Banner & Back button
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
            ) {
                AsyncImage(
                    model = anime.bannerImage ?: anime.coverImage,
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .statusBarsPadding()
                        .padding(8.dp)
                        .background(Color.Black.copy(alpha = 0.5f), shape = RoundedCornerShape(20.dp))
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
            }
        }

        // Title and actions
        item {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = anime.displayTitle,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    anime.averageScore?.let {
                        AssistChip(
                            onClick = {},
                            label = { Text("Score: \$it%", color = Color.White) },
                            leadingIcon = { Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFFFB800)) }
                        )
                    }
                    anime.seasonYear?.let {
                        AssistChip(
                            onClick = {},
                            label = { Text("\$it", color = Color.White) }
                        )
                    }
                    anime.status?.let {
                        AssistChip(
                            onClick = {},
                            label = { Text(it, color = Color.White) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Button(
                        onClick = {
                            val firstEp = episodes.firstOrNull()
                            if (firstEp != null) onPlayEpisode(firstEp)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AnitubeCrimson),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Watch Ep 1")
                    }

                    OutlinedButton(
                        onClick = onToggleWatchlist,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = if (isInWatchlist) Icons.Default.BookmarkAdded else Icons.Default.BookmarkBorder,
                            contentDescription = null,
                            tint = if (isInWatchlist) AnitubeCrimson else Color.White
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isInWatchlist) "Added" else "Watchlist", color = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Description
                Text(
                    text = anime.description ?: "No synopsis available.",
                    fontSize = 14.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Audio selector: Sub / Dub
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Episodes (\${episodes.size})",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    SingleChoiceSegmentedButtonRow {
                        SegmentedButton(
                            selected = selectedAudio == "sub",
                            onClick = { selectedAudio = "sub" },
                            shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2)
                        ) {
                            Text("SUB")
                        }
                        SegmentedButton(
                            selected = selectedAudio == "dub",
                            onClick = { selectedAudio = "dub" },
                            shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2)
                        ) {
                            Text("DUB")
                        }
                    }
                }
            }
        }

        // Episodes list
        if (isLoadingEpisodes) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = AnitubeCrimson)
                }
            }
        } else if (episodes.isEmpty()) {
            item {
                Text(
                    text = "No playable episodes found on streaming provider.",
                    color = Color.White.copy(alpha = 0.6f),
                    modifier = Modifier.padding(16.dp)
                )
            }
        } else {
            items(episodes) { ep ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(DarkSurfaceVariant)
                        .clickable { onPlayEpisode(ep) }
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = ep.thumbnail ?: anime.coverImage,
                        contentDescription = null,
                        modifier = Modifier
                            .size(width = 80.dp, height = 48.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        contentScale = ContentScale.Crop
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Episode \${ep.number}: \${ep.title ?: ""}",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        ep.durationSeconds?.let {
                            Text(
                                text = "\${it / 60}m",
                                color = Color.White.copy(alpha = 0.5f),
                                fontSize = 11.sp
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.Default.PlayCircle,
                        contentDescription = "Play",
                        tint = AnitubeCrimson,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}
`);

// 2. SearchScreen.kt
writeFile('app/src/main/java/com/anitube/app/ui/search/SearchScreen.kt', `
package com.anitube.app.ui.search

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.DarkBackground
import com.anitube.app.core.designsystem.DarkSurface
import com.anitube.app.domain.model.Anime
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SearchScreen(
    onSearch: suspend (String) -> List<Anime>,
    onAnimeClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<Anime>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    var searchJob by remember { mutableStateOf<Job?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .statusBarsPadding()
            .padding(16.dp)
    ) {
        // Debounced Search Input
        TextField(
            value = query,
            onValueChange = { newText ->
                query = newText
                searchJob?.cancel()
                if (newText.isNotBlank()) {
                    isSearching = true
                    searchJob = scope.launch {
                        delay(400) // 400ms debounce
                        results = onSearch(newText)
                        isSearching = false
                    }
                } else {
                    results = emptyList()
                    isSearching = false
                }
            },
            placeholder = { Text("Search anime, movies, OVAs...", color = Color.White.copy(alpha = 0.5f)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = AnitubeCrimson) },
            trailingIcon = {
                if (query.isNotEmpty()) {
                    IconButton(onClick = { query = ""; results = emptyList() }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear", tint = Color.White)
                    }
                }
            },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = DarkSurface,
                unfocusedContainerColor = DarkSurface,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedIndicatorColor = AnitubeCrimson,
                unfocusedIndicatorColor = Color.Transparent
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (isSearching) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AnitubeCrimson)
            }
        } else if (results.isEmpty() && query.isNotBlank()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No anime found matching '\$query'", color = Color.White.copy(alpha = 0.6f))
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(results) { anime ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onAnimeClick(anime.id) }
                    ) {
                        AsyncImage(
                            model = anime.coverImage,
                            contentDescription = anime.displayTitle,
                            modifier = Modifier
                                .height(160.dp)
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = anime.displayTitle,
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}
`);

// 3. DiagnosticsScreen.kt
writeFile('app/src/main/java/com/anitube/app/ui/diagnostics/DiagnosticsScreen.kt', `
package com.anitube.app.ui.diagnostics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.anitube.app.core.designsystem.AnitubeCrimson
import com.anitube.app.core.designsystem.DarkBackground
import com.anitube.app.core.designsystem.DarkSurfaceVariant

@Composable
fun DiagnosticsScreen(
    anivexaBaseUrl: String = "https://anivexa-api-production-e783.up.railway.app",
    anivexaStatus: Boolean,
    aniListStatus: Boolean,
    lastLatencyMs: Long,
    onRunDiagnostics: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .statusBarsPadding()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("API Diagnostics", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
            IconButton(onClick = onRunDiagnostics) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = AnitubeCrimson)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        DiagnosticCard(
            title = "Anivexa Streaming API",
            endpoint = anivexaBaseUrl,
            isHealthy = anivexaStatus,
            details = "Verified endpoints: /map/:id, /episodes/:provider/:id, /watch/:provider/:id/:audio/:ep"
        )

        Spacer(modifier = Modifier.height(12.dp))

        DiagnosticCard(
            title = "AniList GraphQL Engine",
            endpoint = "https://graphql.anilist.co",
            isHealthy = aniListStatus,
            details = "Latency: \${lastLatencyMs}ms | High-fidelity metadata & carousels active"
        )

        Spacer(modifier = Modifier.height(12.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurfaceVariant),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Media3 ExoPlayer Engine", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Text("HLS (.m3u8) Native Parser: Enabled", color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp)
                Text("Foreground MediaSession: Registered", color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp)
                Text("Persistent Mini-Player: Single ExoPlayer shared instance", color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun DiagnosticCard(
    title: String,
    endpoint: String,
    isHealthy: Boolean,
    details: String
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = DarkSurfaceVariant),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
                Icon(
                    imageVector = if (isHealthy) Icons.Default.CheckCircle else Icons.Default.Error,
                    contentDescription = null,
                    tint = if (isHealthy) Color(0xFF10B981) else AnitubeCrimson
                )
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(endpoint, fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = AnitubeCrimson)
            Spacer(modifier = Modifier.height(4.dp))
            Text(details, fontSize = 12.sp, color = Color.White.copy(alpha = 0.6f))
        }
    }
}
`);

// Refresh the ZIP
console.log('Refreshing anitube-android.zip with all screens...');
const zip = new JSZip();

function addDirToZip(dirPath, zipFolder) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const full = path.join(dirPath, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      addDirToZip(full, zipFolder.folder(item));
    } else {
      zipFolder.file(item, fs.readFileSync(full));
    }
  }
}

addDirToZip(rootDir, zip.folder('anitube-android'));

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }).then((buf) => {
  fs.writeFileSync(path.resolve('public/anitube-android.zip'), buf);
  fs.writeFileSync(path.resolve('anitube-android.zip'), buf);
  console.log('Updated anitube-android.zip (' + (buf.length / 1024).toFixed(1) + ' KB)');
});
