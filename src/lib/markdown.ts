import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogPostMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  image?: string;
  faq?: FAQ[];
  tags?: string[];
}

export interface BlogPost {
  slug: string;
  metadata: BlogPostMetadata;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

function getMetadata(data: Record<string, unknown>, content: string): BlogPostMetadata {
  const contentLines = content.split(/\r?\n/);
  const title = contentLines.find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, '').trim();
  const description = contentLines.find((line) => {
    const trimmedLine = line.trim();
    return trimmedLine.length > 0 && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('`') && !trimmedLine.startsWith('-');
  })?.trim();

  return {
    title: typeof data.title === 'string' && data.title.trim() ? data.title : title || 'Artículo de DMHub',
    description: typeof data.description === 'string' && data.description.trim() ? data.description : description || '',
    author: typeof data.author === 'string' && data.author.trim() ? data.author : 'DMHub',
    date: typeof data.date === 'string' && data.date.trim() ? data.date : '2026-01-01',
    ...(Array.isArray(data.tags) ? { tags: data.tags.filter((tag): tag is string => typeof tag === 'string') } : {}),
    ...(Array.isArray(data.faq) ? { faq: data.faq as FAQ[] } : {}),
    ...(typeof data.image === 'string' ? { image: data.image } : {}),
  };
}

export function getSortedPostsData(): BlogPost[] {
  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      return {
        slug,
        metadata: getMetadata(matterResult.data, matterResult.content),
        content: matterResult.content,
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    return b.metadata.date.localeCompare(a.metadata.date);
  });
}

export function getPostData(slug: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    metadata: getMetadata(matterResult.data, matterResult.content),
    content: matterResult.content,
  };
}
