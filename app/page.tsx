"use client";

import { useState, useEffect } from "react";
import s from "./page.module.css";

const ASSETS = [
  { name: "medali", label: "Medali", path: "medali", thumb: "/assets/medali.svg" },
  { name: "badge", label: "Badge", path: "badge", thumb: "/assets/badge.svg" },
  { name: "trophy", label: "Trophy", path: "trophy", thumb: "/assets/trophy.svg" },
  { name: "sertifikat", label: "Sertifikat", path: "sertifikat", thumb: "/assets/sertifikat.svg" },
];

const MEDALS = [
  { name: "bronze", label: "Bronze", path: "medal/bronze", thumb: "/assets/medal/bronze.png" },
  { name: "silver", label: "Silver", path: "medal/silver", thumb: "/assets/medal/silver.png" },
  { name: "gold",   label: "Gold",   path: "medal/gold",   thumb: "/assets/medal/gold.png" },
];

const ALL_ASSETS = [...ASSETS, ...MEDALS];

const LAYOUTS = ["center", "top", "left"];

const EXAMPLES = [
  { url: "medali?text=Juara+1&color=ffd700&fs=48&bg=1a1a2e&w=400&h=400", label: "Juara 1" },
  { url: "trophy?text=Champion&color=fff&fs=36&bg=0f172a&w=400&h=400&layout=top", label: "Champion" },
  { url: "badge?text=Verified&color=fff&fs=32&bg=1e3a5f&w=400&h=400&layout=top", label: "Verified" },
  { url: "medal/bronze?w=400&h=400&serial=42&serialpos=bottom", label: "Bronze #0042" },
];

const PARAMS = [
  ["text / t", "Teks overlay (pisah baris pakai |)", "text=Juara+1|Gold"],
  ["color / c", "Warna teks (hex)", "color=ffd700"],
  ["bg", "Warna background (hex)", "bg=1a1a2e"],
  ["w / width", "Lebar output (px)", "w=600"],
  ["h / height", "Tinggi output (px)", "h=400"],
  ["imgsize / is", "Ukuran gambar (px)", "imgsize=180"],
  ["fontsize / fs", "Ukuran font (px)", "fontsize=48"],
  ["layout", "Posisi: center | top | left | right", "layout=top"],
  ["radius / r", "Border radius", "radius=20"],
  ["bold", "Tebal font (0 = normal)", "bold=0"],
  ["serial / s", "Nomor seri (misal: 42 → #0042)", "serial=42"],
  ["pad", "Zero-padding nomor seri (default: 4)", "pad=4"],
  ["sprefix", "Prefix nomor seri (default: #)", "sprefix=No."],
  ["serialcolor / sc", "Warna nomor seri (hex, default: c8a96e)", "serialcolor=c8a96e"],
  ["serialsize / ss", "Ukuran font nomor seri (px)", "serialsize=28"],
  ["serialpos", "Posisi nomor seri: top | center | bottom", "serialpos=bottom"],
];

type Sel = {
  assetPath: string;
  text: string;
  color: string;
  bg: string;
  w: string;
  h: string;
  layout: string;
  fs: string;
  serial: string;
  serialcolor: string;
  serialpos: string;
};

const isMedalPath = (path: string) => path.startsWith("medal/");

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [sel, setSel] = useState<Sel>({
    assetPath: "medali",
    text: "Juara 1",
    color: "ffd700",
    bg: "1a1a2e00",
    w: "400",
    h: "400",
    layout: "center",
    fs: "48",
    serial: "",
    serialcolor: "c8a96e",
    serialpos: "bottom",
  });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const origin = mounted ? window.location.origin : "https://yourapp.vercel.app";

  const buildUrl = (full = true) => {
    const p = new URLSearchParams();
    if (sel.text) p.set("text", sel.text.replace(/\n/g, "|"));
    if (sel.color) p.set("color", sel.color.replace("#", ""));
    if (sel.bg) p.set("bg", sel.bg.replace("#", ""));
    p.set("w", sel.w);
    p.set("h", sel.h);
    p.set("fontsize", sel.fs);
    if (sel.layout !== "center") p.set("layout", sel.layout);
    if (sel.serial) {
      p.set("serial", sel.serial);
      p.set("serialcolor", sel.serialcolor.replace("#", ""));
      p.set("serialpos", sel.serialpos);
    }
    const path = `/${sel.assetPath}?${p.toString()}`;
    return full ? origin + path : path;
  };

  const copy = (text: string, k: string) => {
    navigator.clipboard.writeText(text);
    setCopied(k);
    setTimeout(() => setCopied(null), 1800);
  };

  const selectedIsMedal = isMedalPath(sel.assetPath);

  return (
    <div className={s.page}>
      <div className={s.noise} />

      {/* HERO */}
      <header className={s.hero}>
        <div className={s.heroGrid} />
        <div className={s.heroInner}>
          <div className={s.badge}>✦ Gambar kamu · Teks kamu · URL kamu</div>
          <h1 className={s.title}><span className={s.accent}>Img</span>Place</h1>
          <p className={s.sub}>Tambahkan teks ke icon atau gambar kamu lewat URL.<br />Gratisss, selama masih bisa diakses.</p>

          <div className={s.heroDemo}>
            {EXAMPLES.slice(0, 3).map((e, i) => (
              <div key={i} className={s.heroDemoCard}>
                <img src={e.url} alt={e.label} className={s.heroDemoImg} />
                <span className={s.heroDemoLabel}>{e.label}</span>
              </div>
            ))}
          </div>

          <div className={s.heroUrl}>
            <span className={s.urlBase}>{origin}/</span>
            <span className={s.urlPath}>medal/bronze</span>
            <span className={s.urlParam}>?serial=42&serialpos=bottom</span>
          </div>
        </div>
      </header>

      <main className={s.main}>

        {/* HOW IT WORKS */}
        <section className={s.section}>
          <div className={s.sectionLabel}>✦ Cara Kerja</div>
          <h2 className={s.sectionTitle}>Tiga langkah selesai</h2>
          <div className={s.steps}>
            {[
              { n: "01", title: "Pilih gambar", desc: "Pilih yang paling cocok" },
              { n: "02", title: "Bebas Atur Semaumu", desc: "Atur teks placeholder sesuai keinginanmu" },
              { n: "03", title: "Pakai via URL", desc: "Panggil /nama-file?text=Teks+Kamu — langsung jadi!" },
            ].map((st) => (
              <div key={st.n} className={s.step}>
                <div className={s.stepNum}>{st.n}</div>
                <div className={s.stepTitle}>{st.title}</div>
                <div className={s.stepDesc}>{st.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BUILDER */}
        <section className={s.section}>
          <div className={s.sectionLabel}>✦ Live Builder</div>
          <h2 className={s.sectionTitle}>Coba sekarang</h2>

          <div className={s.builder}>
            {/* Controls */}
            <div className={s.controls}>

              {/* Icon assets */}
              <div className={s.field} style={{ gridColumn: "1/-1" }}>
                <label className={s.label}>Icon / Ilustrasi</label>
                <div className={s.assetGrid}>
                  {ASSETS.map((a) => (
                    <button key={a.name}
                      className={`${s.assetBtn} ${sel.assetPath === a.path ? s.assetBtnActive : ""}`}
                      onClick={() => setSel({ ...sel, assetPath: a.path })}
                    >
                      <img src={a.thumb} alt={a.label} className={s.assetThumb} />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Medal assets */}
              <div className={s.field} style={{ gridColumn: "1/-1" }}>
                <label className={s.label}>Medal</label>
                <div className={s.assetGrid}>
                  {MEDALS.map((a) => (
                    <button key={a.name}
                      className={`${s.assetBtn} ${sel.assetPath === a.path ? s.assetBtnActive : ""}`}
                      onClick={() => setSel({ ...sel, assetPath: a.path })}
                    >
                      <img src={a.thumb} alt={a.label} className={s.assetThumb} />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={s.field} style={{ gridColumn: "1/-1" }}>
                <label className={s.label}>Teks (pisah baris pakai |)</label>
                <input className={s.input} value={sel.text}
                  onChange={(e) => setSel({ ...sel, text: e.target.value })}
                  placeholder="Juara 1|Gold Medal" />
              </div>

              <div className={s.field}>
                <label className={s.label}>Warna Teks</label>
                <div className={s.colorRow}>
                  <input type="color" className={s.swatch} value={`#${sel.color.replace("#", "")}`}
                    onChange={(e) => setSel({ ...sel, color: e.target.value.replace("#", "") })} />
                  <input className={s.input} value={sel.color}
                    onChange={(e) => setSel({ ...sel, color: e.target.value.replace("#", "") })} />
                </div>
              </div>

              <div className={s.field}>
                <label className={s.label}>Background</label>
                <div className={s.colorRow}>
                  <input type="color" className={s.swatch} value={`#${sel.bg.replace("#", "")}`}
                    onChange={(e) => setSel({ ...sel, bg: e.target.value.replace("#", "") })} />
                  <input className={s.input} value={sel.bg}
                    onChange={(e) => setSel({ ...sel, bg: e.target.value.replace("#", "") })} />
                </div>
              </div>

              <div className={s.field}>
                <label className={s.label}>Lebar (px)</label>
                <input className={s.input} type="number" value={sel.w}
                  onChange={(e) => setSel({ ...sel, w: e.target.value })} />
              </div>

              <div className={s.field}>
                <label className={s.label}>Tinggi (px)</label>
                <input className={s.input} type="number" value={sel.h}
                  onChange={(e) => setSel({ ...sel, h: e.target.value })} />
              </div>

              <div className={s.field}>
                <label className={s.label}>Font Size (px)</label>
                <input className={s.input} type="number" value={sel.fs}
                  onChange={(e) => setSel({ ...sel, fs: e.target.value })} />
              </div>

              <div className={s.field}>
                <label className={s.label}>Layout</label>
                <div className={s.layoutGrid}>
                  {LAYOUTS.map((l) => (
                    <button key={l} className={`${s.layoutBtn} ${sel.layout === l ? s.layoutBtnActive : ""}`}
                      onClick={() => setSel({ ...sel, layout: l })}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Serial number — shown for all assets, visually highlighted for medals */}
              <div className={s.field} style={{ gridColumn: "1/-1" }}>
                <label className={s.label}>
                  Nomor Seri
                  {selectedIsMedal && <span className={s.badgeTip}>✦ cNFT</span>}
                </label>
                <div className={s.serialRow}>
                  <input
                    className={s.input}
                    type="number"
                    value={sel.serial}
                    onChange={(e) => setSel({ ...sel, serial: e.target.value })}
                    placeholder="42  →  #0042"
                    style={{ flex: 1 }}
                  />
                  <select
                    className={s.input}
                    value={sel.serialpos}
                    onChange={(e) => setSel({ ...sel, serialpos: e.target.value })}
                    style={{ flex: "0 0 auto", width: "auto" }}
                  >
                    <option value="bottom">Bawah</option>
                    <option value="center">Tengah</option>
                    <option value="top">Atas</option>
                  </select>
                </div>
              </div>

              <div className={s.field}>
                <label className={s.label}>Warna Nomor Seri</label>
                <div className={s.colorRow}>
                  <input type="color" className={s.swatch} value={`#${sel.serialcolor.replace("#", "")}`}
                    onChange={(e) => setSel({ ...sel, serialcolor: e.target.value.replace("#", "") })} />
                  <input className={s.input} value={sel.serialcolor}
                    onChange={(e) => setSel({ ...sel, serialcolor: e.target.value.replace("#", "") })} />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className={s.preview}>
              <div className={s.previewFrame}>
                <img key={buildUrl(false)} src={buildUrl(false)} alt="preview"
                  style={{ maxWidth: "100%", maxHeight: "260px", objectFit: "contain", borderRadius: "6px" }} />
              </div>
              <div className={s.urlBar}>
                <code className={s.urlCode}>{buildUrl()}</code>
                <button className={s.copyBtn} onClick={() => copy(buildUrl(), "main")}>
                  {copied === "main" ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* EXAMPLES */}
        <section className={s.section}>
          <div className={s.sectionLabel}>✦ Contoh</div>
          <h2 className={s.sectionTitle}>Siap pakai</h2>
          <div className={s.exGrid}>
            {EXAMPLES.map((e, i) => (
              <div key={i} className={s.exCard}>
                <div className={s.exImg}><img src={`/${e.url}`} alt={e.label} style={{ maxHeight: 160, maxWidth: "100%" }} /></div>
                <div className={s.exMeta}>
                  <span className={s.exLabel}>{e.label}</span>
                  <div className={s.exUrlRow}>
                    <code className={s.exUrl}>/{e.url}</code>
                    <button className={s.miniCopy} onClick={() => copy(`${origin}/${e.url}`, `ex${i}`)}>
                      {copied === `ex${i}` ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ADD YOUR OWN
        <section className={s.section}>
          <div className={s.sectionLabel}>✦ Tambah Gambar Sendiri</div>
          <h2 className={s.sectionTitle}>Cara tambah asset</h2>
          <div className={s.addCard}>
            <div className={s.addStep}>
              <div className={s.addCode}>
                <div className={s.codeHeader}><span className={s.codeLang}>Struktur folder</span></div>
                <pre className={s.codeBody}>{`public/
└── assets/
    ├── medali.svg      ✓ sudah ada
    ├── badge.svg       ✓ sudah ada
    ├── trophy.svg      ✓ sudah ada
    ├── sertifikat.svg  ✓ sudah ada
    └── medal/
        ├── bronze.png  ✓ sudah ada
        ├── silver.png  ✓ sudah ada
        ├── gold.png    ✓ sudah ada
        └── custom.png  ← taruh di sini!`}</pre>
              </div>
            </div>
            <div className={s.addStep}>
              <div className={s.addCode}>
                <div className={s.codeHeader}><span className={s.codeLang}>Langsung pakai</span></div>
                <pre className={s.codeBody}>{`${origin}/medal/bronze?serial=1&serialpos=bottom
${origin}/medal/gold?serial=42&text=Champion
${origin}/logo-mu?text=Brand+Name&color=fff`}</pre>
              </div>
            </div>
          </div>
        </section> */}

        {/* PARAMS */}
        <section className={s.section}>
          <div className={s.sectionLabel}>✦ Referensi</div>
          <h2 className={s.sectionTitle}>Parameter lengkap</h2>
          <div className={s.paramTable}>
            <div className={s.paramHead}><span>Parameter</span><span>Fungsi</span><span>Contoh</span></div>
            {PARAMS.map(([p, d, ex], i) => (
              <div key={i} className={s.paramRow}>
                <code className={s.pName}>{p}</code>
                <span className={s.pDesc}>{d}</span>
                <code className={s.pEx}>{ex}</code>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <span className={s.footerBrand}>ImgPlace</span>
        <span className={s.footerMuted}>@Lordsans</span>
      </footer>
    </div>
  );
}