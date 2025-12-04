// ============================================
// TASK LIST COMPONENT - Display all tasks
// ============================================
// Fetches and displays tasks, handles CRUD operations

"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/database";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import ShareModal from "./ShareModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  ListTodo,
  RefreshCw,
  AlertCircle,
  Inbox,
} from "lucide-react";

interface TaskListProps {
  userId: string;
}

interface TaskWithShares extends Task {
  task_shares?: Array<{ id: string; shared_with_user_id: string }>;
}

export default function TaskList({ userId }: TaskListProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [tasks, setTasks] = useState<TaskWithShares[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [shareModalTask, setShareModalTask] = useState<Task | undefined>(
    undefined
  );
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | undefined>(
    undefined
  );
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // FETCH TASKS ON COMPONENT MOUNT
  // ============================================
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CREATE NEW TASK
  // ============================================
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string | null;
    category: string | null;
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const data = await response.json();
      setTasks([data.task, ...tasks]);
      setShowForm(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create task";
      throw new Error(message);
    }
  };

  // ============================================
  // UPDATE EXISTING TASK
  // ============================================
  const handleUpdateTask = async (taskData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string | null;
    category: string | null;
  }) => {
    if (!editingTask) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const data = await response.json();
      setTasks(tasks.map((t) => (t.id === editingTask.id ? data.task : t)));
      setEditingTask(undefined);
      setShowForm(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      throw new Error(message);
    }
  };

  // ============================================
  // TOGGLE TASK STATUS
  // ============================================
  const handleToggleStatus = async (
    taskId: string,
    newStatus: "todo" | "completed"
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const data = await response.json();
      setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      alert(message);
    }
  };

  // ============================================
  // DELETE TASK
  // ============================================
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setDeleteConfirmTask(task);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirmTask) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/tasks/${deleteConfirmTask.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((t) => t.id !== deleteConfirmTask.id));
      setDeleteConfirmTask(undefined);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(message);
      setDeleteConfirmTask(undefined);
    } finally {
      setDeleting(false);
    }
  };

  // ============================================
  // HANDLE ACTIONS
  // ============================================
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleShareClick = (task: Task) => {
    setShareModalTask(task);
  };

  const handleShareClose = () => {
    setShareModalTask(undefined);
    fetchTasks();
  };

  // ============================================
  // FILTER TASKS BY STATUS
  // ============================================
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const visibleTodoTasks = todoTasks.filter((t) => t.id !== editingTask?.id);
  const visibleInProgressTasks = inProgressTasks.filter(
    (t) => t.id !== editingTask?.id
  );
  const visibleCompletedTasks = completedTasks.filter(
    (t) => t.id !== editingTask?.id
  );

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive font-semibold mb-2">
          Error loading tasks
        </p>
        <p className="text-destructive/80 text-sm mb-4">{error}</p>
        <Button onClick={fetchTasks} variant="destructive">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with create button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <ListTodo className="w-8 h-8" />
          My Tasks
        </h1>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="w-5 h-5" />
          New Task
        </Button>
      </div>

      {/* Task form */}
      {showForm && (
        <div className="mb-6">
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="bg-muted border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            No tasks yet. Create your first task to get started!
          </p>
          <Button onClick={() => setShowForm(true)} size="lg">
            <Plus className="w-5 h-5" />
            Create Your First Task
          </Button>
        </div>
      )}

      {/* Task sections */}
      {tasks.length > 0 && (
        <div className="space-y-8">
          {/* To Do section */}
          {visibleTodoTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                To Do ({visibleTodoTasks.length})
              </h2>
              <div className="space-y-3">
                {todoTasks.map((task) =>
                  editingTask?.id === task.id ? null : (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteTask}
                      onShare={handleShareClick}
                      isOwner={task.user_id === userId}
                      isShared={
                        !!task.task_shares && task.task_shares.length > 0
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* In Progress section */}
          {visibleInProgressTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                In Progress ({visibleInProgressTasks.length})
              </h2>
              <div className="space-y-3">
                {inProgressTasks.map((task) =>
                  editingTask?.id === task.id ? null : (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteTask}
                      onShare={handleShareClick}
                      isOwner={task.user_id === userId}
                      isShared={
                        !!task.task_shares && task.task_shares.length > 0
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Completed section */}
          {visibleCompletedTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Completed ({visibleCompletedTasks.length})
              </h2>
              <div className="space-y-3">
                {completedTasks.map((task) =>
                  editingTask?.id === task.id ? null : (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteTask}
                      onShare={handleShareClick}
                      isOwner={task.user_id === userId}
                      isShared={
                        !!task.task_shares && task.task_shares.length > 0
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {shareModalTask && (
        <ShareModal
          task={shareModalTask}
          isOpen={true}
          onClose={handleShareClose}
          onShare={handleShareClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmTask}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteConfirmTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteConfirmTask(undefined)}
      />
    </div>
  );
}
