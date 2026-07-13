import Link from "next/link";
import { Building2, Shield, Users } from "lucide-react";

export default function SelectLoginPage() {
  const loginOptions = [
    {
      title: "Admin Portal",
      description: "For internal staff and managers.",
      href: "/admin/login",
      icon: Shield,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Vendor Portal",
      description: "For staffing partners and vendors.",
      href: "/vendor/login",
      icon: Building2,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Consultant Portal",
      description: "For active consultants on billing.",
      href: "/consultant/login",
      icon: Users,
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors py-20 overflow-hidden flex items-center justify-center">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 dark:bg-brand-900/40 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-900/40 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center w-full">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">Select Login Portal</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">Choose your portal to access the system.</p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {loginOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group block glass-card rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-500/10"
            >
              <div className={`inline-flex rounded-2xl p-4 ${option.color} transition-transform duration-300 group-hover:scale-110`}>
                <option.icon className="h-8 w-8" />
              </div>
              <h2 className="mt-8 text-2xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {option.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{option.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <Link href="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
