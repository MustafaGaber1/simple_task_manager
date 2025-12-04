// ============================================
// INDIVIDUAL TASK API ROUTE - GET, PATCH, DELETE single task
// ============================================
// This is a dynamic API route: [id] means it accepts any ID
// URL: /api/tasks/123 (where 123 is the task ID)

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { TaskUpdate } from "@/types/database";

// ============================================
// HELPER: Check if user owns or has access to task
// ============================================
import type { SupabaseClient } from "@supabase/supabase-js";

interface TaskShare {
  shared_with_user_id: string;
}

async function canAccessTask(supabase: SupabaseClient, taskId: string, userId: string) {
  const { data: task } = await supabase
    .from("tasks")
    .select("user_id, task_shares(shared_with_user_id)")
    .eq("id", taskId)
    .single();

  if (!task) return false;

  // User is owner OR task is shared with them
  const isOwner = task.user_id === userId;
  const isShared = task.task_shares?.some(
    (share: TaskShare) => share.shared_with_user_id === userId
  );

  return isOwner || isShared;
}

// ============================================
// GET /api/tasks/[id] - Fetch single task
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: taskId } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can access this task
    const hasAccess = await canAccessTask(supabase, taskId, user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch task with related data
    const { data: task, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        profile:profiles!tasks_user_id_fkey(id, full_name, email),
        comments(
          *,
          profile:profiles!comments_user_id_fkey(id, full_name, email)
        ),
        attachments(*),
        task_shares(
          *,
          profile:profiles!task_shares_shared_with_user_id_fkey(id, full_name, email)
        )
      `
      )
      .eq("id", taskId)
      .single();

    if (error) {
      console.error("Error fetching task:", error);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH /api/tasks/[id] - Update task
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: taskId } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns the task (only owner can update)
    const { data: task } = await supabase
      .from("tasks")
      .select("user_id")
      .eq("id", taskId)
      .single();

    if (!task || task.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - Only owner can update task" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, status, priority, due_date, category } = body;

    // Prepare update data (only include fields that were provided)
    const updateData: TaskUpdate = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (category !== undefined) updateData.category = category;

    // Validate title if provided
    if (updateData.title && updateData.title === "") {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    // Update task in database
    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update(updateData as never)
      .eq("id", taskId)
      .select(
        `
        *,
        profile:profiles!tasks_user_id_fkey(id, full_name, email)
      `
      )
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/tasks/[id] - Delete task
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: taskId } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns the task (only owner can delete)
    const { data: task } = await supabase
      .from("tasks")
      .select("user_id")
      .eq("id", taskId)
      .single();

    if (!task || task.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - Only owner can delete task" },
        { status: 403 }
      );
    }

    // Delete task (cascade will delete related comments, attachments, etc.)
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// KEY CONCEPTS EXPLAINED:
// ============================================
//
// 1. DYNAMIC ROUTES:
//    - [id] in folder name makes it dynamic
//    - Accessible via params.id
//    - /api/tasks/abc → params.id = "abc"
//    - /api/tasks/123 → params.id = "123"
//
// 2. AUTHORIZATION vs AUTHENTICATION:
//    - Authentication: "Who are you?" (login check)
//    - Authorization: "Can you do this?" (permission check)
//    - We check BOTH: logged in AND owns the task
//
// 3. HTTP METHODS FOR CRUD:
//    - GET: Read data (fetch task)
//    - PATCH: Partial update (change some fields)
//    - DELETE: Remove data (delete task)
//    - POST: Create new (we did this in route.ts)
//
// 4. PATCH vs PUT:
//    - PATCH: Update only provided fields
//    - PUT: Replace entire resource
//    - We use PATCH for flexibility
//
// 5. HELPER FUNCTIONS:
//    - canAccessTask() is reusable logic
//    - Keeps code DRY (Don't Repeat Yourself)
//    - Makes permissions easier to maintain
//
// 6. CASCADE DELETE:
//    - When we delete a task, related data is auto-deleted
//    - Comments, attachments, shares all removed
//    - Configured in database with ON DELETE CASCADE
//
// 7. STATUS CODE 403 (Forbidden):
//    - 401 Unauthorized: Not logged in
//    - 403 Forbidden: Logged in but no permission
//    - Important distinction for security
//
// 8. PARTIAL UPDATES:
//    - Only update fields that were provided
//    - Check `!== undefined` (not just falsy)
//    - Allows updating to null/empty values
//
// ============================================
// RESEARCH TOPICS:
// ============================================
// - Authorization patterns
// - Database cascade operations
// - Partial vs full updates (PATCH vs PUT)
// - HTTP 403 vs 401
// - Reusable helper functions
// - Permission-based access control (PBAC)
