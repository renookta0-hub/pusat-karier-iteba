# Pusat Karir ITEBA

Situs statis satu halaman (`public/index.html`) dengan routing berbasis hash
(`#/about`, `#/mitra`, `#/dashboard`, dst.) yang ditangani sepenuhnya oleh
JavaScript di sisi klien — tidak ada proses build yang diperlukan.

## Menjalankan secara lokal (Bun)

```bash
bun install      # tidak ada dependency, hanya menyiapkan project
bun run dev      # server statis dengan auto-restart saat file berubah
```

Buka **http://localhost:5173**.

Skrip lain yang tersedia:
- `bun run start` — jalankan server tanpa mode watch.
- `bun run build` — no-op (situs statis, tidak ada yang perlu dikompilasi).

## Struktur proyek

```
pusat-karir-iteba-app/
  public/
    index.html     ← seluruh aplikasi (HTML + CSS + JS dalam satu file)
  server.js         ← server statis untuk pengembangan lokal via Bun
  package.json
  vercel.json        ← memberi tahu Vercel untuk men-deploy isi public/ apa adanya
```

## Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Di Vercel, klik **Add New → Project**, pilih repo tersebut.
3. Vercel akan membaca `vercel.json` dan langsung men-deploy isi `public/`
   tanpa proses build tambahan — tidak perlu mengubah framework preset.
4. Deploy.

Karena ini situs statis murni, tidak ada environment variable yang perlu
diisi di Vercel untuk versi ini.

## Akun demo

Data (pengguna, lowongan, lamaran) saat ini disimpan di **localStorage
browser pengunjung** — jadi hanya terlihat di perangkat yang sama, tidak
sinkron antar-pengguna atau perangkat. Saat pertama kali dibuka, situs akan
mengisi data contoh berikut secara otomatis:

| Peran      | Email                              | Kata Sandi |
|------------|-------------------------------------|------------|
| Admin      | admin@iteba.ac.id                   | admin123   |
| Mitra      | hr@nusantaraelektronik.co.id        | mitra123   |
| Mahasiswa  | rangga@student.iteba.ac.id          | mhs123     |

## Catatan

- Karena penyimpanannya `localStorage`, ini masih level prototipe/demo —
  belum cocok untuk data mahasiswa/mitra yang sesungguhnya.
- Kalau ke depannya perlu dashboard yang datanya benar-benar tersimpan di
  server dan bisa diakses dari perangkat mana pun (bukan hanya localStorage
  per-browser), langkah berikutnya adalah menyambungkan ke database
  terkelola seperti Supabase — beri tahu saya kalau mau saya siapkan.
