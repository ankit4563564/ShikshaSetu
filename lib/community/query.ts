'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getCommunityPostsAction, getCommunityCategoriesAction, getStudentPostsAction,
  getPostByIdAction, getAnswersAction, searchCommunityAction, getTrendingPostsAction,
  createPostAction, createAnswerAction, toggleUpvoteAction, createReportAction,
  getCommunityAnalyticsAction, getModerationQueueAction, getPendingReportsAction,
  getRoutedPostsAction,
} from '@/app/actions/communityActions';
import type { CommunityPost, CommunityAnswer, SearchFilters } from './types';

export const COMMUNITY_KEYS = {
  posts: (filters?: SearchFilters) => ['community', 'posts', filters] as const,
  post: (id: string) => ['community', 'post', id] as const,
  answers: (postId: string) => ['community', 'answers', postId] as const,
  categories: ['community', 'categories'] as const,
  myPosts: (studentId: string) => ['community', 'myPosts', studentId] as const,
  trending: ['community', 'trending'] as const,
  analytics: ['community', 'analytics'] as const,
  moderationQueue: ['community', 'moderationQueue'] as const,
  reports: ['community', 'reports'] as const,
  routedPosts: (target: string) => ['community', 'routed', target] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: COMMUNITY_KEYS.categories,
    queryFn: getCommunityCategoriesAction,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePosts(filters?: SearchFilters) {
  return useQuery({
    queryKey: COMMUNITY_KEYS.posts(filters),
    queryFn: () => getCommunityPostsAction(filters),
    staleTime: 30_000,
  });
}

export function useInfinitePosts(filters?: Omit<SearchFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['community', 'posts', 'infinite', filters],
    queryFn: ({ pageParam }) => getCommunityPostsAction({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function usePost(postId: string | null) {
  return useQuery({
    queryKey: COMMUNITY_KEYS.post(postId!),
    queryFn: () => getPostByIdAction(postId!),
    enabled: !!postId,
    staleTime: 30_000,
  });
}

export function useAnswers(postId: string | null) {
  return useQuery({
    queryKey: COMMUNITY_KEYS.answers(postId!),
    queryFn: () => getAnswersAction(postId!),
    enabled: !!postId,
    staleTime: 10_000,
  });
}

export function useMyPosts(studentId: string) {
  return useQuery({
    queryKey: COMMUNITY_KEYS.myPosts(studentId),
    queryFn: () => getStudentPostsAction(studentId),
    staleTime: 30_000,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: COMMUNITY_KEYS.trending,
    queryFn: getTrendingPostsAction,
    staleTime: 60_000,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: COMMUNITY_KEYS.analytics,
    queryFn: getCommunityAnalyticsAction,
    staleTime: 2 * 60_000,
  });
}

export function useModerationQueue() {
  return useQuery({
    queryKey: COMMUNITY_KEYS.moderationQueue,
    queryFn: getModerationQueueAction,
    refetchInterval: 30_000,
  });
}

export function useReports() {
  return useQuery({
    queryKey: COMMUNITY_KEYS.reports,
    queryFn: getPendingReportsAction,
    refetchInterval: 30_000,
  });
}

export function useRoutedPosts(target: string) {
  return useQuery({
    queryKey: COMMUNITY_KEYS.routedPosts(target),
    queryFn: () => getRoutedPostsAction(target),
    staleTime: 30_000,
  });
}

export function useSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filters: SearchFilters) => searchCommunityAction(filters),
    onSuccess: (data, filters) => {
      queryClient.setQueryData(COMMUNITY_KEYS.posts(filters), data.posts);
    },
  });
}

export function useCreatePost(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createPostAction>[1]) =>
      createPostAction(studentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
      queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.myPosts(studentId) });
      queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.analytics });
    },
  });
}

export function useCreateAnswer(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createAnswerAction(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITY_KEYS.answers(postId) });
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

export function useToggleUpvote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId, userRole, targetType, targetId,
    }: {
      userId: string; userRole: 'student' | 'teacher' | 'admin';
      targetType: 'post' | 'answer'; targetId: string;
    }) => toggleUpvoteAction(userId, userRole, targetType, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'answers'] });
    },
  });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: ({
      reporterId, reporterRole, targetType, targetId, reason, description,
    }: {
      reporterId: string; reporterRole: 'student' | 'teacher' | 'admin';
      targetType: 'post' | 'answer'; targetId: string;
      reason: string; description?: string;
    }) => createReportAction(reporterId, reporterRole, targetType, targetId, reason, description),
  });
}
