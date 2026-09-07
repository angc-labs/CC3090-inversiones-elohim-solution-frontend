import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3 } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { BlogImage } from "@/components/BlogImage";

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#060d14] text-slate-100">
      <header className="border-b border-slate-800/70"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 lg:px-8"><Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#66e8c1]"><ArrowLeft size={16} /> Todos los casos</Link><Link href="/" className="text-sm font-bold text-white">DM Hub</Link></div></header>
      <article>
        <section className="relative mx-auto max-w-5xl px-5 pb-20 pt-20 lg:px-8 lg:pt-28"><div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#22D3A6]/10 blur-[120px]" /><div className="relative max-w-4xl"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#66e8c1]">{post.category}</span><h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">{post.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">{post.excerpt}</p><div className="mt-8 flex items-center gap-3 text-sm text-slate-500"><Clock3 size={16} /> {post.date} <span>·</span> {post.readTime} de lectura</div></div></section>
        <section className="mx-auto max-w-5xl px-5 lg:px-8"><div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#123c3b] via-[#10242c] to-[#0b1320]"><BlogImage src={post.image} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-[#060d14]/60 to-transparent" /></div></section>
        <section className="mx-auto grid max-w-5xl gap-14 px-5 py-20 lg:grid-cols-[1fr_280px] lg:px-8"><div className="space-y-16"><Section title={post.challenge.title} paragraphs={post.challenge.paragraphs} /><Section title={post.solution.title} paragraphs={post.solution.paragraphs} /><div><h2 className="text-2xl font-bold text-white">El flujo</h2><ol className="mt-7 space-y-5">{post.flow.map((step, index) => <li key={step} className="flex gap-4 text-base leading-7 text-slate-400"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#22D3A6]/15 text-sm font-bold text-[#66e8c1]">{index + 1}</span>{step}</li>)}</ol></div><div><h2 className="text-2xl font-bold text-white">El resultado</h2><p className="mt-5 text-lg leading-8 text-slate-400">{post.result}</p></div></div><aside className="h-fit rounded-2xl border border-slate-800 bg-[#0b1720] p-6"><h2 className="text-sm font-bold uppercase tracking-wider text-white">Funcionalidades usadas</h2><ul className="mt-5 space-y-4">{post.features.map((feature) => <li key={feature} className="flex gap-3 text-sm leading-5 text-slate-400"><Check size={16} className="mt-0.5 shrink-0 text-[#22D3A6]" />{feature}</li>)}</ul></aside></section>
      </article>
      <section className="border-t border-slate-800/70 bg-[#08151d] px-5 py-20 text-center"><h2 className="text-3xl font-bold text-white">Haz espacio para tu próximo resultado.</h2><Link href="/register?role=administrador" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22D3A6] px-6 py-3 text-sm font-bold text-slate-950 hover:bg-[#66e8c1]">Crear mi tienda <ArrowRight size={16} /></Link></section>
    </main>
  );
}

function Section({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return <section><h2 className="text-2xl font-bold text-white">{title}</h2><div className="mt-5 space-y-4 text-base leading-7 text-slate-400">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>;
}
