import { Cpu, Brain, Bell } from "lucide-react";

const steps = [
  {
    icon: Cpu,
    num: "01",
    title: "Dois módulos se comunicam",
    body: "Um par de módulos ESP32 troca sinal de Wi-Fi entre si, cobrindo o ambiente sem usar câmeras.",
    accent: "text-[#B8A8D4]",
  },
  {
    icon: Brain,
    num: "02",
    title: "IA analisa o sinal",
    body: "Uma queda causa interferências características nesse sinal Wi-Fi. Nossa IA reconhece esse padrão em tempo real.",
    accent: "text-[#E8A0C0]",
  },
  {
    icon: Bell,
    num: "03",
    title: "Alerta chega ao dashboard",
    body: "O evento aparece no seu painel na hora, para você agir em segundos, não horas.",
    accent: "text-[#90B8D8]",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Tecnologia simples
        </p>
        <h2 className="mb-20 max-w-xl text-4xl font-bold tracking-tight text-neutral-900">
          Como o SeniorCare funciona
        </h2>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num}>
                <p className={`mb-4 text-5xl font-black ${s.accent} opacity-30`}>{s.num}</p>
                <Icon className={`mb-5 h-8 w-8 ${s.accent}`} />
                <h3 className="mb-2 text-xl font-semibold text-neutral-900">{s.title}</h3>
                <p className="leading-relaxed text-neutral-500">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
