import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase, MapPin, Clock, Search, LogOut, Plus, CheckCircle2, XCircle,
  Users, FileText, ChevronRight, X, Building2, GraduationCap, ShieldCheck,
  Filter, ArrowLeft, Eye, Trash2, Pencil, Link as LinkIcon, Inbox
} from "lucide-react";

const INK = "#12233B";
const TEAL = "#0F6D6D";
const AMBER = "#E8A33D";
const PAPER = "#F6F4EE";
const SLATE = "#5B6472";
const LINE = "#DBD6C9";
const DANGER = "#B0432F";
const SUCCESS = "#3C8562";

const JOB_TYPES = ["Magang", "Penuh Waktu", "Paruh Waktu", "Kontrak"];
const TYPE_COLOR = { "Magang": AMBER, "Penuh Waktu": INK, "Paruh Waktu": TEAL, "Kontrak": SLATE };

function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) { return d; }
}

async function storeGet(key, shared) {
  try {
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  } catch (e) { return null; }
}
async function storeSet(key, value, shared) {
  try { await window.storage.set(key, JSON.stringify(value), shared); } catch (e) {}
}

function seedData() {
  const mitraId = uid("u");
  const mhsId = uid("u");
  const adminId = uid("u");
  const users = [
    { id: adminId, role: "admin", name: "Admin Pusat Karir", email: "admin@iteba.ac.id", password: "admin123" },
    { id: mitraId, role: "mitra", name: "PT Nusantara Elektronik Batam", email: "hr@nusantaraelektronik.co.id",
      password: "mitra123", industri: "Manufaktur Elektronik", lokasi: "Batam, Kepulauan Riau",
      deskripsi: "Produsen komponen elektronik untuk pasar ekspor Asia Tenggara, berbasis di Kawasan Industri Batamindo." },
    { id: mhsId, role: "mahasiswa", name: "Rangga Saputra", email: "rangga@student.iteba.ac.id", password: "mhs123",
      nim: "22041001", prodi: "Teknik Informatika", angkatan: "2022", noHp: "081234567890" },
  ];
  const j1 = uid("j"), j2 = uid("j"), j3 = uid("j");
  const jobs = [
    { id: j1, mitraId, title: "Staff Quality Control", tipe: "Penuh Waktu", lokasi: "Batamindo, Batam",
      kuota: 2, gaji: "Rp 4.500.000 - 6.000.000", deadline: "2026-10-15",
      deskripsi: "Melakukan inspeksi kualitas produk elektronik pada lini produksi dan menyusun laporan QC harian.",
      kualifikasi: "D3/S1 Teknik, teliti, mampu bekerja shift, diutamakan berpengalaman di manufaktur.",
      status: "disetujui", dibuat: "2026-09-01" },
    { id: j2, mitraId, title: "Magang Software Engineer", tipe: "Magang", lokasi: "Batam (Hybrid)",
      kuota: 4, gaji: "Uang saku Rp 1.500.000/bulan", deadline: "2026-11-01",
      deskripsi: "Membantu tim IT internal mengembangkan sistem inventori berbasis web selama 4-6 bulan.",
      kualifikasi: "Mahasiswa aktif semester 5+, menguasai dasar JavaScript/SQL, mau belajar cepat.",
      status: "disetujui", dibuat: "2026-09-05" },
    { id: j3, mitraId, title: "Supervisor Produksi", tipe: "Kontrak", lokasi: "Batamindo, Batam",
      kuota: 1, gaji: "Rp 6.000.000 - 8.000.000", deadline: "2026-10-30",
      deskripsi: "Mengawasi jalannya proses produksi harian dan koordinasi dengan tim QC.",
      kualifikasi: "S1 Teknik Industri/Elektro, pengalaman min. 2 tahun sebagai supervisor.",
      status: "menunggu", dibuat: "2026-09-12" },
  ];
  const applications = [
    { id: uid("a"), jobId: j2, studentId: mhsId, pesan: "Saya tertarik mengembangkan skill web development saya melalui program ini.",
      cvUrl: "https://drive.google.com/contoh-cv-rangga", status: "ditinjau", dikirim: "2026-09-08" },
  ];
  return { users, jobs, applications };
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm mb-1.5" style={{ color: SLATE }}>{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full px-3 py-2.5 rounded-none border bg-white text-sm outline-none focus:ring-2";
const inputStyle = { borderColor: LINE, color: INK };

function Btn({ children, onClick, variant = "primary", type = "button", className = "", disabled }) {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50";
  const styles = {
    primary: { background: INK, color: PAPER },
    amber: { background: AMBER, color: INK },
    outline: { background: "transparent", color: INK, border: `1px solid ${INK}` },
    ghost: { background: "transparent", color: SLATE },
    danger: { background: "transparent", color: DANGER, border: `1px solid ${DANGER}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base + " " + className} style={styles[variant]}>
      {children}
    </button>
  );
}

function Badge({ text, color }) {
  return (
    <span className="text-xs font-medium px-2 py-1" style={{ background: color + "1A", color }}>
      {text}
    </span>
  );
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 px-4 py-3 shadow-lg text-sm flex items-center gap-3"
      style={{ background: INK, color: PAPER }}>
      {message}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function Navbar({ user, onNav, onLogout }) {
  return (
    <div className="border-b sticky top-0 z-40" style={{ background: PAPER, borderColor: LINE }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => onNav("landing")} className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center" style={{ background: INK }}>
            <span style={{ color: AMBER, fontFamily: "Archivo", fontWeight: 800, fontSize: 15 }}>PK</span>
          </div>
          <span style={{ fontFamily: "Archivo", fontWeight: 700, color: INK, fontSize: 15 }}>
            Pusat Karir ITEBA
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onNav("jobs")} className="px-3 py-2 text-sm hidden sm:block" style={{ color: SLATE }}>
            Cari Lowongan
          </button>
          {!user && (
            <>
              <button onClick={() => onNav("login")} className="px-3 py-2 text-sm" style={{ color: INK }}>Masuk</button>
              <Btn variant="amber" onClick={() => onNav("register")}>Daftar</Btn>
            </>
          )}
          {user && (
            <>
              <button onClick={() => onNav("dashboard")} className="px-3 py-2 text-sm font-medium" style={{ color: INK }}>
                {user.name.split(" ")[0]}
              </button>
              <Btn variant="ghost" onClick={onLogout}><LogOut size={16} />Keluar</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Hero({ onNav, stats }) {
  return (
    <div style={{ background: INK }}>
      <div className="max-w-6xl mx-auto px-5 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 style={{ fontFamily: "Archivo", color: PAPER, fontWeight: 800, lineHeight: 1.05 }}
            className="text-4xl md:text-[2.75rem] mb-5">
            Karier dimulai dari kampus, berlabuh di dunia kerja.
          </h1>
          <p className="text-base mb-7 max-w-md" style={{ color: "#C7CEDA" }}>
            Pusat Karir Institut Teknologi Batam menghubungkan mahasiswa dengan
            mitra industri untuk peluang magang dan kerja penuh waktu.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Btn variant="amber" onClick={() => onNav("jobs")}>
              Cari Lowongan <ChevronRight size={16} />
            </Btn>
            <Btn variant="outline" onClick={() => onNav("register")}
              className="text-white" >
              <span style={{ color: PAPER }}>Daftar sebagai Mitra</span>
            </Btn>
          </div>
          <div className="flex gap-8">
            {[["Lowongan aktif", stats.jobs], ["Mitra industri", stats.mitra], ["Mahasiswa terdaftar", stats.mhs]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontFamily: "Archivo", color: AMBER, fontWeight: 800 }} className="text-2xl">{v}</div>
                <div className="text-xs mt-1" style={{ color: "#93A0B3" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:flex justify-end">
          <svg viewBox="0 0 320 240" width="320" height="240">
            <line x1="20" y1="200" x2="300" y2="200" stroke="#2A3E5C" strokeWidth="2" />
            <line x1="160" y1="30" x2="160" y2="200" stroke={AMBER} strokeWidth="3" />
            {[...Array(9)].map((_, i) => {
              const x = 30 + i * 32;
              const topY = 30 + Math.abs(4 - i) * 14;
              return <line key={i} x1="160" y1={topY} x2={x} y2="200" stroke="#3C5678" strokeWidth="1.5" />;
            })}
            <circle cx="160" cy="30" r="5" fill={AMBER} />
            {[60, 120, 200, 260].map((x, i) => (
              <rect key={i} x={x - 10} y={185 - (i % 2) * 12} width="20" height={15 + (i % 2) * 12} fill="#233A5C" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, mitra, onOpen }) {
  const color = TYPE_COLOR[job.tipe] || SLATE;
  return (
    <button onClick={() => onOpen(job.id)}
      className="text-left w-full bg-white border p-5 flex flex-col gap-2 hover:shadow-md transition-shadow"
      style={{ borderColor: LINE, borderLeft: `4px solid ${color}` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 style={{ fontFamily: "Archivo", color: INK, fontWeight: 700 }} className="text-base leading-snug">
            {job.title}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: SLATE }}>{mitra ? mitra.name : "Mitra"}</p>
        </div>
        <Badge text={job.tipe} color={color} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 text-xs" style={{ color: SLATE }}>
        <span className="flex items-center gap-1"><MapPin size={13} />{job.lokasi}</span>
        <span className="flex items-center gap-1"><Clock size={13} />Batas {fmtDate(job.deadline)}</span>
        <span className="flex items-center gap-1"><Users size={13} />{job.kuota} posisi</span>
      </div>
    </button>
  );
}

function JobsBoard({ jobs, users, onOpen, onlyApproved }) {
  const [q, setQ] = useState("");
  const [tipe, setTipe] = useState("Semua");
  const list = useMemo(() => {
    return jobs
      .filter(j => (onlyApproved ? j.status === "disetujui" : true))
      .filter(j => (tipe === "Semua" ? true : j.tipe === tipe))
      .filter(j => {
        const mitra = users.find(u => u.id === j.mitraId);
        const t = (j.title + " " + (mitra ? mitra.name : "") + " " + j.lokasi).toLowerCase();
        return t.includes(q.toLowerCase());
      })
      .sort((a, b) => new Date(b.dibuat) - new Date(a.dibuat));
  }, [jobs, users, q, tipe, onlyApproved]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center border bg-white px-3" style={{ borderColor: LINE }}>
          <Search size={16} color={SLATE} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari posisi, perusahaan, atau lokasi"
            className="w-full px-2.5 py-2.5 text-sm outline-none" />
        </div>
        <div className="flex items-center border bg-white px-3" style={{ borderColor: LINE }}>
          <Filter size={15} color={SLATE} />
          <select value={tipe} onChange={e => setTipe(e.target.value)} className="px-2.5 py-2.5 text-sm outline-none bg-white">
            <option>Semua</option>
            {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {list.length === 0 && (
        <div className="text-center py-16" style={{ color: SLATE }}>
          <Inbox size={28} className="mx-auto mb-2" />
          Belum ada lowongan yang cocok dengan pencarianmu.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(j => <JobCard key={j.id} job={j} mitra={users.find(u => u.id === j.mitraId)} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

function JobDetail({ job, mitra, user, applications, onBack, onApply, notify }) {
  const [pesan, setPesan] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  if (!job) return null;
  const already = user && applications.some(a => a.jobId === job.id && a.studentId === user.id);
  const color = TYPE_COLOR[job.tipe] || SLATE;

  const submit = () => {
    if (!cvUrl.trim()) { notify("Tautan CV wajib diisi."); return; }
    onApply(job.id, pesan, cvUrl);
    setPesan(""); setCvUrl("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-5" style={{ color: SLATE }}>
        <ArrowLeft size={15} /> Kembali
      </button>
      <div className="bg-white border p-6" style={{ borderColor: LINE, borderTop: `4px solid ${color}` }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 style={{ fontFamily: "Archivo", color: INK, fontWeight: 700 }} className="text-2xl">{job.title}</h2>
          <Badge text={job.tipe} color={color} />
        </div>
        <p className="text-sm mb-5" style={{ color: SLATE }}>{mitra ? mitra.name : "Mitra"} · {mitra ? mitra.lokasi : job.lokasi}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
          <div><div style={{ color: SLATE }} className="text-xs mb-1">Lokasi</div><div style={{ color: INK }}>{job.lokasi}</div></div>
          <div><div style={{ color: SLATE }} className="text-xs mb-1">Kuota</div><div style={{ color: INK }}>{job.kuota} posisi</div></div>
          <div><div style={{ color: SLATE }} className="text-xs mb-1">Batas Lamar</div><div style={{ color: INK }}>{fmtDate(job.deadline)}</div></div>
          <div><div style={{ color: SLATE }} className="text-xs mb-1">Kompensasi</div><div style={{ color: INK }}>{job.gaji || "-"}</div></div>
        </div>
        <div className="mb-5">
          <h4 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-sm mb-1.5">Deskripsi</h4>
          <p className="text-sm leading-relaxed" style={{ color: SLATE }}>{job.deskripsi}</p>
        </div>
        <div className="mb-6">
          <h4 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-sm mb-1.5">Kualifikasi</h4>
          <p className="text-sm leading-relaxed" style={{ color: SLATE }}>{job.kualifikasi}</p>
        </div>

        {user && user.role === "mahasiswa" && job.status === "disetujui" && (
          already ? (
            <div className="flex items-center gap-2 text-sm px-4 py-3" style={{ background: SUCCESS + "1A", color: SUCCESS }}>
              <CheckCircle2 size={16} /> Kamu sudah melamar posisi ini.
            </div>
          ) : (
            <div className="border-t pt-5" style={{ borderColor: LINE }}>
              <h4 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-sm mb-3">Lamar posisi ini</h4>
              <Field label="Tautan CV (Google Drive/lainnya)">
                <input value={cvUrl} onChange={e => setCvUrl(e.target.value)} placeholder="https://drive.google.com/..." className={inputCls} style={inputStyle} />
              </Field>
              <Field label="Pesan singkat (opsional)">
                <textarea value={pesan} onChange={e => setPesan(e.target.value)} rows={3} className={inputCls} style={inputStyle} />
              </Field>
              <Btn variant="amber" onClick={submit}>Kirim Lamaran</Btn>
            </div>
          )
        )}
        {!user && job.status === "disetujui" && (
          <div className="text-sm px-4 py-3" style={{ background: PAPER, border: `1px solid ${LINE}`, color: SLATE }}>
            Masuk sebagai mahasiswa untuk melamar posisi ini.
          </div>
        )}
      </div>
    </div>
  );
}

function AuthForm({ mode, onSubmit, notify, onSwitch }) {
  const [role, setRole] = useState("mahasiswa");
  const [form, setForm] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (mode === "login") {
      if (!form.email || !form.password) return notify("Isi email dan kata sandi.");
      onSubmit({ mode, email: form.email, password: form.password });
      return;
    }
    if (!form.name || !form.email || !form.password) return notify("Lengkapi data wajib.");
    onSubmit({ mode, role, ...form });
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 style={{ fontFamily: "Archivo", fontWeight: 800, color: INK }} className="text-2xl mb-1">
        {mode === "login" ? "Masuk" : "Buat Akun"}
      </h2>
      <p className="text-sm mb-6" style={{ color: SLATE }}>
        {mode === "login" ? "Masuk untuk melamar atau mengelola lowongan." : "Prototipe — jangan gunakan kata sandi akun penting."}
      </p>

      {mode === "register" && (
        <div className="flex gap-2 mb-6">
          {[["mahasiswa", "Mahasiswa", GraduationCap], ["mitra", "Mitra", Building2]].map(([v, l, Icon]) => (
            <button key={v} onClick={() => setRole(v)}
              className="flex-1 flex flex-col items-center gap-1.5 px-3 py-3 border text-sm"
              style={{ borderColor: role === v ? INK : LINE, background: role === v ? INK : "white", color: role === v ? PAPER : SLATE }}>
              <Icon size={18} /> {l}
            </button>
          ))}
        </div>
      )}

      {mode === "register" && (
        <Field label={role === "mitra" ? "Nama Perusahaan" : "Nama Lengkap"}>
          <input className={inputCls} style={inputStyle} onChange={e => set("name", e.target.value)} />
        </Field>
      )}
      <Field label="Email">
        <input type="email" className={inputCls} style={inputStyle} onChange={e => set("email", e.target.value)} />
      </Field>
      <Field label="Kata Sandi">
        <input type="password" className={inputCls} style={inputStyle} onChange={e => set("password", e.target.value)} />
      </Field>

      {mode === "register" && role === "mahasiswa" && (
        <>
          <Field label="NIM"><input className={inputCls} style={inputStyle} onChange={e => set("nim", e.target.value)} /></Field>
          <Field label="Program Studi"><input className={inputCls} style={inputStyle} onChange={e => set("prodi", e.target.value)} /></Field>
          <Field label="Angkatan"><input className={inputCls} style={inputStyle} onChange={e => set("angkatan", e.target.value)} /></Field>
        </>
      )}
      {mode === "register" && role === "mitra" && (
        <>
          <Field label="Bidang Industri"><input className={inputCls} style={inputStyle} onChange={e => set("industri", e.target.value)} /></Field>
          <Field label="Lokasi"><input className={inputCls} style={inputStyle} onChange={e => set("lokasi", e.target.value)} /></Field>
          <Field label="Deskripsi Perusahaan"><textarea rows={3} className={inputCls} style={inputStyle} onChange={e => set("deskripsi", e.target.value)} /></Field>
        </>
      )}

      <Btn variant="amber" onClick={submit} className="w-full mt-2">
        {mode === "login" ? "Masuk" : "Daftar"}
      </Btn>
      <p className="text-sm text-center mt-5" style={{ color: SLATE }}>
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <button onClick={onSwitch} className="font-medium" style={{ color: INK }}>
          {mode === "login" ? "Daftar" : "Masuk"}
        </button>
      </p>
    </div>
  );
}

function Sidebar({ tabs, active, onChange }) {
  return (
    <div className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      {tabs.map(([key, label, Icon]) => (
        <button key={key} onClick={() => onChange(key)}
          className="flex items-center gap-2 px-3.5 py-2.5 text-sm whitespace-nowrap text-left"
          style={{ background: active === key ? INK : "transparent", color: active === key ? PAPER : SLATE }}>
          <Icon size={15} /> {label}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border p-4" style={{ borderColor: LINE, borderTop: `3px solid ${color}` }}>
      <div style={{ fontFamily: "Archivo", fontWeight: 800, color: INK }} className="text-2xl">{value}</div>
      <div className="text-xs mt-1" style={{ color: SLATE }}>{label}</div>
    </div>
  );
}

function AdminDashboard({ users, jobs, applications, updateJobStatus, deleteUser, notify }) {
  const [tab, setTab] = useState("ringkasan");
  const pending = jobs.filter(j => j.status === "menunggu");
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Sidebar active={tab} onChange={setTab} tabs={[
        ["ringkasan", "Ringkasan", ShieldCheck],
        ["moderasi", "Moderasi Lowongan", FileText],
        ["pengguna", "Kelola Pengguna", Users],
      ]} />
      <div className="flex-1">
        {tab === "ringkasan" && (
          <div>
            <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl mb-4">Ringkasan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Mahasiswa" value={users.filter(u => u.role === "mahasiswa").length} color={TEAL} />
              <StatCard label="Mitra" value={users.filter(u => u.role === "mitra").length} color={INK} />
              <StatCard label="Lowongan Aktif" value={jobs.filter(j => j.status === "disetujui").length} color={SUCCESS} />
              <StatCard label="Menunggu Moderasi" value={pending.length} color={AMBER} />
            </div>
          </div>
        )}
        {tab === "moderasi" && (
          <div>
            <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl mb-4">Moderasi Lowongan</h2>
            <div className="space-y-3">
              {jobs.length === 0 && <p className="text-sm" style={{ color: SLATE }}>Belum ada lowongan.</p>}
              {jobs.map(j => {
                const mitra = users.find(u => u.id === j.mitraId);
                const statusColor = j.status === "disetujui" ? SUCCESS : j.status === "ditolak" ? DANGER : AMBER;
                return (
                  <div key={j.id} className="bg-white border p-4 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: LINE }}>
                    <div>
                      <div style={{ color: INK, fontWeight: 600 }} className="text-sm">{j.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: SLATE }}>{mitra ? mitra.name : "-"} · {j.tipe}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge text={j.status} color={statusColor} />
                      {j.status !== "disetujui" && (
                        <button onClick={() => updateJobStatus(j.id, "disetujui")} title="Setujui"
                          className="p-2" style={{ color: SUCCESS }}><CheckCircle2 size={17} /></button>
                      )}
                      {j.status !== "ditolak" && (
                        <button onClick={() => updateJobStatus(j.id, "ditolak")} title="Tolak"
                          className="p-2" style={{ color: DANGER }}><XCircle size={17} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "pengguna" && (
          <div>
            <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl mb-4">Kelola Pengguna</h2>
            <div className="space-y-2">
              {users.filter(u => u.role !== "admin").map(u => (
                <div key={u.id} className="bg-white border p-3.5 flex items-center justify-between gap-3" style={{ borderColor: LINE }}>
                  <div>
                    <div style={{ color: INK, fontWeight: 600 }} className="text-sm">{u.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: SLATE }}>{u.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge text={u.role} color={u.role === "mitra" ? INK : TEAL} />
                    <button onClick={() => { deleteUser(u.id); notify("Pengguna dihapus."); }} style={{ color: DANGER }}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { title: "", tipe: "Penuh Waktu", lokasi: "", kuota: 1, gaji: "", deadline: "", deskripsi: "", kualifikasi: "" });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  return (
    <div className="bg-white border p-5" style={{ borderColor: LINE }}>
      <Field label="Judul Posisi"><input className={inputCls} style={inputStyle} value={f.title} onChange={e => set("title", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipe">
          <select className={inputCls} style={inputStyle} value={f.tipe} onChange={e => set("tipe", e.target.value)}>
            {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Kuota"><input type="number" min={1} className={inputCls} style={inputStyle} value={f.kuota} onChange={e => set("kuota", e.target.value)} /></Field>
      </div>
      <Field label="Lokasi"><input className={inputCls} style={inputStyle} value={f.lokasi} onChange={e => set("lokasi", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Kompensasi"><input className={inputCls} style={inputStyle} value={f.gaji} onChange={e => set("gaji", e.target.value)} /></Field>
        <Field label="Batas Lamar"><input type="date" className={inputCls} style={inputStyle} value={f.deadline} onChange={e => set("deadline", e.target.value)} /></Field>
      </div>
      <Field label="Deskripsi Pekerjaan"><textarea rows={3} className={inputCls} style={inputStyle} value={f.deskripsi} onChange={e => set("deskripsi", e.target.value)} /></Field>
      <Field label="Kualifikasi"><textarea rows={3} className={inputCls} style={inputStyle} value={f.kualifikasi} onChange={e => set("kualifikasi", e.target.value)} /></Field>
      <div className="flex gap-3 mt-2">
        <Btn variant="amber" onClick={() => onSave(f)}>Simpan</Btn>
        <Btn variant="ghost" onClick={onCancel}>Batal</Btn>
      </div>
    </div>
  );
}

function MitraDashboard({ user, jobs, applications, users, saveJob, deleteJob, updateAppStatus, notify }) {
  const [tab, setTab] = useState("lowongan");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const myJobs = jobs.filter(j => j.mitraId === user.id);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Sidebar active={tab} onChange={setTab} tabs={[
        ["lowongan", "Lowongan Saya", Briefcase],
        ["pelamar", "Pelamar", Users],
      ]} />
      <div className="flex-1">
        {tab === "lowongan" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl">Lowongan Saya</h2>
              {!creating && !editing && (
                <Btn variant="amber" onClick={() => setCreating(true)}><Plus size={15} /> Buat Lowongan</Btn>
              )}
            </div>
            {(creating || editing) && (
              <div className="mb-5">
                <JobForm initial={editing}
                  onSave={(f) => {
                    saveJob({ ...f, id: editing ? editing.id : uid("j"), mitraId: user.id,
                      status: editing ? editing.status : "menunggu", dibuat: editing ? editing.dibuat : new Date().toISOString() });
                    setEditing(null); setCreating(false);
                    notify(editing ? "Lowongan diperbarui." : "Lowongan dikirim, menunggu moderasi admin.");
                  }}
                  onCancel={() => { setEditing(null); setCreating(false); }} />
              </div>
            )}
            <div className="space-y-3">
              {myJobs.length === 0 && !creating && <p className="text-sm" style={{ color: SLATE }}>Belum ada lowongan yang dibuat.</p>}
              {myJobs.map(j => {
                const statusColor = j.status === "disetujui" ? SUCCESS : j.status === "ditolak" ? DANGER : AMBER;
                const applicantCount = applications.filter(a => a.jobId === j.id).length;
                return (
                  <div key={j.id} className="bg-white border p-4" style={{ borderColor: LINE }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div style={{ color: INK, fontWeight: 600 }} className="text-sm">{j.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: SLATE }}>{j.tipe} · {j.lokasi} · {applicantCount} pelamar</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge text={j.status} color={statusColor} />
                        <button onClick={() => { setEditing(j); setCreating(false); }} style={{ color: SLATE }}><Pencil size={15} /></button>
                        <button onClick={() => { deleteJob(j.id); notify("Lowongan dihapus."); }} style={{ color: DANGER }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "pelamar" && (
          <div>
            <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl mb-4">Pelamar</h2>
            <div className="space-y-3">
              {applications.filter(a => myJobs.some(j => j.id === a.jobId)).length === 0 && (
                <p className="text-sm" style={{ color: SLATE }}>Belum ada pelamar.</p>
              )}
              {applications.filter(a => myJobs.some(j => j.id === a.jobId)).map(a => {
                const job = jobs.find(j => j.id === a.jobId);
                const student = users.find(u => u.id === a.studentId);
                const statusColor = a.status === "diterima" ? SUCCESS : a.status === "ditolak" ? DANGER : TEAL;
                return (
                  <div key={a.id} className="bg-white border p-4" style={{ borderColor: LINE }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div style={{ color: INK, fontWeight: 600 }} className="text-sm">{student ? student.name : "-"}</div>
                        <div className="text-xs mt-0.5" style={{ color: SLATE }}>
                          Melamar {job ? job.title : "-"} · {student ? student.prodi : ""} {student ? "(" + student.angkatan + ")" : ""}
                        </div>
                        {a.pesan && <p className="text-sm mt-2" style={{ color: INK }}>{a.pesan}</p>}
                        <a href={a.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 mt-2" style={{ color: TEAL }}>
                          <LinkIcon size={12} /> Lihat CV
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge text={a.status} color={statusColor} />
                        <select value={a.status} onChange={e => updateAppStatus(a.id, e.target.value)}
                          className="text-xs border px-2 py-1.5 outline-none" style={{ borderColor: LINE }}>
                          {["terkirim", "ditinjau", "diterima", "ditolak"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MahasiswaDashboard({ user, jobs, applications, users, onOpenJob, notify }) {
  const [tab, setTab] = useState("cari");
  const myApps = applications.filter(a => a.studentId === user.id);
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Sidebar active={tab} onChange={setTab} tabs={[
        ["cari", "Cari Lowongan", Search],
        ["lamaran", "Lamaran Saya", FileText],
        ["profil", "Profil", GraduationCap],
      ]} />
      <div className="flex-1">
        {tab === "cari" && <JobsBoard jobs={jobs} users={users} onOpen={onOpenJob} onlyApproved />}
        {tab === "lamaran" && (
          <div>
            <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl mb-4">Lamaran Saya</h2>
            <div className="space-y-3">
              {myApps.length === 0 && <p className="text-sm" style={{ color: SLATE }}>Kamu belum melamar posisi apa pun.</p>}
              {myApps.map(a => {
                const job = jobs.find(j => j.id === a.jobId);
                const mitra = job && users.find(u => u.id === job.mitraId);
                const statusColor = a.status === "diterima" ? SUCCESS : a.status === "ditolak" ? DANGER : TEAL;
                return (
                  <div key={a.id} className="bg-white border p-4 flex items-center justify-between gap-3" style={{ borderColor: LINE }}>
                    <div>
                      <div style={{ color: INK, fontWeight: 600 }} className="text-sm">{job ? job.title : "Lowongan dihapus"}</div>
                      <div className="text-xs mt-0.5" style={{ color: SLATE }}>{mitra ? mitra.name : "-"} · Dikirim {fmtDate(a.dikirim)}</div>
                    </div>
                    <Badge text={a.status} color={statusColor} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "profil" && (
          <div className="max-w-md">
            <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl mb-4">Profil</h2>
            <div className="bg-white border p-5 space-y-3 text-sm" style={{ borderColor: LINE }}>
              {[["Nama", user.name], ["Email", user.email], ["NIM", user.nim], ["Program Studi", user.prodi], ["Angkatan", user.angkatan], ["No. HP", user.noHp]].map(([l, v]) => (
                <div key={l} className="flex justify-between border-b pb-2" style={{ borderColor: LINE }}>
                  <span style={{ color: SLATE }}>{l}</span>
                  <span style={{ color: INK, fontWeight: 500 }}>{v || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("landing");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [toast, setToast] = useState("");

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    (async () => {
      let u = await storeGet("pk_users", true);
      let j = await storeGet("pk_jobs", true);
      let a = await storeGet("pk_applications", true);
      if (!u || u.length === 0) {
        const seed = seedData();
        u = seed.users; j = seed.jobs; a = seed.applications;
        await storeSet("pk_users", u, true);
        await storeSet("pk_jobs", j, true);
        await storeSet("pk_applications", a, true);
      }
      setUsers(u || []); setJobs(j || []); setApplications(a || []);

      const session = await storeGet("pk_session", false);
      if (session && session.userId) {
        const found = (u || []).find(x => x.id === session.userId);
        if (found) setCurrentUser(found);
      }
      setLoading(false);
    })();
  }, []);

  const saveUsers = (next) => { setUsers(next); storeSet("pk_users", next, true); };
  const saveJobs = (next) => { setJobs(next); storeSet("pk_jobs", next, true); };
  const saveApplications = (next) => { setApplications(next); storeSet("pk_applications", next, true); };

  const handleAuth = ({ mode, role, email, password, ...rest }) => {
    if (mode === "login") {
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return notify("Email atau kata sandi salah.");
      setCurrentUser(found);
      storeSet("pk_session", { userId: found.id }, false);
      setView("dashboard");
      return;
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return notify("Email sudah terdaftar.");
    const newUser = { id: uid("u"), role, email, password, ...rest };
    const next = [...users, newUser];
    saveUsers(next);
    setCurrentUser(newUser);
    storeSet("pk_session", { userId: newUser.id }, false);
    notify("Akun berhasil dibuat.");
    setView("dashboard");
  };

  const logout = () => {
    setCurrentUser(null);
    storeSet("pk_session", { userId: null }, false);
    setView("landing");
  };

  const updateJobStatus = (id, status) => saveJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
  const saveJob = (job) => {
    const exists = jobs.some(j => j.id === job.id);
    saveJobs(exists ? jobs.map(j => j.id === job.id ? job : j) : [...jobs, job]);
  };
  const deleteJob = (id) => saveJobs(jobs.filter(j => j.id !== id));
  const deleteUser = (id) => saveUsers(users.filter(u => u.id !== id));
  const updateAppStatus = (id, status) => saveApplications(applications.map(a => a.id === id ? { ...a, status } : a));

  const applyToJob = (jobId, pesan, cvUrl) => {
    if (!currentUser) return notify("Masuk terlebih dahulu untuk melamar.");
    const app = { id: uid("a"), jobId, studentId: currentUser.id, pesan, cvUrl, status: "terkirim", dikirim: new Date().toISOString() };
    saveApplications([...applications, app]);
    notify("Lamaran terkirim.");
  };

  const goto = (v) => {
    if (v === "dashboard" && !currentUser) { setView("login"); return; }
    setView(v);
  };
  const openJob = (id) => { setSelectedJobId(id); setView("job-detail"); };

  const stats = {
    jobs: jobs.filter(j => j.status === "disetujui").length,
    mitra: users.filter(u => u.role === "mitra").length,
    mhs: users.filter(u => u.role === "mahasiswa").length,
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: PAPER, color: SLATE }}>Memuat...</div>;
  }

  return (
    <div style={{ background: PAPER, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { font-family: 'IBM Plex Sans', sans-serif; }
        input:focus, textarea:focus, select:focus { border-color: ${INK}; }
      `}</style>
      <Navbar user={currentUser} onNav={goto} onLogout={logout} />

      {view === "landing" && (
        <>
          <Hero onNav={goto} stats={stats} />
          <div className="max-w-6xl mx-auto px-5 py-14">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: "Archivo", fontWeight: 700, color: INK }} className="text-xl">Lowongan Terbaru</h2>
              <button onClick={() => goto("jobs")} className="text-sm flex items-center gap-1" style={{ color: TEAL }}>
                Lihat semua <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.filter(j => j.status === "disetujui").slice(0, 4).map(j => (
                <JobCard key={j.id} job={j} mitra={users.find(u => u.id === j.mitraId)} onOpen={openJob} />
              ))}
            </div>
          </div>
        </>
      )}

      {view === "jobs" && (
        <div className="max-w-6xl mx-auto px-5 py-10">
          <h2 style={{ fontFamily: "Archivo", fontWeight: 800, color: INK }} className="text-2xl mb-6">Cari Lowongan</h2>
          <JobsBoard jobs={jobs} users={users} onOpen={openJob} onlyApproved />
        </div>
      )}

      {view === "job-detail" && (
        <div className="max-w-6xl mx-auto px-5 py-10">
          <JobDetail job={jobs.find(j => j.id === selectedJobId)} mitra={users.find(u => u.id === (jobs.find(j => j.id === selectedJobId) || {}).mitraId)}
            user={currentUser} applications={applications} onBack={() => setView("jobs")} onApply={applyToJob} notify={notify} />
        </div>
      )}

      {(view === "login" || view === "register") && (
        <div className="max-w-6xl mx-auto px-5">
          <AuthForm mode={view === "login" ? "login" : "register"} onSubmit={handleAuth} notify={notify}
            onSwitch={() => setView(view === "login" ? "register" : "login")} />
        </div>
      )}

      {view === "dashboard" && currentUser && (
        <div className="max-w-6xl mx-auto px-5 py-8">
          <h1 style={{ fontFamily: "Archivo", fontWeight: 800, color: INK }} className="text-2xl mb-6">
            Dasbor {currentUser.role === "admin" ? "Admin" : currentUser.role === "mitra" ? "Mitra" : "Mahasiswa"}
          </h1>
          {currentUser.role === "admin" && (
            <AdminDashboard users={users} jobs={jobs} applications={applications}
              updateJobStatus={updateJobStatus} deleteUser={deleteUser} notify={notify} />
          )}
          {currentUser.role === "mitra" && (
            <MitraDashboard user={currentUser} jobs={jobs} applications={applications} users={users}
              saveJob={saveJob} deleteJob={deleteJob} updateAppStatus={updateAppStatus} notify={notify} />
          )}
          {currentUser.role === "mahasiswa" && (
            <MahasiswaDashboard user={currentUser} jobs={jobs} applications={applications} users={users}
              onOpenJob={openJob} notify={notify} />
          )}
        </div>
      )}

      <div className="border-t mt-10" style={{ borderColor: LINE }}>
        <div className="max-w-6xl mx-auto px-5 py-8 text-xs flex flex-wrap justify-between gap-2" style={{ color: SLATE }}>
          <span>© 2026 Pusat Karir Institut Teknologi Batam.</span>
          <span>Prototipe — data disimpan untuk keperluan demonstrasi.</span>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
