"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, GitBranch as Github, Copy, MoreHorizontal, Check, RefreshCw, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RepositoryCardProps {
  repo: any;
  onPreviewClick: (repo: any) => void;
  onQuickView: (repo: any) => void;
}

export function RepositoryCard({ repo, onPreviewClick, onQuickView }: RepositoryCardProps) {
  const [copied, setCopied] = useState(false);
  const preview = repo.preview;
  
  const statusColors = {
    LIVE: "bg-success/20 text-success border-success/30",
    WARNING: "bg-warning/20 text-warning border-warning/30",
    OFFLINE: "bg-danger/20 text-danger border-danger/30",
    NO_WEBSITE: "bg-muted text-muted-foreground border-border",
  };

  const statusIndicators = {
    LIVE: "bg-success",
    WARNING: "bg-warning",
    OFFLINE: "bg-danger",
    NO_WEBSITE: "bg-muted-foreground",
  };

  const status = preview?.status || "NO_WEBSITE";
  
  const handleCopy = () => {
    if (!preview?.url) return;
    navigator.clipboard.writeText(preview.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Open inline preview automatically as requested
    onPreviewClick(repo);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-crystal group relative">
      
      {/* Thumbnail Area */}
      <div 
        className="relative aspect-video w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(repo)}
      >
        {preview?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={preview.image} 
            alt={preview.title || repo.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <span className="text-4xl font-light text-blue-200/50">{repo.name.substring(0, 2).toUpperCase()}</span>
          </div>
        )}

        {/* Badges on Thumbnail */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className={`glass-pill font-medium shadow-sm ${statusColors[status as keyof typeof statusColors]}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusIndicators[status as keyof typeof statusIndicators]}`}></span>
            {status}
          </Badge>
          
          {preview?.hosting && (
            <Badge variant="outline" className="glass-pill font-medium text-foreground bg-white/70">
              {preview.hosting}
            </Badge>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-primary-foreground text-[#10243e] truncate pr-2" title={preview?.title || repo.name}>
            {preview?.title || repo.name}
          </h3>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mb-3 gap-2">
          <Github className="w-3.5 h-3.5" />
          <span className="truncate">{repo.fullName}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}</span>
        </div>
        
        <p className="text-sm text-secondary-foreground/80 line-clamp-2 mb-4 flex-1" title={preview?.description || repo.description}>
          {preview?.description || repo.description || "No description provided."}
        </p>

        {/* Actions Divider */}
        <div className="h-px w-full bg-border-crystal mb-4"></div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2">
          <Button 
            className={`flex-1 shadow-sm transition-all ${copied ? 'bg-success hover:bg-success text-white' : 'bg-gradient-to-r from-accent to-accent-strong hover:from-accent-strong hover:to-accent text-white'}`}
            disabled={!preview?.url}
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Đã copy" : "Copy Link"}
          </Button>
          
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {preview?.url ? (
                    <a href={preview.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 text-secondary-foreground hover:bg-white/50 rounded-full cursor-pointer transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center h-9 w-9 text-secondary-foreground/50 rounded-full cursor-not-allowed">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                </TooltipTrigger>
                <TooltipContent>Mở Website</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 w-9 text-secondary-foreground hover:bg-white/50 rounded-full cursor-pointer transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>GitHub Repository</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-secondary-foreground hover:bg-white/50 rounded-full" 
                    onClick={() => onPreviewClick(repo)}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-secondary-foreground hover:bg-white/50 rounded-full">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-panel border-crystal bg-white/80">
                <DropdownMenuItem onClick={() => onQuickView(repo)}>
                  <Info className="w-4 h-4 mr-2" /> Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!preview?.url}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" /> Favorite
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
