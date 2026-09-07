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
        metadata: matterResult.data as BlogPostMetadata,
        content: matterResult.content,
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.metadata.date < b.metadata.date) {
      return 1;
    } else {
      return -1;
    }
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
    metadata: matterResult.data as BlogPostMetadata,
    content: matterResult.content,
  };
}
