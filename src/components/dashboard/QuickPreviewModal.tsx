"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Github, Copy, RefreshCw, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuickPreviewModalProps {
  repo: any;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPreviewModal({ repo, isOpen, onClose }: QuickPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !repo) return null;

  const preview = repo.preview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-400/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="glass-panel relative w-full max-w-5xl max-h-full rounded-[24px] md:rounded-[28px] overflow-hidden flex flex-col md:flex-row shadow-2xl bg-white/95 border-white/50 animate-in zoom-in-95 duration-200">
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/10 hover:bg-black/20 text-white md:text-foreground md:bg-white/50 md:hover:bg-white/80"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Left Side: Screenshot (70%) */}
        <div className="w-full md:w-[65%] bg-slate-100 relative min-h-[30vh] md:min-h-0 flex items-center justify-center">
          {preview?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.image} alt={preview.title || repo.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <span className="text-6xl font-light text-slate-300 mb-4">{repo.name.substring(0, 2).toUpperCase()}</span>
              <span>No preview available</span>
            </div>
          )}
        </div>

        {/* Right Side: Details (30%) */}
        <div className="w-full md:w-[35%] flex flex-col overflow-y-auto max-h-[60vh] md:max-h-full">
          <div className="p-6 flex-1">
            <Badge variant="outline" className="mb-4 glass-pill bg-white shadow-sm border-crystal-strong">{preview?.hosting || "Custom"}</Badge>
            
            <h2 className="text-2xl font-bold text-[#10243e] mb-1">{preview?.title || repo.name}</h2>
            
            <a href={preview?.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-strong hover:underline break-all mb-4 block">
              {preview?.url || "No website URL"}
            </a>
            
            <p className="text-secondary-foreground text-sm mb-6 leading-relaxed">
              {preview?.description || repo.description || "No description provided for this repository."}
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1 border-t border-border-cool pt-4">
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Repository</span>
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-accent-strong flex items-center">
                  <Github className="w-4 h-4 mr-2" /> {repo.fullName}
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-border-cool pt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Status</span>
                  <span className="text-sm font-medium">{preview?.status || "Unknown"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Language</span>
                  <span className="text-sm font-medium">{repo.language || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sticky Action Bar */}
          <div className="p-6 bg-white/50 backdrop-blur-md border-t border-crystal-strong/50 flex flex-wrap gap-2 sticky bottom-0">
            <Button className="flex-1 bg-gradient-to-r from-accent to-accent-strong hover:from-accent-strong hover:to-accent text-white shadow-md">
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button variant="outline" className="flex-1 bg-white hover:bg-slate-50">
              <Share2 className="w-4 h-4 mr-2" /> Copy Info
            </Button>
            <div className="w-full flex gap-2 mt-2">
              <Button variant="ghost" className="flex-1 bg-white/40">
                <ExternalLink className="w-4 h-4 mr-2" /> Open
              </Button>
              <Button variant="ghost" className="flex-1 bg-white/40">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
