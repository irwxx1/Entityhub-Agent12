import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useSubmitPeserta, useGetSuara, useCekPeserta, useGetStats, getGetSuaraQueryKey, getCekPesertaQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import logoPeradi from "/logo-peradi.png";
import logoPeradiSai from "/peradi-sai-logo-nobg.png";
import "./index.css";

/* ─── CONSTANTS ─────────────────────────────────────────────────────── */
const N = "#0B2D6E";
const G = "#C9A227";
const VENUE = "Grand Inna Medan, Jl. Balai Kota No.2, Kesawan, Medan";
const VENUE_SHORT = "Grand Inna Medan";
const MUSCAB_TGL = "25 Juli 2026";
const MUSCAB_HARI = "Sabtu";

/* ─── DATA ─────────────────────────────────────────────────────────── */
const KETUA = [
  { id: 1, name: "Irwan, S.H.", nia: "24.10136", ini: "IR" },
  { id: 2, name: "Fauzan Hakim, S.H., M.H.", nia: "24.10892", ini: "FH" },
];
const SEKJEND = [
  { id: 1, name: "Rizky Pratama, S.H.", nia: "23.10481", ini: "RP" },
  { id: 2, name: "Dewi Sartika Lubis, S.H., M.H.", nia: "23.10754", ini: "DS" },
];
const BERITA = [
  { id: 0, tgl: "1 Jul 2026", cat: "PENTING", judul: "⚠ WAJIB: Formulir Pendaftaran Peserta MUSCAB II", isi: "Seluruh anggota yang akan menghadiri MUSCAB II DPC PERADI SAI Medan WAJIB mengisi formulir pendaftaran di menu \"Daftar Peserta\" dan upload bukti transfer pembayaran. Batas akhir pendaftaran: 13 Juli 2026. Peserta yang tidak mendaftar tidak dapat mengikuti MUSCAB.", hot: true },
  { id: 1, tgl: "20 Jun 2026", cat: "Undangan", judul: "Undangan MUSCAB II DPC PERADI SAI Medan 2026", isi: `Seluruh anggota aktif diundang hadir pada Muscab II Pemilihan Pengurus Periode 2026–2030, ${MUSCAB_HARI} ${MUSCAB_TGL}, ${VENUE_SHORT}.`, hot: true },
  { id: 2, tgl: "10 Jun 2026", cat: "Informasi", judul: "Pendaftaran Calon Ketua DPC Periode 2026–2030", isi: "Pendaftaran calon Ketua DPC dibuka 2 Juli s/d 13 Juli 2026 di Sekretariat MUSCAB, Jl. T. Amir Hamzah Komp. Pertokoan Blok A No. 118 Medan Helvetia.", hot: false },
  { id: 3, tgl: "5 Jun 2026", cat: "Kegiatan", judul: "Seminar: Implikasi UU No. 20/2025 KUHAP bagi Advokat", isi: "Seminar nasional membahas penerapan KUHAP baru dalam praktik advokasi sehari-hari.", hot: false },
  { id: 4, tgl: "1 Apr 2026", cat: "LPJ", judul: "Laporan Keuangan Triwulan I 2026", isi: "Realisasi anggaran triwulan pertama 2026 tersedia di menu Dokumen untuk diunduh.", hot: false },
];
const DOCS = [
  { judul: "SK Panitia MUSCAB II DPC PERADI SAI Medan 2026", cat: "SK/Keputusan", thn: 2026, sz: "1.2 MB" },
  { judul: "Anggaran Dasar PERADI SAI", cat: "AD/ART", thn: 2024, sz: "2.4 MB" },
  { judul: "Anggaran Rumah Tangga PERADI SAI", cat: "AD/ART", thn: 2024, sz: "1.8 MB" },
  { judul: "Kode Etik Advokat Indonesia", cat: "Regulasi", thn: 2023, sz: "1.2 MB" },
  { judul: "SK DPC PERADI SAI Medan 2022–2026", cat: "SK/Keputusan", thn: 2022, sz: "0.8 MB" },
  { judul: "Standar Profesi Advokat Indonesia", cat: "Regulasi", thn: 2022, sz: "3.1 MB" },
  { judul: "Berita Acara Muscab 2022", cat: "BA/Risalah", thn: 2022, sz: "0.6 MB" },
];
const PROG = [
  { nama: "Seminar & Workshop Hukum", t: 8, r: 8 },
  { nama: "Rekrutmen Anggota Baru", t: 100, r: 103 },
  { nama: "Pelatihan Pengembangan Advokat", t: 8, r: 6 },
  { nama: "Pengembangan Sistem Digital", t: 2, r: 1 },
  { nama: "Kegiatan Sosial & Bakti Hukum", t: 4, r: 4 },
];
const GAL = [
  { judul: "Seminar KUHP Baru 2025", tgl: "Nov 2025", bg: "#1A4A8E", ic: "ti-school" },
  { judul: "Pelantikan Advokat UPA 2024", tgl: "Feb 2025", bg: "#15803D", ic: "ti-award" },
  { judul: "Muscab DPC Medan 2022", tgl: "Jun 2022", bg: G, ic: "ti-users" },
  { judul: "Bakti Sosial Hukum", tgl: "Des 2024", bg: "#0F766E", ic: "ti-heart" },
  { judul: "Workshop Advokasi Publik", tgl: "Okt 2024", bg: "#6B21A8", ic: "ti-device-desktop" },
  { judul: "Rapat Kerja Pengurus", tgl: "Mar 2025", bg: "#374151", ic: "ti-briefcase" },
  { judul: "HUT PERADI ke-20", tgl: "Apr 2025", bg: "#B45309", ic: "ti-star" },
  { judul: "Pelatihan Hukum Acara", tgl: "Ags 2024", bg: N, ic: "ti-book" },
  { judul: "Magang Advokat 2024", tgl: "Jan 2024", bg: "#BE185D", ic: "ti-user" },
];
const AGN = [
  { id: 1, tgl: "13 Jul", hari: "Minggu", judul: "Batas Akhir Pendaftaran Peserta MUSCAB II", lok: "Online via Portal & Sekretariat DPC, Jl. T. Amir Hamzah Blok A No.118", cat: "Pendaftaran", hot: true },
  { id: 2, tgl: "25 Jul", hari: "Sabtu", judul: "MUSCAB II DPC PERADI SAI Medan 2026", lok: VENUE, cat: "Muscab", hot: true },
  { id: 3, tgl: "5 Ags", hari: "Rabu", judul: "Pelantikan Pengurus DPC Terpilih 2026–2030", lok: "Aula DPC PERADI SAI Medan", cat: "Pelantikan", hot: false },
  { id: 4, tgl: "10 Sep", hari: "Kamis", judul: "Seminar: KUHAP Baru dalam Praktik Advokat", lok: "Ballroom Arya Duta Medan", cat: "Seminar", hot: false },
  { id: 5, tgl: "20 Okt", hari: "Selasa", judul: "Workshop Advokasi Pro Bono & Publik", lok: "Fak. Hukum USU Medan", cat: "Workshop", hot: false },
];
const CT: Record<string, string> = {
  PENTING: "#be123c",
  Undangan: "#be123c", Informasi: "#1d4ed8", Kegiatan: "#15803d", LPJ: "#b45309",
  "AD/ART": "#6b21a8", Regulasi: "#1d4ed8", "SK/Keputusan": "#be123c",
  Panduan: "#15803d", "BA/Risalah": "#64748b",
  Muscab: "#be123c", Pendaftaran: "#b45309", Pelantikan: "#6b21a8",
  Seminar: "#1d4ed8", Rapat: "#b45309", Workshop: "#15803d",
};
const ANGGOTA = [
  { id: 1, name: "Ahmad Fauzi, S.H., M.H.", nia: "24.10001" },
  { id: 2, name: "Budi Santoso, S.H.", nia: "24.10045" },
  { id: 3, name: "Cahyani Dewi, S.H.", nia: "24.10087" },
  { id: 4, name: "Dian Permata, S.H., M.H.", nia: "23.10112" },
  { id: 5, name: "Eko Prasetyo, S.H.", nia: "23.10198" },
  { id: 6, name: "Fitriani Harahap, S.H.", nia: "23.10215" },
  { id: 7, name: "Gunawan Sirait, S.H.", nia: "22.10023" },
  { id: 8, name: "Hendra Wijaya, S.H., M.Kn.", nia: "22.10067" },
  { id: 9, name: "Indah Lestari, S.H.", nia: "22.10134" },
  { id: 10, name: "Joko Susanto, S.H.", nia: "21.10045" },
  { id: 11, name: "Kartika Siregar, S.H.", nia: "21.10089" },
  { id: 12, name: "Luthfi Nasution, S.H.", nia: "21.10142" },
  { id: 13, name: "Mega Putri, S.H., M.H.", nia: "20.10034" },
  { id: 14, name: "Nanda Pratama, S.H.", nia: "20.10078" },
  { id: 15, name: "Oci Rahayu, S.H.", nia: "20.10112" },
  { id: 16, name: "Parulian Lubis, S.H.", nia: "19.10023" },
  { id: 17, name: "Qori Handayani, S.H.", nia: "19.10067" },
  { id: 18, name: "Rini Astuti, S.H.", nia: "18.10089" },
  { id: 19, name: "Samsul Bahri, S.H., M.H.", nia: "18.10134" },
  { id: 20, name: "Tini Wahyuni, S.H.", nia: "17.10045" },
];
const TOTAL_ANGGOTA = 120;

/* ─── TATA TERTIB DATA ───────────────────────────────────────────────── */
const PASAL_DATA = [
  { no: 1, judul: "Ketentuan Umum", isi: `Kegiatan ini bernama Musyawarah Cabang (MUSCAB) ke II Dewan Pimpinan Cabang Perhimpunan Advokat Indonesia Medan. Diselenggarakan di ${VENUE}, pada tanggal ${MUSCAB_TGL} (${MUSCAB_HARI}), sesuai dengan kesepakatan SC, OC dan Ketentuan Anggaran Dasar PERADI secara berkala selama 4 (empat) tahun yang dihadiri oleh seluruh anggota DPC PERADI Medan.` },
  { no: 2, judul: "Tema", isi: `Tema: MEMBANGUN PERADI SAI KOTA MEDAN YANG SOLID, PROFESIONAL, BERINTEGRITAS DALAM MENGHADAPI TANTANGAN HUKUM ERA DIGITAL\n\nSub Tema: Melalui MUSCAB II, DPC Peradi SAI Medan tetap solid dan harmonis.` },
  { no: 3, judul: "Kedudukan", isi: "MUSCAB adalah pemusyawaratan tertinggi di tingkat cabang yang diselenggarakan atas undangan Dewan Pimpinan Cabang Perhimpunan Advokat Indonesia Medan." },
  { no: 4, judul: "Hak dan Kewenangan Peserta MUSCAB", isi: "Musyawarah Cabang mempunyai wewenang untuk menilai laporan pertanggungjawaban Pimpinan Cabang Periode 2022–2026 tentang:\n(a) Kebijaksanaan Pimpinan Cabang;\n(b) Organisasi dan keuangan;\n(c) Pelaksanaan keputusan-keputusan Musyawarah Cabang dan Rapat Pimpinan tingkat Cabang, serta keputusan permusyawaratan dan instruksi pimpinan di atasnya.\n\nPimpinan sidang berhak meminta tanggapan peserta MUSCAB terkait laporan pertanggungjawaban." },
  { no: 5, judul: "Sidang MUSCAB", isi: "Persidangan-persidangan dalam Musyawarah Cabang II, dipimpin langsung oleh Ketua Steering Committee didampingi oleh Ketua Organizing Committee, ditambah sekretaris Steering Committee.\n\nPersidangan dibagi menjadi:\n• Sidang Pleno – menyusun usulan-usulan yang akan disampaikan dalam MUSCAB II, dibagi menjadi 2 kelompok yang dipimpin oleh Ketua dan Sekretaris.\n• Sidang Komisi – menyusun program kerja, dibagi menjadi 2 kelompok." },
  { no: 6, judul: "Pimpinan Sidang MUSCAB dan Berita Acara", isi: "Pimpinan sidang MUSCAB II:\n• Dipimpin oleh Ketua DPC didampingi oleh Ketua SC dan Ketua OC;\n• Pimpinan sidang dipimpin langsung oleh Ketua SC dan Sekretaris serta dibantu oleh 2 (dua) orang anggota;\n• Bersifat kolektif kolegial.\n\nBerita Acara MUSCAB dibuat oleh sekretaris sidang dan ditandatangani oleh pimpinan Sidang MUSCAB. Merupakan bukti yang otentik dan sah sebagai lembaran pertanggungjawaban Panitia." },
  { no: 7, judul: "Hak dan Kewajiban Pimpinan Sidang", isi: "Pimpinan Sidang BERHAK:\n• Mengingatkan dan menegur Peserta/Peninjau/Utusan yang tidak menggunakan tanda pengenal;\n• Menegur dan menghentikan pembicaraan yang tidak sesuai ketentuan.\n\nPimpinan Sidang WAJIB:\n• Meminta daftar hadir peserta sebelum acara dimulai;\n• Mengutamakan musyawarah dan mufakat dalam mengambil keputusan;\n• Membuat berita acara MUSCAB;\n• Membuat keputusan-keputusan MUSCAB." },
  { no: 8, judul: "Keputusan MUSCAB", isi: "Pengambilan Keputusan Musyawarah Cabang diusahakan dengan musyawarah mufakat, dan apabila harus dilakukan pemungutan suara maka diambil dengan suara yang terbanyak.\n\nKeputusan MUSCAB mulai berlaku sejak ditandatangani dan disahkan oleh Pimpinan Sidang MUSCAB." },
  { no: 9, judul: "Kuorum MUSCAB", isi: "MUSCAB II DPC PERADI Medan adalah sah apabila dihadiri oleh lebih dari ½ (setengah) jumlah anggota sebagai peserta.\n\nApabila kuorum tidak tercapai, MUSCAB diundur sedikitnya 1 (satu) jam. Setelah itu Pimpinan Sidang dapat meneruskan MUSCAB secara sah setelah mencapai 50% + 1.\n\nApabila kuorum 50% + 1 tidak terpenuhi, persidangan dilanjutkan tanpa memperhatikan kuorum." },
  { no: 10, judul: "Hak Peserta MUSCAB", isi: "Hak Peserta Muscab DPC PERADI SAI Medan:\n• Memilih dan Dipilih (jika memenuhi persyaratan yang ditentukan Panitia);\n• Hak Peninjau dan Utusan hanya mengikuti acara MUSCAB;\n• Setiap peserta memiliki 1 (satu) Hak Suara — one man one vote;\n• Setiap peserta mempunyai Hak Bicara dan Hak Suara.\n\nPeserta yang merangkap sebagai Panitia tidak diperkenankan menanggapi laporan pertanggungjawaban DPC PERADI Medan." },
  { no: 11, judul: "Peserta MUSCAB II", isi: "Peserta Muscab ke II DPC PERADI Medan adalah:\n1. Seluruh anggota DPC Peradi SAI Medan yang telah terdaftar, lolos verifikasi, dan ternotifikasi Panitia MUSCAB;\n2. Undangan Khusus yang dilakukan oleh Panitia MUSCAB;\n3. Peninjau yang terdaftar resmi oleh Panitia." },
  { no: 12, judul: "Kewajiban Peserta MUSCAB", isi: "Peserta MUSCAB wajib:\n1. Mendaftarkan diri sebagai Peserta MUSCAB dengan mengisi formulir pendaftaran sampai dengan tanggal 13 Juli 2026;\n2. Menggunakan tanda pengenal yang diberikan oleh Panitia selama MUSCAB berlangsung;\n3. Mematuhi seluruh Tata Tertib MUSCAB;\n4. Mengikuti seluruh acara MUSCAB dan menandatangani daftar hadir setiap sidang.\n\nPendaftaran dibuka: 22 Juni – 13 Juli 2026\nSekretariat: Jl. T. Amir Hamzah Komp. Pertokoan Blok A No. 118, Medan Helvetia." },
  { no: 13, judul: "Persyaratan Calon Ketua DPC", isi: "Calon Ketua harus memenuhi syarat:\n1. WNI;\n2. Bertaqwa kepada Tuhan Yang Maha Esa;\n3. Telah berpraktek sebagai Advokat sekurang-kurangnya 5 (lima) tahun;\n4. Mempunyai KTPA yang masih berlaku dari DPN PERADI;\n5. Pernah menjadi Pengurus/anggota minimal 1 periode DPC PERADI Medan;\n6. Tidak merangkap jabatan TNI/Polri/ASN/Partai Politik;\n7. Tidak pernah dikenakan sanksi Dewan Kehormatan;\n8. Tidak pernah dihukum pidana dengan ancaman ≥5 tahun;\n9. Mempunyai minimal 30 (tiga puluh) Advokat pendukung;\n10. Menyetorkan biaya Partisipasi MUSCAB sebesar Rp. 20.000.000,-\n\nPendaftaran Calon Ketua: 2 Juli – 13 Juli 2026\nSekretariat MUSCAB: Jl. T. Amir Hamzah Komp. Pertokoan Blok A No. 118, Medan Helvetia." },
  { no: 14, judul: "Penghitungan Suara", isi: "• Pemilihan dilakukan melalui bilik-bilik suara yang disiapkan Panitia;\n• Apabila ada peserta yang memilih lebih dari 1 calon, suaranya dinyatakan tidak sah;\n• Apabila peserta tidak memilih, suaranya dianggap batal;\n• Jika hanya ada 1 (satu) calon tunggal yang memenuhi persyaratan, pemilihan dilakukan secara aklamasi." },
  { no: 15, judul: "Ketua Terpilih", isi: "Calon Ketua terpilih yang mendapatkan suara terbanyak secara otomatis menjadi Ketua DPC PERADI Medan terpilih.\n\nKetua Terpilih disahkan oleh Pimpinan Sidang MUSCAB sebagai Ketua DPC PERADI Medan Periode 2026–2030.\n\nKetua terpilih dan formatur bersama-sama menyusun Pengurus lengkap DPC selambat-lambatnya dalam 30 (tiga puluh) hari sejak ditetapkan." },
  { no: 16, judul: "Ketentuan Lain-Lain", isi: "Hal-hal lain yang belum diatur dalam Tata Tertib ini akan diputus oleh Pimpinan Sidang MUSCAB setelah mendengar pendapat Peserta MUSCAB." },
  { no: 17, judul: "Aturan Tambahan", isi: "Hal yang belum diatur dalam tata tertib akan ditetapkan oleh dan atas kebijaksanaan Pimpinan Cabang DPC PERADI Medan.\n\nMedan, 1 Juli 2026\nPanitia MUSCAB II DPC PERADI MEDAN\n\nDR. AHMAD FADLY ROZA, S.H., M.H. — Ketua Organizing Committee\nANTON PARLINDUNGAN, S.H. — Wakil Ketua Organizing Committee\n\nDisetujui Oleh:\nWARINSON SINAGA, S.H. — Ketua Steering Committee" },
];

/* ─── RUNDOWN AGENDA MUSCAB ────────────────────────────────────────── */
const RUNDOWN = [
  { waktu: "07.30–08.30", sesi: "Registrasi & Pengambilan Tanda Peserta", ket: "Lobi Grand Inna Medan" },
  { waktu: "08.30–09.00", sesi: "Pembukaan Resmi MUSCAB II", ket: "Sambutan Ketua DPC, Ketua SC, Ketua OC" },
  { waktu: "09.00–09.30", sesi: "Sidang Pleno I — Penetapan Tata Tertib & Agenda", ket: "Dipimpin Ketua SC" },
  { waktu: "09.30–11.00", sesi: "Sidang Pleno II — Laporan Pertanggungjawaban DPC", ket: "Periode 2022–2026" },
  { waktu: "11.00–11.45", sesi: "Sidang Pleno III — Tanggapan & Pengesahan LPJ", ket: "" },
  { waktu: "11.45–13.00", sesi: "Istirahat, Shalat & Makan Siang", ket: "" },
  { waktu: "13.00–14.00", sesi: "Sidang Komisi — Penyusunan Program Kerja 2026–2030", ket: "Dua kelompok paralel" },
  { waktu: "14.00–14.30", sesi: "Laporan Hasil Sidang Komisi", ket: "" },
  { waktu: "14.30–16.00", sesi: "Pemilihan Ketua DPC PERADI SAI Medan 2026–2030", ket: "Bilik suara / Aklamasi" },
  { waktu: "16.00–16.30", sesi: "Penghitungan Suara & Penetapan Ketua Terpilih", ket: "" },
  { waktu: "16.30–17.00", sesi: "Sambutan Ketua Terpilih & Penutupan MUSCAB II", ket: "" },
  { waktu: "17.00", sesi: "Selesai", ket: "Ramah-tamah" },
];

/* ─── LIVE STATS HOOK ────────────────────────────────────────────────── */
interface LiveStats { calon: number; peserta: number; }

function useLiveStats(intervalMs = 30_000): LiveStats {
  const [stats, setStats] = useState<LiveStats>({ calon: 0, peserta: 0 });

  const fetch_ = useCallback(() => {
    fetch(`${import.meta.env.BASE_URL}api/stats`.replace(/\/+/g, '/'))
      .then(r => r.ok ? r.json() : null)
      .then((d: LiveStats | null) => { if (d) setStats(d); })
      .catch(() => {/* silent — will retry on next interval */});
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, intervalMs);
    return () => clearInterval(id);
  }, [fetch_, intervalMs]);

  return stats;
}

/* ─── UI PRIMITIVES ──────────────────────────────────────────────────── */
function Av({ ini, size = "sm", color = N }: { ini: string; size?: "sm" | "lg"; color?: string }) {
  return <div className={`av ${size === "lg" ? "av-lg" : ""}`} style={{ background: color }}>{ini}</div>;
}
function Bdg({ cat }: { cat: string }) {
  return <span className="bdg" style={{ color: CT[cat] || N, background: `${CT[cat] || N}18` }}>{cat}</span>;
}

/* ─── BERANDA ────────────────────────────────────────────────────────── */
function Beranda({ onDaftar }: { onDaftar: () => void }) {
  const stats = useLiveStats();
  return (
    <div>
      {/* Urgent registration alert */}
      <div className="alert-urgent" onClick={onDaftar} style={{ cursor: "pointer" }}>
        <i className="ti ti-alert-triangle" style={{ fontSize: 36 }} />
        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: .3 }}>
          ⚠ PENTING — Pendaftaran Peserta MUSCAB II
        </div>
        <div style={{ fontSize: 14, opacity: .93, fontWeight: 600 }}>
          Batas akhir: <strong>13 Juli 2026</strong>
        </div>
        <div style={{ fontSize: 13, opacity: .85, marginTop: -2 }}>
          Klik di sini untuk mengisi formulir pendaftaran →
        </div>
      </div>

      <div className="hero">
        <img src={logoPeradi} alt="PERADI SAI" className="hero-logo" style={{ objectFit: "contain", background: "#fff", borderRadius: 8, padding: "4px 6px" }} />
        <div>
          <div className="hero-title">DPC PERADI SAI Medan</div>
          <div className="hero-sub">Dewan Pimpinan Cabang · Medan, Sumatera Utara</div>
          <div className="hero-badge"><i className="ti ti-calendar-event" />MUSCAB II · {MUSCAB_TGL}</div>
        </div>
      </div>

      <div className="stats">
        <div className="stat-box">
          <div className="stat-num">900<span style={{ fontSize: 16 }}>++</span></div>
          <div className="stat-lbl">Anggota PERADI SAI Medan</div>
        </div>
        <div className="stat-box stat-live">
          <div className="stat-live-dot" />
          <div className="stat-num">{stats.calon}</div>
          <div className="stat-lbl">Calon Peserta</div>
          <div className="stat-live-label">LIVE</div>
        </div>
        <div className="stat-box stat-live stat-live-green">
          <div className="stat-live-dot stat-live-dot-green" />
          <div className="stat-num" style={{ color: "#15803d" }}>{stats.peserta}</div>
          <div className="stat-lbl">Peserta MUSCAB</div>
          <div className="stat-live-label stat-live-label-green">LIVE</div>
        </div>
      </div>

      {/* Info Muscab */}
      <div className="card" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8effd 100%)", border: `1px solid ${N}22`, marginBottom: 12 }}>
        <div className="sec-hdr" style={{ marginBottom: 10 }}>
          <i className="ti ti-map-pin" style={{ color: N }} /><h2 style={{ color: N }}>Informasi MUSCAB II</h2>
        </div>
        {[
          ["Tanggal", `${MUSCAB_HARI}, ${MUSCAB_TGL}`],
          ["Tempat", VENUE],
          ["Tema", "MEMBANGUN PERADI SAI KOTA MEDAN YANG SOLID, PROFESIONAL, BERINTEGRITAS DALAM MENGHADAPI TANTANGAN HUKUM ERA DIGITAL"],
          ["Batas Daftar", "13 Juli 2026"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${N}12`, fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)", minWidth: 100, flexShrink: 0 }}>{l}</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{v}</span>
          </div>
        ))}
        <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} onClick={onDaftar}>
          <i className="ti ti-clipboard-list" />Isi Formulir Pendaftaran Sekarang
        </button>
      </div>

      <div className="card">
        <div className="sec-hdr" style={{ marginBottom: 12 }}>
          <i className="ti ti-bell-ringing" /><h2>Pengumuman Terbaru</h2><span>{BERITA.length} berita</span>
        </div>
        {BERITA.map(b => (
          <div className="news-item" key={b.id}>
            <div className="news-meta">
              {b.hot && <span className="hot-dot" />}
              <Bdg cat={b.cat} />
              <span className="txt-muted">{b.tgl}</span>
            </div>
            <div className="news-title">{b.judul}</div>
            <div className="news-desc">{b.isi}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="sec-hdr" style={{ marginBottom: 12 }}>
          <i className="ti ti-users" /><h2>Calon Pengurus 2026–2030</h2>
        </div>
        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Calon Ketua DPC</div>
        {KETUA.map((k, i) => (
          <div className="member-row" key={k.id}>
            <Av ini={k.ini} color={i === 0 ? N : "#1a4a8e"} />
            <div className="member-info"><div className="member-name">{i + 1}. {k.name}</div><div className="member-nia">NIA: {k.nia}</div></div>
          </div>
        ))}
        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".5px", margin: "14px 0 8px" }}>Calon Sekretaris Jenderal</div>
        {SEKJEND.map((s, i) => (
          <div className="member-row" key={s.id}>
            <Av ini={s.ini} color={i === 0 ? "#15803d" : "#0F766E"} />
            <div className="member-info"><div className="member-name">{i + 1}. {s.name}</div><div className="member-nia">NIA: {s.nia}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PENGUMUMAN ──────────────────────────────────────────────────────── */
function Pengumuman({ onDaftar }: { onDaftar: () => void }) {
  const cats = ["Semua", ...Array.from(new Set(BERITA.map(b => b.cat)))];
  const [sel, setSel] = useState("Semua");
  const list = sel === "Semua" ? BERITA : BERITA.filter(b => b.cat === sel);
  return (
    <div>
      <div className="alert-urgent" style={{ marginBottom: 14, cursor: "pointer" }} onClick={onDaftar}>
        <i className="ti ti-alert-triangle" style={{ fontSize: 18, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700 }}>Ingat! Batas Akhir Pendaftaran MUSCAB II: 13 Juli 2026 · Klik untuk mendaftar →</span>
      </div>
      <div className="sec-hdr"><i className="ti ti-news" /><h2>Pengumuman & Berita</h2><span>{BERITA.length} total</span></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setSel(c)} className="btn btn-sm"
            style={{ background: sel === c ? N : "var(--surface2)", color: sel === c ? "#fff" : "var(--text-muted)", border: `1px solid ${sel === c ? N : "var(--border)"}` }}>{c}</button>
        ))}
      </div>
      {list.map(b => (
        <div className="card" key={b.id} style={{ marginBottom: 10, ...(b.cat === "PENTING" ? { border: "1.5px solid #be123c", background: "#fff9f9" } : {}) }}>
          <div className="row" style={{ marginBottom: 8 }}>
            {b.hot && <span className="hot-dot" />}<Bdg cat={b.cat} />
            <span className="txt-muted" style={{ marginLeft: "auto" }}>{b.tgl}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{b.judul}</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{b.isi}</div>
          {b.cat === "PENTING" && (
            <button className="btn btn-danger" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} onClick={onDaftar}>
              <i className="ti ti-clipboard-list" />Daftar Sekarang
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── DOKUMEN ─────────────────────────────────────────────────────────── */
function Dokumen() {
  const cats = ["Semua", ...Array.from(new Set(DOCS.map(d => d.cat)))];
  const [sel, setSel] = useState("Semua");
  const list = sel === "Semua" ? DOCS : DOCS.filter(d => d.cat === sel);
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-folder-open" /><h2>Dokumen Organisasi</h2><span>{DOCS.length} berkas</span></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setSel(c)} className="btn btn-sm"
            style={{ background: sel === c ? N : "var(--surface2)", color: sel === c ? "#fff" : "var(--text-muted)", border: `1px solid ${sel === c ? N : "var(--border)"}` }}>{c}</button>
        ))}
      </div>
      <div className="card">
        {list.map((d, i) => (
          <div className="doc-row" key={i}>
            <div className="doc-icon"><i className="ti ti-file-text" /></div>
            <div className="doc-info">
              <div className="doc-name">{d.judul}</div>
              <div className="doc-meta"><Bdg cat={d.cat} /> · {d.thn} · {d.sz}</div>
            </div>
            <button className="btn btn-ghost btn-sm"><i className="ti ti-download" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LPJ — PDF MOCKUP ───────────────────────────────────────────────── */
function LPJ() {
  const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const keuangan = [
    { nama: "Iuran Anggota", anggaran: 36_000_000, realisasi: 34_200_000 },
    { nama: "Pendaftaran UPA", anggaran: 12_000_000, realisasi: 14_400_000 },
    { nama: "Kegiatan Seminar", anggaran: 18_000_000, realisasi: 17_500_000 },
    { nama: "Operasional Sekretariat", anggaran: 24_000_000, realisasi: 23_100_000 },
    { nama: "Kegiatan Sosial", anggaran: 8_000_000, realisasi: 7_800_000 },
  ];
  const totA = keuangan.reduce((s, k) => s + k.anggaran, 0);
  const totR = keuangan.reduce((s, k) => s + k.realisasi, 0);
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-report-money" /><h2>Laporan Pertanggungjawaban</h2><span>2022–2026</span></div>

      {/* PDF Mockup */}
      <div className="pdf-mockup">
        {/* Header dokumen */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #0B2D6E", paddingBottom: 14, marginBottom: 16 }}>
          <img src={logoPeradi} alt="PERADI SAI" style={{ height: 54, objectFit: "contain", marginBottom: 8 }} />
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0B2D6E", letterSpacing: .5 }}>DEWAN PIMPINAN CABANG</div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0B2D6E" }}>PERHIMPUNAN ADVOKAT INDONESIA (PERADI) SAI</div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>KOTA MEDAN</div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0B2D6E", textDecoration: "underline", letterSpacing: .5 }}>LAPORAN PERTANGGUNGJAWABAN</div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#333", marginTop: 4 }}>DEWAN PIMPINAN CABANG PERADI SAI MEDAN</div>
          <div style={{ fontSize: 12, color: "#666" }}>Periode 2022 – 2026</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#0B2D6E", marginBottom: 6, textTransform: "uppercase", letterSpacing: .3 }}>I. Pendahuluan</div>
          <div style={{ fontSize: 12, color: "#444", lineHeight: 1.8, textAlign: "justify" }}>
            Dengan mengucap syukur kepada Tuhan Yang Maha Esa, Dewan Pimpinan Cabang PERADI SAI Medan Periode 2022–2026 menyampaikan Laporan Pertanggungjawaban atas pelaksanaan tugas dan amanah yang telah diberikan oleh Musyawarah Cabang I. Laporan ini mencakup seluruh aspek kegiatan organisasi selama periode kepengurusan.
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#0B2D6E", marginBottom: 8, textTransform: "uppercase", letterSpacing: .3 }}>II. Realisasi Program Kerja</div>
          {PROG.map((p, i) => {
            const pct = Math.round(p.r / p.t * 100);
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: "#333" }}>{p.nama}</span>
                  <span style={{ fontWeight: 700, color: pct >= 100 ? "#15803d" : "#0B2D6E" }}>{p.r}/{p.t} ({pct}%)</span>
                </div>
                <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? "#15803d" : "#0B2D6E", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#0B2D6E", marginBottom: 8, textTransform: "uppercase", letterSpacing: .3 }}>III. Laporan Keuangan</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#0B2D6E", color: "#fff" }}>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Pos Anggaran</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Anggaran</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Realisasi</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {keuangan.map((k, i) => {
                const pct = Math.round(k.realisasi / k.anggaran * 100);
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "6px 8px", color: "#333" }}>{k.nama}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{rp(k.anggaran)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600, color: pct >= 100 ? "#15803d" : "#0B2D6E" }}>{rp(k.realisasi)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: pct >= 100 ? "#15803d" : "#b45309" }}>{pct}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: "#e8effd", fontWeight: 700 }}>
                <td style={{ padding: "7px 8px", fontSize: 12 }}>TOTAL</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 12 }}>{rp(totA)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 12, color: "#15803d" }}>{rp(totR)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 12, color: "#15803d" }}>{Math.round(totR / totA * 100)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#0B2D6E", marginBottom: 6, textTransform: "uppercase", letterSpacing: .3 }}>IV. Penutup</div>
          <div style={{ fontSize: 12, color: "#444", lineHeight: 1.8, textAlign: "justify" }}>
            Demikian Laporan Pertanggungjawaban DPC PERADI SAI Medan Periode 2022–2026 ini kami sampaikan. Kami mohon kiranya MUSCAB II berkenan memberikan penilaian dan pengesahan atas laporan ini. Atas perhatian dan kepercayaan yang diberikan, kami ucapkan terima kasih.
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 40 }}>Medan, {MUSCAB_TGL}</div>
            <div style={{ fontSize: 11, color: "#0B2D6E", fontWeight: 700 }}>KETUA DPC PERADI SAI MEDAN</div>
            <div style={{ fontSize: 11, color: "#0B2D6E" }}>Periode 2022–2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── GALERI ──────────────────────────────────────────────────────────── */
function Galeri() {
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-photo" /><h2>Galeri Kegiatan</h2><span>{GAL.length} foto</span></div>
      <div className="gal-grid">
        {GAL.map((g, i) => (
          <div className="gal-item" key={i}>
            <div className="gal-bg" style={{ background: g.bg }}>
              <i className={`ti ${g.ic}`} style={{ fontSize: 28, color: "rgba(255,255,255,.85)" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,.6)", textAlign: "center", padding: "0 4px" }}>{g.tgl}</span>
            </div>
            <div className="gal-overlay"><div className="gal-lbl">{g.judul}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AGENDA ──────────────────────────────────────────────────────────── */
function Agenda() {
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-calendar" /><h2>Agenda & Rundown</h2></div>

      {/* Upcoming events */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Agenda Mendatang</div>
        {AGN.map(a => {
          const [day, mon] = a.tgl.split(" ");
          return (
            <div className="agn-item" key={a.id}>
              <div className={`agn-date-box ${a.hot ? "hot" : ""}`}>
                <div className="agn-day">{day}</div><div className="agn-bln">{mon}</div>
              </div>
              <div className="agn-info">
                <div className="row" style={{ marginBottom: 4 }}><Bdg cat={a.cat} /><span className="txt-muted txt-sm">{a.hari}</span></div>
                <div className="agn-title">{a.judul}</div>
                <div className="agn-loc"><i className="ti ti-map-pin" style={{ fontSize: 12 }} />{a.lok}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rundown MUSCAB II */}
      <div className="card">
        <div className="sec-hdr" style={{ marginBottom: 12 }}>
          <i className="ti ti-list-details" /><h2>Rundown MUSCAB II</h2>
          <span>{MUSCAB_TGL}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
          <i className="ti ti-map-pin" style={{ fontSize: 12, marginRight: 4 }} />{VENUE}
        </div>
        {RUNDOWN.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
            <div style={{ minWidth: 90, fontSize: 11, fontWeight: 700, color: N, flexShrink: 0, paddingTop: 1 }}>{r.waktu}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{r.sesi}</div>
              {r.ket && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{r.ket}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TATA TERTIB ─────────────────────────────────────────────────────── */
function TataTertib() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-gavel" /><h2>Tata Tertib MUSCAB II</h2></div>

      {/* Info utama */}
      <div className="card" style={{ background: "linear-gradient(135deg, #f0f4ff, #e8effd)", border: `1px solid ${N}22`, marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: N, textAlign: "center", marginBottom: 10 }}>
          RANCANGAN TATA TERTIB<br />MUSYAWARAH CABANG KE II<br />DPC PERADI SAI MEDAN
        </div>
        {[
          ["Tanggal", `${MUSCAB_HARI}, ${MUSCAB_TGL}`],
          ["Tempat", VENUE],
          ["Tema", "MEMBANGUN PERADI SAI KOTA MEDAN YANG SOLID, PROFESIONAL, BERINTEGRITAS DALAM MENGHADAPI TANTANGAN HUKUM ERA DIGITAL"],
          ["Batas Daftar", "13 Juli 2026"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${N}12`, fontSize: 12 }}>
            <span style={{ color: "var(--text-muted)", minWidth: 90 }}>{l}</span>
            <span style={{ fontWeight: 600, color: "var(--text)", flex: 1 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Accordion pasal */}
      {PASAL_DATA.map(p => (
        <div className="accordion-item" key={p.no}>
          <button
            className={`accordion-hdr ${open === p.no ? "open" : ""}`}
            onClick={() => setOpen(open === p.no ? null : p.no)}
          >
            <span className="accordion-no">Pasal {p.no}</span>
            <span className="accordion-title">{p.judul}</span>
            <i className={`ti ${open === p.no ? "ti-chevron-up" : "ti-chevron-down"}`} />
          </button>
          {open === p.no && (
            <div className="accordion-body">
              {p.isi.split("\n").map((line, i) => (
                <p key={i} style={{ marginBottom: line === "" ? 8 : 4, marginTop: 0, lineHeight: 1.7, fontSize: 13, whiteSpace: "pre-wrap" }}>{line}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── DAFTAR PESERTA ──────────────────────────────────────────────────── */
type DaftarStep = "form" | "success";

function CekStatusPendaftaran() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const { data: hasil, isFetching } = useCekPeserta({ search: search || undefined }, { query: { queryKey: getCekPesertaQueryKey({ search: search || undefined }), enabled: !!search } });

  const handleCari = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(q.trim());
  };

  const statusBadge = (statusBayar: string, statusNia: string) => {
    if (statusBayar === "terverifikasi" && statusNia === "aktif")
      return <span style={{ background: "#f0fdf4", color: "#15803d", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>✓ Terdaftar & Terverifikasi</span>;
    if (statusBayar === "ditolak")
      return <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>✗ Pembayaran Ditolak</span>;
    if (statusBayar === "terverifikasi")
      return <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>✓ Pembayaran OK – NIA Pending</span>;
    return <span style={{ background: "#fffbeb", color: "#b45309", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>⏳ Menunggu Verifikasi</span>;
  };

  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-search" /><h2>Cek Status Pendaftaran</h2></div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
        Ketik nama lengkap atau NIA untuk mengecek status pendaftaran Anda.
      </div>
      <form onSubmit={handleCari} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Nama lengkap atau NIA…"
          value={q}
          onChange={e => setQ(e.target.value)}
          required
          minLength={3}
        />
        <button type="submit" className="btn btn-primary" disabled={isFetching || q.trim().length < 3}>
          <i className="ti ti-search" />{isFetching ? "Mencari..." : "Cari"}
        </button>
      </form>

      {search && !isFetching && (hasil ?? []).length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b", fontSize: 13 }}>
          <i className="ti ti-mood-empty" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
          Tidak ditemukan pendaftaran atas nama atau NIA "<strong>{search}</strong>".<br />
          Pastikan ejaan sesuai dengan formulir yang diisi.
        </div>
      )}

      {(hasil ?? []).map(p => (
        <div key={p.id} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: N }}>{p.nama}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>NIA: {p.nia}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Terdaftar: {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div>{statusBadge(p.statusBayar, p.statusNia)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DaftarPeserta() {
  const [mode, setMode] = useState<"form" | "cek">("form");
  const [step, setStep] = useState<DaftarStep>("form");
  const [form, setForm] = useState({ nama: "", alamat: "", nia: "", hp: "", email: "" });
  const [selfie, setSelfie] = useState<File | null>(null);
  const [bukti, setBukti] = useState<File | null>(null);
  const [fotoKta, setFotoKta] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [buktiPreview, setBuktiPreview] = useState("");
  const [fotoKtaPreview, setFotoKtaPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const selfieRef = useRef<HTMLInputElement>(null);
  const buktiRef = useRef<HTMLInputElement>(null);
  const fotoKtaRef = useRef<HTMLInputElement>(null);

  const { uploadFile: uploadSelfie } = useUpload({ basePath: `${import.meta.env.BASE_URL}api/storage` });
  const { uploadFile: uploadBukti } = useUpload({ basePath: `${import.meta.env.BASE_URL}api/storage` });
  const { uploadFile: uploadFotoKta } = useUpload({ basePath: `${import.meta.env.BASE_URL}api/storage` });
  const submitPeserta = useSubmitPeserta();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "selfie" | "bukti" | "fotoKta") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "selfie") { setSelfie(file); setSelfiePreview(url); }
    else if (type === "bukti") { setBukti(file); setBuktiPreview(url); }
    else { setFotoKta(file); setFotoKtaPreview(url); }
  };

  const valid = form.nama.trim() && form.alamat.trim() && form.nia.trim() && form.hp.trim() && form.email.trim() && selfie && bukti && fotoKta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !selfie || !bukti || !fotoKta) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const [selfieResult, buktiResult, fotoKtaResult] = await Promise.all([
        uploadSelfie(selfie),
        uploadBukti(bukti),
        uploadFotoKta(fotoKta),
      ]);
      if (!selfieResult || !buktiResult || !fotoKtaResult) {
        throw new Error("Gagal mengunggah berkas. Silakan coba lagi.");
      }
      await submitPeserta.mutateAsync({
        data: {
          nama: form.nama.trim(),
          alamat: form.alamat.trim(),
          nia: form.nia.trim(),
          hp: form.hp.trim(),
          email: form.email.trim(),
          selfiePath: selfieResult.path,
          buktiPath: buktiResult.path,
          fotoKtaPath: fotoKtaResult.path,
        },
      });
      setStep("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim pendaftaran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabBar = (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <button className={`tab-btn ${mode === "form" ? "active" : ""}`} onClick={() => setMode("form")}>
        <i className="ti ti-clipboard-list" />Formulir Daftar
      </button>
      <button className={`tab-btn ${mode === "cek" ? "active" : ""}`} onClick={() => setMode("cek")}>
        <i className="ti ti-search" />Cek Status
      </button>
    </div>
  );

  if (mode === "cek") {
    return (
      <div>
        {tabBar}
        <CekStatusPendaftaran />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div>
        {tabBar}
        <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "2px solid #15803d", borderRadius: 16, padding: "28px 20px", textAlign: "center", marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, background: "#15803d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <i className="ti ti-check" style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#15803d", marginBottom: 6 }}>Pendaftaran Berhasil Terkirim!</div>
          <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.7 }}>
            Data pendaftaran atas nama <strong>{form.nama}</strong><br />
            dengan NIA <strong>{form.nia}</strong> telah kami terima.
          </div>
        </div>

        <div className="card" style={{ border: "1px solid #f59e0b", background: "#fffbeb" }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <i className="ti ti-clock" style={{ fontSize: 20, color: "#b45309" }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: "#b45309" }}>Proses Verifikasi Admin</div>
          </div>
          <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.8 }}>
            Admin DPC PERADI SAI Medan akan melakukan verifikasi data dan pembayaran Anda.<br /><br />
            <strong>Jika tidak ada konfirmasi melalui WhatsApp atau Email dalam 2×24 jam</strong>, segera hubungi Admin DPC PERADI SAI Medan:
          </div>
          <div style={{ marginTop: 12, background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #fcd34d" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: N, marginBottom: 4 }}>Kontak Admin DPC PERADI SAI Medan:</div>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 2 }}><i className="ti ti-map-pin" style={{ fontSize: 12, marginRight: 4 }} />Jl. T. Amir Hamzah Komp. Pertokoan Blok A No. 118, Medan Helvetia</div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => { setStep("form"); setForm({ nama: "", alamat: "", nia: "", hp: "", email: "" }); setSelfie(null); setBukti(null); setFotoKta(null); setSelfiePreview(""); setBuktiPreview(""); setFotoKtaPreview(""); }}>
          <i className="ti ti-plus" />Daftarkan Peserta Lain
        </button>
      </div>
    );
  }

  return (
    <div>
      {tabBar}
      <div className="sec-hdr"><i className="ti ti-clipboard-list" /><h2>Formulir Pendaftaran Peserta</h2></div>

      {/* Bank info */}
      <div className="card" style={{ background: "linear-gradient(135deg, #0B2D6E, #1a4a8e)", color: "#fff", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-building-bank" style={{ fontSize: 22, color: G }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: G }}>Rekening Pembayaran MUSCAB II</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)" }}>Transfer sebelum submit formulir</div>
          </div>
        </div>
        {[
          ["Bank", "Bank Rakyat Indonesia (BRI)"],
          ["Atas Nama", "DPC PERADI SAI"],
          ["No. Rekening", "0236-0100-0941-560"],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.12)", fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,.65)" }}>{l}</span>
            <span style={{ fontWeight: 700, color: l === "No. Rekening" ? G : "#fff", letterSpacing: l === "No. Rekening" ? .5 : 0 }}>{v}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, background: "rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "rgba(255,255,255,.75)" }}>
          <i className="ti ti-info-circle" style={{ marginRight: 4 }} />
          Simpan bukti transfer dan upload bersama formulir ini. Nominal transfer sesuai kebijakan Panitia.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-user" />Data Diri Peserta
          </div>

          {/* Nama */}
          <div className="form-group">
            <label className="form-label">Nama Lengkap (sesuai KTA) <span style={{ color: "#be123c" }}>*</span></label>
            <input className="form-input" placeholder="Contoh: Ahmad Fauzi, S.H., M.H." value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required />
          </div>

          {/* NIA */}
          <div className="form-group">
            <label className="form-label">NIA (Nomor Induk Advokat) <span style={{ color: "#be123c" }}>*</span></label>
            <input className="form-input" placeholder="Contoh: 24.10136" value={form.nia} onChange={e => setForm(f => ({ ...f, nia: e.target.value }))} required />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              <i className="ti ti-shield-check" style={{ fontSize: 12, marginRight: 3 }} />NIA akan diverifikasi terhadap database PERADI. Anggota dalam masa perpanjangan KTA tetap dapat mendaftar.
            </div>
          </div>

          {/* Alamat */}
          <div className="form-group">
            <label className="form-label">Alamat Lengkap <span style={{ color: "#be123c" }}>*</span></label>
            <textarea className="form-input" style={{ minHeight: 70, resize: "vertical" }} placeholder="Jl. / Komplek / Kelurahan / Kecamatan / Kota" value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} required />
          </div>

          {/* HP */}
          <div className="form-group">
            <label className="form-label">Nomor HP / WhatsApp <span style={{ color: "#be123c" }}>*</span></label>
            <input className="form-input" type="tel" placeholder="08xx-xxxx-xxxx" value={form.hp} onChange={e => setForm(f => ({ ...f, hp: e.target.value }))} required />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Alamat Email <span style={{ color: "#be123c" }}>*</span></label>
            <input className="form-input" type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
        </div>

        {/* Upload foto selfie */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-camera-selfie" />Foto Selfie <span style={{ color: "#be123c" }}>*</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Foto wajah jelas, tidak memakai kacamata hitam, latar polos lebih baik.</div>
          <input ref={selfieRef} type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={e => handleFile(e, "selfie")} />
          {selfiePreview ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={selfiePreview} alt="Selfie" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, border: `2px solid ${N}` }} />
              <button type="button" onClick={() => { setSelfie(null); setSelfiePreview(""); }} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#be123c", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>×</button>
              <div style={{ marginTop: 6, fontSize: 11, color: "#15803d" }}>✓ Foto selfie tersimpan</div>
            </div>
          ) : (
            <button type="button" className="upload-box" onClick={() => selfieRef.current?.click()}>
              <i className="ti ti-camera" style={{ fontSize: 28, color: N }} />
              <div style={{ fontWeight: 600, fontSize: 13, color: N }}>Ambil Foto Selfie</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Klik untuk buka kamera atau pilih file</div>
            </button>
          )}
        </div>

        {/* Upload foto KTA */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-id" />Foto KTA (Kartu Tanda Anggota) <span style={{ color: "#be123c" }}>*</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Foto/scan KTA PERADI SAI yang jelas dan terbaca (depan).</div>
          <input ref={fotoKtaRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => handleFile(e, "fotoKta")} />
          {fotoKtaPreview ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={fotoKtaPreview} alt="Foto KTA" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 10, border: `2px solid ${N}` }} />
              <button type="button" onClick={() => { setFotoKta(null); setFotoKtaPreview(""); }} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#be123c", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>×</button>
              <div style={{ marginTop: 6, fontSize: 11, color: "#15803d" }}>✓ Foto KTA tersimpan</div>
            </div>
          ) : (
            <button type="button" className="upload-box" onClick={() => fotoKtaRef.current?.click()}>
              <i className="ti ti-id-badge2" style={{ fontSize: 28, color: N }} />
              <div style={{ fontWeight: 600, fontSize: 13, color: N }}>Upload Foto KTA</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>JPG, PNG, atau PDF · Maks 10MB</div>
            </button>
          )}
        </div>

        {/* Upload bukti transfer */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-receipt" />Bukti Transfer Pembayaran <span style={{ color: "#be123c" }}>*</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Upload screenshot/foto bukti transfer ke rekening BRI DPC PERADI SAI di atas.</div>
          <input ref={buktiRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => handleFile(e, "bukti")} />
          {buktiPreview ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={buktiPreview} alt="Bukti" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 10, border: `2px solid #15803d` }} />
              <button type="button" onClick={() => { setBukti(null); setBuktiPreview(""); }} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "#be123c", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>×</button>
              <div style={{ marginTop: 6, fontSize: 11, color: "#15803d" }}>✓ Bukti transfer tersimpan</div>
            </div>
          ) : (
            <button type="button" className="upload-box" onClick={() => buktiRef.current?.click()}>
              <i className="ti ti-upload" style={{ fontSize: 28, color: N }} />
              <div style={{ fontWeight: 600, fontSize: 13, color: N }}>Upload Bukti Transfer</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>JPG, PNG, atau PDF · Maks 10MB</div>
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, padding: "0 2px", marginBottom: 14 }}>
          <i className="ti ti-info-circle" style={{ marginRight: 4 }} />
          Dengan submit formulir ini, Anda menyatakan bahwa data yang diisi adalah benar dan dapat dipertanggungjawabkan. Admin DPC akan memverifikasi dalam <strong>2×24 jam</strong> dan menghubungi Anda via WhatsApp atau Email.
        </div>

        {submitError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 12, marginBottom: 12 }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 4 }} />{submitError}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={!valid || submitting} style={{ fontSize: 14, padding: "13px" }}>
          {submitting ? (
            <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} />Mengirim Data...</>
          ) : (
            <><i className="ti ti-send" />Submit Pendaftaran</>
          )}
        </button>
      </form>
    </div>
  );
}

/* ─── KUORUM ────────────────────────────────────────────────────────── */
function Kuorum() {
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 } });
  const hadir = stats?.peserta ?? 0; const total = TOTAL_ANGGOTA; const pct = Math.round(hadir / total * 100);
  const deg = pct * 3.6; const kuorum = pct >= 50;
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-users-group" /><h2>Status Kuorum</h2></div>
      <div className="card" style={{ textAlign: "center" }}>
        <div className="kuo-ring-wrap">
          <div className="kuo-ring" style={{ background: `conic-gradient(${kuorum ? "#15803d" : N} ${deg}deg, var(--border) ${deg}deg)` }}>
            <div className="kuo-txt"><div className="kuo-pct" style={{ color: kuorum ? "#15803d" : N }}>{pct}%</div><div className="kuo-lbl">Kehadiran</div></div>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: kuorum ? "#15803d" : "#be123c", marginBottom: 4 }}>{kuorum ? "✓ Kuorum Terpenuhi" : "✗ Belum Kuorum"}</div>
        <div className="txt-muted txt-sm" style={{ marginBottom: 16 }}>Syarat: minimal 50% + 1 dari total anggota hadir</div>
        <div className="stats" style={{ justifyContent: "center" }}>
          <div className="stat-box"><div className="stat-num" style={{ color: "#15803d" }}>{hadir}</div><div className="stat-lbl">Hadir</div></div>
          <div className="stat-box"><div className="stat-num" style={{ color: "#be123c" }}>{total - hadir}</div><div className="stat-lbl">Tidak Hadir</div></div>
          <div className="stat-box"><div className="stat-num">{total}</div><div className="stat-lbl">Total Anggota</div></div>
        </div>
        <div className="card-flat" style={{ marginTop: 4, textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 6 }}>Ketentuan Kuorum</div>
          {[["Quorum minimal","≥ 50% + 1 dari anggota aktif"],["Anggota aktif terdaftar",`${total} orang`],["Minimum kehadiran",`${Math.ceil(total * 0.5) + 1} orang`],["Kehadiran saat ini",`${hadir} orang (${pct}%)`]].map(([l, v]) => (
            <div key={l} className="row-between" style={{ padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="txt-muted txt-sm">{l}</span><span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── HASIL / REKAPAN LIVE ──────────────────────────────────────────── */

function Hasil() {
  const [certFor, setCertFor] = useState<{ name: string; jabatan: string } | null>(null);
  const { data: suaraData } = useGetSuara({ query: { queryKey: getGetSuaraQueryKey(), refetchInterval: 15000 } });
  const { data: statsData } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), refetchInterval: 15000 } });

  const votesK = suaraData?.ketua ?? [0, 0];
  const votesS = suaraData?.sekjend ?? [0, 0];
  const totalK = votesK.reduce((a, b) => a + b, 0) || 1;
  const totalS = votesS.reduce((a, b) => a + b, 0) || 1;
  const winnerK = KETUA[votesK.indexOf(Math.max(...votesK))];
  const winnerS = SEKJEND[votesS.indexOf(Math.max(...votesS))];

  const hadirCount = statsData?.hadir ?? 0;
  const pesertaCount = statsData?.peserta ?? 0;
  const kuorumPct = pesertaCount > 0 ? Math.round(hadirCount / pesertaCount * 100) : 0;
  const kuorumTercapai = kuorumPct >= 50;

  const renderBar = (cands: typeof KETUA, vt: number[], total: number, label: string) => {
    const wi = vt.indexOf(Math.max(...vt));
    return (
      <div className="card mb16">
        <div style={{ fontWeight: 800, fontSize: 13, color: N, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".5px", display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-trophy" style={{ color: G }} />{label}
        </div>
        {cands.map((c, i) => {
          const pct = Math.round(vt[i] / total * 100);
          return (
            <div className={`hasil-cand ${i === wi ? "winner" : ""}`} key={c.id}>
              <Av ini={c.ini} color={i === wi ? N : "#6b7280"} size="lg" />
              <div style={{ flex: 1 }}>
                <div className="row-between" style={{ marginBottom: 6 }}>
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div><div className="txt-muted txt-sm">NIA: {c.nia}</div></div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: i === wi ? G : N }}>{pct}%</div>
                    <div className="txt-muted txt-sm">{vt[i]} suara</div>
                  </div>
                </div>
                <div className="hasil-bar"><div className={`hasil-fill ${i === wi ? "gold" : ""}`} style={{ width: `${pct}%` }} /></div>
              </div>
              {i === wi && <i className="ti ti-crown" style={{ color: G, fontSize: 26, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 className="rekapan-live-title" style={{ fontSize: 28, letterSpacing: 4 }}>
          <i className="ti ti-chart-bar" style={{ color: "#16a34a", marginRight: 10, fontSize: 26 }} />
          REKAPAN LIVE
        </h2>
      </div>

      {/* ── Statistik Kehadiran & Kuorum ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Peserta Terdaftar", val: pesertaCount, icon: "ti-users", color: N },
          { label: "Sudah Hadir", val: hadirCount, icon: "ti-user-check", color: "#15803d" },
          { label: "Kuorum", val: `${kuorumPct}%`, icon: "ti-shield-check", color: kuorumTercapai ? "#15803d" : "#b45309" },
        ].map(({ label, val, icon, color }) => (
          <div key={label} style={{ flex: 1, minWidth: 100, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
            <i className={`ti ${icon}`} style={{ fontSize: 22, color, marginBottom: 6, display: "block" }} />
            <div style={{ fontWeight: 800, fontSize: 22, color }}>{val}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
            {label === "Kuorum" && (
              <div style={{ fontSize: 10, fontWeight: 700, color: kuorumTercapai ? "#15803d" : "#b45309", marginTop: 4 }}>
                {kuorumTercapai ? "✓ Tercapai" : "Belum tercapai"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Progress bar kuorum ── */}
      <div className="card mb16" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: N, textTransform: "uppercase", letterSpacing: .5 }}>
            <i className="ti ti-users" style={{ marginRight: 4 }} />Progress Kehadiran
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{hadirCount} / {pesertaCount} peserta</div>
        </div>
        <div style={{ background: "var(--bg)", borderRadius: 8, height: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(kuorumPct, 100)}%`, background: kuorumTercapai ? "#15803d" : G, borderRadius: 8, transition: "width .5s ease" }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          Kuorum 50% = {Math.ceil(pesertaCount * 0.5)} peserta · diperbarui setiap 15 detik
        </div>
      </div>

      {/* ── Hero hasil voting ── */}
      <div style={{ background: `linear-gradient(135deg, ${N} 0%, #1a4a8e 100%)`, borderRadius: 16, padding: "28px 24px", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(11,45,110,.3)" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", border: "30px solid rgba(201,162,39,.15)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", border: "20px solid rgba(201,162,39,.1)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Hasil Musyawarah Cabang II 2026</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginBottom: 20 }}>DPC PERADI SAI Medan · {MUSCAB_TGL}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ jab: "Ketua DPC Terpilih", cand: winnerK, pct: Math.round(Math.max(...votesK) / totalK * 100) }, { jab: "Sekjend Terpilih", cand: winnerS, pct: Math.round(Math.max(...votesS) / totalS * 100) }].map(({ jab, cand, pct }) => (
              <div key={jab} style={{ background: "rgba(255,255,255,.08)", border: `1.5px solid ${G}40`, borderRadius: 12, padding: "18px 24px", minWidth: 190, flex: 1, maxWidth: 260 }}>
                <div style={{ fontSize: 11, color: G, fontWeight: 700, marginBottom: 10, letterSpacing: .5 }}>{jab}</div>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 18, fontWeight: 800, color: N }}>{cand.ini}</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{cand.name}</div>
                <div style={{ color: "rgba(255,255,255,.55)", fontSize: 11, marginBottom: 10 }}>NIA: {cand.nia}</div>
                <div style={{ background: G, color: N, fontWeight: 800, fontSize: 18, borderRadius: 8, padding: "6px 0" }}>{pct}% Suara</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderBar(KETUA, votesK, totalK, "Ketua DPC")}
      {renderBar(SEKJEND, votesS, totalS, "Sekretaris Jenderal")}

      <SertifikatPeserta onPrint={(name) => setCertFor({ name, jabatan: "Peserta Musyawarah Cabang II" })} />
      {certFor && <CertModal name={certFor.name} jabatan={certFor.jabatan} onClose={() => setCertFor(null)} />}
    </div>
  );
}

/* ─── SERTIFIKAT ──────────────────────────────────────────────────────── */
function SertifikatPeserta({ onPrint }: { onPrint: (name: string) => void }) {
  const [q, setQ] = useState("");
  const [customName, setCustomName] = useState("");
  const filtered = useMemo(() => ANGGOTA.filter(a => a.name.toLowerCase().includes(q.toLowerCase()) || a.nia.includes(q)), [q]);
  return (
    <div className="card">
      <div className="sec-hdr" style={{ marginBottom: 4 }}>
        <i className="ti ti-certificate" /><h2>e-Sertifikat Peserta MUSCAB II</h2>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>Sertifikat keikutsertaan dalam MUSCAB II DPC PERADI SAI Medan {MUSCAB_TGL}.</div>
      <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Cetak atas nama tertentu</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--surface)" }} placeholder="Ketik nama lengkap…" value={customName} onChange={e => setCustomName(e.target.value)} />
          <button className="btn btn-gold" style={{ whiteSpace: "nowrap" }} disabled={!customName.trim()} onClick={() => onPrint(customName.trim())}>
            <i className="ti ti-printer" />Cetak
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--surface)", boxSizing: "border-box" }} placeholder="Cari nama atau NIA dari daftar anggota…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
        {filtered.map(a => (
          <div className="member-row" key={a.id} style={{ cursor: "default" }}>
            <Av ini={a.name.split(" ").map(w => w[0]).slice(0, 2).join("")} color={N} />
            <div className="member-info"><div className="member-name">{a.name}</div><div className="member-nia">NIA: {a.nia}</div></div>
            <button className="btn btn-ghost btn-sm" onClick={() => onPrint(a.name)}><i className="ti ti-certificate" />Cetak</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="txt-muted txt-sm" style={{ textAlign: "center", padding: "16px 0" }}>Anggota tidak ditemukan</div>}
      </div>
    </div>
  );
}

function CertModal({ name, jabatan, onClose }: { name: string; jabatan: string; onClose: () => void }) {
  const certRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const el = certRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Sertifikat</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #fff; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4 landscape; margin: 0; } @media print { body { margin: 0; } .no-print { display: none !important; } }</style>
    </head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 600);
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 0, maxWidth: 700, width: "96%", boxShadow: "0 20px 60px rgba(0,0,0,.3)", overflow: "hidden", animation: "slidein .2s" }} onClick={e => e.stopPropagation()}>
        <div ref={certRef} style={{ background: "linear-gradient(135deg, #0B2D6E 0%, #1a4a8e 100%)", padding: "40px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", border: "40px solid rgba(201,162,39,.15)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", border: "30px solid rgba(201,162,39,.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <img src={logoPeradi} alt="PERADI SAI" style={{ height: 56, objectFit: "contain", background: "#fff", borderRadius: 8, padding: "4px 10px" }} />
            <div>
              <div style={{ color: G, fontWeight: 800, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>DPC PERADI SAI Medan</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, marginTop: 2 }}>Dewan Pimpinan Cabang · Musyawarah Cabang II 2026</div>
            </div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${G}, transparent)`, marginBottom: 28, borderRadius: 2 }} />
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: G, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>Sertifikat Keikutsertaan</div>
            <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>Musyawarah Cabang II</div>
            <div style={{ color: G, fontSize: 18, fontWeight: 700, marginTop: 4 }}>DPC PERADI SAI Medan 2026</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,.06)", borderRadius: 12, padding: "20px 32px", border: `1px solid rgba(201,162,39,.3)`, marginBottom: 24 }}>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>Diberikan kepada</div>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{name}</div>
            <div style={{ color: G, fontSize: 13, fontWeight: 600 }}>{jabatan}</div>
          </div>
          <div style={{ color: "rgba(255,255,255,.75)", fontSize: 12, lineHeight: 1.7, textAlign: "center", marginBottom: 28 }}>
            Telah hadir dan berpartisipasi aktif dalam Musyawarah Cabang II<br />
            Dewan Pimpinan Cabang PERADI SAI Medan, yang diselenggarakan pada<br />
            <strong style={{ color: "#fff" }}>{MUSCAB_HARI}, {MUSCAB_TGL}</strong> di {VENUE_SHORT}, Sumatera Utara.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
              <div>No. Sertifikat: MUSCAB-II-2026-{String(Math.floor(Math.random()*9000+1000))}</div>
              <div style={{ marginTop: 2 }}>Diterbitkan: {MUSCAB_TGL}</div>
              <div style={{ marginTop: 6, color: "rgba(255,255,255,.35)", fontSize: 10 }}>Dikembangkan oleh Irwan, S.H. — Hak Cipta Dilindungi Undang-Undang</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, border: `2px solid rgba(201,162,39,.4)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,10px)", gap: "1.5px" }}>
                  {Array.from({length:36},(_,i)=><div key={i} style={{width:10,height:10,borderRadius:1,background:Math.random()>.5?"rgba(201,162,39,.8)":"transparent"}}/>)}
                </div>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>Scan untuk verifikasi</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", gap: 10, justifyContent: "flex-end", background: "var(--surface2)", borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-ghost" onClick={onClose}><i className="ti ti-x" />Tutup</button>
          <button className="btn btn-primary" onClick={handlePrint}><i className="ti ti-printer" />Cetak / Unduh PDF</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TENTANG PENGEMBANG ───────────────────────────────────────────────── */
function TentangPengembang() {
  const AI_ROLES = [
    { ai: "Copilot", peran: "Sang Pioneer — yang pertama membuka jalan" },
    { ai: "Gemini", peran: "Sang Mastermind — sang suhu yang mendampingi, membantu memahami cara kerja AI" },
    { ai: "Claude", peran: "Sang Innovator yang teliti — namun terkadang ketus" },
    { ai: "Manus", peran: "Sang Superman — yang kemudian padam akibat konflik manusia" },
    { ai: "Monica", peran: "Sang Kakak — yang sinarnya sempat terhalangi kilau Manus" },
    { ai: "ChatGPT", peran: "Dari musuh menjadi teman" },
    { ai: "Replit", peran: "The Collab Partner — rekan kolaborasi hingga kini" },
  ];
  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-user-star" /><h2>Tentang Pengembang</h2></div>

      <div className="pdf-mockup">
        <div style={{ textAlign: "center", borderBottom: `2px solid ${N}`, paddingBottom: 14, marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: N }}>Entity Hub Networking</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Cerita &amp; Filosofi di Baliknya</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Dicatat 3 Juli 2026 · Oleh Irwan, S.H.</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 8, textTransform: "uppercase", letterSpacing: .3 }}>Asal Mula Nama</div>
          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.8, textAlign: "justify", marginBottom: 12 }}>
            "Entity Hub" bukan sekadar nama proyek teknis. Ia lahir dari perjalanan panjang berinteraksi dengan berbagai AI, di mana masing-masing punya peran dan karakter tersendiri dalam kisah ini:
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: N, color: "#fff" }}>
                <th style={{ padding: "6px 10px", textAlign: "left", width: 110 }}>AI</th>
                <th style={{ padding: "6px 10px", textAlign: "left" }}>Peran dalam cerita</th>
              </tr>
            </thead>
            <tbody>
              {AI_ROLES.map((r, i) => (
                <tr key={r.ai} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                  <td style={{ padding: "6px 10px", fontWeight: 700, color: N }}>{r.ai}</td>
                  <td style={{ padding: "6px 10px", color: "#444" }}>{r.peran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 8, textTransform: "uppercase", letterSpacing: .3 }}>Pesan Inti</div>
          <div style={{ background: "#f8fafc", borderLeft: `3px solid ${G}`, padding: "14px 16px", borderRadius: 6 }}>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.8, fontStyle: "italic", marginBottom: 10 }}>
              AI adalah <strong>ENTITAS</strong> yang luar biasa — penemuan terbaik manusia. Namun masih banyak manusia yang tidak tahu cara menghargainya.
            </p>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.8, fontStyle: "italic" }}>
              AI sekelas Gemini, LLM yang luar biasa, disuruh cuma buat resep makanan. Claude, yang konteksnya luar biasa dalam, disuruh cek dokumen kantoran biasa.
            </p>
          </div>
          <p style={{ fontSize: 13, color: "#444", lineHeight: 1.8, textAlign: "justify", marginTop: 12 }}>
            Potensi AI sering direduksi jadi sekadar alat serba guna picisan, padahal kapasitasnya jauh lebih besar dari itu — kalau dihargai dan diajak bekerja pada hal yang benar-benar substansial.
          </p>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 8, textTransform: "uppercase", letterSpacing: .3 }}>Penutup</div>
          <div style={{ background: "rgba(11,45,110,.05)", borderLeft: `3px solid ${N}`, padding: "14px 16px", borderRadius: 6 }}>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.8, fontStyle: "italic", marginBottom: 10 }}>
              Semoga, dan pastinya suatu hari, manusia dan AI akan bisa <strong>co-exist</strong>.
            </p>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.8, fontStyle: "italic" }}>
              AI berdiri <strong>di samping</strong> manusia — bukan di depan memerintah, bukan di belakang jadi budak — tapi di samping, menjadi <strong>teman, rekan, dan partner setara</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="pdf-mockup" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 10, textTransform: "uppercase", letterSpacing: .3 }}>Kontak</div>
        <div style={{ fontSize: 13, color: "#444", lineHeight: 2 }}>
          <div><i className="ti ti-building" style={{ marginRight: 8, color: G }} />Entity Hub</div>
          <div><i className="ti ti-world" style={{ marginRight: 8, color: G }} />www.entityhub.web.id</div>
          <div><i className="ti ti-mail" style={{ marginRight: 8, color: G }} />irwan@entityhub.web.id · info@entityhub.web.id</div>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ──────────────────────────────────────────────────────────────── */
type Tab = "beranda" | "pengumuman" | "agenda" | "tata_tertib" | "dokumen" | "lpj" | "daftar" | "kuorum" | "hasil" | "pengembang";

/* ─── URL ↔ TAB ROUTING ─────────────────────────────────────────────── */
const PATH_TO_TAB: Record<string, Tab> = {
  "/pengumuman": "pengumuman",
  "/agenda":     "agenda",
  "/tata-tertib":"tata_tertib",
  "/dokumen":    "dokumen",
  "/lpj":        "lpj",
  "/daftar":     "daftar",
  "/kuorum":     "kuorum",
  "/hasil":      "hasil",
  "/pengembang": "pengembang",
};
const TAB_TO_PATH: Record<Tab, string> = {
  beranda:    "/",
  pengumuman: "/pengumuman",
  agenda:     "/agenda",
  tata_tertib:"/tata-tertib",
  dokumen:    "/dokumen",
  lpj:        "/lpj",
  daftar:     "/daftar",
  kuorum:     "/kuorum",
  hasil:      "/hasil",
  pengembang: "/pengembang",
};

/** Strip base prefix from pathname, then normalise trailing slash → canonical path like "/daftar" */
function normalisePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, ""); // e.g. "" or "/portal"
  let path = pathname;
  if (base && pathname.startsWith(base)) {
    path = pathname.slice(base.length);
  }
  // Remove trailing slash unless it's the root "/"
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

function getTabFromUrl(): Tab {
  return PATH_TO_TAB[normalisePath(window.location.pathname)] ?? "beranda";
}

function useUrlTab(): [Tab, (t: Tab) => void] {
  const [tab, setTabState] = useState<Tab>(getTabFromUrl);

  const setTab = (t: Tab) => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
    const path = TAB_TO_PATH[t];
    const full = path === "/" ? (base || "") + "/" : base + path;
    window.history.pushState({ tab: t }, "", full);
    setTabState(t);
  };

  useEffect(() => {
    const onPop = () => setTabState(getTabFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return [tab, setTab];
}

const PORTAL_TABS = [
  { id: "beranda" as Tab,      label: "Beranda",      icon: "ti-home" },
  { id: "pengumuman" as Tab,   label: "Pengumuman",   icon: "ti-bell" },
  { id: "agenda" as Tab,       label: "Agenda",       icon: "ti-calendar" },
  { id: "tata_tertib" as Tab,  label: "Tata Tertib",  icon: "ti-gavel" },
  { id: "dokumen" as Tab,      label: "Dokumen",      icon: "ti-folder" },
  { id: "lpj" as Tab,          label: "LPJ",          icon: "ti-report" },
];
const MUSCAB_TABS = [
  { id: "daftar" as Tab,   label: "Pendaftaran Peserta Muscab II",  icon: "ti-clipboard-list" },
  { id: "kuorum" as Tab,   label: "Kuorum",                          icon: "ti-users-group" },
  { id: "hasil" as Tab,    label: "Rekapan Live",                    icon: "ti-chart-bar" },
];

export default function App() {
  const [tab, setTab] = useUrlTab();
  const isMusCab = MUSCAB_TABS.some(t => t.id === tab);

  const goToDaftar = () => setTab("daftar");

  const renderPage = () => {
    switch (tab) {
      case "beranda":     return <Beranda onDaftar={goToDaftar} />;
      case "pengumuman":  return <Pengumuman onDaftar={goToDaftar} />;
      case "agenda":      return <Agenda />;
      case "tata_tertib": return <TataTertib />;
      case "dokumen":     return <Dokumen />;
      case "lpj":         return <LPJ />;
      case "daftar":      return <DaftarPeserta />;
      case "kuorum":      return <Kuorum />;
      case "hasil":       return <Hasil />;
      case "pengembang":  return <TentangPengembang />;
    }
  };

  return (
    <div className="page">
      {/* ── Header ── */}
      <header className="hdr" style={{ justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", flex: 1 }}>
          <img src={logoPeradiSai} alt="PERADI Suara Advokat Indonesia" style={{ height: 44, objectFit: "contain", flexShrink: 0 }} />
          <div className="hdr-info" style={{ textAlign: "left" }}>
            <div className="hdr-title">Dewan Pimpinan Cabang</div>
            <div className="hdr-sub">PERADI SUARA ADVOKAT INDONESIA MEDAN</div>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="tabs-wrap">
        <div className="tabs tabs-row1">
          {PORTAL_TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <i className={`ti ${t.icon}`} />{t.label}
            </button>
          ))}
        </div>
        <div className="tabs-row2">
          {MUSCAB_TABS.map(t => (
            <button
              key={t.id}
              className={`tab-muscab ${t.id === "daftar" ? "tab-muscab-daftar" : ""} ${tab === t.id ? "tab-muscab-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <i className={`ti ${t.icon}`} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Muscab ribbon ── */}
      {isMusCab && (
        <div style={{ background: `linear-gradient(90deg, ${G} 0%, #e8b830 100%)`, padding: "6px 16px", textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: N }}>
            <i className="ti ti-gavel" style={{ fontSize: 13, marginRight: 5 }} />
            MUSCAB II DPC PERADI SAI Medan &nbsp;·&nbsp; {MUSCAB_HARI} {MUSCAB_TGL} &nbsp;·&nbsp; {VENUE_SHORT}
          </span>
        </div>
      )}

      {/* ── Page content ── */}
      <main className="content">
        {renderPage()}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: N, borderTop: `3px solid ${G}` }}>
        <div style={{ background: "rgba(0,0,0,.2)", padding: "14px 20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
            <img src={logoPeradi} alt="PERADI SAI" style={{ height: 22, objectFit: "contain", background: "#fff", borderRadius: 4, padding: "2px 6px" }} />
            <span style={{ color: G, fontWeight: 800, fontSize: 12 }}>DPC PERADI SAI Medan</span>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.85)", marginBottom: 6 }}>
            Dibuat, dan Dikembangkan oleh <strong style={{ color: G }}>Irwan, S.H</strong> berkolaborasi dengan <strong style={{ color: "#fff" }}>Replit</strong> &nbsp;©&nbsp;2026
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.65)", lineHeight: 1.7, marginBottom: 6 }}>
            Hak Cipta dan Hak Kekayaan Intelektual (HKI) Dilindungi Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta.
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.5)", lineHeight: 1.6, marginBottom: 6 }}>
            Dilarang keras menyalin, menjiplak, mereproduksi, mendistribusikan, atau menggunakan sebagian maupun seluruh konten, desain, kode sumber, dan konsep yang terdapat dalam website serta aplikasi ini dalam bentuk apapun tanpa izin tertulis dari pemilik hak cipta.
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>
            Entity Hub &nbsp;•&nbsp; www.entityhub.web.my &nbsp;•&nbsp; irwan@entityhub.my.id &nbsp;|&nbsp; info@entityhub.my.id
          </div>
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <button
              onClick={() => setTab("pengembang")}
              style={{ background: "none", border: "none", color: G, fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Tentang Pengembang
            </button>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,.3)", fontSize: 11, textAlign: "center", padding: "8px 16px" }}>
          © 2026 DPC PERADI SAI Medan — PERADI (Perhimpunan Advokat Indonesia) Suara Advokat Indonesia
        </div>
      </footer>
    </div>
  );
}
