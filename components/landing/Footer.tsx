import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row lg:px-10">
        <span className="text-base font-bold text-neutral-900">SeniorCare</span>

        <nav className="flex flex-wrap justify-center gap-6 text-sm text-neutral-400">
          <a href="#como-funciona" className="hover:text-neutral-700">Como funciona</a>
          <a href="#beneficios"    className="hover:text-neutral-700">Benefícios</a>
          <Link href="/login"      className="hover:text-neutral-700">Entrar</Link>
          <Link href="/register"   className="hover:text-neutral-700">Criar conta</Link>
        </nav>

        <p className="text-sm text-neutral-300">© {new Date().getFullYear()} SeniorCare</p>
      </div>
    </footer>
  );
}
