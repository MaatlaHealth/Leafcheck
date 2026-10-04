# Leihlo

The extension officer's eye on your farm.

Leihlo means "the eye" in Sepedi. It is a prototype for the World Bank "Small AI for Development" hackathon, agriculture sector.

## What it does

Leihlo guides a coffee smallholder through a short weekend crop check: she photographs three leaves and a small model on the phone classifies each one, with no network needed. The app shows and speaks a result and one approved next step in Sepedi, saves a field report on the phone, and queues it for the extension officer. The officer later confirms or corrects every leaf, the farmer gets the answer, and each correction becomes a labelled photo for retraining the model.

## The user

Noor grows coffee on a small plot. She owns a basic phone. The household smartphone belongs to her daughter and is home on weekends. There is no Wi-Fi and she buys a 3G bundle now and then. Her language is Sepedi. An extension officer visits twice a year.

## User journey

1. **First time only.** The daughter's phone opens Leihlo. The welcome screen says, in text and in recorded Sepedi audio, what is stored, where (on this phone), who sees it (the extension officer) and how to delete it. Noor enters her name, cooperative member number and plot name and taps "I agree, start".
2. **Weekend check.** Noor picks the part of the plot she is in: upper slope or lower slope, two big picture buttons. A voice asks for the first leaf.
3. **Three leaves.** For each leaf she takes a photo (or picks a saved one). The model runs on the phone. She sees the photo, the result, a simple confidence indicator (high, medium, not sure) and exactly one next step. The app plays the matching clip. A "Listen again" button replays it.
4. **Overall result.** After three leaves the app shows one overall result and one next step, and saves the report on the phone. The header shows "Offline, saved on phone" or, once a network is found, "Online, all sent".
5. **Officer review.** The extension officer opens `/officer`. For each leaf they press Confirm or Correct (with a class picker), add an optional note from a fixed list, and send.
6. **Answer.** Noor's report changes to "Confirmed by officer" or "Corrected by officer". A preview shows the SMS she would get on her basic phone, labelled "Simulated SMS".
7. **Learning.** The officer exports the corrected dataset: a zip with one folder of photos per final label plus a JSON manifest, ready to upload into Teachable Machine for the next model.

## Screens

| Screen | Where | Notes |
| --- | --- | --- |
| Welcome and consent | `/#/welcome` | Spoken consent, one time setup |
| Guided check | `/#/check` | Zone, then three leaves, voice prompt at each step |
| Result per leaf and overall | inside the check | Photo, class, confidence, one advice item, replay |
| My reports | `/#/reports` | Status per report, officer answer, SMS preview, delete all my data |
| Officer review | `/officer` | Queue, confirm or correct, note, export, labelled photo counter |
| SMS preview | officer page and My reports | Basic phone style, labelled "Simulated SMS" |
| About and limits | `/#/about` | Data sources, limits, privacy, lost or shared phone |

Every screen has a Sepedi / English toggle in the header. The farmer side starts in Sepedi, the officer page starts in English. The choice is remembered.

Some Sepedi text is a machine draft awaiting review by a native speaker.

## Tech stack

- Vite and vanilla JavaScript, plain CSS, no UI framework. System fonts only.
- TensorFlow.js (`tfjs-core`, `tfjs-layers`, WebGL and CPU backends) installed from npm and bundled into its own chunk.
- A Teachable Machine image model in `public/model/` (`model.json`, `metadata.json`, `weights.bin`).
- `vite-plugin-pwa` (Workbox) precaches the app shell, the TF.js chunk, the model files, the strings file and all audio clips. A web manifest lets the app install to the home screen.
- IndexedDB through the `idb` package for the farmer profile, reports (including the photo as a JPEG blob) and the sync queue.
- `fflate` builds the export zip in the browser.
- A Netlify Function (`netlify/functions/api.mjs`) with Netlify Blobs as the optional sync layer.

## How the AI is used

- The model is a Teachable Machine image classifier (transfer learning on MobileNet) with four classes: `healthy`, `leaf_rust`, `leaf_miner`, `not_a_leaf`. Class names are read from `metadata.json`.
- It runs fully on the phone in TensorFlow.js. The photo is centre cropped to 224 by 224 and scaled the same way the Teachable Machine library does it. On the test laptop one leaf took about 2 seconds, including photo decoding.
- The model only produces numbers. A small rule layer (`src/lib/results.js`) turns them into one of a few fixed messages. The model never writes text.

**Why SMS or a spreadsheet could not do this.** Noor cannot describe leaf rust or leaf miner damage reliably in a text message, and an SMS cannot carry a photo from her basic phone. A spreadsheet or a shared photo folder needs a person to look at every photo, and the officer is only there twice a year. The model gives a first answer in the field, at the moment Noor is standing at the tree, with no network. It also sorts the work: confident results get a safe next step straight away, uncertain ones go to the officer. Every officer correction is saved as a labelled photo from real local fields, which is the data the model is missing today.

## Guardrails

1. **Offline core.** Photo, classification, spoken result and saved report all work with no network. No CDN scripts, no remote fonts, no API calls in the core flow. Tested by stopping the server after first load (see Testing).
2. **No generated text.** Every message the app shows or speaks is in `public/strings.json`. The only values filled in are data: dates, the plot name, counts and the officer's chosen keys. `npm run check` fails if code uses a key that is not in the file. The server also rejects notes and labels that are not in the fixed lists.
3. **Never guess.** If the top class confidence is below the threshold (default 0.75), or the top class is `not_a_leaf`, or the model returns a label the app does not know, the result is "Not sure, ask the extension officer" with no advice. The overall result is only "healthy" if all three leaves are confidently healthy.
4. **A human makes the final call.** Results say "This is not the final answer. The extension officer makes the final call." The app only informs and queues the report. It never contacts anyone else, orders anything or names a product.
5. **Simulated things are labelled.** The mock classifier shows a purple "Simulated" banner on every farmer screen and a note on every result. Reports made in mock mode carry a "Mock classifier" chip on the officer page. The SMS preview is labelled "Simulated SMS".
6. **Writing style.** No em dashes or en dashes anywhere. `npm run check` scans every text file we wrote.

The threshold lives in `src/config.js` (`DEFAULT_CONFIDENCE_THRESHOLD`). For a demo it can be changed without a rebuild by opening the app once with `?threshold=0.85`. The value is remembered on that device and shown on the About page.

## Advice list

**Draft, must be validated by the extension service before real use.**

| Class | Next step shown and spoken |
| --- | --- |
| healthy | Keep checking your trees every week. |
| leaf_rust | Remove and destroy the affected leaves, then check the trees nearby. |
| leaf_miner | Remove and destroy the damaged leaves, and tell the cooperative. |
| not sure | No advice. "Not sure, ask the extension officer." |

No pesticide product names and no doses. The officer's optional notes are also a fixed list: "I will visit your farm soon.", "Please take clearer photos next time.", "Please bring a leaf sample to the cooperative.", "Good work, keep checking every week."

## Data sources and limits

- Training images: **[dataset name and link, to be added]**
- License: **[license, to be added]**
- Dataset size: **[number of images per class, to be added]**
- Model: Teachable Machine export `tm-my-image-model`, trained 4 October 2026, labels `healthy, leaf_rust, leaf_miner, not_a_leaf`. The original zip is kept in `model-source/`.

What the data does not cover:

- The training images are not from Noor's fields.
- Lighting, coffee variety, leaf age and local diseases may differ from the training photos.
- Only three conditions are known. Anything else (for example nutrient problems, other diseases, insect damage that is not leaf miner) can only show as "not sure", or worse, as a wrong confident answer.
- **Seen in testing:** on synthetic test pictures that look nothing like a real leaf photo (a grey rectangle, a flat green oval), the model gave confident answers such as `leaf_rust` at 97 percent. The threshold does not catch inputs that are far from the training data. More varied `not_a_leaf` photos (soil, hands, sky, bark, other plants) would help. Until then the officer review is the safety net.

The same placeholders appear on the About page and in `public/strings.json` (`about_data_source`, `about_data_license`, `about_data_size`).

## Privacy

- The name, member number, plot name and photos are stored in IndexedDB on the phone.
- Reports are sent only to the project's own Netlify Function. There are no analytics, ads or third party scripts.
- "Delete all my data" (My reports) clears the phone and, if online, asks the server to delete the reports this phone sent.
- The exported training dataset contains photos and labels only. No names, member numbers or plot names.
- The officer queue on the server can be protected with a shared access code (`LEIHLO_OFFICER_KEY`). This is not real authentication. Before real use the server needs proper accounts, HTTPS only access rules and a data retention policy.
- **If the phone is lost or shared:** anyone who opens the app on that phone can see the reports. The About page tells the farmer to use "Delete all my data" before handing the phone on, and to ask the officer to remove sent reports if the phone is lost. A PIN lock was left out to keep the flow simple for a shared family phone.

## Offline bundle and model size

Measured with `npm run size` after `npm run build`:

| Part | Size |
| --- | --- |
| Model files (`model.json` 90 KB, `weights.bin` 2.05 MB, `metadata.json`) | 2.14 MB |
| TF.js chunk | 0.86 MB (about 236 KB gzipped) |
| App code, styles, strings, icons, service worker | 0.15 MB |
| Audio clips | 0 MB today (23 clips to record) |
| **Full offline bundle** | **3.15 MB**, about **2.2 MB** to download gzipped |

The first visit on a network downloads everything once. After that the app opens and works with no network.

## Run locally

Needs Node 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. The dev server has no service worker and no sync server, so reports stay "saved on phone".

To test offline behaviour and the service worker:

```bash
npm run build
npm run preview
```

Open http://localhost:4173, let it load once, then stop the server (or turn the network off) and reload.

To test the full sync loop without a Netlify account (serves `dist/` and runs the real function against a local Netlify Blobs server):

```bash
npm run build
npm run serve:local
```

Open http://localhost:8888 for the farmer and http://127.0.0.1:8888/officer for the officer. They are different origins, so they behave like two separate phones. Press "Get reports from server" on the officer page.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run check` | No dashes, every string key exists, under 25 clips, string file shape |
| `npm run test:api` | Integration test of every sync route on a local Blobs server |
| `npm run recording-script` | Rebuilds `RECORDING_SCRIPT.md` from `public/strings.json` |
| `npm run size` | Model and offline bundle sizes |
| `npm run sample-model` | Writes a tiny untrained Teachable Machine format model to `test-fixtures/` |
| `npm run icons` | Redraws the app icons |

## Deploy to Netlify

From the GitHub repository (recommended):

1. In Netlify, choose "Add new project", then "Import an existing project", then GitHub, and pick `MaatlaHealth/Leafcheck`.
2. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`, functions directory `netlify/functions`. Leave these as they are.
3. Under "Environment variables" add `LEIHLO_OFFICER_KEY` with a code you choose. The officer types the same code on the officer page. Without it the officer queue is open to anyone with the link.
4. Deploy. Netlify Blobs needs no setup on Netlify.
5. Open the site on the phone once while online, so the service worker saves everything. Use the browser menu to add it to the home screen.

From the command line instead:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set LEIHLO_OFFICER_KEY "choose-a-code"
netlify deploy --build --prod
```

## Sepedi text and audio

Every entry in `public/strings.json` has Sepedi text and a `sepedi_source` field:

- `human`: written by the team (9 lines, all spoken clips).
- `machine_draft`: drafted by machine to match the team's vocabulary (171 lines). These need review by a native speaker before real use.

To review and record:

1. Open `RECORDING_SCRIPT.md`. Part 1 lists the 23 clips to record. Part 2 lists the screen text. Machine drafts are marked "(machine draft, check)".
2. Fix a line in the `sepedi` field of the same key in `public/strings.json`, then set its `sepedi_source` to `human`. Run `npm run recording-script` to refresh the script. A blank field falls back to English, so the app always works.
3. Save each clip as `public/audio/{key}.mp3`. Optional English clips can go in `public/audio/en/{key}.mp3`.
4. Run `npm run build` and deploy, so the text and clips are precached for offline use.

While any line is still a machine draft, the About and limits page shows "Some Sepedi text is a machine draft awaiting review by a native speaker." The line goes away by itself once every line is marked `human`.

Lines to check first:

- The disease names are descriptive drafts, not settled terms: `class_leaf_rust` is "Bolwetši bja matheba a namune" (orange spot disease) and `class_leaf_miner` is "Diboko tša matlakala" (leaf worms).
- `leaf_prompt_1` uses "lekhasi" for leaf, while `leaf_prompt_2` and `leaf_prompt_3` use "letlakala". `zone_prompt` uses "plot" while `setup_prompt` uses "ploto". The leaf prompts use "tsea" where the drafts use "tšea". These are team lines, so they were copied without change.
- In Sepedi mode the English button still says "English", on purpose, so an English speaker can always find it.

A speaker button only appears when its clip exists. There is no text to speech of any kind.

## Replacing the model

Export a new image model from Teachable Machine ("Export Model", "Tensorflow.js", "Download"). Unzip `model.json`, `metadata.json` and `weights.bin` into `public/model/`, replacing the old files, then build and deploy. No code change is needed. If the files are missing or fail to load, the app falls back to mock mode and says so on screen. Labels are matched loosely (for example "Leaf Rust" becomes `leaf_rust`); any label the app does not know is treated as "not sure".

## What is simulated

- **Mock classifier.** Used only when no model files are present or they fail to load. It is a simple colour rule, not a model. Clearly labelled on every farmer screen and on the officer page. With the current repository the real model is used, so mock mode only appears if `public/model/` is emptied.
- **SMS.** Nothing is sent. The officer page and My reports show a basic phone style preview labelled "Simulated SMS", with a character and SMS part count.
- **Sepedi audio.** Not recorded yet. Speaker buttons stay hidden until the clip files exist.
- **Most Sepedi text.** 171 of 180 lines are machine drafts awaiting review by a native speaker. They are marked in `public/strings.json` and `RECORDING_SCRIPT.md`.
- **Single device demo.** When there is no server, the officer page reads the same IndexedDB as the farmer app, so one phone or laptop can show the whole loop.
- **Access control.** The officer code is a shared secret for the demo, not real login.

## Decisions made while building

- **One single page app, two areas.** `/` is the farmer app with hash routes, `/officer` is the officer page. One service worker covers both, so the officer page also opens offline.
- **Sepedi field names.** `public/strings.json` uses `english` and `sepedi` fields so a translator can edit it without knowing language codes. Each entry also has `sepedi_source` (`human` or `machine_draft`), `audio` (`/audio/{key}.mp3`) and `spoken`. Only the 23 `spoken` entries are clips. The other 157 entries are screen text that needs a translation but no recording.
- **Clips per language.** Sepedi clips play when Sepedi is selected. English clips are optional (`/audio/en/`), so English mode does not play Sepedi audio over English text.
- **Overall result rule.** A confident disease on any leaf wins (leaf rust first on a tie). "Healthy" needs all three leaves confidently healthy. Anything else is "not sure".
- **Officer decisions are per leaf.** "Confirm" accepts the model's top class for that leaf, even if the farmer was shown "not sure". "Correct" opens a class picker. The report is "Confirmed by officer" only when no leaf was changed and the overall answer matches what the farmer already saw. Otherwise it is "Corrected by officer".
- **SMS language.** The SMS preview uses the farmer's language: the toggle on the farmer side, and the language saved with the report on the officer side.
- **Photos are shrunk** to 640 pixels on the long side, JPEG quality 0.82, to keep storage and uploads small on 3G.
- **Export as a zip** with one folder per label, because that is how Teachable Machine takes new training data.
- **Delete all my data** also asks the server to delete this phone's sent reports, when online. It keeps the language choice.
- **The team's Teachable Machine zip** was found in `public/model/`. It was unpacked there and the zip was moved to `model-source/` so it is not deployed twice.
- **Persistent storage.** The app asks the browser not to evict its data (`navigator.storage.persist`).
- **No PIN lock** on the shared phone, to keep the flow short. This is noted as a limit.

## Testing

Automated or scripted checks run during the build:

| Acceptance test | Result |
| --- | --- |
| Network gone after first load, full check works and a report is saved | Passed. Stopped the server after first load, reloaded, ran a full three leaf check, report count went from 3 to 4. |
| Non-leaf or low confidence photo gives the not sure message and no advice | Passed in mock mode (non-leaf picture: "Not sure, ask the extension officer", no advice item) and with the real model (a test picture whose top class was `not_a_leaf` at 66 percent gave the same). |
| A Teachable Machine export in `public/model` switches off mock mode with no code change | Passed. With your export in place the banner disappears and reports record `mode: model`. With the folder empty the app runs in labelled mock mode. |
| The language toggle switches every farmer string | Passed. Filled every Sepedi field of a test build with a marker and scanned every visible text node and accessibility label on the check, result, overall, reports and About screens. All switched, and switched back to English. |
| With Sepedi selected, no farmer screen shows English | Passed. Built a list of 273 words that appear in the English strings but in none of the Sepedi ones, then scanned every visible text, label and alt text on the welcome screen (with its form error), zone, capture, photo failed message, leaf result, overall result, My reports with an officer SMS, the delete dialog and About. No hits. Two English items stay on purpose: the "English" button in the language toggle and the hackathon name "Small AI for Development". |
| Officer correction updates the farmer's status and SMS preview | Passed on one device and on two devices through the sync server. |
| Exported dataset contains the officer's labels | Passed. The corrected leaf was saved under `images/leaf_miner/` with `label: leaf_miner` and `modelTopClass: leaf_rust`. No farmer name in the zip. |
| No em dashes or en dashes | Passed. `npm run check` scans all source, strings, docs and config. Third party code in `node_modules` and the built TF.js bundle is not ours and is not scanned. |
| Sync API | Passed. `npm run test:api`: 12 checks, including officer code, fixed list validation and delete. |
| Audio | Passed with a temporary test clip: the speaker button only appears when the file exists, and the clip plays. |

Manual tests to run on a real phone:

1. Install from the deployed site, open once online, then turn on flight mode. Run a full check with the camera. Check that the report is saved and the header says "Offline, saved on phone".
2. Turn flight mode off. Check that the header changes to "Online, all sent" without pressing anything.
3. Photograph something that is not a leaf (soil, a hand). Expect "Not sure, ask the extension officer" and no advice.
4. Photograph real healthy, rust and miner leaves. Note the results and confidence. This is the real test of the model.
5. Switch Sepedi and English on every screen, including the welcome screen and the delete dialog.
6. After recording clips, check that each prompt plays and "Listen again" works. On iPhone check that audio plays after the first tap.
7. On the officer page on a second device, enter the officer code, get reports, correct one leaf, send. On the farmer phone open My reports and check the new status and SMS preview.
8. Export the dataset and open the zip.
9. Use "Delete all my data" and check that the welcome screen returns and the officer can no longer fetch that report.

## Project structure

```
index.html              single page app entry
src/main.js             boot, routing, service worker registration
src/config.js           threshold, classes, sizes
src/lib/                classifier, guardrail rules, strings, audio, IndexedDB, sync, camera, export, UI helpers
src/screens/            welcome, check, result card, reports, about, officer
public/strings.json     every message the app shows or speaks
public/model/           Teachable Machine export
public/audio/           recorded clips (to add)
netlify/functions/      sync API on Netlify Blobs
scripts/                checks, local server, API test, size report, generators
RECORDING_SCRIPT.md     what to translate and record
```

## License

Code license: **[to be chosen]**. Training data license: see Data sources.
