import { useState } from "react";
import {
  useAdminLogin,
  useAdminLogout,
  useAdminMe,
  useListAdminPeserta,
  useUpdateAdminPeserta,
  useUpdateAdminSuara,
  useGetSuara,
  useListAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  getListAdminPesertaQueryKey,
  getListAdminUsersQueryKey,
  getGetSuaraQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Peserta, AdminUser, AdminSessionRole } from "@workspace/api-client-react";

const ROLE_LABELS: Record<AdminSessionRole, string> = {
  full_access: "Akses Penuh",
  registrasi: "Registrasi",
  keuangan: "Keuangan",
  spectator: "Peninjau",
};

const N = "#0B2D6E";
const G = "#C9A227";

function objectStorageUrl(objectPath: string | null | undefined): string {
  const entityId = (objectPath ?? "").replace(/^\/objects\//, "");
  return `${import.meta.env.BASE_URL}api/storage/objects/${entityId}`;
}

function toWaNumber(hp: string): string {
  const digits = hp.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}

function buildWaMessage(peserta: Peserta): string {
  const niaLabel = peserta.statusNia === "aktif" ? "AKTIF ✅" : peserta.statusNia === "tidak_aktif" ? "TIDAK AKTIF ❌" : "Pending (belum diverifikasi)";
  const bayarLabel = peserta.statusBayar === "terverifikasi" ? "TERVERIFIKASI ✅" : peserta.statusBayar === "ditolak" ? "DITOLAK ❌" : "Menunggu verifikasi";

  let lines = [
    `Halo ${peserta.nama},`,
    ``,
    `Berikut update status pendaftaran Anda untuk MUSCAB II DPC PERADI SAI Medan:`,
    ``,
    `• Status NIA: ${niaLabel}`,
    `• Status Pembayaran: ${bayarLabel}`,
  ];

  if (peserta.catatanAdmin) {
    lines.push(``, `Catatan Panitia: ${peserta.catatanAdmin}`);
  }

  if (peserta.statusNia === "aktif" && peserta.statusBayar === "terverifikasi") {
    lines.push(``, `Pendaftaran Anda sudah LENGKAP dan terverifikasi. Sampai jumpa di MUSCAB II! 🙏`);
  } else if (peserta.statusBayar === "ditolak" || peserta.statusNia === "tidak_aktif") {
    lines.push(``, `Mohon segera hubungi Sekretariat DPC untuk menindaklanjuti status di atas.`);
  }

  lines.push(``, `Terima kasih.`, `Panitia MUSCAB II DPC PERADI SAI Medan`);

  return lines.join("\n");
}

function waLink(peserta: Peserta): string {
  const number = toWaNumber(peserta.hp);
  const message = encodeURIComponent(buildWaMessage(peserta));
  return `https://wa.me/${number}?text=${message}`;
}

function statusBayarBadge(status: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    menunggu: { bg: "#fffbeb", fg: "#b45309", label: "Menunggu" },
    terverifikasi: { bg: "#f0fdf4", fg: "#15803d", label: "Terverifikasi" },
    ditolak: { bg: "#fef2f2", fg: "#b91c1c", label: "Ditolak" },
  };
  const s = map[status] ?? map.menunggu;
  return (
    <span style={{ background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function statusNiaBadge(status: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending: { bg: "#f1f5f9", fg: "#475569", label: "Pending" },
    aktif: { bg: "#eff6ff", fg: "#1d4ed8", label: "Aktif" },
    tidak_aktif: { bg: "#fef2f2", fg: "#b91c1c", label: "Tidak Aktif" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useAdminLogin();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ data: { username, password } });
      onSuccess();
    } catch {
      setError("Username atau password salah.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${N}, #1a4a8e)`, padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, background: N, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 28, color: G }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: N }}>Admin DPC PERADI SAI Medan</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Panel Verifikasi Pendaftaran MUSCAB II</div>
        </div>

        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 4 }} />{error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={login.isPending} style={{ justifyContent: "center" }}>
          {login.isPending ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

function PesertaRow({ peserta, role }: { peserta: Peserta; role: AdminSessionRole }) {
  const [expanded, setExpanded] = useState(false);
  const [catatan, setCatatan] = useState(peserta.catatanAdmin ?? "");
  const update = useUpdateAdminPeserta();
  const queryClient = useQueryClient();

  const canEditNia = role === "full_access" || role === "registrasi";
  const canEditBayar = role === "full_access" || role === "keuangan";
  const canEditCatatan = canEditNia || canEditBayar;
  const readOnly = role === "spectator";

  const applyUpdate = async (patch: Partial<{ statusNia: Peserta["statusNia"]; statusBayar: Peserta["statusBayar"]; catatanAdmin: string }>) => {
    if (readOnly) return;
    await update.mutateAsync({ id: peserta.id, data: patch });
    queryClient.invalidateQueries({ queryKey: getListAdminPesertaQueryKey() });
  };

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, cursor: "pointer" }} onClick={() => setExpanded(v => !v)}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: N }}>{peserta.nama}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>NIA: {peserta.nia} · {peserta.hp}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {statusNiaBadge(peserta.statusNia)}
            {statusBayarBadge(peserta.statusBayar)}
          </div>
        </div>
        <i className={`ti ${expanded ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: 18, color: "#94a3b8" }} />
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8, marginBottom: 12 }}>
            <strong>Alamat:</strong> {peserta.alamat}<br />
            <strong>Email:</strong> {peserta.email}<br />
            <strong>Terdaftar:</strong> {new Date(peserta.createdAt).toLocaleString("id-ID")}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <a href={objectStorageUrl(peserta.selfiePath)} target="_blank" rel="noreferrer" className="btn" style={{ fontSize: 12, padding: "6px 12px" }}>
              <i className="ti ti-camera-selfie" />Lihat Selfie
            </a>
            <a href={objectStorageUrl(peserta.fotoKtaPath)} target="_blank" rel="noreferrer" className="btn" style={{ fontSize: 12, padding: "6px 12px" }}>
              <i className="ti ti-id-badge2" />Lihat Foto KTA
            </a>
            <a href={objectStorageUrl(peserta.buktiPath)} target="_blank" rel="noreferrer" className="btn" style={{ fontSize: 12, padding: "6px 12px" }}>
              <i className="ti ti-receipt" />Lihat Bukti Transfer
            </a>
            <a href={waLink(peserta)} target="_blank" rel="noreferrer" className="btn" style={{ fontSize: 12, padding: "6px 12px", background: "#25D366", color: "#fff", border: "1px solid #25D366" }}>
              <i className="ti ti-brand-whatsapp" />Kirim Notif WhatsApp
            </a>
          </div>

          <div className="form-group">
            <label className="form-label">Status NIA</label>
            <select className="form-input" value={peserta.statusNia} disabled={!canEditNia} onChange={e => applyUpdate({ statusNia: e.target.value as Peserta["statusNia"] })}>
              <option value="pending">Pending</option>
              <option value="aktif">Aktif</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status Pembayaran</label>
            <select className="form-input" value={peserta.statusBayar} disabled={!canEditBayar} onChange={e => applyUpdate({ statusBayar: e.target.value as Peserta["statusBayar"] })}>
              <option value="menunggu">Menunggu</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Admin</label>
            <textarea className="form-input" style={{ minHeight: 60 }} value={catatan} disabled={!canEditCatatan} onChange={e => setCatatan(e.target.value)} onBlur={() => applyUpdate({ catatanAdmin: catatan })} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminUsersPanel({ currentUsername }: { currentUsername: string }) {
  const { data: users, isLoading } = useListAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminSessionRole>("spectator");
  const [error, setError] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createUser.mutateAsync({ data: { username, password, role } });
      setUsername("");
      setPassword("");
      setRole("spectator");
      refresh();
    } catch {
      setError("Gagal membuat admin. Username mungkin sudah dipakai.");
    }
  };

  const handleRoleChange = async (user: AdminUser, newRole: AdminSessionRole) => {
    await updateUser.mutateAsync({ id: user.id, data: { role: newRole } });
    refresh();
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Hapus admin "${user.username}"?`)) return;
    await deleteUser.mutateAsync({ id: user.id });
    refresh();
  };

  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-users" /><h2>Kelola Admin</h2></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 12 }}>Tambah Admin Baru</div>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value as AdminSessionRole)}>
              {(Object.keys(ROLE_LABELS) as AdminSessionRole[]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={createUser.isPending}>
            <i className="ti ti-user-plus" />{createUser.isPending ? "Menyimpan..." : "Tambah Admin"}
          </button>
        </form>
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>Memuat data admin...</div>}

      {(users ?? []).map(user => (
        <div key={user.id} className="card" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: N }}>{user.username}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Dibuat: {user.createdAt ? new Date(user.createdAt).toLocaleString("id-ID") : "-"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="form-input"
              style={{ padding: "6px 10px", fontSize: 12, width: "auto" }}
              value={user.role}
              disabled={user.username === currentUsername}
              onChange={e => handleRoleChange(user, e.target.value as AdminSessionRole)}
            >
              {(Object.keys(ROLE_LABELS) as AdminSessionRole[]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button
              className="btn"
              style={{ fontSize: 12, padding: "6px 10px", color: "#b91c1c" }}
              disabled={user.username === currentUsername}
              onClick={() => handleDelete(user)}
            >
              <i className="ti ti-trash" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function InputSuara() {
  const { data: suaraData, refetch } = useGetSuara({ query: { queryKey: getGetSuaraQueryKey(), refetchInterval: 10000 } });
  const updateSuara = useUpdateAdminSuara();
  const queryClient = useQueryClient();

  const KETUA = [
    { name: "Irwan, S.H.", nia: "24.10136" },
    { name: "Fauzan Hakim, S.H., M.H.", nia: "24.10892" },
  ];
  const SEKJEND = [
    { name: "Rizky Pratama, S.H.", nia: "23.10481" },
    { name: "Dewi Sartika Lubis, S.H., M.H.", nia: "23.10754" },
  ];

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const getKey = (posisi: string, calonIndex: number) => `${posisi}-${calonIndex}`;

  const currentVal = (posisi: "ketua" | "sekjend", idx: number) => {
    const k = getKey(posisi, idx);
    if (inputs[k] !== undefined) return inputs[k];
    const arr = posisi === "ketua" ? suaraData?.ketua : suaraData?.sekjend;
    return String(arr?.[idx] ?? 0);
  };

  const handleSave = async (posisi: "ketua" | "sekjend", calonIndex: number) => {
    const k = getKey(posisi, calonIndex);
    const val = parseInt(inputs[k] ?? "0", 10);
    if (isNaN(val) || val < 0) return;
    setSaving(k);
    try {
      await updateSuara.mutateAsync({ data: { posisi, calonIndex, jumlahSuara: val } });
      queryClient.invalidateQueries({ queryKey: getGetSuaraQueryKey() });
      setSaved(k);
      setInputs(prev => { const next = { ...prev }; delete next[k]; return next; });
      setTimeout(() => setSaved(null), 2000);
      refetch();
    } finally {
      setSaving(null);
    }
  };

  const renderCalonRow = (posisi: "ketua" | "sekjend", idx: number, cand: { name: string; nia: string }) => {
    const k = getKey(posisi, idx);
    const isSaving = saving === k;
    const isSaved = saved === k;
    const liveVal = posisi === "ketua" ? suaraData?.ketua?.[idx] : suaraData?.sekjend?.[idx];
    const total = (posisi === "ketua" ? suaraData?.ketua : suaraData?.sekjend)?.reduce((a, b) => a + b, 0) || 1;
    const pct = Math.round((liveVal ?? 0) / total * 100);

    return (
      <div key={k} className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: N, marginBottom: 4 }}>{cand.name}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>NIA: {cand.nia} · Live: <strong>{liveVal ?? 0} suara ({pct}%)</strong></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="number"
            min={0}
            className="form-input"
            style={{ width: 100 }}
            value={currentVal(posisi, idx)}
            onChange={e => setInputs(prev => ({ ...prev, [k]: e.target.value }))}
          />
          <button
            className="btn btn-primary"
            style={{ fontSize: 12 }}
            disabled={isSaving}
            onClick={() => handleSave(posisi, idx)}
          >
            {isSaving ? <><i className="ti ti-loader-2" />Menyimpan...</> : isSaved ? <><i className="ti ti-check" />Tersimpan</> : <><i className="ti ti-device-floppy" />Simpan</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-chart-bar" /><h2>Input Suara Rekapan Live</h2></div>
      <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#78350f", marginBottom: 16 }}>
        <i className="ti ti-info-circle" style={{ marginRight: 4 }} />
        Data ini langsung tampil di halaman publik "/hasil" dan di-refresh otomatis setiap 15 detik.
      </div>

      <div style={{ fontWeight: 800, fontSize: 12, color: N, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>
        <i className="ti ti-trophy" style={{ marginRight: 4, color: "#C9A227" }} />Ketua DPC
      </div>
      {KETUA.map((c, i) => renderCalonRow("ketua", i, c))}

      <div style={{ fontWeight: 800, fontSize: 12, color: N, marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: .5 }}>
        <i className="ti ti-trophy" style={{ marginRight: 4, color: "#C9A227" }} />Sekretaris Jenderal
      </div>
      {SEKJEND.map((c, i) => renderCalonRow("sekjend", i, c))}
    </div>
  );
}

function TandaiHadir() {
  const { data: pesertaList, isLoading } = useListAdminPeserta();
  const update = useUpdateAdminPeserta();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");

  const filtered = (pesertaList ?? []).filter(p => {
    if (!q.trim()) return true;
    const kw = q.toLowerCase();
    return p.nama.toLowerCase().includes(kw) || p.nia.toLowerCase().includes(kw);
  });

  const totalHadir = (pesertaList ?? []).filter(p => p.hadir).length;

  const toggleHadir = async (p: Peserta) => {
    await update.mutateAsync({ id: p.id, data: { hadir: !p.hadir } });
    queryClient.invalidateQueries({ queryKey: getListAdminPesertaQueryKey() });
  };

  return (
    <div>
      <div className="sec-hdr"><i className="ti ti-qrcode" /><h2>Tandai Hadir</h2></div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 100 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: N }}>{totalHadir}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Sudah Hadir</div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 100 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#b45309" }}>{(pesertaList ?? []).length - totalHadir}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Belum Hadir</div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 100 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>{(pesertaList ?? []).length}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Total Peserta</div>
        </div>
      </div>

      <div className="checkin-search">
        <input
          placeholder="Cari nama atau NIA..."
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
        {q && (
          <button className="btn" style={{ fontSize: 12 }} onClick={() => setQ("")}>
            <i className="ti ti-x" />
          </button>
        )}
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Memuat data...</div>}
      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          {q ? "Peserta tidak ditemukan." : "Belum ada pendaftaran."}
        </div>
      )}

      {filtered.map(p => (
        <div key={p.id} className="member-row" style={{ background: p.hadir ? "#f0fdf4" : undefined, borderColor: p.hadir ? "#86efac" : undefined }}>
          <button
            className={`chk-btn ${p.hadir ? "on" : ""}`}
            onClick={() => toggleHadir(p)}
            title={p.hadir ? "Tandai Belum Hadir" : "Tandai Hadir"}
          >
            {p.hadir && <i className="ti ti-check" />}
          </button>
          <div className="member-info">
            <div className="member-name" style={{ color: p.hadir ? "#15803d" : N }}>{p.nama}</div>
            <div className="member-nia">NIA: {p.nia} · {p.hp}</div>
          </div>
          <div>
            {p.statusBayar === "terverifikasi"
              ? <span style={{ background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>Lunas</span>
              : p.statusBayar === "ditolak"
                ? <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>Ditolak</span>
                : <span style={{ background: "#fffbeb", color: "#b45309", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>Menunggu</span>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard({
  username,
  role,
  onLogout,
}: {
  username: string;
  role: AdminSessionRole;
  onLogout: () => void;
}) {
  const { data: pesertaList, isLoading } = useListAdminPeserta();
  const logout = useAdminLogout();
  const [filter, setFilter] = useState<"semua" | "menunggu" | "terverifikasi" | "ditolak">("semua");
  const [view, setView] = useState<"peserta" | "hadir" | "rekapan" | "admin">("peserta");

  const handleLogout = async () => {
    await logout.mutateAsync();
    onLogout();
  };

  const filtered = (pesertaList ?? []).filter(p => filter === "semua" || p.statusBayar === filter);

  const canHadir = role === "full_access" || role === "registrasi";
  const canRekapan = role === "full_access" || role === "registrasi";

  const handleExportCSV = () => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
    window.open(`${base}/api/admin/peserta/export`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header className="hdr" style={{ background: N }}>
        <div className="hdr-info">
          <div className="hdr-title">Admin Panel DPC PERADI SAI Medan</div>
          <div className="hdr-sub">
            {username} · {ROLE_LABELS[role]}
          </div>
        </div>
        <button className="btn" style={{ fontSize: 12 }} onClick={handleLogout}>
          <i className="ti ti-logout" />Keluar
        </button>
      </header>

      <main className="content" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <button className={`tab-btn ${view === "peserta" ? "active" : ""}`} onClick={() => setView("peserta")}>
            <i className="ti ti-list-check" />Peserta
          </button>
          {canHadir && (
            <button className={`tab-btn ${view === "hadir" ? "active" : ""}`} onClick={() => setView("hadir")}>
              <i className="ti ti-qrcode" />Tandai Hadir
            </button>
          )}
          {canRekapan && (
            <button className={`tab-btn ${view === "rekapan" ? "active" : ""}`} onClick={() => setView("rekapan")}>
              <i className="ti ti-chart-bar" />Input Suara
            </button>
          )}
          {role === "full_access" && (
            <button className={`tab-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>
              <i className="ti ti-users" />Kelola Admin
            </button>
          )}
        </div>

        {view === "admin" && role === "full_access" ? (
          <AdminUsersPanel currentUsername={username} />
        ) : view === "hadir" && canHadir ? (
          <TandaiHadir />
        ) : view === "rekapan" && canRekapan ? (
          <InputSuara />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div className="sec-hdr" style={{ marginBottom: 0 }}><i className="ti ti-list-check" /><h2>Daftar Peserta ({pesertaList?.length ?? 0})</h2></div>
              <button className="btn" style={{ fontSize: 12, color: "#15803d", borderColor: "#86efac" }} onClick={handleExportCSV}>
                <i className="ti ti-file-spreadsheet" />Export CSV
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {(["semua", "menunggu", "terverifikasi", "ditolak"] as const).map(f => (
                <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>
                  {f}
                </button>
              ))}
            </div>

            {isLoading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Memuat data...</div>}
            {!isLoading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Belum ada pendaftaran.</div>
            )}
            {filtered.map(p => <PesertaRow key={p.id} peserta={p} role={role} />)}
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminPanel() {
  const { data: session, isLoading } = useAdminMe();
  const [loggedIn, setLoggedIn] = useState(false);

  if (isLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Memuat...</div>;
  }

  const authenticated = loggedIn || !!session;

  if (!authenticated || !session?.username || !session?.role) {
    return <LoginForm onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <Dashboard
      username={session.username}
      role={session.role}
      onLogout={() => setLoggedIn(false)}
    />
  );
}
