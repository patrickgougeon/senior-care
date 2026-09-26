"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Como o dispositivo detecta uma queda sem câmeras?",
    answer:
      "O SeniorCare usa dois módulos ESP32 que se comunicam por Wi-Fi. Um movimento brusco, como uma queda, causa interferências características nesse sinal. Um modelo de IA analisa essas variações em tempo real e identifica quando algo assim aconteceu.",
  },
  {
    question: "Preciso de internet para o sistema funcionar?",
    answer:
      "A detecção em si acontece localmente, pelo sinal Wi-Fi trocado entre os dois módulos. A internet é usada para que o alerta apareça no seu dashboard assim que um evento é identificado.",
  },
  {
    question: "O sistema usa câmeras?",
    answer:
      "Não. A detecção é feita por análise do sinal de Wi-Fi entre os dois módulos, sem captura de imagem ou som. A privacidade do idoso é preservada o tempo todo.",
  },
  {
    question: "Quanto tempo leva para instalar?",
    answer:
      "A instalação é plug and play, sem obras ou fiação. Na maioria dos casos, o dispositivo fica pronto para uso em poucos minutos.",
  },
  {
    question: "Quantos contatos de emergência posso cadastrar?",
    answer:
      "Você pode cadastrar quantos contatos quiser. Por enquanto eles ficam salvos para consulta rápida — o alerta em si aparece no seu dashboard; o envio automático de notificação para os contatos ainda está em desenvolvimento.",
  },
  {
    question: "O que acontece se a energia ou a internet cair?",
    answer:
      "O monitoramento local continua funcionando sem internet. Em caso de queda de energia, o dispositivo é projetado para retomar o funcionamento assim que a alimentação for restabelecida.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer:
      "Sim. Os dados de eventos e histórico são armazenados de forma segura e usados apenas para o funcionamento do serviço e para relatórios que você mesmo solicitar.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#EDE9E1] py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Perguntas frequentes
        </p>
        <h2 className="mb-16 max-w-xl text-4xl font-bold tracking-tight text-neutral-900">
          Tudo que você precisa saber
        </h2>

        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="rounded-2xl bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-neutral-900">{faq.question}</span>
                  <Plus
                    className={`h-5 w-5 flex-shrink-0 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="px-6 pb-6 leading-relaxed text-neutral-500">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
