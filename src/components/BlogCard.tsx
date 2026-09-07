import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { BlogImage } from "@/components/BlogImage";

type BlogCardProps = {
  post: BlogPost;
  featured?: boolean;
};

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1720] ${featured ? "md:grid md:grid-cols-[1.15fr_1fr]" : ""}`}>
      <div className={`relative overflow-hidden bg-slate-900 ${featured ? "min-h-72 md:min-h-full" : "aspect-[16/10]"}`}>
        <BlogImage
          src={post.image}
          alt=""
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 55vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081018]/80 to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-[#22D3A6]/30 bg-[#081018]/80 px-3 py-1 text-xs font-semibold text-[#66e8c1] backdrop-blur">
          {post.category}
        </span>
      </div>
      <div className="flex flex-col p-6 md:p-7">
        <div className="mb-5 flex gap-3 text-xs text-slate-500"><span>{post.date}</span><span>·</span><span>{post.readTime} de lectura</span></div>
        <h2 className={`${featured ? "text-2xl md:text-3xl" : "text-xl"} font-bold leading-tight text-white`}>{post.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#66e8c1] transition group-hover:gap-3">
          Leer caso <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
