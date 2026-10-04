// Reports the size of the model files and of the full offline bundle in dist/.
// Run after a build: npm run size
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const PRECACHED_EXTENSIONS = new Set(['.js', '.css', '.html', '.json', '.bin', '.mp3', '.png', '.svg', '.ico', '.webmanifest']);

function listFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const fullPath = join(directory, name);
    return statSync(fullPath).isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

const kilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const sumSizes = (files) => files.reduce((total, filePath) => total + statSync(filePath).size, 0);

const distFiles = listFiles('dist');
const precachedFiles = distFiles.filter((filePath) => PRECACHED_EXTENSIONS.has(extname(filePath)));
const groups = {
  'Model files (public/model)': precachedFiles.filter((filePath) => filePath.includes(join('dist', 'model'))),
  'Audio clips (public/audio)': precachedFiles.filter((filePath) => filePath.includes(join('dist', 'audio'))),
  'TF.js chunk': precachedFiles.filter((filePath) => /assets[\\/]tf-.*\.js$/.test(filePath)),
  'App code, styles, strings, icons, service worker': precachedFiles.filter((filePath) =>
    !filePath.includes(join('dist', 'model')) && !filePath.includes(join('dist', 'audio')) && !/assets[\\/]tf-.*\.js$/.test(filePath)),
};

console.log('Leihlo offline bundle (files the service worker precaches)\n');
for (const [label, files] of Object.entries(groups)) {
  console.log(`${label}: ${megabytes(sumSizes(files))}`);
  for (const filePath of files.filter((candidate) => statSync(candidate).size > 50 * 1024)) {
    console.log(`  ${relative('dist', filePath)}  ${kilobytes(statSync(filePath).size)}`);
  }
}
console.log(`\nTotal offline bundle: ${megabytes(sumSizes(precachedFiles))} in ${precachedFiles.length} files`);

const swSource = readFileSync('dist/sw.js', 'utf8');
const precacheEntryCount = (swSource.match(/revision:/g) || []).length;
console.log(`Service worker precache manifest entries: ${precacheEntryCount}`);
