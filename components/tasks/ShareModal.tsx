// ============================================
// SHARE MODAL COMPONENT - UI for task sharing
// ============================================
// Allows task owners to share tasks with other users

"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types/database";
import { Search, Users, Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

interface SharedUser extends User {
  share_id?: string;
}

export default function ShareModal({
  task,
  isOpen,
  onClose,
  onShare,
}: ShareModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSharedUsers = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`);
      if (response.ok) {
        const data = await response.json();
        const shares = data.task.task_shares || [];
        setSharedUsers(
          shares.map(
            (share: {
              profile: { id: string; email: string; full_name: string | null };
              id: string;
            }) => ({
              id: share.profile.id,
              email: share.profile.email,
              full_name: share.profile.full_name,
              share_id: share.id,
            })
          )
        );
      }
    } catch (err) {
      console.error("Error fetching shared users:", err);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSharedUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleShare = async (userEmail: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${task.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to share task");
      }

      setSearchQuery("");
      setSearchResults([]);
      await fetchSharedUsers();
      onShare();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share task");
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (userId: string) => {
    if (!confirm("Remove this user's access to the task?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/tasks/${task.id}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedUserId: userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unshare task");
      }

      await fetchSharedUsers();
      onShare();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unshare task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share Task
          </DialogTitle>
          <DialogDescription>
            Sharing:{" "}
            <span className="font-medium text-foreground">{task.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Search input */}
          <div className="space-y-2">
            <Label>Add people</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email..."
                className="pl-10"
                disabled={loading}
              />
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleShare(user.email)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {user.full_name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <UserPlus className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shared users list */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              People with access ({sharedUsers.length})
            </h3>

            {sharedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one else has access yet
              </p>
            ) : (
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.full_name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleUnshare(user.id)}
                      disabled={loading}
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      title="Remove access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
