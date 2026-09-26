import { Home, Users } from "lucide-react";

const cases = [
  {
    icon: Home,
    tag: "Autonomia com segurança",
    title: "Idoso que mora sozinho",
    body: "Para quem vive de forma independente, uma queda sem socorro pode ser fatal. O SeniorCare mostra o alerta no dashboard assim que detecta o evento.",
    bg: "bg-white",
    iconColor: "text-[#B8A8D4]",
  },
  {
    icon: Users,
    tag: "Proteção quando você não pode estar",
    title: "Idoso que mora com a família",
    body: "Mesmo morando juntos, não é possível vigiar alguém a cada segundo. Quando você está no trabalho, dormindo ou em outro cômodo.",
    bg: "bg-white",
    iconColor: "text-[#E8A0C0]",
  },
];

export function ForWhom() {
  return (
    <section id="para-quem" className="bg-[#EDE9E1] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Para quem é
        </p>
        <h2 className="mb-16 text-4xl font-bold tracking-tight text-neutral-900">
          Para cada situação
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className={`rounded-3xl p-10 ${c.bg}`}>
                <Icon className={`mb-6 h-8 w-8 ${c.iconColor}`} />
                <span className="mb-3 inline-block rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
                  {c.tag}
                </span>
                <h3 className="mb-3 mt-3 text-2xl font-bold text-neutral-900">{c.title}</h3>
                <p className="leading-relaxed text-neutral-500">{c.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
