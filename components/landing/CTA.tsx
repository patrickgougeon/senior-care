import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-3xl bg-neutral-900 px-12 py-20 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Comece a proteger sua família hoje
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-lg text-neutral-400">
            Cadastre-se, configure seus contatos de emergência e tenha o dispositivo instalado em minutos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-white/40">
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
