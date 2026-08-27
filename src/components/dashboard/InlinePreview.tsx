"use client";

import { X, Copy, ExternalLink, Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InlinePreviewProps {
  repo: any;
  onClose: () => void;
}

export function InlinePreview({ repo, onClose }: InlinePreviewProps) {
  const preview = repo.preview;
  if (!preview) return null;

  const handleCopyLink = () => {
    if (preview.url) {
      navigator.clipboard.writeText(preview.url);
    }
  };

  const handleCopyInfo = () => {
    const text = `${preview.title || repo.name}\n${preview.description || repo.description}\n\n${preview.url}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="glass-panel w-full rounded-2xl mt-4 p-1 animate-in slide-in-from-top-4 fade-in duration-300 relative overflow-hidden flex flex-col md:flex-row gap-4">
      {/* Close button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 z-10"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Image */}
      <div className="w-full md:w-1/2 rounded-xl overflow-hidden aspect-video bg-slate-100 relative">
        {preview.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.image} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Preview Available</div>
        )}
      </div>

      {/* Content */}
      <div className="w-full md:w-1/2 py-2 pr-4 pl-2 flex flex-col justify-center">
        <a 
          href={preview.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-medium text-accent-strong hover:underline truncate mb-1 block"
        >
          {preview.url}
        </a>
        
        <h3 className="text-xl font-bold text-primary-foreground text-[#10243e] mb-2">
          {preview.title || repo.name}
        </h3>
        
        <p className="text-sm text-secondary-foreground mb-4 line-clamp-3">
          {preview.description || repo.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="glass-pill px-2 py-1 flex items-center gap-2 text-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview.favicon && <img src={preview.favicon} alt="favicon" className="w-4 h-4" />}
            <span className="font-medium">{preview.domain || new URL(preview.url).hostname}</span>
          </div>
          <Badge variant="outline" className="glass-pill bg-white/50">{preview.status} • {preview.hosting}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          <Button size="sm" className="bg-white/80 text-foreground hover:bg-white border shadow-sm" onClick={handleCopyLink}>
            <Copy className="w-3.5 h-3.5 mr-2" /> Copy Link
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent border-crystal" onClick={handleCopyInfo}>
            <Share2 className="w-3.5 h-3.5 mr-2" /> Copy Info
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
