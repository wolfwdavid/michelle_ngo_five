#!/usr/bin/env node
// Apex DNS cutover helper — queries a public resolver (no dig/nslookup needed).
// Usage: node scripts/dns-check.mjs [domain] [resolver]
import { Resolver } from 'node:dns/promises';

const domain = process.argv[2] || 'michellengo.net';
const server = process.argv[3] || '8.8.8.8';
const r = new Resolver();
r.setServers([server]);

const GH_V4 = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
const GH_V6 = ['2606:50c0:8000::153', '2606:50c0:8001::153', '2606:50c0:8002::153', '2606:50c0:8003::153'];

const norm6 = (a) => a.toLowerCase().replace(/(^|:)0+([0-9a-f])/g, '$1$2');

async function q(label, fn) {
  try {
    const out = await fn();
    console.log(`\n===== ${label} =====`);
    console.log(JSON.stringify(out, null, 2));
    return out;
  } catch (e) {
    console.log(`\n===== ${label} =====`);
    console.log(`  (none / error: ${e.code || e.message})`);
    return null;
  }
}

console.log(`# DNS snapshot for ${domain} via ${server}`);

const a = await q('A (apex)', () => r.resolve4(domain));
const aaaa = await q('AAAA (apex)', () => r.resolve6(domain));
await q('MX', () => r.resolveMx(domain));
await q('TXT', () => r.resolveTxt(domain));
await q('CAA', () => r.resolveCaa(domain));
await q('NS', () => r.resolveNs(domain));
await q('CNAME www', () => r.resolveCname('www.' + domain));

// Verdicts
if (a) {
  const set = new Set(a);
  const allGh = GH_V4.every((ip) => set.has(ip));
  const onlyGh = a.every((ip) => GH_V4.includes(ip));
  console.log(`\n>>> A verdict: ${allGh && onlyGh ? 'GITHUB (exactly the 4 IPs)' : allGh ? 'has all 4 GitHub IPs but EXTRA records present' : 'NOT on GitHub yet'} — got [${a.join(', ')}]`);
}
if (aaaa) {
  const set = new Set(aaaa.map(norm6));
  const want = GH_V6.map(norm6);
  const allGh = want.every((ip) => set.has(ip));
  const onlyGh = aaaa.map(norm6).every((ip) => want.includes(ip));
  console.log(`>>> AAAA verdict: ${allGh && onlyGh ? 'GITHUB (exactly the 4 IPs)' : allGh ? 'has all 4 but EXTRA present' : 'NOT on GitHub yet'} — got [${aaaa.join(', ')}]`);
}
