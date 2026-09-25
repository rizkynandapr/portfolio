// BM25 over the site corpus, with a small Indonesian→English expansion so
// questions in Bahasa find English text. No model, no network, no tokens.

const STOP = new Set(`a an the and or but of to in on at for from by with about into over as is are was were be been being
do does did done have has had it its this that these those there here what which who whom whose when where why how
i me my you your he him his she her we our they them their can could would should will shall may might must just
tell me please pls know any some more most much many very also too than then so if not no yes
yang dan di ke dari untuk dengan itu ini ada apa gimana bagaimana siapa kapan dimana mana kenapa mengapa dong sih kak
aku saya kamu dia mereka kita kami nya punya apakah bisa boleh tolong coba jelaskan ceritain cerita tentang soal
adalah sudah udah belum lagi juga aja saja atau tapi kalau kalo pernah buat bikin sama`.split(/\s+/));

// Bahasa Indonesia → English terms used in the corpus.
const ID_EN = {
  proyek: 'project', projek: 'project', project: 'project', karya: 'project',
  kerja: 'work job', pekerjaan: 'work job', kerjaan: 'work job', jabatan: 'role position', posisi: 'position role',
  pengalaman: 'experience', perusahaan: 'company', kantor: 'company',
  sekarang: 'now current', terbaru: 'latest', nanti: 'next', mulai: 'starting start',
  sebelumnya: 'before previous', dulu: 'before previous',
  kontak: 'contact', hubungi: 'contact reach', menghubungi: 'contact reach', surel: 'email', nomor: 'contact',
  pendidikan: 'education', kuliah: 'university study', kampus: 'university', lulusan: 'graduate degree', sekolah: 'school',
  keahlian: 'skills', kemampuan: 'skills', skill: 'skills', alat: 'tools', teknologi: 'technologies', bahasa: 'languages',
  pesanan: 'order', order: 'order', pelanggan: 'customer', pembeli: 'customer', pemilik: 'owner', toko: 'shop business',
  usaha: 'business', bisnis: 'business', umkm: 'business small', hukum: 'legal law', regulasi: 'regulations', peraturan: 'regulations',
  akurasi: 'accuracy', tes: 'tests', uji: 'tests', lamaran: 'application job', lowongan: 'job listings', rekrutmen: 'recruitment hiring',
  kandidat: 'candidate', surat: 'letter', judul: 'headline', berita: 'headline', cara: 'how', kerjanya: 'works',
  alur: 'pipeline flow', langkah: 'step', tahap: 'step', data: 'data', cerita: 'story', latar: 'background',
  tinggal: 'based', lokasi: 'based location', domisili: 'based', asal: 'based',
};

function stem(t) {
  if (t.length > 5 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
  if (t.length > 6 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 5 && t.endsWith('ed')) return t.slice(0, -2);
  if (t.length > 4 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}

export function tokenize(text, { expand = false } = {}) {
  const raw = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const out = [];
  for (const w of raw) {
    // Indonesian enclitics: "kerjanya" → "kerja"
    const base = w.length > 5 && /(nya|lah|kah)$/.test(w) && !ID_EN[w] ? w.slice(0, -3) : w;
    const extra = expand ? ID_EN[w] ?? ID_EN[base] : null;
    if (extra) extra.split(' ').forEach((e) => out.push(stem(e)));
    if (!STOP.has(base)) out.push(stem(base));
  }
  return out;
}

const K1 = 1.4;
const B = 0.72;

export function createIndex(chunks) {
  const docs = chunks.map((c) => {
    // Titles and keywords count twice: they say what a chunk is about.
    const toks = tokenize(`${c.title} ${c.title} ${c.keywords} ${c.keywords} ${c.text}`);
    const tf = new Map();
    toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    return { chunk: c, tf, len: toks.length };
  });
  const df = new Map();
  docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / docs.length;
  const N = docs.length;
  const idf = (t) => Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));

  return function search(query, k = 4) {
    const q = [...new Set(tokenize(query, { expand: true }))];
    if (!q.length) return [];
    return docs
      .map((d) => {
        let score = 0;
        let hits = 0;
        for (const t of q) {
          const f = d.tf.get(t);
          if (!f) continue;
          hits += 1;
          score += idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
        }
        return { chunk: d.chunk, score, hits, coverage: hits / q.length };
      })
      .filter((r) => r.hits > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  };
}
