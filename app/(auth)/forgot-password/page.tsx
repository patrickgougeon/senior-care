"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Erro ao processar solicitação. Tente novamente.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
          <Mail className="h-8 w-8 text-teal-700" />
        </div>
        <h1 className="mb-3 text-2xl font-extrabold text-gray-900">Verifique seu email</h1>
        <p className="mb-6 text-base text-gray-600">
          Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá um link para
          redefinir sua senha em breve.
        </p>
        <p className="mb-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800 ring-1 ring-yellow-200">
          <strong>Modo MVP:</strong> o envio de email ainda não está integrado. Em desenvolvimento, o
          token de recuperação aparece no console do servidor.
        </p>
        <Link href="/login" className="btn-primary w-full justify-center">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-8">
        <Link
          href="/login"
          className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Recuperar senha</h1>
        <p className="mt-2 text-base text-gray-500">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input-field"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 w-full justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enviando…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar link de recuperação
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
