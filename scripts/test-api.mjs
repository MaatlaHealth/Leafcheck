// Integration test for netlify/functions/api.mjs against a local Netlify Blobs server.
// Run: npm run test:api
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BlobsServer } from '@netlify/blobs/server';

const blobsDirectory = await mkdtemp(join(tmpdir(), 'leihlo-blobs-'));
const blobsServer = new BlobsServer({ directory: blobsDirectory, token: 'test-token' });
const { port } = await blobsServer.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({
  siteID: 'test-site', token: 'test-token', edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}`,
})).toString('base64');
process.env.LEIHLO_OFFICER_KEY = 'officer-test-code';

const { default: handleApiRequest } = await import('../netlify/functions/api.mjs');
const call = async (method, path, body, headers = {}) => {
  const response = await handleApiRequest(new Request(`http://localhost/api/${path}`, {
    method, headers: { 'content-type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined,
  }));
  return { status: response.status, body: await response.json() };
};

let failures = 0;
const expect = (label, condition) => {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
  if (!condition) failures += 1;
};

const reportId = 'test-report-0001';
const tinyPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const report = {
  id: reportId, createdAt: new Date().toISOString(), farmer: { name: 'Test', memberNumber: '1', plotName: 'Plot' },
  farmerLanguage: 'nso', zone: 'upper', classifier: { mode: 'mock' },
  overall: { classId: 'leaf_rust', isSure: true, level: 'high', resultKey: 'overall_leaf_rust', adviceKey: 'advice_leaf_rust' },
  leaves: [{ index: 0, prediction: { topClassId: 'leaf_rust', topProbability: 0.9 }, result: { classId: 'leaf_rust' }, photoDataUrl: tinyPhoto }],
};
const decision = {
  leaves: [{ index: 0, decision: 'corrected', finalClassId: 'leaf_miner', modelTopClassId: 'leaf_rust' }],
  overallClassId: 'leaf_miner', noteKey: 'note_visit', status: 'corrected', decidedAt: new Date().toISOString(),
};
const officerHeaders = { 'x-officer-key': 'officer-test-code' };

expect('health', (await call('GET', 'health')).body.ok === true);
expect('upload report', (await call('POST', 'reports', report)).status === 200);
expect('reject bad report', (await call('POST', 'reports', { id: 'x' })).status === 400);
expect('list needs officer key', (await call('GET', 'reports')).status === 403);
const listed = await call('GET', 'reports', null, officerHeaders);
expect('officer lists report', listed.status === 200 && listed.body.reports.some((item) => item.id === reportId));
expect('no decision yet', (await call('GET', `decisions?ids=${reportId}`)).body.decisions[reportId] === undefined);
expect('decision needs officer key', (await call('POST', 'decisions', { reportId, decision })).status === 403);
expect('reject note outside fixed list', (await call('POST', 'decisions', { reportId, decision: { ...decision, noteKey: 'free text' } }, officerHeaders)).status === 400);
expect('officer posts decision', (await call('POST', 'decisions', { reportId, decision }, officerHeaders)).status === 200);
const pulled = await call('GET', `decisions?ids=${reportId}`);
expect('farmer pulls decision', pulled.body.decisions[reportId]?.overallClassId === 'leaf_miner');
expect('farmer deletes report', (await call('POST', 'reports/delete', { ids: [reportId] })).body.deleted === 1);
const afterDelete = await call('GET', 'reports', null, officerHeaders);
expect('report gone after delete', !afterDelete.body.reports.some((item) => item.id === reportId));

await blobsServer.stop();
await rm(blobsDirectory, { recursive: true, force: true });
console.log(failures ? `\n${failures} failure(s)` : '\nAll API tests passed.');
process.exit(failures ? 1 : 0);
