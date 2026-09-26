import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#EDE9E1]">
      <header className="px-6 py-5">
        <Link href="/" className="text-base font-bold text-neutral-900">
          SeniorCare
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
