import fs from 'fs';
import path from 'path';
import https from 'https';

// Pre-curated high-quality fabric image URLs from Unsplash
const FABRIC_SOURCES = [
  {
    category: 'banners',
    items: [
      { name: 'cotton-linen-hero.jpg', url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=1600&h=600&fit=crop&q=80' },
      { name: 'wool-silk-hero.jpg', url: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=1600&h=600&fit=crop&q=80' },
      { name: 'synthetic-tech-hero.jpg', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&h=600&fit=crop&q=80' },
      { name: 'denim-velvet-hero.jpg', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1600&h=600&fit=crop&q=80' },
    ]
  },
  {
    category: 'fabrics/cotton',
    items: [
      { name: 'egyptian-cotton-1.jpg', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=1200&fit=crop&q=80' },
      { name: 'organic-cotton-1.jpg', url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=1200&h=1200&fit=crop&q=80' },
    ]
  },
  {
    category: 'fabrics/linen',
    items: [
      { name: 'plain-linen-1.jpg', url: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=1200&h=1200&fit=crop&q=80' },
      { name: 'damask-linen-1.jpg', url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=1200&fit=crop&q=80' },
    ]
  },
  {
    category: 'fabrics/wool',
    items: [
      { name: 'merino-wool-1.jpg', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&h=1200&fit=crop&q=80' },
      { name: 'cashmere-1.jpg', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&h=1200&fit=crop&q=80' },
    ]
  },
  {
    category: 'fabrics/silk',
    items: [
      { name: 'mulberry-silk-1.jpg', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=1200&fit=crop&q=80' },
      { name: 'charmeuse-1.jpg', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=1200&fit=crop&q=80' },
    ]
  },
  {
    category: 'fabrics/denim',
    items: [
      { name: 'selvedge-denim-1.jpg', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1200&h=1200&fit=crop&q=80' },
    ]
  }
];

const downloadImage = (url: string, filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve());
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

async function main() {
  console.log('Starting Fabric Image Fetcher...');
  for (const group of FABRIC_SOURCES) {
    const dirPath = path.join(process.cwd(), 'public', group.category);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    for (const item of group.items) {
      const filePath = path.join(dirPath, item.name);
      if (fs.existsSync(filePath)) {
        console.log(`Skipping ${item.name} - already exists`);
        continue;
      }
      
      console.log(`Downloading ${item.name}...`);
      try {
        await downloadImage(item.url, filePath);
        console.log(`Successfully downloaded ${item.name}`);
      } catch (err: any) {
        console.error(`Failed to download ${item.name}: ${err.message}`);
      }
    }
  }
  console.log('Finished fetching fabric images.');
}

main().catch(console.error);
