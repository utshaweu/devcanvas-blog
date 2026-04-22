#!/usr/bin/env node

/**
 * DevCanvas Blog MCP Server
 *
 * A Model Context Protocol server that provides blog statistics,
 * post information, and analytics through MCP tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import process from 'node:process';
import { z } from 'zod';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Set VITE_SUPABASE_URL and one of: SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new McpServer({
  name: 'devcanvas-blog-server',
  version: '1.0.0',
  description: 'DevCanvas Blog MCP Server - blog statistics and analytics tools',
});

function asTextResponse(text) {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

server.tool(
  'get_posts_today',
  'Get the number of blog posts published today',
  {},
  async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .gte('published_at', today.toISOString());

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    const postCount = count || 0;

    if (postCount === 0) {
      return asTextResponse('No posts have been published today yet.');
    }

    if (postCount === 1) {
      return asTextResponse('1 post has been published today.');
    }

    return asTextResponse(`${postCount} posts have been published today.`);
  }
);

server.tool(
  'get_total_posts',
  'Get the total number of blog posts',
  {},
  async () => {
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    return asTextResponse(`There are ${count || 0} total posts on DevCanvas Blog.`);
  }
);

server.tool(
  'get_published_posts',
  'Get the number of published blog posts',
  {},
  async () => {
    const { count, error } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    return asTextResponse(`There are ${count || 0} published posts available to read.`);
  }
);

server.tool(
  'get_total_views',
  'Get the total number of views across all posts',
  {},
  async () => {
    const { data, error } = await supabase.from('posts').select('views');

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    const totalViews = data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;

    return asTextResponse(`DevCanvas posts have ${totalViews.toLocaleString()} total views.`);
  }
);

server.tool(
  'get_total_likes',
  'Get the total number of likes across all posts',
  {},
  async () => {
    const { data, error } = await supabase.from('posts').select('likes');

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    const totalLikes = data?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;

    return asTextResponse(`DevCanvas posts have received ${totalLikes.toLocaleString()} total likes.`);
  }
);

server.tool(
  'get_popular_posts',
  'Get the most popular blog posts by views',
  {
    limit: z.number().optional().default(5).describe('Number of posts to return (default: 5)'),
  },
  async (args) => {
    const limit = args.limit || 5;

    const { data, error } = await supabase
      .from('posts')
      .select('title, views, likes')
      .eq('published', true)
      .order('views', { ascending: false })
      .limit(limit);

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return asTextResponse('No posts found yet.');
    }

    let response = 'Most Popular Posts:\n\n';
    data.forEach((post, index) => {
      response += `${index + 1}. ${post.title}\n   ${post.views} views | ${post.likes} likes\n\n`;
    });

    return asTextResponse(response.trim());
  }
);

server.tool(
  'get_recent_posts',
  'Get the most recent blog posts',
  {
    limit: z.number().optional().default(5).describe('Number of posts to return (default: 5)'),
  },
  async (args) => {
    const limit = args.limit || 5;

    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        title,
        published_at,
        author:users(name)
      `
      )
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      return asTextResponse(`Error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return asTextResponse('No posts found yet.');
    }

    let response = 'Recent Posts:\n\n';
    data.forEach((post, index) => {
      const date = post.published_at ? new Date(post.published_at).toLocaleDateString() : 'N/A';
      const authorName = post.author && typeof post.author === 'object' && 'name' in post.author ? post.author.name : 'Unknown';
      response += `${index + 1}. ${post.title}\n   By ${authorName || 'Unknown'} | ${date}\n\n`;
    });

    return asTextResponse(response.trim());
  }
);

server.tool('get_categories', 'Get all blog categories with post counts', {}, async () => {
  const [categoriesResult, postsResult] = await Promise.all([
    supabase.from('categories').select('id, name'),
    supabase.from('posts').select('category_id').not('category_id', 'is', null),
  ]);

  if (categoriesResult.error) {
    return asTextResponse(`Error: ${categoriesResult.error.message}`);
  }

  if (postsResult.error) {
    return asTextResponse(`Error: ${postsResult.error.message}`);
  }

  const categories = categoriesResult.data || [];
  if (categories.length === 0) {
    return asTextResponse('No categories available yet.');
  }

  const categoryCounts = new Map();
  (postsResult.data || []).forEach((post) => {
    if (!post.category_id) {
      return;
    }

    const currentCount = categoryCounts.get(post.category_id) || 0;
    categoryCounts.set(post.category_id, currentCount + 1);
  });

  const categoriesWithCounts = categories
    .map((category) => ({
      name: category.name,
      post_count: categoryCounts.get(category.id) || 0,
    }))
    .sort((a, b) => b.post_count - a.post_count || a.name.localeCompare(b.name));

  let response = 'Available Categories:\n\n';
  categoriesWithCounts.forEach((category) => {
    response += `- ${category.name} (${category.post_count} posts)\n`;
  });

  return asTextResponse(response.trim());
});

server.tool(
  'get_tags',
  'Get popular blog tags',
  {
    limit: z.number().optional().default(10).describe('Number of tags to return (default: 10)'),
  },
  async (args) => {
    const limit = args.limit || 10;

    const [tagsResult, postTagsResult] = await Promise.all([
      supabase.from('tags').select('id, name'),
      supabase.from('post_tags').select('tag_id'),
    ]);

    if (tagsResult.error) {
      return asTextResponse(`Error: ${tagsResult.error.message}`);
    }

    if (postTagsResult.error) {
      return asTextResponse(`Error: ${postTagsResult.error.message}`);
    }

    const tags = tagsResult.data || [];
    if (tags.length === 0) {
      return asTextResponse('No tags available yet.');
    }

    const tagCounts = new Map();
    (postTagsResult.data || []).forEach((postTag) => {
      const currentCount = tagCounts.get(postTag.tag_id) || 0;
      tagCounts.set(postTag.tag_id, currentCount + 1);
    });

    const tagsWithCounts = tags
      .map((tag) => ({
        name: tag.name,
        post_count: tagCounts.get(tag.id) || 0,
      }))
      .sort((a, b) => b.post_count - a.post_count || a.name.localeCompare(b.name))
      .slice(0, limit);

    let response = 'Popular Tags:\n\n';
    tagsWithCounts.forEach((tag) => {
      response += `- ${tag.name} (${tag.post_count} posts)\n`;
    });

    return asTextResponse(response.trim());
  }
);

server.tool('get_comment_stats', 'Get total number of comments', {}, async () => {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return asTextResponse(`Error: ${error.message}`);
  }

  return asTextResponse(`There are ${count || 0} total comments across all posts.`);
});

server.tool('get_create_post_guide', 'Get step-by-step guide for creating a post', {}, async () => {
  const guide = `📝 **Creating a Post on DevCanvas**

Here's how to create and publish your post:

**Step 1: Add a Title**
- Click "Create New Post" from the dashboard
- Enter a compelling title (required)
- Add a short excerpt to give readers a preview (optional)

**Step 2: Write Your Content**
- Use the rich text editor with formatting options
- Add bold, italics, headings, lists, code blocks, quotes, etc.
- Insert links and images to enhance your post
- You can add emojis to make it more engaging!

**Step 3: Organize Your Post**
- Select a category to organize your content
- Add relevant tags to help readers find your post
- Featured image: Upload an eye-catching cover image (optional)

**Step 4: Add a Featured Image**
- Upload an image that represents your post
- This image will appear as the post thumbnail
- Recommended size: at least 400x300 pixels
- File size limit: 100KB

**Step 5: Publish or Save as Draft**
- Click "Save as Draft" to save your work without publishing
- Click "Publish" to make your post live and visible to readers
- You can edit published posts anytime
- Drafts remain private until you publish them

**Pro Tips:**
✨ Write engaging titles (40-60 characters work best)
✨ Use clear headings to organize your content
✨ Include relevant tags for better discoverability
✨ Add a featured image for visual appeal
✨ Save as draft frequently to avoid losing work
✨ Review before publishing - you can always edit!

Ready to create your first post? Head to the Create Post page now! 🚀`;

  return asTextResponse(guide);
});

server.resource('blog://stats', 'Overall blog statistics', 'application/json', async () => {
  const [postsResult, viewsResult, likesResult, commentsResult] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('views'),
    supabase.from('posts').select('likes'),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ]);

  const totalPosts = postsResult.count || 0;
  const totalViews =
    viewsResult.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const totalLikes =
    likesResult.data?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;
  const totalComments = commentsResult.count || 0;

  const stats = {
    totalPosts,
    totalViews,
    totalLikes,
    totalComments,
    timestamp: new Date().toISOString(),
  };

  return {
    contents: [
      {
        uri: 'blog://stats',
        mimeType: 'application/json',
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DevCanvas Blog MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
