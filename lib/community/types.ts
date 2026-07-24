export type CommunityCategorySlug =
  | 'academic' | 'ideas' | 'clubs' | 'transport'
  | 'canteen' | 'lost-found' | 'events' | 'wellness' | 'safety' | 'library';

export type PostStatus = 'open' | 'under_review' | 'approved' | 'resolved' | 'closed' | 'hidden';
export type AiPriority = 'low' | 'medium' | 'high' | 'critical';
export type AiSentiment = 'positive' | 'neutral' | 'negative' | 'urgent';
export type RoutingTarget = 'teacher' | 'admin' | 'vendor' | 'transport' | 'library' | 'lost_found' | 'safety' | 'canteen' | 'none';

export interface CommunityCategory {
  id: string;
  name: string;
  slug: CommunityCategorySlug;
  description: string | null;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  requiresModeration: boolean;
  routingTarget: RoutingTarget;
  routingRole: string;
}

export interface AnonymousIdentity {
  id: string;
  animalName: string;
  icon: string;
}

export interface CommunityPost {
  id: string;
  studentId: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  title: string;
  body: string;
  isAnonymous: boolean;
  anonymousIdentityId: string | null;
  anonymousName?: string;
  anonymousIcon?: string;
  aiCategory: string | null;
  aiPriority: AiPriority | null;
  aiSentiment: AiSentiment | null;
  aiToxicityScore: number;
  aiDuplicateOf: string | null;
  aiSuggestedDepartment: string | null;
  aiModerated: boolean;
  aiModerationPassed: boolean;
  aiModerationReason: string | null;
  status: PostStatus;
  isPublished: boolean;
  upvoteCount: number;
  answerCount: number;
  viewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  studentDisplayName?: string;
  isUpvotedByMe?: boolean;
}

export interface CommunityAnswer {
  id: string;
  postId: string;
  authorId: string | null;
  teacherId: string | null;
  isAiGenerated: boolean;
  isVerified: boolean;
  verifiedBy: string | null;
  body: string;
  upvoteCount: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  isUpvotedByMe?: boolean;
}

export interface CommunityUpvote {
  id: string;
  userId: string;
  userRole: 'student' | 'teacher' | 'admin';
  postId: string | null;
  answerId: string | null;
}

export interface CommunityReport {
  id: string;
  reporterId: string;
  reporterRole: 'student' | 'teacher' | 'admin';
  postId: string | null;
  answerId: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CommunityAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorRole: 'student' | 'teacher' | 'admin' | 'system';
  targetType: 'post' | 'answer' | 'report' | 'identity';
  targetId: string;
  details: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface AiModerationResult {
  category: string;
  priority: AiPriority;
  sentiment: AiSentiment;
  toxicityScore: number;
  duplicateOf: string | null;
  suggestedDepartment: string;
  isAppropriate: boolean;
  reason: string | null;
}

export interface CreatePostInput {
  title: string;
  body: string;
  categoryId: string;
  isAnonymous: boolean;
  tags?: string[];
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  status?: PostStatus;
  sort?: 'latest' | 'trending' | 'most_upvoted' | 'most_helpful';
  tags?: string[];
  solved?: boolean;
  page?: number;
}
