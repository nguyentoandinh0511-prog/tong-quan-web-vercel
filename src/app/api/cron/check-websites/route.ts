import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find oldest checked websites (limit to 10 per cron run to avoid timeouts)
    const websites = await prisma.websitePreview.findMany({
      take: 10,
      orderBy: {
        lastCheckedAt: 'asc'
      },
      where: {
        url: { not: '' }
      }
    });

    const results = [];

    for (const site of websites) {
      if (!site.url) continue;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const res = await fetch(site.url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Visual-Repo-Manager-Cron/1.0',
          }
        });
        
        clearTimeout(timeoutId);

        let newStatus = 'WARNING';
        if (res.ok) newStatus = 'LIVE';
        else if (res.status >= 500) newStatus = 'WARNING';
        else if (res.status === 404 || res.status === 403) newStatus = 'WARNING'; // Might be private or unconfigured

        await prisma.websitePreview.update({
          where: { id: site.id },
          data: {
            status: newStatus,
            httpStatus: res.status,
            lastCheckedAt: new Date(),
          }
        });
        
        results.push({ url: site.url, status: newStatus });
      } catch (err: any) {
        await prisma.websitePreview.update({
          where: { id: site.id },
          data: {
            status: 'OFFLINE',
            lastCheckedAt: new Date(),
          }
        });
        results.push({ url: site.url, status: 'OFFLINE', error: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
