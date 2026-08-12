# Perombakan Desain Portfolio — Spec

**Tanggal:** 2026-08-13
**Status:** Disetujui, siap masuk tahap perencanaan implementasi
**Repo:** `rizkynandapr/portfolio` (branch `main`)

---

## 1. Latar belakang

Portfolio saat ini berbasis React 19 + Vite dengan tujuh section bertumpuk (Nav, Hero, About, Projects, Experience, Stack, Contact). Bahasa visualnya "deep space": latar `#070B14`, gradien holografik periwinkle→cyan, glassmorphism, dan scene three.js berisi partikel bercahaya.

Isi tulisannya sudah kuat — spesifik, membawa angka nyata, bersuara percaya diri. **Isi tidak dirombak.** Yang dirombak adalah seluruh lapisan visual dan mekanik penyajiannya.

Referensi yang dijadikan landasan: <https://independent-product-studio.vercel.app/>

### Temuan dari referensi

Situs itu adalah **satu `<section class="stage">` setinggi 36.273px (53,5 viewport)** — bukan section bertumpuk. Seluruh isinya di-*scrub* mengikuti scroll dalam panggung yang di-pin.

Token intinya:

| Token | Nilai |
|---|---|
| `--paper` | `#f2f1ed` |
| `--ink` | `#1d1c19` |
| `--press` | `#0b0a09` |
| `--ease` | `cubic-bezier(.22,1,.36,1)` |

Tipografi: Flecha (serif display), GT Standard L (grotesk), GT Standard Mono. **Ketiganya berlisensi komersial** — tidak dipakai di proyek ini, diganti padanan gratis (lihat §3).

Motion: 14 keyframes, termasuk `draw`, `shine`, `ruleV`/`ruleH`, `settle`. `prefers-reduced-motion` dihormati.

---

## 2. Keputusan yang mengunci arah

Semua diputuskan bersama pemilik proyek pada sesi 2026-08-13:

| # | Keputusan | Pilihan |
|---|---|---|
| 1 | Audiens | Ketiganya: recruiter, klien freelance, komunitas |
| 2 | Kedalaman mengikuti referensi | **Full cinematic** — satu stage di-scrub |
| 3 | Dunia visual | **Abstrak teknis** — node, graf, data |
| 4 | Palet & gaya render | **Tinta di atas kertas** — node sebagai gambar teknik, tanpa glow |
| 5 | Perlakuan proyek | **Keempat alur di-scrub**, satu demi satu |
| 6 | Urutan pembukaan | **A** — proyek pertama muncul di ~10% |
| 7 | Pendekatan teknis | **A** — GSAP ScrollTrigger sebagai tulang punggung |
| 8 | Pasangan huruf | **C** — Newsreader + IBM Plex Sans + IBM Plex Mono |
| 9 | Perlakuan HP | **A** — scrub dimatikan, alur jadi stepper ketuk |

### Risiko yang disadari dan diterima

Dua risiko disampaikan sebelum keputusan diambil, dan pemilik proyek tetap memilih jalur ini:

1. **Recruiter harus scroll lama.** Diterima; dimitigasi lewat nav tetap `WORK · STACK · ABOUT · CV` yang selalu terjangkau, bukan dengan memperpendek pengalaman.
2. **Efek yang sama berulang 4×.** Diterima; dimitigasi lewat komposisi panggung berbeda per proyek (§5.2), bukan dengan mengurangi jumlah alur.

Catatan lingkup: ini penulisan ulang lapisan render, bukan penataan CSS. Perkiraan realistis dalam hitungan hari kerja, bukan jam.

---

## 3. Fondasi

### 3.1 Token warna

```css
:root {
  --paper: #f2f1ed;   /* latar utama */
  --ink:   #1d1c19;   /* teks & garis */
  --press: #0b0a09;   /* hanya babak Contact */
  --rule:  rgba(29,28,25,.14);  /* garis rambut 1px */
  --flag:  #8a4b2a;   /* satu-satunya aksen */
  --ease:  cubic-bezier(.22,1,.36,1);
}
```

**Aturan `--flag`:** warna aksen dipakai **hanya di dua tempat** — node aktif pada diagram, dan momen Citation Validator gagal di babak WORK 01. Tidak ada penggunaan lain. Kelangkaannya adalah alasan ia berarti.

Skema warna: terang saja (`color-scheme: light only`). Tidak ada dark mode.

### 3.2 Tipografi

| Peran | Font | Sumber |
|---|---|---|
| Display | **Newsreader** | Google Fonts (OFL) |
| Body | **IBM Plex Sans** | Google Fonts (OFL) |
| Mono | **IBM Plex Mono** | Google Fonts (OFL) |

Semua berlisensi bebas untuk penggunaan komersial. Font di-*self-host* (di-copy ke `public/fonts/`) dengan `font-display: swap`, bukan dimuat dari CDN Google — menghindari permintaan pihak ketiga dan pergeseran layout.

Subset: Latin + Latin Extended (copy berbahasa Indonesia dan Inggris).

### 3.3 Grid

Grid editorial berbasis persentase dengan garis rambut yang terlihat, mengikuti pola referensi:

```css
--v1: 4.75%;   /* margin kiri */
--v2: 95.25%;  /* margin kanan */
--colA: 8%;    /* kolom penanda babak */
--colB: 24%;   /* kolom diagram */
```

Garis vertikal dan horizontal `--rule` selebar 1px membingkai kolom — bukan dekorasi, tapi penanda struktur.

---

## 4. Peta babak

Total ≈ 51 layar desktop, mengikuti aturan §5.1 (satu node = satu layar, ditambah satu layar pembuka tiap babak alur). Urutan dari 0% ke 100%:

| Rentang | Babak | Isi | Layar |
|---|---|---|---|
| 00–04% | Opening | Nama + satu kalimat. Garis tinta menggambar dirinya. | 2 |
| 04–10% | Premise | Apa yang dikerjakan, untuk siapa. Metrik: 10 klien, 80% alur terotomasi. | 3 |
| 10–27% | **WORK 01** | LegalitasAI — 8 node, komposisi **vertikal** | 9 |
| 27–47% | **WORK 02** | WhatsApp Chatbot — 9 node, komposisi **horizontal** | 10 |
| 47–65% | **WORK 03** | ApplyIQ — 8 node, komposisi **bercabang** | 9 |
| 65–76% | **WORK 04** | TalentScout — 5 node, komposisi **konvergen** | 6 |
| 76–80% | WORK 05 | Clickbait Detector — ringkas, tanpa alur. Satu angka: 98%. | 2 |
| 80–88% | Stack + Exp | Tabel editorial bergaris, bukan grid ikon | 4 |
| 88–94% | About | Setelah bukti, bukan sebelum | 3 |
| 94–100% | Contact | Satu-satunya babak gelap (`--press`). Email, CV, GitHub. | 3 |

Nav tetap terlihat sepanjang scroll: `WORK · STACK · ABOUT · CV`. Label babak aktif berganti mengikuti posisi, dengan indikator persentase.

---

## 5. Mekanik alur scrubbed

### 5.1 Aturan panggung

1. **Panggung di-pin** — viewport diam, hanya isinya berubah. Satu node = satu layar scroll, ditambah satu layar pembuka tiap babak alur.
2. **Node menggambar dirinya** — SVG `stroke-dasharray` dianimasikan dari penuh ke nol. Batang penghubung menyambung dari node sebelumnya.
3. **Hanya node aktif yang penuh** — node yang sudah lewat maupun yang belum datang tetap terlihat pada opasitas 18%. Diagram utuh terbangun di depan mata, dan di akhir babak seluruh arsitektur terlihat sekaligus.
4. **Teks berganti, diagram tetap di tempat** — mata tidak berpindah-pindah.
5. **Aksen muncul sekali** — node Citation Validator di WORK 01.

### 5.2 Empat komposisi

Perbedaan ritme dicapai lewat fungsi layout murni, bukan komponen terpisah:

| Proyek | Komposisi | Bentuk |
|---|---|---|
| LegalitasAI | `vertical` | Turun lurus, satu kolom |
| WhatsApp Chatbot | `horizontal` | Melintas kiri→kanan, satu pesan berjalan |
| ApplyIQ | `branching` | Pecah jadi paralel, bertemu lagi di Supabase |
| TalentScout | `convergent` | Dua masukan menyatu jadi satu skor |

Tanda tangan fungsi:

```js
// layouts/vertical.js
export default function vertical(nodes, viewport) {
  return nodes.map((n, i) => ({ ...n, x: 0, y: i * GAP, edge: 'straight' }));
}
```

Masuk: array node + dimensi viewport. Keluar: array koordinat. Murni, tanpa efek samping, bisa diuji tanpa DOM.

### 5.3 Klimaks WORK 01

Node 07 (Citation Validator) adalah puncak naratif seluruh situs. Saat aktif:

- Titik node dan labelnya berubah ke `--flag`
- Garis penghubung ke node berikutnya **putus** (dasharray tidak pernah menutup)
- Panel teks mendapat batas kiri `--flag`

Pesannya: sistem menolak menjawab ketika tidak bisa membuktikan. Ini satu-satunya warna di ~51 layar.

---

## 6. Perilaku HP (< 768px)

**Scrub dan pinning dimatikan sepenuhnya.**

Tiap alur menjadi *stepper* yang diketuk: satu node per ketukan, dengan bar progres dan tombol `NODE n / total →`. Node yang belum dilewati tetap terlihat di bawah pada opasitas rendah, jadi struktur keseluruhan tetap terbaca.

Total ≈ 12 layar.

Alasan teknis, bukan estetis:

- Pinning + `100vh` bermasalah di iOS Safari saat bilah alamat menyusut
- Empat timeline scrub aktif menguras baterai
- Momentum scrolling di iOS membuat scrub terasa tersendat

Isi identik dengan desktop — hanya cara mengaksesnya berbeda.

---

## 7. Aksesibilitas

**Prinsip pengikat:** situs harus terbaca utuh tanpa JavaScript. Kondisi dasar CSS menampilkan **semua** isi. JS hanya menambahkan peredupan dan scrub. Kalau GSAP gagal dimuat, yang tersaji adalah dokumen editorial lengkap.

| Jalur | Perilaku |
|---|---|
| `prefers-reduced-motion: reduce` | Pinning dilepas total. Tiap alur dirender sebagai diagram statis utuh dengan semua teks node terlihat sekaligus. Situs ≈ 10 layar. |
| Pembaca layar | Teks scrubbed ada di DOM sebagai `<h3>`/`<p>` asli sejak awal, hanya diatur `opacity`. Tanpa `display:none`, tanpa penyisipan lewat JS. Urutan baca benar tanpa ARIA tambahan. |
| Keyboard | Tiap babak bisa dilompati lewat `Tab`. Nav selalu terjangkau — ini juga jalan pintas bagi recruiter. |
| Kontras | `--ink` di atas `--paper` = 15.1:1. `--flag` di atas `--paper` = 5.9:1. Keduanya lolos WCAG AA untuk teks normal. |

Jalur reduced-motion adalah jalur yang harus benar-benar berfungsi, bukan tambahan.

---

## 8. Arsitektur

### 8.1 Struktur berkas

```
src/
  index.css              token saja — warna, tipografi, grid
  App.jsx
  data/
    projects.js          alur & copy, dikeluarkan dari Projects.jsx
  stage/
    Stage.jsx            orkestrator babak
    useChapter.js        daftarkan ScrollTrigger, pasang malas
    useReducedMotion.js
  flow/
    FlowChapter.jsx      SATU komponen untuk keempat alur
    FlowDiagram.jsx      renderer SVG
    FlowStepper.jsx      versi ketuk untuk HP
    layouts/
      vertical.js
      horizontal.js
      branching.js
      convergent.js
  chapters/
    Opening.jsx
    Premise.jsx
    Compact.jsx          Clickbait Detector
    StackExp.jsx
    About.jsx
    Contact.jsx
  ui/
    Nav.jsx
    Chip.jsx
    Rule.jsx
```

### 8.2 Aliran data

`data/projects.js` mengekspor objek proyek yang membawa `flow` (array node) dan `composition` (nama layout). `FlowChapter` membaca keduanya, memanggil fungsi layout yang sesuai untuk mendapat koordinat, lalu menyerahkannya ke `FlowDiagram` (desktop) atau `FlowStepper` (HP). Pemilihan renderer berdasarkan media query, bukan user-agent.

`useChapter` mendaftarkan ScrollTrigger dan memasangnya secara malas — hanya babak aktif ± 1 yang punya timeline hidup.

### 8.3 Nasib berkas lama

| Berkas | Nasib |
|---|---|
| `NeuralScene.jsx` | Dihapus. `three` (~600KB) keluar dari bundle. |
| `WorkflowDiagram.jsx` | Dilebur jadi `FlowDiagram.jsx` |
| `TypingText.jsx` | Dihapus — tidak cocok dengan bahasa tinta |
| `Projects.jsx` | Dipecah: data → `data/projects.js`, tampilan → `FlowChapter` |
| `Hero/About/Experience/Stack/Contact` | Ditulis ulang sebagai babak |
| `useSmoothScroll.js` | Tetap (Lenis) |
| `useScrollReveal.js` | Dihapus — digantikan sistem babak |

### 8.4 Dependensi

| Paket | Peran |
|---|---|
| `gsap` (ada) | ScrollTrigger — pinning & scrub. Tulang punggung. |
| `lenis` (ada) | Smooth scroll |
| `framer-motion` (ada, v13.1.0) | Elemen diskrit: kartu, menu, transisi masuk-keluar. **Bukan** penggerak scroll. |
| `three` (ada) | **Dihapus** bersama NeuralScene |
| `vitest` + `@testing-library/react` | **Ditambah** sebagai devDependency |

### 8.5 Performa

| Keputusan | Alasan |
|---|---|
| SVG, bukan canvas | Garis tinta = path. Bisa di-CSS, terbaca screen reader, tajam di retina. |
| Timeline dipasang malas | Empat timeline aktif sekaligus tidak perlu. |
| Animasi hanya `transform` + `opacity` | Tidak memicu layout. |
| Font di-self-host, subset | Tanpa permintaan pihak ketiga, tanpa pergeseran layout. |

---

## 9. Pengujian

Proyek ini belum punya tes; hanya `oxlint`. Lingkup pengujian sengaja dijaga kecil — dua hal yang murah dan benar-benar menangkap bug:

1. **Unit test empat fungsi layout** (Vitest, tanpa DOM)
   - Jumlah koordinat sama dengan jumlah node
   - Tidak ada dua node bertumpuk pada koordinat sama
   - Semua node berada di dalam batas viewport yang diberikan

2. **Satu tes render `prefers-reduced-motion`** (Testing Library)
   - Semua teks node ada di DOM dan terlihat saat motion dimatikan

Poin kedua menjaga jalur yang paling gampang rusak diam-diam.

Verifikasi manual sebelum merge: `npm run build` bersih, `npm run lint` bersih, dan pemeriksaan langsung di Chrome + iOS Safari.

---

## 10. Kriteria selesai

- [ ] Keempat alur ter-scrub di desktop dengan komposisi berbeda
- [ ] Stepper ketuk berfungsi di bawah 768px
- [ ] `prefers-reduced-motion` menyajikan dokumen statis lengkap
- [ ] Situs terbaca utuh dengan JavaScript dimatikan
- [ ] `three` hilang dari bundle produksi
- [ ] Nav `WORK · STACK · ABOUT · CV` terjangkau dari titik mana pun
- [ ] Unduhan CV berfungsi
- [ ] Kontras lolos WCAG AA
- [ ] `npm run build` dan `npm run lint` bersih
- [ ] Tes layout dan reduced-motion lulus
