import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostData, getSortedPostsData } from "@/lib/markdown";

// Export generateStaticParams if we want to statically generate these routes at build time
export function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const postData = getPostData(resolvedParams.slug);

  if (!postData) {
    notFound();
  }

  const { title, description, author, date, tags, faq } = postData.metadata;

  return (
    <div className="min-h-screen bg-[#0c141c] text-[#dbe3ef] font-sans selection:bg-[#22D3A6] selection:text-[#00382a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c141c]/80 backdrop-blur-xl border-b border-[#3c4a44]/60">
        <div className="h-16 max-w-[900px] mx-auto px-6 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft size={16} className="text-[#22D3A6]" />
            Volver al Blog
          </Link>
          <div className="text-lg font-bold" style={{ fontFamily: "'Geist', sans-serif" }}>
            DMHub <span className="text-[#22D3A6]">Blog</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[700px] mx-auto px-6 py-16">
        
        {/* Article Header */}
        <header className="mb-12">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[#182029] border border-[#3c4a44]/50 text-xs font-medium text-[#7bd0ff] uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.02em] text-white leading-tight mb-6" style={{ fontFamily: "'Geist', sans-serif" }}>
            {title}
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed mb-8">
            {description}
          </p>
          
          <div className="flex items-center gap-4 pt-6 border-t border-[#3c4a44]/40">
            <div className="w-12 h-12 rounded-full bg-[#232b33] border border-[#3c4a44]/80 flex items-center justify-center font-bold text-[#22D3A6] text-xl">
              {author.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-slate-200">{author}</div>
              <div className="text-sm text-slate-500">
                Publicado el {new Date(date).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </header>

        {/* Markdown Content (Medium Style with Typography Plugin) */}
        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-a:text-[#22D3A6] hover:prose-a:text-[#50f0c1] prose-pre:bg-[#182029] prose-pre:border prose-pre:border-[#3c4a44]/50 prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {postData.content}
          </ReactMarkdown>
        </article>

        {/* FAQ Section */}
        {faq && faq.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#3c4a44]/40">
            <h3 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "'Geist', sans-serif" }}>
              Preguntas Frecuentes
            </h3>
            <div className="flex flex-col gap-6">
              {faq.map((item, index) => (
                <div key={index} className="p-6 rounded-2xl bg-[#182029]/60 border border-[#3c4a44]/40">
                  <h4 className="text-lg font-medium text-slate-200 mb-3">{item.question}</h4>
                  <p className="text-slate-400 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
