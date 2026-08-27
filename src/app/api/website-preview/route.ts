import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function resolveUrl(baseUrl: string, relativeUrl: string) {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const url = new URL(urlParam);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }
    
    // Basic SSRF protection
    const hostname = url.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.internal')
    ) {
      return NextResponse.json({ error: 'Private IPs are not allowed' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(url.href, {
      headers: {
        'User-Agent': 'Visual-Repo-Manager-Bot/1.0',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const html = await res.text();
    const $ = cheerio.load(html);

    const finalUrl = res.url;
    const finalUrlObj = new URL(finalUrl);
    
    // Extract metadata according to priority
    const title = 
      $('meta[property="og:title"]').attr('content') || 
      $('title').text() || 
      '';
      
    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      '';
      
    let image = 
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[property="og:image"]').attr('content') ||
      '';

    if (image && !image.startsWith('http')) {
      image = resolveUrl(finalUrl, image) || image;
    }

    let favicon = 
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      '/favicon.ico';

    if (favicon && !favicon.startsWith('http')) {
      favicon = resolveUrl(finalUrl, favicon) || favicon;
    }

    // Determine hosting from headers or domain
    let hosting = 'Custom';
    const serverHeader = res.headers.get('server')?.toLowerCase() || '';
    if (finalUrlObj.hostname.endsWith('.vercel.app') || serverHeader.includes('vercel')) {
      hosting = 'Vercel';
    } else if (finalUrlObj.hostname.endsWith('.github.io') || serverHeader.includes('github')) {
      hosting = 'GitHub Pages';
    } else if (finalUrlObj.hostname.endsWith('.netlify.app') || serverHeader.includes('netlify')) {
      hosting = 'Netlify';
    }

    return NextResponse.json({
      url: urlParam,
      finalUrl,
      domain: finalUrlObj.hostname,
      title: title.trim(),
      description: description.trim(),
      image,
      favicon,
      status: res.ok ? 'LIVE' : (res.status >= 500 ? 'WARNING' : 'OFFLINE'),
      httpStatus: res.status,
      hosting,
      checkedAt: new Date().toISOString(),
      source: {
        title: $('meta[property="og:title"]').length ? 'og:title' : 'title',
        description: $('meta[property="og:description"]').length ? 'og:description' : 'meta description',
        image: $('meta[property="og:image"]').length ? 'og:image' : 'none'
      }
    });
  } catch (error: any) {
    console.error('Preview fetch error:', error.message);
    return NextResponse.json({
      url: urlParam,
      status: error.name === 'AbortError' ? 'WARNING' : 'OFFLINE',
      error: error.message,
      checkedAt: new Date().toISOString(),
    }, { status: 200 }); // Return 200 with OFFLINE status rather than 500
  }
}
