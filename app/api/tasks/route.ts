// ============================================
// TASKS API ROUTE - GET all tasks, POST new task
// ============================================
// This is a Next.js API Route (backend endpoint)
// URL: /api/tasks

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { TaskInsert } from "@/types/database";

// ============================================
// GET /api/tasks - Fetch all tasks for current user
// ============================================
export async function GET() {
  try {
    // Create Supabase client for server-side operations
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch tasks owned by the user (with task_shares for shared indicator)
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        profile:profiles!tasks_user_id_fkey(id, full_name, email),
        task_shares(id, shared_with_user_id)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/tasks - Create a new task
// ============================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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
    const { title, description, status, priority, due_date, category } = body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Prepare task data
    const taskData: TaskInsert = {
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      status: status || "todo",
      priority: priority || "medium",
      due_date: due_date || null,
      category: category || null,
    };

    // Insert into database
    const { data: newTask, error } = await supabase
      .from("tasks")
      .insert(taskData as never)
      .select(
        `
        *,
        profile:profiles!tasks_user_id_fkey(id, full_name, email)
      `
      )
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task: newTask }, { status: 201 });
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
// 1. NEXT.JS API ROUTES:
//    - Files in app/api/* become backend endpoints
//    - route.ts exports HTTP method functions (GET, POST, etc.)
//    - Runs on the server, not in the browser
//
// 2. NEXTREQUEST & NEXTRESPONSE:
//    - NextRequest: Incoming request with body, headers, etc.
//    - NextResponse: Response to send back (JSON, status code)
//    - Similar to Express req/res but for Next.js
//
// 3. AUTHENTICATION CHECK:
//    - Always verify user is logged in before DB operations
//    - Return 401 (Unauthorized) if not authenticated
//    - This prevents anonymous users from accessing data
//
// 4. SUPABASE QUERIES:
//    - .from('tasks'): Select table
//    - .select('*'): Get all columns
//    - .insert(): Create new row
//    - .single(): Expect only one result
//    - .or(): Complex condition (owner OR shared with)
//
// 5. DATA VALIDATION:
//    - Check required fields (title)
//    - Sanitize input (.trim())
//    - Return 400 (Bad Request) for invalid data
//
// 6. ERROR HANDLING:
//    - Try-catch for unexpected errors
//    - Check Supabase error responses
//    - Return appropriate HTTP status codes
//    - Log errors for debugging
//
// 7. HTTP STATUS CODES:
//    - 200: Success (OK)
//    - 201: Created (new resource)
//    - 400: Bad Request (invalid data)
//    - 401: Unauthorized (not logged in)
//    - 500: Internal Server Error (something broke)
//
// 8. SUPABASE JOINS:
//    - profile:profiles!tasks_user_id_fkey
//    - This joins the profiles table to get user info
//    - The !tasks_user_id_fkey specifies the foreign key
//
// ============================================
// RESEARCH TOPICS:
// ============================================
// - REST API principles
// - HTTP methods (GET, POST, PUT/PATCH, DELETE)
// - HTTP status codes
// - Request/Response cycle
// - Server-side vs client-side code
// - SQL joins and relationships
// - Input validation and sanitization
// - Error handling best practices
