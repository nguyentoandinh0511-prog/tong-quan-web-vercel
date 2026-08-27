import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'GitHub account not linked' }, { status: 400 });
    }

    // Fetch repositories
    let allRepos: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 5) { // Limit to 5 pages for safety in this version
      const res = await fetch(`https://api.github.com/user/repos?visibility=all&affiliation=owner&sort=updated&per_page=100&page=${page}`, {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
           console.warn('GitHub rate limit exceeded');
           break;
        }
        throw new Error('Failed to fetch repositories from GitHub');
      }

      const repos = await res.json();
      if (repos.length === 0) {
        hasMore = false;
      } else {
        allRepos = [...allRepos, ...repos];
        page++;
      }
    }

    const syncResults = { added: 0, updated: 0 };

    // Process and upsert repositories
    for (const repo of allRepos) {
      // Find potential website URLs
      const urls: string[] = [];
      if (repo.homepage) urls.push(repo.homepage);
      if (repo.has_pages) {
        urls.push(`https://${repo.owner.login}.github.io/${repo.name}`);
      }

      // Upsert repo
      const dbRepo = await prisma.repository.upsert({
        where: { githubId: repo.id },
        create: {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          homepage: repo.homepage,
          defaultBranch: repo.default_branch,
          language: repo.language,
          topics: repo.topics || [],
          isPrivate: repo.private,
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          primaryWebsiteUrl: urls.length > 0 ? urls[0] : null,
        },
        update: {
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          homepage: repo.homepage,
          defaultBranch: repo.default_branch,
          language: repo.language,
          topics: repo.topics || [],
          isPrivate: repo.private,
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
        },
      });

      // Add candidates if they don't exist
      for (const url of urls) {
        if (!url || !url.startsWith('http')) continue;
        
        await prisma.websiteCandidate.upsert({
          where: {
            repositoryId_url: {
              repositoryId: dbRepo.id,
              url: url,
            }
          },
          create: {
            repositoryId: dbRepo.id,
            url: url,
            source: repo.homepage === url ? 'homepage' : 'github_pages',
            status: 'UNKNOWN'
          },
          update: {}
        });
      }
    }

    return NextResponse.json({ success: true, count: allRepos.length });
  } catch (error: any) {
    console.error('Error syncing repos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
