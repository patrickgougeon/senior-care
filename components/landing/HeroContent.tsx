import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroContent() {
  return (
    <section className="bg-[#EDE9E1] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Monitoramento 24 horas por dia
        </p>
        <h1 className="mb-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-neutral-900 lg:text-6xl">
          Proteja quem você ama, mesmo à distância
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-neutral-500">
          O SeniorCare detecta quedas automaticamente e o alerta aparece no seu dashboard
          em segundos — mesmo quando você está em outro cômodo ou no trabalho.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/register" className="btn-primary px-8 py-3.5 text-base">
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#como-funciona" className="btn-ghost text-base">
            Como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
