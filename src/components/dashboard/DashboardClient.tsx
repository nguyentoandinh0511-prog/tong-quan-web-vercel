"use client";

import { useState } from "react";
import { Search, LayoutGrid, List as ListIcon, Filter, RefreshCw, Layers } from "lucide-react";
import { RepositoryCard } from "./RepositoryCard";
import { InlinePreview } from "./InlinePreview";
import { QuickPreviewModal } from "./QuickPreviewModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardClient({ initialRepos, user }: { initialRepos: any[], user: any }) {
  const [repos, setRepos] = useState(initialRepos);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activePreviewRepo, setActivePreviewRepo] = useState<any | null>(null);
  const [quickViewRepo, setQuickViewRepo] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Stats
  const totalRepos = repos.length;
  const liveCount = repos.filter(r => r.preview?.status === "LIVE").length;
  const vercelCount = repos.filter(r => r.preview?.hosting === "Vercel").length;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' });
      if (res.ok) {
        window.location.reload(); // Simple reload for MVP
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.preview?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Header Area */}
      <header className="glass-panel sticky top-4 z-40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-strong rounded-xl flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-[#10243e] leading-tight">Visual Repo Manager</h1>
            <p className="text-xs text-muted-foreground">Crystal White Workspace</p>
          </div>
        </div>

        <div className="flex-1 w-full md:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search websites, domains, tags..." 
            className="pl-9 bg-white/60 border-crystal-strong h-10 rounded-xl w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Button variant="outline" className="bg-white/50 border-crystal" size="icon" onClick={() => setViewMode('grid')}>
            <LayoutGrid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-accent-strong' : 'text-muted-foreground'}`} />
          </Button>
          <Button variant="outline" className="bg-white/50 border-crystal" size="icon" onClick={() => setViewMode('list')}>
            <ListIcon className={`w-4 h-4 ${viewMode === 'list' ? 'text-accent-strong' : 'text-muted-foreground'}`} />
          </Button>
          <Button variant="outline" className="bg-white/50 border-crystal text-secondary-foreground">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button 
            className="bg-accent hover:bg-accent-strong text-white shadow-sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> 
            {isSyncing ? 'Syncing...' : 'Sync GitHub'}
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-sm font-medium text-muted-foreground mb-1">Total Repositories</div>
          <div className="text-3xl font-bold text-[#10243e]">{totalRepos}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-success/10 rounded-full blur-xl"></div>
          <div className="text-sm font-medium text-muted-foreground mb-1">LIVE Websites</div>
          <div className="text-3xl font-bold text-success">{liveCount}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-sm font-medium text-muted-foreground mb-1">Vercel Deployments</div>
          <div className="text-3xl font-bold text-[#10243e]">{vercelCount}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-sm font-medium text-muted-foreground mb-1">Last Sync</div>
          <div className="text-xl font-semibold text-[#10243e] mt-2">Just now</div>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
        {filteredRepos.map((repo) => (
          <div key={repo.id} className="flex flex-col relative">
            <RepositoryCard 
              repo={repo} 
              onPreviewClick={(r) => setActivePreviewRepo(activePreviewRepo?.id === r.id ? null : r)}
              onQuickView={(r) => setQuickViewRepo(r)}
            />
            {activePreviewRepo?.id === repo.id && (
              <div className="w-full">
                <InlinePreview repo={repo} onClose={() => setActivePreviewRepo(null)} />
              </div>
            )}
          </div>
        ))}
        {filteredRepos.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Layers className="w-12 h-12 mb-4 opacity-20" />
            <p>No repositories found.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <QuickPreviewModal 
        repo={quickViewRepo} 
        isOpen={!!quickViewRepo} 
        onClose={() => setQuickViewRepo(null)} 
      />
    </div>
  );
}
