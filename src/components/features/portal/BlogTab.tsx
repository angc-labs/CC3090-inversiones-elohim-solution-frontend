"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { BlogCard } from "@/components/BlogCard";
import { blogPosts } from "@/lib/blog";

export function BlogTab() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#22D3A6]">Contenido</p><h1 className="mt-2 text-3xl font-black text-white">Blog</h1><p className="mt-2 text-sm text-slate-400">Casos y aprendizajes para hacer crecer tu operación.</p></div><Link href="/blog" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-[#22D3A6] hover:text-white">Ver blog público <ArrowUpRight size={16} /></Link></div>
      <div className="grid gap-6 lg:grid-cols-2"><BlogCard post={blogPosts[0]} featured /><div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-7"><BookOpen className="text-[#22D3A6]" size={22} /><h2 className="mt-5 text-xl font-bold text-white">Diez historias listas para compartir</h2><p className="mt-3 text-sm leading-6 text-slate-400">El blog público presenta los casos de forma editorial. Mantén aquí una vista rápida del contenido disponible para tu equipo.</p><div className="mt-7 text-3xl font-black text-white">{blogPosts.length}<span className="ml-2 text-sm font-normal text-slate-500">casos publicados</span></div></div></div>
    </div>
  );
}
