import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import { AuthContext } from '@/lib/auth/getAuthContext';

/**
 * ScopedSupabaseClient wrapper: Wraps standard Supabase query builder to automatically
 * scope queries to the authenticated tenant's school_id.
 */
export class ScopedSupabaseClient {
  private client = createSupabaseClient();
  public readonly schoolId: string;

  constructor(public readonly context: AuthContext) {
    this.schoolId = context.schoolId;
  }

  /**
   * from: Creates a query builder pre-scoped to the current school_id tenant context.
   */
  from(table: string) {
    const queryBuilder = (this.client as any).from(table);
    
    return {
      select: (...args: any[]) =>
        queryBuilder.select(...args).eq('school_id', this.schoolId),
      insert: (values: any, ...args: any[]) => {
        const payload = Array.isArray(values)
          ? values.map((v) => ({ ...v, school_id: this.schoolId }))
          : { ...values, school_id: this.schoolId };
        return queryBuilder.insert(payload, ...args);
      },
      update: (values: any, ...args: any[]) =>
        queryBuilder.update(values, ...args).eq('school_id', this.schoolId),
      delete: () =>
        queryBuilder.delete().eq('school_id', this.schoolId),
      upsert: (values: any, ...args: any[]) => {
        const payload = Array.isArray(values)
          ? values.map((v) => ({ ...v, school_id: this.schoolId }))
          : { ...values, school_id: this.schoolId };
        return queryBuilder.upsert(payload, ...args);
      },
      // Raw client bypass for custom RPCs or non-tenant queries
      raw: queryBuilder,
    };
  }

  /**
   * getRawClient: Returns raw Supabase server client instance when direct access is required.
   */
  getRawClient() {
    return this.client;
  }
}

/**
 * createScopedClient: Helper factory returning a ScopedSupabaseClient bound to AuthContext.
 */
export function createScopedClient(context: AuthContext): ScopedSupabaseClient {
  return new ScopedSupabaseClient(context);
}
