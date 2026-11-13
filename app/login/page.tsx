"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, User, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan login.");
      }

      window.location.href = data.redirectUrl || redirect;
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
          Username atau Email
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username atau email terdaftar"
            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
          />
          <User className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-deep-charcoal">
            Kata Sandi
          </label>
          <Link
            href="/forgot-password"
            className="text-[11px] text-muted-olive hover:underline font-medium"
          >
            Lupa Password?
          </Link>
        </div>
        <div className="relative">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
          />
          <Lock className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
      >
        <span>{loading ? "Memverifikasi..." : "Masuk ke Sistem"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-deep-charcoal">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo variant="dark" size="lg" withTagline={true} href="/" />
        </div>
        <h2 className="text-2xl font-display font-bold text-deep-charcoal pt-2">
          Masuk ke Akun Anda
        </h2>
        <p className="text-xs text-deep-charcoal/70">
          Gunakan username dan kata sandi Anda untuk mengakses dashboard pesanan, penawaran, dan tagihan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-[#D9D7CF] py-8 px-6 sm:px-10 rounded-xs shadow-xs space-y-6">
          <Suspense fallback={<div className="text-xs text-center py-6 font-mono">Memuat formulir...</div>}>
            <LoginForm />
          </Suspense>

          <div className="pt-4 border-t border-[#D9D7CF]/60 text-center space-y-3">
            <p className="text-xs text-deep-charcoal/70">
              Belum memiliki akun?{" "}
              <Link href="/register" className="font-semibold text-deep-charcoal hover:underline">
                Daftar Pelanggan Baru
              </Link>
            </p>

            <div className="p-3 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs text-[11px] text-deep-charcoal/60 text-center font-mono">
              Autentikasi terenkripsi aman • Akses instan ke Dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
