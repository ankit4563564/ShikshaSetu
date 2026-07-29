'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  useModerationQueue, useReports, usePosts, useAnalytics,
} from '@/lib/community/query';
import { COMMUNITY_KEYS } from '@/lib/community/query';
import {
  approvePostAction, hidePostAction, resolveReportAction, revealPostIdentityAction,
} from '@/app/actions/communityActions';
import type { CommunityPost, CommunityReport } from '@/lib/community/types';
import { PostSkeleton, AnalyticsSkeleton } from './LoadingSkeleton';
import { CommunityErrorBoundary } from './ErrorBoundary';

interface ModPanelProps {
  adminId: string;
  role: 'admin' | 'teacher';
}

type TabId = 'flagged' | 'reports' | 'all' | 'analytics';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'flagged', label: 'Flagged', icon: '🚩' },
  { id: 'reports', label: 'Reports', icon: '⚠️' },
  { id: 'all', label: 'All Posts', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

function useModerationActions(adminId: string, role: string) {
  const queryClient = useQueryClient();
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.moderationQueue });
    queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.reports });
    queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.analytics });
  }, [queryClient]);

  const approve = useCallback(async (postId: string) => {
    const res = await approvePostAction(postId, adminId, role);
    if (res.success) invalidate();
    return res;
  }, [adminId, role, invalidate]);

  const hide = useCallback(async (postId: string) => {
    const reason = 'Policy Violation';
    const res = await hidePostAction(postId, adminId, role, reason);
    if (res.success) invalidate();
    return res;
  }, [adminId, role, invalidate]);

  const reveal = useCallback(async (postId: string) => {
    return revealPostIdentityAction(postId, adminId);
  }, [adminId]);

  const resolveReport = useCallback(async (reportId: string, status: string) => {
    const res = await resolveReportAction(reportId, status, adminId);
    if (res.success) invalidate();
    return res;
  }, [adminId, invalidate]);

  return { approve, hide, reveal, resolveReport };
}

export default function CommunityModerationPanel({ adminId, role }: ModPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('flagged');
  const [modSearch, setModSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const { data: modQueue, isLoading: modLoading } = useModerationQueue();
  const { data: reports } = useReports();
  const { data: allPosts, isLoading: allLoading } = usePosts({ status: undefined as any });
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { approve, hide, reveal, resolveReport } = useModerationActions(adminId, role);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredPosts = modSearch
    ? (allPosts || []).filter(p =>
        p.title.toLowerCase().includes(modSearch.toLowerCase()) ||
        p.body.toLowerCase().includes(modSearch.toLowerCase())
      )
    : allPosts;

  return (
    <CommunityErrorBoundary>
      <div className="space-y-6">
        {toast && (
          <div className="rounded-xl bg-sage/10 px-4 py-3 text-sm font-bold text-sage flex items-center justify-between">
            <span>{toast}</span>
            <button type="button" onClick={() => setToast(null)} className="text-xs ml-2">✕</button>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto border-b border-deep-teal/5 pb-2 text-nowrap">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 pb-1 text-sm font-bold capitalize transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-deep-teal text-deep-teal'
                  : 'border-transparent text-deep-teal/40 hover:text-deep-teal/60'
              }`}
            ><span>{tab.icon}</span> {tab.label}</button>
          ))}
        </div>

        {activeTab === 'flagged' && (
          <motion.div key="flagged" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {modLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
            ) : !modQueue?.flagged.length ? (
              <p className="text-sm text-deep-teal/40 italic text-center py-8">No flagged posts.</p>
            ) : (
              modQueue.flagged.map(post => (
                <FlaggedPostCard key={post.id} post={post} onApprove={approve} onHide={hide} onReveal={reveal} showToast={showToast} />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {!reports?.length ? (
              <p className="text-sm text-deep-teal/40 italic text-center py-8">No pending reports.</p>
            ) : (
              reports.map(r => (
                <ReportCard key={r.id} report={r} onResolve={resolveReport} />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'all' && (
          <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <input type="text" value={modSearch} onChange={e => setModSearch(e.target.value)}
              placeholder="Search all posts…"
              className="w-full rounded-xl border border-deep-teal/10 bg-white px-4 py-2.5 text-sm text-deep-teal placeholder-deep-teal/30 outline-none"
            />
            {allLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
            ) : !filteredPosts?.length ? (
              <p className="text-sm text-deep-teal/40 italic text-center py-8">No posts found.</p>
            ) : (
              filteredPosts.map(post => (
                <AllPostCard key={post.id} post={post} onHide={hide} onReveal={reveal} showToast={showToast} />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {analyticsLoading ? <AnalyticsSkeleton /> : analytics && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Posts" value={analytics.totalPosts} />
                  <StatCard label="Answers" value={analytics.totalAnswers} />
                  <StatCard label="Pending Reports" value={analytics.totalReports} color="warm-clay" />
                  <StatCard label="Mod. Rate" value={`${analytics.moderationRate.toFixed(1)}%`} color="marigold" />
                </div>
                <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase text-deep-teal/40 mb-3">Posts by Category</p>
                  {analytics.postsByCategory.length === 0 ? (
                    <p className="text-sm text-deep-teal/40 italic">No data yet.</p>
                  ) : (
                    analytics.postsByCategory.map(c => (
                      <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-deep-teal/5 last:border-0">
                        <span className="text-sm text-deep-teal">{c.name}</span>
                        <span className="text-sm font-bold text-deep-teal">{c.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </CommunityErrorBoundary>
  );
}

function StatCard({ label, value, color = 'deep-teal' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
      <p className="text-[10px] font-bold uppercase text-deep-teal/40">{label}</p>
      <p className={`mt-1 text-xl font-extrabold text-${color}`}>{value}</p>
    </div>
  );
}

function FlaggedPostCard({ post, onApprove, onHide, onReveal, showToast }: {
  post: CommunityPost;
  onApprove: (id: string) => Promise<any>;
  onHide: (id: string) => Promise<any>;
  onReveal: (id: string) => Promise<any>;
  showToast: (msg: string) => void;
}) {
  const [actioning, setActioning] = useState(false);
  const act = async (fn: () => Promise<any>) => {
    setActioning(true);
    const res = await fn();
    if (res?.error) showToast(res.error);
    setActioning(false);
  };
  return (
    <div className="rounded-xl border border-marigold/20 bg-marigold/5 p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-marigold uppercase">AI Flagged · {post.aiPriority}</p>
        <span className="text-xs text-deep-teal/30">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-sm font-bold text-deep-teal">{post.title}</p>
      <p className="text-xs text-deep-teal/60 mt-1 line-clamp-2">{post.body}</p>
      {post.aiModerationReason && (
        <p className="text-[10px] text-warm-clay mt-1">Reason: {post.aiModerationReason}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={() => act(() => onApprove(post.id))} disabled={actioning}
          className="rounded-lg bg-sage px-4 py-1.5 text-xs font-bold text-white hover:bg-sage/90 disabled:opacity-40 shadow-sm"
        >{actioning ? '…' : 'Approve'}</button>
        <button type="button" onClick={() => act(() => onHide(post.id))} disabled={actioning}
          className="rounded-lg border border-warm-clay/20 px-4 py-1.5 text-xs font-bold text-warm-clay hover:bg-warm-clay/5 disabled:opacity-40"
        >Hide</button>
        <button type="button" onClick={() => act(() => onReveal(post.id))} disabled={actioning}
          className="rounded-lg border border-deep-teal/10 px-4 py-1.5 text-xs font-bold text-deep-teal/40 hover:text-deep-teal ml-auto disabled:opacity-40"
        >Reveal Identity</button>
      </div>
    </div>
  );
}

function ReportCard({ report, onResolve }: {
  report: CommunityReport;
  onResolve: (id: string, status: string) => Promise<any>;
}) {
  const [actioning, setActioning] = useState(false);
  const act = async (status: string) => {
    setActioning(true);
    await onResolve(report.id, status);
    setActioning(false);
  };
  return (
    <div className="rounded-xl border border-warm-clay/10 bg-white/70 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-warm-clay uppercase">{report.reason}</p>
        <span className="text-[10px] text-deep-teal/30">{new Date(report.createdAt).toLocaleDateString()}</span>
      </div>
      {report.description && <p className="text-xs text-deep-teal/60">{report.description}</p>}
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={() => act('actioned')} disabled={actioning}
          className="rounded-lg bg-sage px-3 py-1.5 text-xs font-bold text-white hover:bg-sage/90 disabled:opacity-40 shadow-sm"
        >Actioned</button>
        <button type="button" onClick={() => act('dismissed')} disabled={actioning}
          className="rounded-lg border border-deep-teal/10 px-3 py-1.5 text-xs font-bold text-deep-teal/60 disabled:opacity-40"
        >Dismiss</button>
      </div>
    </div>
  );
}

function AllPostCard({ post, onHide, onReveal, showToast }: {
  post: CommunityPost;
  onHide: (id: string) => Promise<any>;
  onReveal: (id: string) => Promise<any>;
  showToast: (msg: string) => void;
}) {
  const [actioning, setActioning] = useState(false);
  const act = async (fn: () => Promise<any>) => {
    setActioning(true);
    const res = await fn();
    if (res?.error) showToast(res.error);
    setActioning(false);
  };
  return (
    <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-deep-teal">{post.title}</p>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
          post.status === 'open' ? 'bg-sage/10 text-sage' : 'bg-deep-teal/5 text-deep-teal/40'
        }`}>{post.status}</span>
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={() => act(() => onHide(post.id))} disabled={actioning}
          className="rounded-lg border border-deep-teal/10 px-3 py-1 text-xs font-bold text-deep-teal/60 disabled:opacity-40"
        >Hide</button>
        <button type="button" onClick={() => act(() => onReveal(post.id))} disabled={actioning}
          className="rounded-lg border border-deep-teal/10 px-3 py-1 text-xs font-bold text-deep-teal/40 disabled:opacity-40"
        >Reveal Identity</button>
      </div>
    </div>
  );
}
