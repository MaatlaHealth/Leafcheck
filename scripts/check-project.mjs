// Project checks that guard the hackathon rules. Run: npm run check
// 1. No em dashes or en dashes in any text file we wrote (source, strings, docs, config).
// 2. Every t('key') used in the code exists in public/strings.json.
// 3. Fewer than 25 spoken clips, and every string entry has the required fields.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const FORBIDDEN_DASHES = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']');
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.git', '.netlify', 'dev-dist']);
const TEXT_EXTENSIONS = new Set(['.js', '.mjs', '.json', '.md', '.html', '.css', '.toml', '.svg', '.txt', '.webmanifest']);
let problemCount = 0;

function report(problem) {
  problemCount += 1;
  console.log(`  FAIL ${problem}`);
}

function listTextFiles(directory) {
  const files = [];
  for (const name of readdirSync(directory)) {
    if (SKIPPED_DIRECTORIES.has(name)) continue;
    const fullPath = join(directory, name);
    if (statSync(fullPath).isDirectory()) files.push(...listTextFiles(fullPath));
    else if (TEXT_EXTENSIONS.has(extname(name)) && name !== 'package-lock.json') files.push(fullPath);
  }
  return files;
}

console.log('Check 1: no em dashes or en dashes');
const textFiles = listTextFiles('.');
for (const filePath of textFiles) {
  readFileSync(filePath, 'utf8').split('\n').forEach((line, index) => {
    if (FORBIDDEN_DASHES.test(line)) report(`${filePath}:${index + 1} contains a forbidden dash`);
  });
}
console.log(`  scanned ${textFiles.length} files`);

console.log('Check 2: every string key used in code exists');
const stringsFile = JSON.parse(readFileSync('public/strings.json', 'utf8'));
const knownKeys = new Set(stringsFile.strings.map((entry) => entry.key));
const sourceFiles = listTextFiles('src').filter((filePath) => filePath.endsWith('.js'));
const usedKeys = new Set();
for (const filePath of sourceFiles) {
  const source = readFileSync(filePath, 'utf8');
  for (const match of source.matchAll(/\bt\(\s*'([a-z0-9_]+)'/g)) usedKeys.add(match[1]);
  for (const match of source.matchAll(/(?:Key|Keys|labelKey|textKey|titleKey|bodyKey|confirmKey)\s*[:=]\s*'([a-z0-9_]+)'/g)) usedKeys.add(match[1]);
}
for (const key of usedKeys) if (!knownKeys.has(key)) report(`key "${key}" is used in code but missing from strings.json`);
console.log(`  ${usedKeys.size} literal keys found in code, ${knownKeys.size} keys in strings.json`);

console.log('Check 3: strings.json shape and clip count');
const spokenCount = stringsFile.strings.filter((entry) => entry.spoken).length;
if (spokenCount >= 25) report(`${spokenCount} spoken clips, must be under 25`);
const seenKeys = new Set();
for (const entry of stringsFile.strings) {
  if (seenKeys.has(entry.key)) report(`duplicate key ${entry.key}`);
  seenKeys.add(entry.key);
  for (const field of ['key', 'english', 'sepedi', 'audio']) if (typeof entry[field] !== 'string') report(`${entry.key} is missing the ${field} field`);
  if (entry.audio !== `/audio/${entry.key}.mp3`) report(`${entry.key} audio path should be /audio/${entry.key}.mp3`);
  if (!entry.english.trim()) report(`${entry.key} has no English text`);
}
console.log(`  ${spokenCount} spoken clips, ${stringsFile.strings.length} entries`);

console.log('Check 4: Sepedi coverage and sources');
const SEPEDI_SOURCES = ['human', 'machine_draft'];
for (const entry of stringsFile.strings) {
  const hasSepedi = Boolean((entry.sepedi || '').trim());
  if (hasSepedi && !SEPEDI_SOURCES.includes(entry.sepedi_source)) report(`${entry.key} needs sepedi_source "human" or "machine_draft"`);
  const placeholderList = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
  if (hasSepedi && placeholderList(entry.sepedi) !== placeholderList(entry.english)) report(`${entry.key} Sepedi placeholders differ from English`);
}
const humanSepediCount = stringsFile.strings.filter((entry) => entry.sepedi_source === 'human').length;
const draftSepediCount = stringsFile.strings.filter((entry) => entry.sepedi_source === 'machine_draft').length;
const blankSepediKeys = stringsFile.strings.filter((entry) => !(entry.sepedi || '').trim()).map((entry) => entry.key);
console.log(`  ${humanSepediCount} human, ${draftSepediCount} machine_draft, ${blankSepediKeys.length} blank`);
if (blankSepediKeys.length) console.log(`  note: these keys fall back to English: ${blankSepediKeys.join(', ')}`);

if (problemCount > 0) {
  console.log(`\n${problemCount} problem(s) found.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
