import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSortedPostsData } from "@/lib/markdown";

export default function BlogIndexPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-[#0c141c] text-[#dbe3ef] font-sans selection:bg-[#22D3A6] selection:text-[#00382a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c141c]/80 backdrop-blur-xl border-b border-[#3c4a44]/60">
        <div className="h-16 max-w-[900px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} className="text-[#22D3A6]" />
            Volver a DMHub
          </Link>
          <div className="text-lg font-bold" style={{ fontFamily: "'Geist', sans-serif" }}>
            DMHub <span className="text-[#22D3A6]">Blog</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[700px] mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
          Novedades y Artículos
        </h1>
        <p className="text-lg text-slate-400 mb-16">
          Explora los últimos artículos sobre arquitectura, logística B2B y el desarrollo detrás de DMHub.
        </p>

        <div className="flex flex-col gap-12">
          {posts.map((post) => (
            <article key={post.slug} className="group flex flex-col gap-3">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold text-slate-100 group-hover:text-[#22D3A6] transition-colors leading-snug" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {post.metadata.title}
                </h2>
              </Link>
              <p className="text-[15px] text-slate-400 leading-relaxed line-clamp-3">
                {post.metadata.description}
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="font-medium text-slate-300">{post.metadata.author}</span>
                <span>•</span>
                <time dateTime={post.metadata.date}>{new Date(post.metadata.date).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                {post.metadata.tags && post.metadata.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex gap-2">
                      {post.metadata.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-[#182029] border border-[#3c4a44]/50 text-xs text-[#7bd0ff]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              Aún no hay artículos publicados.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
