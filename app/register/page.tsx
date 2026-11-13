"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, User, Mail, Phone, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      window.location.href = data.redirectUrl || "/dashboard";
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-deep-charcoal">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo variant="dark" size="lg" withTagline={true} href="/" />
        </div>
        <h2 className="text-2xl font-display font-bold text-deep-charcoal pt-2">
          Daftar Akun Pelanggan
        </h2>
        <p className="text-xs text-deep-charcoal/70">
          Buat akun untuk melakukan pemesanan, melihat tagihan, dan melacak progres pengerjaan sistem Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-[#D9D7CF] py-8 px-6 sm:px-10 rounded-xs shadow-xs space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Nama Lengkap / Nama Bisnis
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: PT Arvanta Digital Sejahtera"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
                <User className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Username Pilihan
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="huruf_kecil_tanpa_spasi"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
                <User className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Alamat Email Aktif
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
                <Mail className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Nomor WhatsApp (Aktif)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789 atau 628123456789"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
                <Phone className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                />
                <Lock className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? "Memproses Akun..." : "Daftar Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#D9D7CF]/60 text-center space-y-3">
            <p className="text-xs text-deep-charcoal/70">
              Sudah memiliki akun terdaftar?{" "}
              <Link href="/login" className="font-semibold text-deep-charcoal hover:underline">
                Masuk ke Akun
              </Link>
            </p>

            <p className="text-[11px] text-deep-charcoal/50 leading-relaxed">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link href="/terms" className="underline hover:text-deep-charcoal">
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="/privacy" className="underline hover:text-deep-charcoal">
                Kebijakan Privasi
              </Link>{" "}
              Arvanta Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
