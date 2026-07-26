'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCategories, useInfinitePosts, usePost, useAnswers, useMyPosts, useCreatePost, useCreateAnswer, useToggleUpvote, useCreateReport } from '@/lib/community/query';
import type { CommunityPost, CommunityAnswer } from '@/lib/community/types';
import { PostSkeleton, PostDetailSkeleton } from './LoadingSkeleton';
import { CommunityErrorBoundary } from './ErrorBoundary';

interface StudentCommunityPanelProps {
  studentId: string;
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
  { value: 'most_helpful', label: 'Most Helpful' },
] as const;

const TABS = [
  { id: 'feed' as const, label: 'Browse', icon: '🌐' },
  { id: 'ask' as const, label: 'Ask', icon: '✍️' },
  { id: 'mine' as const, label: 'My Posts', icon: '📋' },
];

function getDisplayName(post: CommunityPost) {
  if (post.isAnonymous && post.anonymousName) {
    return { name: post.anonymousName, icon: post.anonymousIcon || '🦊' };
  }
  return { name: post.studentDisplayName || 'Student', icon: '👤' };
}

export default function StudentCommunityPanel({ studentId: sid }: StudentCommunityPanelProps) {
  const [activeView, setActiveView] = useState<'feed' | 'ask' | 'mine' | 'post'>('feed');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const { data: categories } = useCategories();
  const {
    data: infinitePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: feedLoading,
  } = useInfinitePosts({ sort: sortBy as any, query: searchQuery || undefined, categoryId: categoryFilter });
  const posts = infinitePages?.pages.flat() || [];

  const { data: selectedPost, isLoading: postLoading } = usePost(selectedPostId);
  const { data: answers } = useAnswers(selectedPostId);
  const { data: myPosts } = useMyPosts(sid);

  const createPost = useCreatePost(sid);
  const createAnswer = useCreateAnswer(selectedPostId || '');
  const toggleUpvote = useToggleUpvote();
  const createReport = useCreateReport();

  const [askForm, setAskForm] = useState({ title: '', body: '', categoryId: '', isAnonymous: false });
  const [answerBody, setAnswerBody] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleAsk = useCallback(async () => {
    if (!askForm.title.trim() || !askForm.body.trim() || !askForm.categoryId) return;
    const res = await createPost.mutateAsync({
      title: askForm.title, body: askForm.body,
      categoryId: askForm.categoryId, isAnonymous: askForm.isAnonymous,
    });
    if (res.success) {
      showToast('Question posted!', 'success');
      setAskForm({ title: '', body: '', categoryId: '', isAnonymous: false });
      setActiveView('feed');
    } else {
      showToast(res.error || 'Failed to post', 'error');
    }
  }, [askForm, createPost, showToast]);

  const handleAnswer = useCallback(async () => {
    if (!answerBody.trim() || !selectedPostId) return;
    const res = await createAnswer.mutateAsync(answerBody);
    if (res.success) {
      setAnswerBody('');
      showToast('Answer posted!', 'success');
    } else {
      showToast(res.error || 'Failed to post answer', 'error');
    }
  }, [answerBody, selectedPostId, createAnswer, showToast]);

  const handleUpvote = useCallback(async (targetType: 'post' | 'answer', targetId: string) => {
    await toggleUpvote.mutateAsync({ userId: sid, userRole: 'student', targetType, targetId });
  }, [sid, toggleUpvote]);

  const handleReport = useCallback(async (targetType: 'post' | 'answer', targetId: string) => {
    const reason = 'Inappropriate content report';
    const res = await createReport.mutateAsync({
      reporterId: sid, reporterRole: 'student', targetType, targetId, reason,
    });
    if (res.success) showToast('Report submitted for review', 'success');
    else showToast(res.error || 'Failed to report', 'error');
  }, [sid, createReport, showToast]);

  const openPost = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setActiveView('post');
  }, []);

  return (
    <CommunityErrorBoundary>
      <div className="space-y-6">
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between ${
              toast.type === 'success' ? 'bg-sage/10 text-sage' : 'bg-warm-clay/10 text-warm-clay'
            }`}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="text-xs ml-2">✕</button>
          </motion.div>
        )}

        <div className="flex gap-3 overflow-x-auto border-b border-deep-teal/5 pb-2 text-nowrap">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 pb-1 text-sm font-bold transition-all border-b-2 ${
                activeView === tab.id
                  ? 'border-deep-teal text-deep-teal'
                  : 'border-transparent text-deep-teal/40 hover:text-deep-teal/60'
              }`}
            ><span>{tab.icon}</span> {tab.label}</button>
          ))}
        </div>

        {activeView === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setActiveView('feed')}
                placeholder="Search community discussions…"
                className="flex-1 rounded-xl border border-deep-teal/10 bg-white px-4 py-2.5 text-sm text-deep-teal placeholder-deep-teal/30 outline-none focus:border-deep-teal/20"
              />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="rounded-xl border border-deep-teal/10 bg-white px-3 py-2.5 text-sm text-deep-teal"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {categories?.map(c => (
                <button key={c.id} type="button" onClick={() => setCategoryFilter(c.id === categoryFilter ? undefined : c.id)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-all ${
                    categoryFilter === c.id
                      ? 'border-deep-teal bg-deep-teal/5 text-deep-teal'
                      : 'border-deep-teal/10 text-deep-teal/60 hover:border-deep-teal/20'
                  }`}
                >{c.icon} {c.name}</button>
              ))}
              {categoryFilter && (
                <button type="button" onClick={() => setCategoryFilter(undefined)}
                  className="rounded-full border border-deep-teal/10 px-3 py-1 text-[10px] font-bold text-deep-teal/60"
                >✕ Clear</button>
              )}
            </div>

            {feedLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <PostSkeleton key={i} />)}</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <span className="text-3xl">💬</span>
                <p className="text-sm text-deep-teal/40 italic">
                  {searchQuery ? 'No matching discussions found.' : 'No discussions yet. Be the first to ask!'}
                </p>
                {!searchQuery && (
                  <button type="button" onClick={() => setActiveView('ask')}
                    className="inline-block rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white"
                  >Start a Discussion</button>
                )}
              </div>
            ) : (
              <>
                {posts.map(post => {
                  const dn = getDisplayName(post);
                  return (
                    <div key={post.id} onClick={() => openPost(post.id)}
                      className="cursor-pointer rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{dn.icon}</span>
                          <span className="text-[10px] font-bold text-deep-teal/40">{dn.name}</span>
                          {post.isAnonymous && <span className="text-[9px] bg-deep-teal/5 px-1.5 py-0.5 rounded text-deep-teal/40">Anonymous</span>}
                          <span className="text-[10px] text-deep-teal/30">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-deep-teal/5 text-deep-teal/40">
                          {post.categoryName || 'General'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-deep-teal">{post.title}</p>
                      <p className="text-xs text-deep-teal/60 mt-1 line-clamp-2">{post.body}</p>
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-deep-teal/30">
                        <span>🔼 {post.upvoteCount}</span>
                        <span>💬 {post.answerCount}</span>
                        {post.aiPriority === 'high' || post.aiPriority === 'critical' ? (
                          <span className="text-warm-clay font-bold">{post.aiPriority === 'critical' ? '🚨' : '⚠️'} {post.aiPriority}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {hasNextPage && (
                  <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                    className="w-full rounded-xl border border-deep-teal/10 py-3 text-xs font-bold text-deep-teal/50 hover:text-deep-teal disabled:opacity-40"
                  >{isFetchingNextPage ? 'Loading more…' : 'Load More'}</button>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeView === 'ask' && (
          <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="rounded-xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40">New Discussion</p>

              <select value={askForm.categoryId} onChange={e => setAskForm(p => ({ ...p, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-deep-teal/10 px-3 py-2.5 text-sm text-deep-teal"
              >
                <option value="">Select category…</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>

              <div className="relative">
                <input type="text" placeholder="Title" value={askForm.title}
                  onChange={e => setAskForm(p => ({ ...p, title: e.target.value }))} maxLength={200}
                  className="w-full rounded-lg border border-deep-teal/10 px-3 py-2.5 text-sm text-deep-teal placeholder-deep-teal/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-deep-teal/30">{askForm.title.length}/200</span>
              </div>

              <div className="relative">
                <textarea placeholder="Describe your question or idea…" value={askForm.body}
                  onChange={e => setAskForm(p => ({ ...p, body: e.target.value }))} maxLength={5000} rows={5}
                  className="w-full rounded-lg border border-deep-teal/10 px-3 py-2.5 text-sm text-deep-teal placeholder-deep-teal/30 resize-none"
                />
                <span className="absolute right-3 bottom-3 text-[10px] text-deep-teal/30">{askForm.body.length}/5000</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={askForm.isAnonymous}
                  onChange={e => setAskForm(p => ({ ...p, isAnonymous: e.target.checked }))}
                  className="rounded border-deep-teal/20 text-deep-teal"
                />
                <span className="text-sm text-deep-teal/70">Post anonymously</span>
              </label>

              <button type="button" onClick={handleAsk}
                disabled={createPost.isPending || !askForm.categoryId || !askForm.title.trim() || !askForm.body.trim()}
                className="w-full rounded-xl bg-deep-teal py-3 text-sm font-bold text-white hover:bg-deep-teal/90 disabled:opacity-40 transition-all"
              >{createPost.isPending ? 'Posting…' : 'Submit to Community'}</button>

              <p className="text-[10px] text-deep-teal/30 leading-relaxed">
                Your post will be reviewed by AI for safety. Inappropriate content may be flagged for moderation.
                {askForm.isAnonymous ? ' Your identity will not be visible to other students.' : ''}
              </p>
            </div>
          </motion.div>
        )}

        {activeView === 'mine' && (
          <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {myPosts && myPosts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <span className="text-3xl">📋</span>
                <p className="text-sm text-deep-teal/40 italic">You haven&apos;t posted anything yet.</p>
                <button type="button" onClick={() => setActiveView('ask')}
                  className="inline-block rounded-lg bg-deep-teal px-4 py-2 text-xs font-bold text-white"
                >Ask a Question</button>
              </div>
            ) : (
              myPosts?.map(post => {
                const dn = getDisplayName(post);
                return (
                  <div key={post.id} onClick={() => openPost(post.id)}
                    className="cursor-pointer rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-[10px] text-deep-teal/40">
                        <span>{dn.icon} {dn.name}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        post.status === 'open' ? 'bg-sage/10 text-sage' :
                        post.status === 'under_review' ? 'bg-marigold/10 text-marigold' :
                        post.status === 'resolved' ? 'bg-deep-teal/10 text-deep-teal/60' : 'bg-warm-clay/10 text-warm-clay'
                      }`}>{post.status}</span>
                    </div>
                    <p className="text-sm font-bold text-deep-teal">{post.title}</p>
                    <div className="flex gap-3 mt-1 text-[10px] text-deep-teal/30">
                      <span>🔼 {post.upvoteCount}</span>
                      <span>💬 {post.answerCount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeView === 'post' && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button type="button" onClick={() => { setActiveView('feed'); setSelectedPostId(null); }}
              className="text-xs font-bold text-deep-teal/40 hover:text-deep-teal"
            >← Back to feed</button>

            {postLoading ? <PostDetailSkeleton /> : selectedPost && (
              <>
                <div className="rounded-xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getDisplayName(selectedPost).icon}</span>
                    <div>
                      <p className="text-xs font-bold text-deep-teal">{getDisplayName(selectedPost).name}</p>
                      <p className="text-[10px] text-deep-teal/30">{new Date(selectedPost.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-deep-teal/5 text-deep-teal/40">
                      {selectedPost.categoryName || 'General'}
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-deep-teal">{selectedPost.title}</p>
                  <p className="text-sm text-deep-teal/80 mt-2 leading-relaxed whitespace-pre-wrap">{selectedPost.body}</p>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-deep-teal/5">
                    <button type="button" onClick={() => handleUpvote('post', selectedPost.id)}
                      className="flex items-center gap-1 text-xs font-bold text-deep-teal/50 hover:text-deep-teal transition-colors"
                    >🔼 {selectedPost.upvoteCount}</button>
                    <button type="button" onClick={() => handleReport('post', selectedPost.id)}
                      className="flex items-center gap-1 text-xs font-bold text-deep-teal/30 hover:text-warm-clay transition-colors"
                    >🚩 Report</button>
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40">{(answers?.length || 0)} Answers</p>

                {answers && answers.length === 0 ? (
                  <p className="text-sm text-deep-teal/40 italic text-center py-4">No answers yet. Be the first to respond!</p>
                ) : (
                  answers?.map(answer => (
                    <AnswerCard key={answer.id} answer={answer} onUpvote={handleUpvote} onReport={handleReport} />
                  ))
                )}

                <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
                  <textarea value={answerBody} onChange={e => setAnswerBody(e.target.value)}
                    placeholder="Write an answer…" rows={3} maxLength={5000}
                    className="w-full rounded-lg border border-deep-teal/10 px-3 py-2.5 text-sm text-deep-teal placeholder-deep-teal/30 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-deep-teal/30">{answerBody.length}/5000</span>
                    <button type="button" onClick={handleAnswer}
                      disabled={createAnswer.isPending || !answerBody.trim()}
                      className="rounded-lg bg-deep-teal px-5 py-2 text-xs font-bold text-white hover:bg-deep-teal/90 disabled:opacity-40"
                    >{createAnswer.isPending ? 'Posting…' : 'Post Answer'}</button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </CommunityErrorBoundary>
  );
}

function AnswerCard({ answer, onUpvote, onReport }: {
  answer: CommunityAnswer;
  onUpvote: (type: 'post' | 'answer', id: string) => void;
  onReport: (type: 'post' | 'answer', id: string) => void;
}) {
  return (
    <div className={`rounded-xl border p-4 ${
      answer.isAccepted ? 'border-sage/20 bg-sage/5' :
      answer.isAiGenerated ? 'border-primary/10 bg-primary/[0.02]' :
      'border-white/80 bg-white/70 backdrop-blur-xl'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-deep-teal">
            {answer.isAiGenerated ? '🤖 AI Assistant' : answer.authorName || 'Student'}
          </span>
          {answer.isVerified && <span className="text-[9px] bg-sage/10 text-sage px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>}
          {answer.isAccepted && <span className="text-[9px] bg-sage text-white px-1.5 py-0.5 rounded-full font-bold">Accepted</span>}
        </div>
        <span className="text-[10px] text-deep-teal/30">{new Date(answer.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-deep-teal/80 leading-relaxed whitespace-pre-wrap">{answer.body}</p>
      <div className="flex items-center gap-3 mt-3">
        <button type="button" onClick={() => onUpvote('answer', answer.id)}
          className="text-xs font-bold text-deep-teal/50 hover:text-deep-teal"
        >🔼 {answer.upvoteCount}</button>
        <button type="button" onClick={() => onReport('answer', answer.id)}
          className="text-xs font-bold text-deep-teal/30 hover:text-warm-clay"
        >🚩 Report</button>
      </div>
    </div>
  );
}
