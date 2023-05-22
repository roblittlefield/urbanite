const mapLayers = [
  "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
  "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
];

function getTileSize(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error("Failed to load tile image."));
    };
    img.src = url;
  });
}

async function checkTileSizes() {
  for (const url of mapLayers) {
    try {
      const tileSize = await getTileSize(url);
      console.log(`Tile size for ${url}: ${tileSize.width}x${tileSize.height}`);
    } catch (error) {
      console.error(`Error loading tile image for ${url}: ${error.message}`);
    }
  }
}

// Call the function to check tile sizes
checkTileSizes();
