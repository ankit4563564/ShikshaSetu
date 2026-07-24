'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth, requireRole } from '@/lib/auth/getUser';
import type {
  CommunityPost, CommunityAnswer, CommunityCategory, AnonymousIdentity,
  CommunityReport, CommunityAuditLog, AiModerationResult, CreatePostInput, SearchFilters,
} from '@/lib/community/types';

const db = createAdminClient();

function mapPost(row: any): CommunityPost {
  return {
    id: row.id, studentId: row.student_id, categoryId: row.category_id,
    categoryName: row.community_categories?.name, categoryIcon: row.community_categories?.icon,
    title: row.title, body: row.body, isAnonymous: row.is_anonymous,
    anonymousIdentityId: row.anonymous_identity_id,
    anonymousName: row.anonymous_identities?.animal_name,
    anonymousIcon: row.anonymous_identities?.icon,
    aiCategory: row.ai_category, aiPriority: row.ai_priority,
    aiSentiment: row.ai_sentiment, aiToxicityScore: row.ai_toxicity_score,
    aiDuplicateOf: row.ai_duplicate_of, aiSuggestedDepartment: row.ai_suggested_department,
    aiModerated: row.ai_moderated, aiModerationPassed: row.ai_moderation_passed,
    aiModerationReason: row.ai_moderation_reason,
    status: row.status, isPublished: row.is_published,
    upvoteCount: row.upvote_count, answerCount: row.answer_count,
    viewCount: row.view_count, tags: row.tags || [],
    createdAt: row.created_at, updatedAt: row.updated_at,
    studentDisplayName: row.students?.display_name,
  };
}

function mapAnswer(row: any): CommunityAnswer {
  return {
    id: row.id, postId: row.post_id, authorId: row.author_id,
    teacherId: row.teacher_id, isAiGenerated: row.is_ai_generated,
    isVerified: row.is_verified, verifiedBy: row.verified_by,
    body: row.body, upvoteCount: row.upvote_count,
    isAccepted: row.is_accepted, createdAt: row.created_at, updatedAt: row.updated_at,
    authorName: row.students?.display_name,
  };
}

// ── Categories ────────────────────────────────────────────────────────────

export async function getCommunityCategoriesAction(): Promise<CommunityCategory[]> {
  await requireAuth();
  const { data, error } = await db.from('community_categories')
    .select('*').eq('is_active', true).order('sort_order');
  if (error || !data) return [];
  return data.map((c: any) => ({
    id: c.id, name: c.name, slug: c.slug, description: c.description,
    icon: c.icon, sortOrder: c.sort_order, isActive: c.is_active,
    requiresModeration: c.requires_moderation,
    routingTarget: c.routing_target, routingRole: c.routing_role,
  }));
}

// ── Anonymous Identities ──────────────────────────────────────────────────

export async function getAnonymousIdentitiesAction(): Promise<AnonymousIdentity[]> {
  await requireAuth();
  const { data, error } = await db.from('anonymous_identities')
    .select('*').eq('is_active', true).order('animal_name');
  if (error || !data) return [];
  return data.map((a: any) => ({ id: a.id, animalName: a.animal_name, icon: a.icon }));
}

// ── AI Moderation ─────────────────────────────────────────────────────────

function moderateContent(title: string, body: string): AiModerationResult {
  const text = `${title} ${body}`.toLowerCase();

  const toxicityWords = ['hate', 'kill', 'hurt', 'attack', 'stupid', 'idiot', 'dumb', 'ugly'];
  const toxicityScore = toxicityWords.reduce((score, word) =>
    text.includes(word) ? score + 0.15 : score, 0
  );

  const personalPatterns = [
    /\d{10,}/g, /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  ];
  const hasPersonalInfo = personalPatterns.some(p => p.test(text));

  const isTechnical = text.includes('homework') || text.includes('exam') || text.includes('math') || text.includes('science');
  const isIdea = text.includes('suggest') || text.includes('improve') || text.includes('should');
  const isWellness = text.includes('sad') || text.includes('anxious') || text.includes('stress') || text.includes('lonely') || text.includes('help');
  const isSafety = text.includes('safe') || text.includes('danger') || text.includes('emergency') || text.includes('bully');

  let priority = 'medium' as any;
  if (isSafety || isWellness) priority = 'high';
  if (text.includes('urgent') || text.includes('emergency')) priority = 'critical';

  let sentiment = 'neutral' as any;
  if (isWellness) sentiment = 'negative';
  if (isIdea) sentiment = 'positive';
  if (isSafety) sentiment = 'urgent';

  let category = 'general';
  if (isTechnical) category = 'academic';
  if (isIdea) category = 'ideas';
  if (text.includes('club') || text.includes('robotics') || text.includes('drama')) category = 'clubs';
  if (text.includes('bus') || text.includes('transport') || text.includes('pickup') || text.includes('route')) category = 'transport';
  if (text.includes('food') || text.includes('canteen') || text.includes('lunch') || text.includes('snack')) category = 'canteen';
  if (text.includes('lost') || text.includes('found') || text.includes('missing')) category = 'lost-found';
  if (isWellness) category = 'wellness';
  if (isSafety) category = 'safety';
  if (text.includes('library') || text.includes('book')) category = 'library';
  if (text.includes('event') || text.includes('sports day') || text.includes('fest')) category = 'events';

  let suggestedDepartment = 'general';
  if (category === 'transport') suggestedDepartment = 'transport_admin';
  if (category === 'canteen') suggestedDepartment = 'canteen_vendor';
  if (category === 'academic') suggestedDepartment = 'teacher';
  if (category === 'ideas' || category === 'safety') suggestedDepartment = 'admin';
  if (category === 'library') suggestedDepartment = 'library_staff';
  if (category === 'lost-found') suggestedDepartment = 'lost_found_queue';

  const isAppropriate = toxicityScore < 0.5 && !hasPersonalInfo;

  return {
    category, priority, sentiment,
    toxicityScore: Math.min(toxicityScore, 1),
    duplicateOf: null,
    suggestedDepartment,
    isAppropriate,
    reason: !isAppropriate
      ? (toxicityScore >= 0.5 ? 'Content flagged for inappropriate language.' : 'Content may contain personal information.')
      : null,
  };
}

// ── Posts ─────────────────────────────────────────────────────────────────

export async function createPostAction(
  studentId: string, input: CreatePostInput
): Promise<{ success: boolean; error?: string; post?: CommunityPost }> {
  await requireAuth();
  const { title, body, categoryId, isAnonymous, tags } = input;

  if (!title?.trim() || !body?.trim()) return { success: false, error: 'Title and body are required.' };
  if (title.length > 200) return { success: false, error: 'Title too long (max 200 characters).' };
  if (body.length > 5000) return { success: false, error: 'Body too long (max 5000 characters).' };

  const recentCount = await db.from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());
  if ((recentCount.count || 0) >= 5) {
    return { success: false, error: 'Rate limit: max 5 posts per hour.' };
  }

  const moderation = moderateContent(title, body);

  const shouldBlock = !moderation.isAppropriate;
  const status = shouldBlock ? 'under_review' : 'open';
  const isPublished = !shouldBlock;

  const { data, error } = await db.from('community_posts').insert({
    student_id: studentId, category_id: categoryId, title, body,
    is_anonymous: isAnonymous, tags: tags || [],
    ai_category: moderation.category, ai_priority: moderation.priority,
    ai_sentiment: moderation.sentiment,
    ai_toxicity_score: moderation.toxicityScore,
    ai_suggested_department: moderation.suggestedDepartment,
    ai_moderated: true, ai_moderation_passed: moderation.isAppropriate,
    ai_moderation_reason: moderation.reason,
    status, is_published: isPublished,
  }).select('*, community_categories(name, icon), anonymous_identities(animal_name, icon), students(display_name)').single();
  if (error) return { success: false, error: error.message };

  await db.rpc('record_community_audit', {
    p_action: shouldBlock ? 'post_flagged' : 'post_created',
    p_actor_id: studentId, p_actor_role: 'student',
    p_target_type: 'post', p_target_id: (data as any).id,
    p_details: shouldBlock ? `Auto-flagged: ${moderation.reason}` : 'Post created',
  });

  return { success: true, post: mapPost(data) };
}

export async function getCommunityPostsAction(filters?: SearchFilters): Promise<CommunityPost[]> {
  await requireAuth();
  let query = db.from('community_posts')
    .select('*, community_categories(name, icon), anonymous_identities(animal_name, icon), students(display_name)');

  if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters?.status) query = query.eq('status', filters.status);
  else query = query.in('status', ['open', 'approved', 'resolved']);

  query = query.eq('is_published', true);

  if (filters?.query) {
    query = query.textSearch('fts', filters.query, { config: 'english' });
  }
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const sort = filters?.sort || 'latest';
  if (sort === 'trending') query = query.order('upvote_count', { ascending: false });
  else if (sort === 'most_upvoted') query = query.order('upvote_count', { ascending: false });
  else if (sort === 'most_helpful') query = query.order('answer_count', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const page = filters?.page || 1;
  query = query.range((page - 1) * 20, page * 20 - 1);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapPost);
}

export async function getStudentPostsAction(studentId: string): Promise<CommunityPost[]> {
  await requireAuth();
  const { data, error } = await db.from('community_posts')
    .select('*, community_categories(name, icon), anonymous_identities(animal_name, icon)')
    .eq('student_id', studentId).order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapPost);
}

export async function getPostByIdAction(postId: string): Promise<CommunityPost | null> {
  await requireAuth();
  const { data, error } = await db.from('community_posts')
    .select('*, community_categories(name, icon), anonymous_identities(animal_name, icon), students(display_name)')
    .eq('id', postId).single();
  if (error || !data) return null;

  await db.from('community_posts').update({ view_count: (data as any).view_count + 1 }).eq('id', postId);
  return mapPost(data);
}

export async function updatePostStatusAction(
  postId: string, status: string, actorId: string, actorRole: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { error } = await db.from('community_posts').update({ status }).eq('id', postId);
  if (error) return { success: false, error: error.message };

  await db.rpc('record_community_audit', {
    p_action: `status_${status}`, p_actor_id: actorId, p_actor_role: actorRole,
    p_target_type: 'post', p_target_id: postId, p_details: `Status changed to ${status}`,
  });
  return { success: true };
}

// ── Answers ───────────────────────────────────────────────────────────────

export async function createAnswerAction(
  postId: string, body: string, authorId?: string, teacherId?: string, isAi = false
): Promise<{ success: boolean; error?: string; answer?: CommunityAnswer }> {
  await requireAuth();
  if (!body?.trim()) return { success: false, error: 'Answer body is required.' };
  if (body.length > 5000) return { success: false, error: 'Answer too long.' };

  const { data, error } = await db.from('community_answers').insert({
    post_id: postId, author_id: authorId || null, teacher_id: teacherId || null,
    body, is_ai_generated: isAi,
  }).select('*, students(display_name)').single();
  if (error) return { success: false, error: error.message };

  const { data: curPost } = await db.from('community_posts').select('answer_count').eq('id', postId).single();
  await db.from('community_posts').update({ answer_count: ((curPost as any)?.answer_count || 0) + 1 }).eq('id', postId);

  return { success: true, answer: mapAnswer(data) };
}

export async function getAnswersAction(postId: string): Promise<CommunityAnswer[]> {
  await requireAuth();
  const { data, error } = await db.from('community_answers')
    .select('*, students(display_name)')
    .eq('post_id', postId).order('is_accepted', { ascending: false }).order('upvote_count', { ascending: false });
  if (error || !data) return [];
  return data.map(mapAnswer);
}

export async function acceptAnswerAction(
  answerId: string, teacherId: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { data: answer } = await db.from('community_answers').select('post_id').eq('id', answerId).single() as any;
  if (!answer) return { success: false, error: 'Answer not found' };

  await db.from('community_answers').update({ is_accepted: false }).eq('post_id', answer.post_id);
  const { error } = await db.from('community_answers').update({
    is_accepted: true, is_verified: true, verified_by: teacherId,
  }).eq('id', answerId);
  if (error) return { success: false, error: error.message };

  await db.from('community_posts').update({ status: 'resolved' }).eq('id', answer.post_id);
  return { success: true };
}

export async function verifyAnswerAction(
  answerId: string, teacherId: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { error } = await db.from('community_answers').update({
    is_verified: true, verified_by: teacherId,
  }).eq('id', answerId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Upvotes ───────────────────────────────────────────────────────────────

export async function toggleUpvoteAction(
  userId: string, userRole: 'student' | 'teacher' | 'admin',
  targetType: 'post' | 'answer', targetId: string
): Promise<{ success: boolean; upvoted?: boolean; count?: number; error?: string }> {
  await requireAuth();
  const col = targetType === 'post' ? 'post_id' : 'answer_id';
  const existing = await db.from('community_upvotes').select('id')
    .eq('user_id', userId).eq('user_role', userRole).eq(col, targetId).maybeSingle();

  const table = targetType === 'post' ? 'community_posts' : 'community_answers';

  if ((existing.data as any)?.id) {
    await db.from('community_upvotes').delete().eq('id', (existing.data as any).id);
    const { data: cur } = await db.from(table).select('upvote_count').eq('id', targetId).single() as any;
    await db.from(table).update({ upvote_count: Math.max(0, (cur?.upvote_count || 0) - 1) }).eq('id', targetId);
    return { success: true, upvoted: false };
  }

  const { error } = await db.from('community_upvotes').insert({
    user_id: userId, user_role: userRole, [col]: targetId,
  });
  if (error) return { success: false, error: error.message };

  const { data: cur } = await db.from(table).select('upvote_count').eq('id', targetId).single() as any;
  await db.from(table).update({ upvote_count: (cur?.upvote_count || 0) + 1 }).eq('id', targetId);

  const { data: updated } = await db.from(table).select('upvote_count').eq('id', targetId).single() as any;
  return { success: true, upvoted: true, count: updated?.upvote_count };
}

// ── Reports ───────────────────────────────────────────────────────────────

export async function createReportAction(
  reporterId: string, reporterRole: 'student' | 'teacher' | 'admin',
  targetType: 'post' | 'answer', targetId: string, reason: string, description?: string
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const col = targetType === 'post' ? 'post_id' : 'answer_id';
  const { error } = await db.from('community_reports').insert({
    reporter_id: reporterId, reporter_role: reporterRole,
    [col]: targetId, reason, description: description || null,
  });
  if (error) return { success: false, error: error.message };

  await db.rpc('record_community_audit', {
    p_action: 'reported', p_actor_id: reporterId, p_actor_role: reporterRole,
    p_target_type: targetType, p_target_id: targetId, p_details: reason,
  });
  return { success: true };
}

export async function getPendingReportsAction(): Promise<CommunityReport[]> {
  await requireRole(['teacher', 'admin']);
  const { data, error } = await db.from('community_reports')
    .select('*').eq('status', 'pending').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id, reporterId: r.reporter_id, reporterRole: r.reporter_role,
    postId: r.post_id, answerId: r.answer_id, reason: r.reason,
    description: r.description, status: r.status,
    reviewedBy: r.reviewed_by, reviewedAt: r.reviewed_at, createdAt: r.created_at,
  }));
}

export async function resolveReportAction(
  reportId: string, status: string, reviewerId: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { error } = await db.from('community_reports').update({
    status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString(),
  }).eq('id', reportId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── AI Answer Generation ─────────────────────────────────────────────────

export async function generateAiAnswerAction(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { data: post } = await db.from('community_posts')
    .select('title, body, community_categories!inner(name)')
    .eq('id', postId).single() as any;
  if (!post) return { success: false, error: 'Post not found' };

  const title = post.title || '';
  const body = post.body || '';
  const category = post.community_categories?.name || 'General';

  const answerBody = `Based on the discussion in "${category}":

I understand you're asking about "${title}". Here's some helpful information:

${generateHelpfulResponse(title, body, category)}

If you need more specific information, please provide additional details or check with your class teacher.`;

  return createAnswerAction(postId, answerBody, undefined, undefined, true);
}

function generateHelpfulResponse(title: string, body: string, category: string): string {
  const text = `${title} ${body}`.toLowerCase();

  if (text.includes('homework') || text.includes('assignment')) {
    return '• Review your class notes and textbook for relevant concepts.\n• Break down the problem into smaller parts.\n• Ask your subject teacher during the next class.\n• Check the school library for reference materials.';
  }
  if (text.includes('exam') || text.includes('test') || text.includes('study')) {
    return '• Create a study schedule covering all subjects.\n• Practice with previous year question papers.\n• Form a study group with classmates.\n• Visit the library for reference books.';
  }
  if (text.includes('bus') || text.includes('transport')) {
    return '• Contact the transport office for route details.\n• Check the school app for bus timing updates.\n• Report any issues to the transport coordinator.';
  }
  if (text.includes('canteen') || text.includes('food') || text.includes('lunch')) {
    return '• Share your feedback with the canteen manager directly.\n• Menu suggestions are reviewed weekly.\n• For hygiene concerns, please report to the admin office.';
  }
  if (text.includes('lost') || text.includes('found')) {
    return '• Check with the school lost and found office.\n• Provide a detailed description of the item.\n• Ask your class teacher to make an announcement.';
  }
  if (text.includes('sad') || text.includes('stress') || text.includes('anxious') || text.includes('lonely')) {
    return '• You can talk to the school counselor — they are here to help.\n• Share your feelings with a trusted teacher.\n• Remember, it\'s okay to ask for help.\n• You are not alone — many students feel the same way.';
  }
  if (text.includes('safety') || text.includes('bully') || text.includes('danger')) {
    return '• Your safety is the top priority. Please report this to a teacher immediately.\n• The school has a zero-tolerance policy for bullying.\n• You can also submit an anonymous report through this platform.';
  }
  return '• Check with your class teacher or subject teacher for guidance.\n• Visit the school office for official information.\n• Review school notices and announcements for updates.\n• Ask a friend or classmate if they have information.';
}

// ── Search ────────────────────────────────────────────────────────────────

export async function searchCommunityAction(filters: SearchFilters): Promise<{
  posts: CommunityPost[]; total: number;
}> {
  await requireAuth();
  const posts = await getCommunityPostsAction(filters);
  return { posts, total: posts.length };
}

export async function getTrendingPostsAction(): Promise<CommunityPost[]> {
  await requireAuth();
  return getCommunityPostsAction({ sort: 'trending', page: 1 });
}

// ── Identity Reveal (Admin only) ──────────────────────────────────────────

export async function revealPostIdentityAction(
  postId: string, adminId: string
): Promise<{ success: boolean; error?: string; studentName?: string }> {
  await requireRole(['admin']);
  const { data: post } = await db.from('community_posts')
    .select('student_id, students!inner(display_name)')
    .eq('id', postId).single() as any;
  if (!post) return { success: false, error: 'Post not found' };

  const studentName = post.students?.display_name || 'Unknown';

  await db.rpc('record_community_audit', {
    p_action: 'identity_revealed', p_actor_id: adminId, p_actor_role: 'admin',
    p_target_type: 'post', p_target_id: postId,
    p_details: `Anonymous identity revealed: ${studentName}`,
    p_metadata: JSON.stringify({ revealed_student_id: post.student_id }),
  });

  return { success: true, studentName };
}

// ── Smart Routing ────────────────────────────────────────────────────────

export async function getRoutedPostsAction(
  routingTarget: string
): Promise<CommunityPost[]> {
  await requireRole(['teacher', 'admin']);
  const { data, error } = await db.from('community_posts')
    .select('*, community_categories!inner(name, icon, routing_target), anonymous_identities(animal_name, icon), students(display_name)')
    .eq('community_categories.routing_target', routingTarget)
    .eq('is_published', true)
    .in('status', ['open', 'approved'])
    .order('ai_priority', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapPost);
}

// ── Moderation Dashboard ─────────────────────────────────────────────────

export async function getModerationQueueAction(): Promise<{
  flagged: CommunityPost[]; reports: CommunityReport[];
}> {
  await requireRole(['teacher', 'admin']);
  const flagged = await getCommunityPostsAction({ status: 'under_review' });
  const reports = await getPendingReportsAction();
  return { flagged, reports };
}

export async function approvePostAction(
  postId: string, moderatorId: string, moderatorRole: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { error } = await db.from('community_posts').update({
    status: 'open', is_published: true, ai_moderation_passed: true,
  }).eq('id', postId);
  if (error) return { success: false, error: error.message };

  await db.rpc('record_community_audit', {
    p_action: 'post_approved', p_actor_id: moderatorId, p_actor_role: moderatorRole,
    p_target_type: 'post', p_target_id: postId, p_details: 'Post approved by moderator',
  });
  return { success: true };
}

export async function hidePostAction(
  postId: string, moderatorId: string, moderatorRole: string, reason?: string
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['teacher', 'admin']);
  const { error } = await db.from('community_posts').update({
    status: 'hidden', is_published: false,
  }).eq('id', postId);
  if (error) return { success: false, error: error.message };

  await db.rpc('record_community_audit', {
    p_action: 'post_hidden', p_actor_id: moderatorId, p_actor_role: moderatorRole,
    p_target_type: 'post', p_target_id: postId, p_details: reason || 'Hidden by moderator',
  });
  return { success: true };
}

// ── Analytics ────────────────────────────────────────────────────────────

export async function getCommunityAnalyticsAction(): Promise<{
  totalPosts: number; totalAnswers: number; totalReports: number;
  postsByCategory: { name: string; count: number }[];
  postsByDay: { day: string; count: number }[];
  moderationRate: number;
}> {
  await requireRole(['teacher', 'admin']);
  const { count: totalPosts } = await db.from('community_posts').select('*', { count: 'exact', head: true });
  const { count: totalAnswers } = await db.from('community_answers').select('*', { count: 'exact', head: true });
  const { count: totalReports } = await db.from('community_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: flagged } = await db.from('community_posts').select('*', { count: 'exact', head: true }).eq('ai_moderation_passed', false);
  const total = totalPosts || 1;
  const moderationRate = ((flagged || 0) / total) * 100;

  const { data: byCategory } = await db.from('community_posts')
    .select('community_categories!inner(name)').eq('is_published', true) as any;
  const catMap = new Map<string, number>();
  for (const r of (byCategory || [])) {
    const n = r.community_categories?.name || 'Other';
    catMap.set(n, (catMap.get(n) || 0) + 1);
  }
  const postsByCategory = [...catMap.entries()].map(([name, count]) => ({ name, count }));

  const { data: byDay } = await db.from('community_posts')
    .select('created_at').eq('is_published', true).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()) as any;
  const dayMap = new Map<string, number>();
  for (const r of (byDay || [])) {
    const d = (r.created_at || '').slice(0, 10);
    if (d) dayMap.set(d, (dayMap.get(d) || 0) + 1);
  }
  const postsByDay = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([day, count]) => ({ day, count }));

  return {
    totalPosts: totalPosts || 0, totalAnswers: totalAnswers || 0,
    totalReports: totalReports || 0, postsByCategory, postsByDay, moderationRate,
  };
}
