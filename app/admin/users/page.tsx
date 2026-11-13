"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, ShieldCheck, User, Lock, Mail, Phone } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, email, phone, password, role }),
      });
      if (res.ok) {
        setShowModal(false);
        setUsername("");
        setFullName("");
        setEmail("");
        setPassword("");
        fetchUsers();
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Manajemen Admin & Staf Operasional
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Kelola akun pengelola studio, peran akses (Super Admin & Admin Operasional).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Admin / Staf</span>
        </button>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9D7CF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Daftar Pengguna Administrator
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-olive font-semibold">
            {users.length} Akun Terdaftar
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
            Memuat daftar pengguna...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] border-b border-[#D9D7CF] text-[10px] font-mono uppercase text-deep-charcoal/60">
                <tr>
                  <th className="p-4">Identitas Pengguna</th>
                  <th className="p-4">Email & Kontak</th>
                  <th className="p-4">Hak Akses Role</th>
                  <th className="p-4">Status Akun</th>
                  <th className="p-4">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-4">
                      <span className="font-bold text-deep-charcoal block">{u.fullName}</span>
                      <span className="text-[10px] font-mono text-deep-charcoal/60">@{u.username}</span>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="text-deep-charcoal">{u.email}</div>
                      <div className="text-[10px] font-mono text-deep-charcoal/60">{u.phone || "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-muted-olive/15 text-muted-olive font-mono font-bold text-[10px] rounded-xs">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[10px] rounded-xs">
                        Aktif
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-deep-charcoal/60">
                      {new Date(u.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#D9D7CF] pb-4">
              <h3 className="text-lg font-display font-bold text-deep-charcoal">
                Tambah Akun Admin Baru
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-deep-charcoal/50 hover:text-deep-charcoal font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-deep-charcoal mb-1">Peran Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs font-mono"
                  >
                    <option value="ADMIN">ADMIN OPERASIONAL</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Nomor Telepon/WA</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#D9D7CF] flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D9D7CF] text-deep-charcoal font-semibold rounded-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-deep-charcoal text-warm-ivory font-semibold rounded-xs hover:bg-muted-olive transition-colors"
                >
                  Buat Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
