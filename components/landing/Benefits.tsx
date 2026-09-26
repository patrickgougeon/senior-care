import { Clock, Zap, WifiOff, Lock, BarChart2, Heart } from "lucide-react";

const items = [
  { icon: Clock,     title: "Monitoramento 24/7",   body: "Proteção contínua, sem intervenção manual." },
  { icon: Zap,       title: "Alerta em segundos",   body: "Assim que uma queda é identificada, o alerta já aparece no seu dashboard." },
  { icon: WifiOff,   title: "Funciona offline",     body: "Opera localmente — sem depender de internet." },
  { icon: Lock,      title: "Sem câmeras",          body: "Privacidade total. Detecção por sinal Wi-Fi entre dois módulos, sem captura de imagem." },
  { icon: BarChart2, title: "Histórico completo",   body: "Acompanhe eventos e padrões para relatórios médicos." },
  { icon: Heart,     title: "Fácil de instalar",    body: "Plug and play. Sem obras, sem fiação." },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Por que escolher
        </p>
        <h2 className="mb-16 max-w-xl text-4xl font-bold tracking-tight text-neutral-900">
          Tudo que você precisa para ter tranquilidade
        </h2>

        <div className="grid gap-px bg-neutral-100 sm:grid-cols-2 lg:grid-cols-3 rounded-3xl overflow-hidden">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white p-8 transition hover:bg-[#EDE9E1]">
                <Icon className="mb-5 h-6 w-6 text-neutral-400" />
                <h3 className="mb-2 font-semibold text-neutral-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
