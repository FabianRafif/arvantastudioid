"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Token pemulihan tidak valid atau telah kedaluwarsa.");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengatur ulang kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-deep-charcoal">
          Kata Sandi Berhasil Diperbarui
        </h3>
        <p className="text-xs text-deep-charcoal/70 leading-relaxed">
          Kata sandi baru Anda telah aktif. Silakan masuk menggunakan kata sandi yang baru.
        </p>
        <div className="pt-4 border-t border-[#D9D7CF]/60">
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
          Kata Sandi Baru
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

      <div>
        <label className="block text-xs font-semibold text-deep-charcoal mb-1">
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative">
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi baru"
            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
          />
          <Lock className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Menyimpan Perubahan..." : "Perbarui Kata Sandi"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-deep-charcoal">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center">
          <Logo variant="dark" size="lg" withTagline={true} href="/" />
        </div>
        <h2 className="text-2xl font-display font-bold text-deep-charcoal pt-2">
          Atur Ulang Kata Sandi
        </h2>
        <p className="text-xs text-deep-charcoal/70">
          Masukkan kata sandi baru yang kuat untuk mengamankan akun Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-[#D9D7CF] py-8 px-6 sm:px-10 rounded-xs shadow-xs space-y-6">
          <Suspense fallback={<div className="text-xs text-center py-6 font-mono">Memuat...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
