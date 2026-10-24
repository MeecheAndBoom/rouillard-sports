import { connectDB, hasDatabase } from "./db";
import { Blog } from "./models/Blog";
import { SEED_BLOG_POSTS } from "./blog-seed";
import { readJson, writeJson } from "./fileStore";
import { slugify } from "./fileStore";
import type { BlogPost, BlogPostInput } from "./types";

const COOL_DOWN = 30_000;
let localFallbackUntil = 0;

async function fromDb<T>(query: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (hasDatabase() && Date.now() > localFallbackUntil) {
    try {
      await connectDB();
      return await query();
    } catch {
      localFallbackUntil = Date.now() + COOL_DOWN;
    }
  }
  return fallback();
}

const toRecord = (doc: unknown): BlogPost => JSON.parse(JSON.stringify(doc)) as BlogPost;

export async function getPosts(opts?: { includeDrafts?: boolean }): Promise<BlogPost[]> {
  return fromDb(
    async () => {
      const docs = await Blog.find(opts?.includeDrafts ? {} : { status: "live" })
        .sort({ date: -1 })
        .lean();
      return (docs as unknown[]).map(toRecord);
    },
    async () => {
      const local = await readJson<BlogPost[] | null>("blog", null);
      const base = local && local.length ? local : SEED_BLOG_POSTS;
      return opts?.includeDrafts ? base : base.filter((p) => p.status === "live");
    },
  );
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  return fromDb(
    async () => {
      const doc = await Blog.findOne({ slug }).lean();
      return doc ? toRecord(doc) : null;
    },
    async () => {
      const local = await readJson<BlogPost[] | null>("blog", null);
      const base = local && local.length ? local : SEED_BLOG_POSTS;
      return base.find((p) => p.slug === slug) ?? null;
    },
  );
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const all = await getPosts();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function upsertPost(input: BlogPostInput): Promise<BlogPost> {
  const slug = input.slug?.trim() || slugify(input.title);

  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Blog.findOneAndUpdate(
        { slug },
        { $set: { ...input, slug } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();
      if (doc) await syncBlogStore();
      return toRecord(doc);
    } catch {
      /* fall through */
    }
  }

  const posts = await readJson<BlogPost[]>("blog", [...SEED_BLOG_POSTS]);
  const idx = posts.findIndex((p) => p.slug === slug);
  const record: BlogPost = {
    ...(idx >= 0 ? posts[idx] : ({} as BlogPost)),
    ...input,
    slug,
  } as BlogPost;
  if (idx >= 0) posts[idx] = record;
  else posts.unshift(record);
  await writeJson("blog", posts);
  return record;
}

export async function deletePost(slug: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Blog.deleteOne({ slug });
      await syncBlogStore();
      return Boolean(res.deletedCount);
    } catch {
      /* fall through */
    }
  }
  const posts = await readJson<BlogPost[]>("blog", [...SEED_BLOG_POSTS]);
  const next = posts.filter((p) => p.slug !== slug);
  if (next.length === posts.length) return false;
  await writeJson("blog", next);
  return true;
}

export async function syncBlogStore(): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await connectDB();
    const docs = await Blog.find({}).sort({ date: -1 }).lean();
    await writeJson("blog", (docs as unknown[]).map(toRecord));
  } catch {
    /* best effort */
  }
}
