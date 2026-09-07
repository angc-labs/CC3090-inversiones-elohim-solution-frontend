import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { BlogCard } from "@/components/BlogCard";
import { blogPosts } from "@/lib/blog";

export default function BlogPage() {
  const [featured, ...posts] = blogPosts;

  return (
    <main className="min-h-screen overflow-hidden bg-[#060d14] text-slate-100">
      <header className="border-b border-slate-800/70 bg-[#060d14]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3"><img src="/logo.png" alt="DM Hub" className="h-8 w-auto" /><span className="hidden text-sm font-bold tracking-wide text-slate-300 sm:inline">Historias que venden</span></Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#66e8c1]"><ArrowLeft size={16} /> Volver al inicio</Link>
        </div>
      </header>
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-24 lg:px-8 lg:pt-32">
        <div className="pointer-events-none absolute -top-20 right-0 h-96 w-96 rounded-full bg-[#22D3A6]/10 blur-[120px]" />
        <div className="relative max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22D3A6]/25 bg-[#22D3A6]/5 px-3 py-1.5 text-xs font-semibold text-[#66e8c1]"><BookOpen size={14} /> Casos reales de crecimiento</div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">Ideas para construir una operación que avance contigo.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Historias de negocios que convirtieron procesos dispersos en experiencias digitales claras, medibles y listas para crecer.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <BlogCard post={featured} featured />
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
      </section>
      <section className="border-t border-slate-800/70 bg-[#08151d] px-5 py-20 text-center"><Sparkles className="mx-auto mb-5 text-[#22D3A6]" size={24} /><h2 className="text-3xl font-bold text-white">Tu siguiente historia empieza aquí.</h2><p className="mx-auto mt-4 max-w-lg text-slate-400">Dale a tu negocio una base digital que se sienta tan propia como tu forma de trabajar.</p><Link href="/register?role=administrador" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22D3A6] px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#66e8c1]">Crear mi tienda <ArrowRight size={16} /></Link></section>
    </main>
  );
}
