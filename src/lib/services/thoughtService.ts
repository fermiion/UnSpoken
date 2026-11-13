import fs from "fs";
import path from "path";
import { supabaseServer, isSupabaseConfigured } from "../supabase";
import {
  computeContentHash,
  generateDeletionToken,
  hashDeletionToken,
  verifyDeletionToken,
} from "../normalization";

export type ReactionType = "hear_you" | "not_alone" | "warmth" | "understand";

export interface Thought {
  id: string;
  content: string;
  content_hash: string;
  category: string;
  status: "published" | "held" | "removed";
  created_at: string;
  published_at: string;
  deletion_token_hash: string;
  is_duplicate_acknowledged: boolean;
  is_demonstration?: boolean;
  reactions_count: {
    hear_you: number;
    not_alone: number;
    warmth: number;
    understand: number;
  };
}

export interface PublicThought {
  id: string;
  content: string;
  category: string;
  created_at: string;
  published_at: string;
  is_demonstration?: boolean;
  reactions_count: {
    hear_you: number;
    not_alone: number;
    warmth: number;
    understand: number;
  };
}

export interface Report {
  id: string;
  thought_id: string;
  category: string;
  description: string;
  status: "pending" | "reviewed" | "dismissed" | "actioned";
  created_at: string;
}

export interface ModerationEvent {
  id: string;
  thought_id: string;
  moderation_category: string;
  decision: "approved" | "held" | "removed" | "dismissed";
  notes?: string;
  reviewed_at: string;
}

interface LocalStore {
  thoughts: Thought[];
  reports: Report[];
  moderationEvents: ModerationEvent[];
}

// Initial warm, realistic seeds for initial launch
const INITIAL_SEEDS: Thought[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    content: "I told everyone I was fine with moving to a new city, but some nights the quiet in this room is so loud it physically aches. I just want someone to know I'm trying my best.",
    content_hash: computeContentHash("I told everyone I was fine with moving to a new city, but some nights the quiet in this room is so loud it physically aches. I just want someone to know I'm trying my best."),
    category: "loneliness",
    status: "published",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    published_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    deletion_token_hash: hashDeletionToken("seed-token-1"),
    is_duplicate_acknowledged: false,
    is_demonstration: true,
    reactions_count: { hear_you: 14, not_alone: 22, warmth: 19, understand: 11 },
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    content: "To the person I haven't spoken to in three years: I forgave you a long time ago. I just didn't have the courage to say it out loud without reopening the wound.",
    content_hash: computeContentHash("To the person I haven't spoken to in three years: I forgave you a long time ago. I just didn't have the courage to say it out loud without reopening the wound."),
    category: "things-left-unsaid",
    status: "published",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    published_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    deletion_token_hash: hashDeletionToken("seed-token-2"),
    is_duplicate_acknowledged: false,
    is_demonstration: true,
    reactions_count: { hear_you: 31, not_alone: 18, warmth: 25, understand: 17 },
  },
  {
    id: "e102f9c8-1153-4315-bb8a-2e4b09b9f69b",
    content: "I finally finished the painting I started when my mother was still here. It took me two years to pick up the brush again. Today, the colours felt warm instead of heavy.",
    content_hash: computeContentHash("I finally finished the painting I started when my mother was still here. It took me two years to pick up the brush again. Today, the colours felt warm instead of heavy."),
    category: "hope",
    status: "published",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    deletion_token_hash: hashDeletionToken("seed-token-3"),
    is_duplicate_acknowledged: false,
    is_demonstration: true,
    reactions_count: { hear_you: 28, not_alone: 9, warmth: 42, understand: 16 },
  },
  {
    id: "b218579e-4e4b-4861-9f93-3e7428c0dbd1",
    content: "I spend all day mentoring juniors and leading meetings, but deep inside I often wonder if I'm just playing a character who knows what they're doing.",
    content_hash: computeContentHash("I spend all day mentoring juniors and leading meetings, but deep inside I often wonder if I'm just playing a character who knows what they're doing."),
    category: "personal-growth",
    status: "published",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    deletion_token_hash: hashDeletionToken("seed-token-4"),
    is_duplicate_acknowledged: false,
    is_demonstration: true,
    reactions_count: { hear_you: 45, not_alone: 52, warmth: 27, understand: 38 },
  },
];

// Local JSON File Path for persistent local development fallback
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "unspoken-store.json");

function ensureLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: LocalStore = {
        thoughts: INITIAL_SEEDS,
        reports: [],
        moderationEvents: [],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(raw) as LocalStore;
  } catch (err) {
    console.error("Local store read error, falling back to memory:", err);
    return { thoughts: INITIAL_SEEDS, reports: [], moderationEvents: [] };
  }
}

function saveLocalStore(store: LocalStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Local store write error:", err);
  }
}

// Convert DB Thought to Public representation (stripping secret hash)
function toPublicThought(t: Thought): PublicThought {
  return {
    id: t.id,
    content: t.content,
    category: t.category,
    created_at: t.created_at,
    published_at: t.published_at,
    is_demonstration: t.is_demonstration,
    reactions_count: t.reactions_count || {
      hear_you: 0,
      not_alone: 0,
      warmth: 0,
      understand: 0,
    },
  };
}

export class ThoughtService {
  /**
   * Returns current database connection status
   */
  static getStatus(): { isSupabase: boolean; provider: string } {
    return {
      isSupabase: isSupabaseConfigured,
      provider: isSupabaseConfigured ? "Supabase PostgreSQL" : "Local Persistent Engine",
    };
  }

  /**
   * Checks if an identical or normalized duplicate thought exists
   */
  static async checkDuplicate(content: string): Promise<boolean> {
    const hash = computeContentHash(content);

    if (isSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from("thoughts")
        .select("id")
        .eq("content_hash", hash)
        .eq("status", "published")
        .limit(1);

      if (error) {
        console.error("Supabase duplicate check error:", error);
      } else if (data && data.length > 0) {
        return true;
      }
      return false;
    }

    const store = ensureLocalStore();
    return store.thoughts.some(
      (t) => t.status === "published" && t.content_hash === hash
    );
  }

  /**
   * Submits a new anonymous thought
   */
  static async createThought(params: {
    content: string;
    category?: string;
    status?: "published" | "held";
    is_duplicate_acknowledged?: boolean;
  }): Promise<{ thought: PublicThought; deletionToken: string }> {
    const deletionToken = generateDeletionToken();
    const deletionTokenHash = hashDeletionToken(deletionToken);
    const contentHash = computeContentHash(params.content);
    const now = new Date().toISOString();
    const category = params.category || "unspoken";
    const status = params.status || "published";

    if (isSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from("thoughts")
        .insert({
          content: params.content,
          content_hash: contentHash,
          category,
          status,
          deletion_token_hash: deletionTokenHash,
          is_duplicate_acknowledged: params.is_duplicate_acknowledged || false,
          reactions_count: { hear_you: 0, not_alone: 0, warmth: 0, understand: 0 },
          created_at: now,
          published_at: now,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save thought to Supabase: ${error.message}`);
      }

      return {
        thought: toPublicThought(data as Thought),
        deletionToken,
      };
    }

    // Local fallback
    const store = ensureLocalStore();
    const newThought: Thought = {
      id: crypto.randomUUID ? crypto.randomUUID() : `thought_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      content: params.content,
      content_hash: contentHash,
      category,
      status,
      created_at: now,
      published_at: now,
      deletion_token_hash: deletionTokenHash,
      is_duplicate_acknowledged: params.is_duplicate_acknowledged || false,
      reactions_count: { hear_you: 0, not_alone: 0, warmth: 0, understand: 0 },
    };

    store.thoughts.unshift(newThought);
    saveLocalStore(store);

    return {
      thought: toPublicThought(newThought),
      deletionToken,
    };
  }

  /**
   * Retrieves published thoughts with optional category filter & pagination
   */
  static async getThoughts(params: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<{ thoughts: PublicThought[]; total: number; hasMore: boolean }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const offset = (page - 1) * limit;

    if (isSupabaseConfigured && supabaseServer) {
      let query = supabaseServer
        .from("thoughts")
        .select("id, content, category, created_at, published_at, reactions_count", {
          count: "exact",
        })
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (params.category && params.category !== "all") {
        query = query.eq("category", params.category);
      }

      const { data, count, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error("Supabase getThoughts error:", error);
      } else {
        const total = count || 0;
        return {
          thoughts: (data || []) as PublicThought[],
          total,
          hasMore: offset + (data?.length || 0) < total,
        };
      }
    }

    // Local fallback
    const store = ensureLocalStore();
    let filtered = store.thoughts.filter((t) => t.status === "published");

    if (params.category && params.category !== "all") {
      filtered = filtered.filter((t) => t.category === params.category);
    }

    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      thoughts: paginated.map(toPublicThought),
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  /**
   * Retrieves a single published thought by ID
   */
  static async getThoughtById(id: string): Promise<PublicThought | null> {
    if (isSupabaseConfigured && supabaseServer) {
      const { data } = await supabaseServer
        .from("thoughts")
        .select("id, content, category, created_at, published_at, reactions_count")
        .eq("id", id)
        .eq("status", "published")
        .single();
      return (data as PublicThought) || null;
    }

    const store = ensureLocalStore();
    const found = store.thoughts.find((t) => t.id === id && t.status === "published");
    return found ? toPublicThought(found) : null;
  }

  /**
   * Increments a supportive reaction for a thought
   */
  static async addReaction(
    thoughtId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; newCount: number }> {
    if (isSupabaseConfigured && supabaseServer) {
      try {
        await supabaseServer.rpc("increment_reaction", {
          p_thought_id: thoughtId,
          p_reaction_type: reactionType,
        });

        // Also record in reactions table
        await supabaseServer.from("reactions").insert({
          thought_id: thoughtId,
          reaction_type: reactionType,
        });

        const { data } = await supabaseServer
          .from("thoughts")
          .select("reactions_count")
          .eq("id", thoughtId)
          .single();

        return {
          success: true,
          newCount: data?.reactions_count?.[reactionType] || 1,
        };
      } catch (err) {
        console.error("Supabase reaction error:", err);
      }
    }

    const store = ensureLocalStore();
    const thought = store.thoughts.find((t) => t.id === thoughtId);
    if (!thought) return { success: false, newCount: 0 };

    if (!thought.reactions_count) {
      thought.reactions_count = { hear_you: 0, not_alone: 0, warmth: 0, understand: 0 };
    }

    thought.reactions_count[reactionType] =
      (thought.reactions_count[reactionType] || 0) + 1;
    saveLocalStore(store);

    return {
      success: true,
      newCount: thought.reactions_count[reactionType],
    };
  }

  /**
   * Submits a report for a thought
   */
  static async reportThought(params: {
    thoughtId: string;
    category: string;
    description?: string;
  }): Promise<{ success: boolean; reportId: string }> {
    const reportId = crypto.randomUUID ? crypto.randomUUID() : `rep_${Date.now()}`;
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from("reports")
        .insert({
          thought_id: params.thoughtId,
          category: params.category,
          description: params.description || null,
          status: "pending",
          created_at: now,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase report error:", error);
      } else if (data) {
        return { success: true, reportId: data.id };
      }
    }

    const store = ensureLocalStore();
    const newReport: Report = {
      id: reportId,
      thought_id: params.thoughtId,
      category: params.category,
      description: params.description || "",
      status: "pending",
      created_at: now,
    };

    store.reports.unshift(newReport);
    saveLocalStore(store);

    return { success: true, reportId };
  }

  /**
   * Securely deletes an anonymous thought using the author's deletion token
   */
  static async deleteThought(
    thoughtId: string,
    deletionToken: string
  ): Promise<{ success: boolean; message: string }> {
    if (!deletionToken) {
      return { success: false, message: "Deletion token is required." };
    }

    if (isSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from("thoughts")
        .select("id, deletion_token_hash")
        .eq("id", thoughtId)
        .single();

      if (error || !data) {
        return { success: false, message: "Thought not found." };
      }

      const isValid = verifyDeletionToken(deletionToken, data.deletion_token_hash);
      if (!isValid) {
        return { success: false, message: "Invalid deletion key. Check your key and try again." };
      }

      await supabaseServer.from("thoughts").delete().eq("id", thoughtId);
      return { success: true, message: "Your thought has been permanently removed." };
    }

    const store = ensureLocalStore();
    const index = store.thoughts.findIndex((t) => t.id === thoughtId);
    if (index === -1) {
      return { success: false, message: "Thought not found." };
    }

    const thought = store.thoughts[index];
    const isValid = verifyDeletionToken(deletionToken, thought.deletion_token_hash);
    if (!isValid) {
      return { success: false, message: "Invalid deletion key. Check your key and try again." };
    }

    // Permanently remove
    store.thoughts.splice(index, 1);
    saveLocalStore(store);

    return { success: true, message: "Your thought has been permanently removed." };
  }

  // ==============================================================
  // ADMIN & MODERATION METHODS
  // ==============================================================

  static async getAdminStats(): Promise<{
    totalPublished: number;
    pendingHeld: number;
    pendingReports: number;
    totalRemoved: number;
  }> {
    if (isSupabaseConfigured && supabaseServer) {
      const [pubRes, heldRes, repRes, remRes] = await Promise.all([
        supabaseServer.from("thoughts").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabaseServer.from("thoughts").select("id", { count: "exact", head: true }).eq("status", "held"),
        supabaseServer.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabaseServer.from("thoughts").select("id", { count: "exact", head: true }).eq("status", "removed"),
      ]);

      return {
        totalPublished: pubRes.count || 0,
        pendingHeld: heldRes.count || 0,
        pendingReports: repRes.count || 0,
        totalRemoved: remRes.count || 0,
      };
    }

    const store = ensureLocalStore();
    return {
      totalPublished: store.thoughts.filter((t) => t.status === "published").length,
      pendingHeld: store.thoughts.filter((t) => t.status === "held").length,
      pendingReports: store.reports.filter((r) => r.status === "pending").length,
      totalRemoved: store.thoughts.filter((t) => t.status === "removed").length,
    };
  }

  static async getModerationQueue(): Promise<{
    heldThoughts: Thought[];
    reports: (Report & { thought?: PublicThought })[];
  }> {
    if (isSupabaseConfigured && supabaseServer) {
      const { data: held } = await supabaseServer
        .from("thoughts")
        .select("*")
        .eq("status", "held")
        .order("created_at", { ascending: false });

      const { data: reports } = await supabaseServer
        .from("reports")
        .select("*, thoughts(id, content, category, created_at, published_at, reactions_count)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const formattedReports = (reports || []).map((r: any) => ({
        ...r,
        thought: r.thoughts ? toPublicThought(r.thoughts) : undefined,
      }));

      return {
        heldThoughts: (held || []) as Thought[],
        reports: formattedReports,
      };
    }

    const store = ensureLocalStore();
    const heldThoughts = store.thoughts.filter((t) => t.status === "held");
    const reports = store.reports
      .filter((r) => r.status === "pending")
      .map((r) => {
        const thought = store.thoughts.find((t) => t.id === r.thought_id);
        return {
          ...r,
          thought: thought ? toPublicThought(thought) : undefined,
        };
      });

    return { heldThoughts, reports };
  }

  static async applyModerationAction(params: {
    thoughtId: string;
    decision: "approved" | "removed" | "held";
    notes?: string;
  }): Promise<{ success: boolean }> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured && supabaseServer) {
      const newStatus = params.decision === "approved" ? "published" : params.decision;
      await supabaseServer
        .from("thoughts")
        .update({ status: newStatus })
        .eq("id", params.thoughtId);

      await supabaseServer.from("moderation_events").insert({
        thought_id: params.thoughtId,
        moderation_category: "admin_decision",
        decision: params.decision,
        notes: params.notes || null,
        reviewed_at: now,
      });

      return { success: true };
    }

    const store = ensureLocalStore();
    const thought = store.thoughts.find((t) => t.id === params.thoughtId);
    if (thought) {
      thought.status = params.decision === "approved" ? "published" : params.decision;
      store.moderationEvents.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : `mod_${Date.now()}`,
        thought_id: params.thoughtId,
        moderation_category: "admin_decision",
        decision: params.decision,
        notes: params.notes,
        reviewed_at: now,
      });
      saveLocalStore(store);
    }

    return { success: true };
  }

  static async resolveReport(params: {
    reportId: string;
    action: "dismiss" | "remove_content";
    notes?: string;
  }): Promise<{ success: boolean }> {
    const status = params.action === "dismiss" ? "dismissed" : "actioned";

    if (isSupabaseConfigured && supabaseServer) {
      const { data: rep } = await supabaseServer
        .from("reports")
        .update({ status })
        .eq("id", params.reportId)
        .select("thought_id")
        .single();

      if (params.action === "remove_content" && rep?.thought_id) {
        await supabaseServer
          .from("thoughts")
          .update({ status: "removed" })
          .eq("id", rep.thought_id);
      }

      return { success: true };
    }

    const store = ensureLocalStore();
    const rep = store.reports.find((r) => r.id === params.reportId);
    if (rep) {
      rep.status = status;
      if (params.action === "remove_content") {
        const thought = store.thoughts.find((t) => t.id === rep.thought_id);
        if (thought) {
          thought.status = "removed";
        }
      }
      saveLocalStore(store);
    }

    return { success: true };
  }
}
