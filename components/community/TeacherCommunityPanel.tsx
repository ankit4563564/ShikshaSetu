'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRoutedPosts, useAnswers, useCategories, useCreateAnswer } from '@/lib/community/query';
import { useQueryClient } from '@tanstack/react-query';
import { COMMUNITY_KEYS } from '@/lib/community/query';
import { acceptAnswerAction, verifyAnswerAction } from '@/app/actions/communityActions';
import type { CommunityPost, CommunityAnswer } from '@/lib/community/types';
import { PostSkeleton } from './LoadingSkeleton';
import { CommunityErrorBoundary } from './ErrorBoundary';

interface TeacherCommunityPanelProps {
  teacherId: string;
}

export default function TeacherCommunityPanel({ teacherId }: TeacherCommunityPanelProps) {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [answerBody, setAnswerBody] = useState('');

  const queryClient = useQueryClient();
  const { data: categories } = useCategories();

  const routedTargets = ['teacher', 'admin', 'general'] as const;
  const [selectedRoute, setSelectedRoute] = useState<string>('teacher');

  const { data: routedPosts, isLoading } = useRoutedPosts(selectedRoute);
  const { data: answers } = useAnswers(selectedPost?.id || null);
  const createAnswer = useCreateAnswer(selectedPost?.id || '');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleAnswer = useCallback(async () => {
    if (!answerBody.trim() || !selectedPost) return;
    const res = await createAnswer.mutateAsync(answerBody);
    if (res.success) {
      setAnswerBody('');
      showToast('Answer posted!', 'success');
    } else {
      showToast(res.error || 'Failed', 'error');
    }
  }, [answerBody, selectedPost, createAnswer, showToast]);

  const handleAccept = useCallback(async (answerId: string) => {
    const res = await acceptAnswerAction(answerId, teacherId);
    if (res.success) {
      showToast('Answer accepted!', 'success');
      queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.answers(selectedPost!.id) });
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    } else {
      showToast(res.error || 'Failed', 'error');
    }
  }, [teacherId, selectedPost, queryClient, showToast]);

  const handleVerify = useCallback(async (answerId: string) => {
    const res = await verifyAnswerAction(answerId, teacherId);
    if (res.success) {
      showToast('Answer verified!', 'success');
      queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.answers(selectedPost!.id) });
    } else {
      showToast(res.error || 'Failed', 'error');
    }
  }, [teacherId, selectedPost, queryClient, showToast]);

  if (!selectedPost) {
    return (
      <CommunityErrorBoundary>
        <div className="space-y-6">
          {toast && (
            <div className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between ${
              toast.type === 'success' ? 'bg-sage/10 text-sage' : 'bg-warm-clay/10 text-warm-clay'
            }`}>
              <span>{toast.message}</span>
              <button type="button" onClick={() => setToast(null)} className="text-xs ml-2">✕</button>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40 mb-3">Community Questions</p>
            <div className="flex gap-2 mb-4">
              {routedTargets.map(target => (
                <button key={target} type="button" onClick={() => setSelectedRoute(target)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                    selectedRoute === target
                      ? 'bg-deep-teal text-white'
                      : 'border border-deep-teal/10 text-deep-teal/60 hover:border-deep-teal/20'
                  }`}
                >{target}</button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
          ) : !routedPosts?.length ? (
            <div className="text-center py-12">
              <span className="text-3xl">💬</span>
              <p className="text-sm text-deep-teal/40 italic mt-2">No questions routed to you yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {routedPosts.map(post => (
                <div key={post.id} onClick={() => setSelectedPost(post)}
                  className="cursor-pointer rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-deep-teal">{post.title}</p>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-deep-teal/5 text-deep-teal/40">
                      {post.categoryName || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-deep-teal/60 line-clamp-2">{post.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-deep-teal/30">
                    <span>🔼 {post.upvoteCount}</span>
                    <span>💬 {post.answerCount}</span>
                    <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CommunityErrorBoundary>
    );
  }

  return (
    <CommunityErrorBoundary>
      <div className="space-y-6">
        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm font-bold flex items-center justify-between ${
            toast.type === 'success' ? 'bg-sage/10 text-sage' : 'bg-warm-clay/10 text-warm-clay'
          }`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="text-xs ml-2">✕</button>
          </div>
        )}

        <button type="button" onClick={() => setSelectedPost(null)}
          className="text-xs font-bold text-deep-teal/40 hover:text-deep-teal"
        >← Back to questions</button>

        <div className="rounded-xl border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <div>
              <p className="text-xs font-bold text-deep-teal/40 uppercase">{selectedPost.categoryName || 'General'}</p>
              <p className="text-sm text-deep-teal/30 text-[10px]">{new Date(selectedPost.createdAt).toLocaleString()}</p>
            </div>
            <span className={`ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
              selectedPost.status === 'open' ? 'bg-sage/10 text-sage' : 'bg-deep-teal/5 text-deep-teal/40'
            }`}>{selectedPost.status}</span>
          </div>
          <p className="text-base font-extrabold text-deep-teal">{selectedPost.title}</p>
          <p className="text-sm text-deep-teal/80 mt-2 leading-relaxed whitespace-pre-wrap">{selectedPost.body}</p>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-deep-teal/40">{(answers?.length || 0)} Answers</p>

        {answers && answers.length === 0 ? (
          <p className="text-sm text-deep-teal/40 italic text-center py-4">No answers yet.</p>
        ) : (
          answers?.map(answer => (
            <TeacherAnswerCard
              key={answer.id}
              answer={answer}
              onAccept={handleAccept}
              onVerify={handleVerify}
            />
          ))
        )}

        <div className="rounded-xl border border-white/80 bg-white/70 p-4 backdrop-blur-xl">
          <p className="text-xs font-bold mb-2 text-deep-teal/60">Your Response</p>
          <textarea value={answerBody} onChange={e => setAnswerBody(e.target.value)}
            placeholder="Write your answer as a teacher…" rows={3} maxLength={5000}
            className="w-full rounded-lg border border-deep-teal/10 px-3 py-2.5 text-sm text-deep-teal placeholder-deep-teal/30 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-deep-teal/30">{answerBody.length}/5000</span>
            <button type="button" onClick={handleAnswer}
              disabled={createAnswer.isPending || !answerBody.trim()}
              className="rounded-lg bg-deep-teal px-5 py-2 text-xs font-bold text-white hover:bg-deep-teal/90 disabled:opacity-40"
            >{createAnswer.isPending ? 'Posting…' : 'Post Answer as Teacher'}</button>
          </div>
        </div>
      </div>
    </CommunityErrorBoundary>
  );
}

function TeacherAnswerCard({ answer, onAccept, onVerify }: {
  answer: CommunityAnswer;
  onAccept: (id: string) => void;
  onVerify: (id: string) => void;
}) {
  const [actioning, setActioning] = useState<string | null>(null);
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
      <div className="flex gap-2 mt-3">
        {!answer.isAccepted && (
          <button type="button" onClick={() => { setActioning('accept'); onAccept(answer.id); setActioning(null); }}
            disabled={actioning === 'accept'}
            className="rounded-lg bg-sage px-3 py-1.5 text-xs font-bold text-white hover:bg-sage/90 disabled:opacity-40"
          >Accept as Answer</button>
        )}
        {!answer.isVerified && (
          <button type="button" onClick={() => { setActioning('verify'); onVerify(answer.id); setActioning(null); }}
            disabled={actioning === 'verify'}
            className="rounded-lg border border-deep-teal/10 px-3 py-1.5 text-xs font-bold text-deep-teal/60 hover:border-deep-teal/20 disabled:opacity-40"
          >Verify</button>
        )}
      </div>
    </div>
  );
}
