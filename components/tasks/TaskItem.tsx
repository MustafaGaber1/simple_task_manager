// ============================================
// TASK ITEM COMPONENT - Display single task
// ============================================
// Shows task details with actions (edit, delete, toggle status)

"use client";

import { Task } from "@/types/database";
import {
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Clock,
  Share2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleStatus: (taskId: string, newStatus: "todo" | "completed") => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onShare: (task: Task) => void;
  isOwner: boolean;
  isShared?: boolean;
}

export default function TaskItem({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onShare,
  isOwner,
  isShared = false,
}: TaskItemProps) {
  // ============================================
  // PRIORITY COLOR CODING - Vibrant & Beautiful
  // ============================================
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 font-semibold";
      case "medium":
        return "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 font-semibold";
      case "low":
        return "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 font-semibold";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ============================================
  // STATUS COLOR CODING - Vibrant & Beautiful
  // ============================================
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30";
      case "todo":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ============================================
  // CHECK IF TASK IS OVERDUE
  // ============================================
  const isOverdue =
    task.due_date &&
    task.status !== "completed" &&
    new Date(task.due_date) < new Date();

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-l-[6px] group relative overflow-hidden",
        task.status === "completed" && "opacity-70",
        task.priority === "high" &&
          "border-l-rose-500 dark:border-l-rose-400 dark:hover:border-l-rose-300",
        task.priority === "medium" &&
          "border-l-amber-500 dark:border-l-amber-400 dark:hover:border-l-amber-300",
        task.priority === "low" &&
          "border-l-emerald-500 dark:border-l-emerald-400 dark:hover:border-l-emerald-300",
        task.priority !== "high" &&
          task.priority !== "medium" &&
          task.priority !== "low" &&
          "border-l-blue-500/20"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardContent className="p-5 relative">
        <div className="flex items-start gap-4">
          {/* Status toggle button */}
          <Button
            onClick={() =>
              onToggleStatus(
                task.id,
                task.status === "completed" ? "todo" : "completed"
              )
            }
            variant="ghost"
            size="icon"
            className={cn(
              "mt-1 hover:scale-110 transition-transform",
              task.status === "completed"
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            )}
            title={
              task.status === "completed"
                ? "Mark as incomplete"
                : "Mark as complete"
            }
          >
            {task.status === "completed" ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </Button>

          {/* Task content */}
          <div className="flex-1">
            {/* Title */}
            <h3
              className={cn(
                "text-lg font-semibold",
                task.status === "completed"
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="text-muted-foreground mt-2 text-sm">
                {task.description}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority badge */}
              <Badge
                className={cn("border", getPriorityVariant(task.priority))}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>

              {/* Status badge */}
              <Badge className={cn("border", getStatusVariant(task.status))}>
                {task.status === "in_progress"
                  ? "In Progress"
                  : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>

              {/* Category */}
              {task.category && (
                <Badge className="bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/30">
                  {task.category}
                </Badge>
              )}

              {/* Due date */}
              {task.due_date && (
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue &&
                      "border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/15 font-semibold animate-pulse"
                  )}
                >
                  <Clock className="w-3 h-3" />
                  {format(new Date(task.due_date), "MMM d, yyyy")}
                  {isOverdue && " (Overdue)"}
                </Badge>
              )}

              {/* Shared indicator */}
              {isShared && (
                <Badge className="bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                  <Users className="w-3 h-3 mr-1" />
                  Shared
                </Badge>
              )}

              {/* Not owner indicator */}
              {!isOwner && (
                <Badge className="bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
                  <Share2 className="w-3 h-3 mr-1" />
                  Shared with you
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            {/* Share button (only for owner) */}
            {isOwner && (
              <Button
                onClick={() => onShare(task)}
                variant="ghost"
                size="icon"
                className="text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/15 hover:scale-105 transition-all"
                title="Share task"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            )}

            {/* Edit button (only for owner) */}
            {isOwner && (
              <Button
                onClick={() => onEdit(task)}
                variant="ghost"
                size="icon"
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/15 hover:scale-105 transition-all"
                title="Edit task"
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}

            {/* Delete button (only for owner) */}
            {isOwner && (
              <Button
                onClick={() => onDelete(task.id)}
                variant="ghost"
                size="icon"
                className="text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/15 hover:scale-105 transition-all"
                title="Delete task"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
