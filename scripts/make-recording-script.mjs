// Writes RECORDING_SCRIPT.md from public/strings.json.
// Part 1 lists the clips to record. Part 2 lists text that only needs a written translation.
// Run: npm run recording-script
import { readFileSync, writeFileSync } from 'node:fs';

const stringsFile = JSON.parse(readFileSync('public/strings.json', 'utf8'));
const spokenEntries = stringsFile.strings.filter((entry) => entry.spoken);
const textOnlyEntries = stringsFile.strings.filter((entry) => !entry.spoken);

const lines = [
  '# Leihlo recording and translation script',
  '',
  'This file is generated from `public/strings.json` by `npm run recording-script`. Edit the JSON, not this file.',
  '',
  'How to use it:',
  '',
  '1. Write the Sepedi text on the blank line under each English sentence.',
  '2. Copy each Sepedi text into the `sepedi` field of the same key in `public/strings.json`.',
  '3. Record each clip in Part 1 as a short MP3 and save it as the file name shown, inside `public/audio/`.',
  '4. Run `npm run build` so the new clips are bundled for offline use.',
  '',
  'Recording tips: one speaker, a quiet room, the phone held about 20 cm away, a calm and slow voice. Mono MP3 at 64 kbps is enough. Keep each clip under 5 seconds.',
  '',
  `## Part 1: clips to record (${spokenEntries.length} clips)`,
  '',
];

spokenEntries.forEach((entry, index) => {
  lines.push(`### ${index + 1}. \`${entry.key}\``);
  lines.push('');
  lines.push(`File: \`public${entry.audio}\``);
  lines.push('');
  lines.push(`English: ${entry.english}`);
  lines.push('');
  lines.push('Sepedi: ______________________________________________');
  lines.push('');
});

lines.push(`## Part 2: text on screen only, no recording needed (${textOnlyEntries.length} items)`);
lines.push('');
lines.push('Words in curly brackets, like {count}, are filled in by the app. Keep them in your translation.');
lines.push('');

let currentSection = null;
for (const entry of textOnlyEntries) {
  if (entry.section !== currentSection) {
    currentSection = entry.section;
    lines.push(`### Section: ${currentSection}`);
    lines.push('');
  }
  lines.push(`- \`${entry.key}\`: ${entry.english}`);
  lines.push('');
  lines.push('  Sepedi: ______________________________________________');
  lines.push('');
}

writeFileSync('RECORDING_SCRIPT.md', `${lines.join('\n').trimEnd()}\n`);
console.log(`RECORDING_SCRIPT.md written: ${spokenEntries.length} clips, ${textOnlyEntries.length} text only items.`);
