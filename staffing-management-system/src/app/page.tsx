import Link from "next/link";
import { Building2, Shield, Users, FolderKanban } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const features = [
    {
      icon: Building2,
      title: "Multi-Tenant Organizations",
      description:
        "Each staffing company operates independently with complete data isolation.",
    },
    {
      icon: Users,
      title: "External Entity Management",
      description:
        "Manage vendors, consultants, and salespeople with full CRUD and search.",
    },
    {
      icon: FolderKanban,
      title: "Project Hub",
      description:
        "Link clients, rates, commissions, and documents in one central workflow.",
    },
    {
      icon: Shield,
      title: "Secure & Role-Based",
      description:
        "JWT authentication with Admin, PM, and Salesperson permission levels.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-400/20 dark:bg-brand-900/40 blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-900/40 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">Staffing MS</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/select-login"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all hover:-translate-y-0.5 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
          Enterprise Grade Staffing Platform
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400">
          Streamline your entire staffing workflow.
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          A centralized, premium platform to manage consultants, vendors, sales teams,
          projects, commissions, and documents for US staffing companies. Built for scale.
        </p>
        <div className="mt-12 flex justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/select-login"
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white/50 px-8 py-4 text-base font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-slate-900 dark:border-dark-border dark:bg-dark-card/50 dark:text-slate-300 dark:hover:bg-dark-card dark:hover:text-white"
          >
            Learn More
          </Link>
        </div>

        <div id="features" className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group glass-card rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 dark:bg-brand-900/30 dark:text-brand-400 dark:group-hover:bg-brand-500 dark:group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
