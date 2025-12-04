// ============================================
// TASK SHARING API ROUTE - Share/Unshare tasks
// ============================================
// URL: POST /api/tasks/:id/share - Add collaborator
// URL: DELETE /api/tasks/:id/share - Remove collaborator

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ============================================
// POST - Share task with another user
// ============================================
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Check if current user owns the task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("user_id")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if ((task as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { error: "Only task owner can share" },
        { status: 403 }
      );
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", userEmail)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "User not found with that email" },
        { status: 404 }
      );
    }

    // Can't share with yourself
    if ((targetUser as { id: string }).id === user.id) {
      return NextResponse.json(
        { error: "Cannot share task with yourself" },
        { status: 400 }
      );
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from("task_shares")
      .select("id")
      .eq("task_id", taskId)
      .eq("shared_with_user_id", (targetUser as { id: string }).id)
      .single();

    if (existingShare) {
      return NextResponse.json(
        { error: "Task already shared with this user" },
        { status: 400 }
      );
    }

    // Create share
    const { data: newShare, error: shareError } = await supabase
      .from("task_shares")
      .insert({
        task_id: taskId,
        shared_with_user_id: (targetUser as { id: string }).id,
        shared_by_user_id: user.id,
      } as never)
      .select(
        `
        *,
        profile:profiles!task_shares_shared_with_user_id_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .single();

    if (shareError) {
      console.error("Error creating share:", shareError);
      return NextResponse.json(
        { error: "Failed to share task" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Task shared successfully",
        share: newShare,
      },
      { status: 201 }
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
// DELETE - Remove user from shared task
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

    // Parse request body
    const body = await request.json();
    const { sharedUserId } = body;

    if (!sharedUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if current user owns the task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("user_id")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if ((task as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { error: "Only task owner can unshare" },
        { status: 403 }
      );
    }

    // Delete the share
    const { error: deleteError } = await supabase
      .from("task_shares")
      .delete()
      .eq("task_id", taskId)
      .eq("shared_with_user_id", sharedUserId);

    if (deleteError) {
      console.error("Error deleting share:", deleteError);
      return NextResponse.json(
        { error: "Failed to unshare task" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Task unshared successfully" },
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
// 1. MANY-TO-MANY RELATIONSHIPS:
//    - One task can be shared with multiple users
//    - One user can have multiple tasks shared with them
//    - task_shares is the "join table" that connects them
//
// 2. AUTHORIZATION CHECKS:
//    - Only the task owner can share/unshare
//    - Check task.user_id === user.id before allowing action
//    - Different from authentication (login check)
//
// 3. VALIDATION STEPS:
//    - Check if user exists (lookup by email)
//    - Check if already shared (prevent duplicates)
//    - Check if sharing with self (not allowed)
//    - Each validation returns helpful error message
//
// 4. DATABASE JOINS:
//    - When creating share, we join with profiles table
//    - This returns the shared user's info in one query
//    - More efficient than separate queries
//
// 5. ERROR HANDLING:
//    - 400: Bad Request (invalid input)
//    - 401: Unauthorized (not logged in)
//    - 403: Forbidden (not allowed to do this)
//    - 404: Not Found (resource doesn't exist)
//    - 500: Server Error (something broke)
//
// 6. RESTful API DESIGN:
//    - POST: Create a resource (add share)
//    - DELETE: Remove a resource (remove share)
//    - Same endpoint, different HTTP methods
//    - Clean and semantic URL structure
//
// ============================================
// RESEARCH TOPICS:
// ============================================
// - Many-to-many relationships in databases
// - Join tables and foreign keys
// - REST API design principles
// - HTTP status codes
// - Authorization vs Authentication
// - Database constraints (unique, foreign key)


