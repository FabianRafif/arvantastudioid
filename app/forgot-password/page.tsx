"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Simulate/request reset link
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success message for security so account enumeration is prevented
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg("Terjadi kendala saat mengirim instruksi reset kata sandi.");
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
          Pemulihan Kata Sandi
        </h2>
        <p className="text-xs text-deep-charcoal/70">
          Masukkan alamat email yang terdaftar pada akun Arvanta Studio Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-[#D9D7CF] py-8 px-6 sm:px-10 rounded-xs shadow-xs space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-deep-charcoal">
                Instruksi Terkirim
              </h3>
              <p className="text-xs text-deep-charcoal/70 leading-relaxed">
                Jika email <span className="font-semibold text-deep-charcoal">{email}</span> terdaftar dalam sistem kami, Anda akan menerima tautan reset kata sandi dalam beberapa menit.
              </p>
              <div className="pt-4 border-t border-[#D9D7CF]/60">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-deep-charcoal hover:text-muted-olive transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-deep-charcoal mb-1">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs focus:outline-hidden focus:border-deep-charcoal"
                  />
                  <Mail className="w-4 h-4 text-deep-charcoal/40 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Mengirim Permintaan..." : "Kirim Tautan Pemulihan"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-deep-charcoal/70 hover:text-deep-charcoal transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
