// ============================================
// USER SEARCH API ROUTE - Find users by email
// ============================================
// URL: GET /api/users/search?q=search_term

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ============================================
// GET - Search for users by email
// ============================================
export async function GET(request: NextRequest) {
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

    // Get search query from URL parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    // Search for users by email (case-insensitive)
    // Using ilike for case-insensitive LIKE
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .ilike("email", `%${query}%`)
      .neq("id", user.id) // Exclude current user
      .limit(10); // Limit results to 10

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users }, { status: 200 });
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
// 1. QUERY PARAMETERS:
//    - URL: /api/users/search?q=john
//    - searchParams.get('q') extracts the query value
//    - Query params are key-value pairs after ? in URL
//    - Multiple params: ?q=john&limit=5
//
// 2. ILIKE OPERATOR:
//    - Case-insensitive LIKE in PostgreSQL
//    - 'ilike' matches regardless of case
//    - %text% pattern matches text anywhere in string
//    - % is a wildcard (matches any characters)
//
// 3. EXCLUDING CURRENT USER:
//    - .neq('id', user.id) means "not equal"
//    - Users shouldn't share tasks with themselves
//    - Filter out at database level (efficient)
//
// 4. LIMITING RESULTS:
//    - .limit(10) returns max 10 results
//    - Prevents overwhelming UI with too many results
//    - Important for performance with large datasets
//
// 5. EMPTY QUERY HANDLING:
//    - Return empty array if no query
//    - Don't search if user hasn't typed anything
//    - Saves database resources
//
// 6. SEARCH UX PATTERNS:
//    - This will be called as user types (debounced)
//    - Shows results in real-time
//    - Common in autocomplete/typeahead features
//
// ============================================
// RESEARCH TOPICS:
// ============================================
// - URL query parameters
// - SQL LIKE and ILIKE operators
// - Debouncing in user input
// - Autocomplete/typeahead patterns
// - Database query optimization
// - Limiting and pagination


