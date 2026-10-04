// Leihlo sync layer: a Netlify Function backed by Netlify Blobs.
// The app works fully without it. This only forwards reports to the officer and decisions back.
//
// Routes (all under /api):
//   GET  /api/health                 quick check
//   POST /api/reports                farmer phone uploads one report
//   GET  /api/reports                officer lists reports (needs x-officer-key when LEIHLO_OFFICER_KEY is set)
//   POST /api/decisions              officer saves a decision (same key rule)
//   GET  /api/decisions?ids=a,b      farmer phone pulls decisions for its own report ids
//   POST /api/reports/delete         farmer phone removes its own reports by id
import { getStore } from '@netlify/blobs';

const MAX_BODY_CHARACTERS = 5 * 1024 * 1024;
const MAX_PHOTO_CHARACTERS = 1.5 * 1024 * 1024;
const MAX_REPORTS_LISTED = 60;
const REPORT_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
const ALLOWED_STATUSES = ['confirmed', 'corrected'];
const ALLOWED_CLASSES = ['healthy', 'leaf_rust', 'leaf_miner', 'not_a_leaf'];
const ALLOWED_NOTE_KEYS = ['note_visit', 'note_clearer_photos', 'note_bring_sample', 'note_keep_checking'];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

function stores() {
  return {
    reportStore: getStore({ name: 'leihlo-reports', consistency: 'strong' }),
    decisionStore: getStore({ name: 'leihlo-decisions', consistency: 'strong' }),
  };
}

function isOfficerRequest(request) {
  const officerKey = process.env.LEIHLO_OFFICER_KEY;
  if (!officerKey) return true;
  return request.headers.get('x-officer-key') === officerKey;
}

async function readJsonBody(request) {
  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_CHARACTERS) throw new Error('body_too_large');
  return JSON.parse(bodyText);
}

function validateReport(report) {
  if (!report || !REPORT_ID_PATTERN.test(String(report.id))) return 'bad_id';
  if (!Array.isArray(report.leaves) || report.leaves.length < 1 || report.leaves.length > 3) return 'bad_leaves';
  for (const leaf of report.leaves) {
    if (typeof leaf.photoDataUrl !== 'string' || !leaf.photoDataUrl.startsWith('data:image/')) return 'bad_photo';
    if (leaf.photoDataUrl.length > MAX_PHOTO_CHARACTERS) return 'photo_too_large';
  }
  if (!report.farmer || !report.zone || !report.overall) return 'missing_fields';
  return null;
}

function validateDecision(decision) {
  if (!decision || !ALLOWED_STATUSES.includes(decision.status)) return 'bad_status';
  if (!ALLOWED_CLASSES.includes(decision.overallClassId)) return 'bad_overall_class';
  if (decision.noteKey && !ALLOWED_NOTE_KEYS.includes(decision.noteKey)) return 'bad_note';
  if (!Array.isArray(decision.leaves) || decision.leaves.some((leaf) => !ALLOWED_CLASSES.includes(leaf.finalClassId))) return 'bad_leaf_labels';
  return null;
}

export default async function handleApiRequest(request) {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
  const method = request.method;

  try {
    if (route === 'health') return jsonResponse({ ok: true });

    const { reportStore, decisionStore } = stores();

    if (route === 'reports' && method === 'POST') {
      const report = await readJsonBody(request);
      const problem = validateReport(report);
      if (problem) return jsonResponse({ error: problem }, 400);
      await reportStore.setJSON(report.id, { ...report, receivedAt: new Date().toISOString() });
      return jsonResponse({ ok: true, id: report.id });
    }

    if (route === 'reports' && method === 'GET') {
      if (!isOfficerRequest(request)) return jsonResponse({ error: 'officer_key_required' }, 403);
      const { blobs } = await reportStore.list();
      const reports = (await Promise.all(blobs.map((blob) => reportStore.get(blob.key, { type: 'json' })))).filter(Boolean);
      reports.sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)));
      const newestReports = reports.slice(0, MAX_REPORTS_LISTED);
      const reportsWithDecisions = await Promise.all(newestReports.map(async (report) => ({
        ...report,
        officerDecision: (await decisionStore.get(report.id, { type: 'json' })) || null,
      })));
      return jsonResponse({ reports: reportsWithDecisions });
    }

    if (route === 'decisions' && method === 'POST') {
      if (!isOfficerRequest(request)) return jsonResponse({ error: 'officer_key_required' }, 403);
      const { reportId, decision } = await readJsonBody(request);
      if (!REPORT_ID_PATTERN.test(String(reportId))) return jsonResponse({ error: 'bad_id' }, 400);
      const problem = validateDecision(decision);
      if (problem) return jsonResponse({ error: problem }, 400);
      await decisionStore.setJSON(reportId, decision);
      return jsonResponse({ ok: true });
    }

    if (route === 'decisions' && method === 'GET') {
      const reportIds = (url.searchParams.get('ids') || '').split(',').filter((reportId) => REPORT_ID_PATTERN.test(reportId)).slice(0, 100);
      const decisions = {};
      for (const reportId of reportIds) {
        const decision = await decisionStore.get(reportId, { type: 'json' });
        if (decision) decisions[reportId] = decision;
      }
      return jsonResponse({ decisions });
    }

    if (route === 'reports/delete' && method === 'POST') {
      const { ids } = await readJsonBody(request);
      const reportIds = (Array.isArray(ids) ? ids : []).filter((reportId) => REPORT_ID_PATTERN.test(String(reportId))).slice(0, 200);
      await Promise.all(reportIds.flatMap((reportId) => [reportStore.delete(reportId), decisionStore.delete(reportId)]));
      return jsonResponse({ ok: true, deleted: reportIds.length });
    }

    return jsonResponse({ error: 'not_found' }, 404);
  } catch (error) {
    console.error('Leihlo api error', error);
    return jsonResponse({ error: error.message === 'body_too_large' ? 'body_too_large' : 'server_error' }, error.message === 'body_too_large' ? 413 : 500);
  }
}

export const config = {
  path: '/api/*',
};
