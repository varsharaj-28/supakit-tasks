import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Trash2, Pencil, Check, X } from "lucide-react";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/tasks";
import type { Task } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Task Manager" },
      { name: "description", content: "A simple task manager powered by Supabase." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: listTasks,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const create = useMutation({
    mutationFn: () => createTask({ title: title.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      invalidate();
    },
  });

  const toggle = useMutation({
    mutationFn: (t: Task) => updateTask(t.id, { completed: !t.completed }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: invalidate,
  });

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connected to your Supabase project.
          </p>
        </header>

        <Card className="p-4 space-y-3">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => create.mutate()}
              disabled={!title.trim() || create.isPending}
            >
              {create.isPending ? "Adding…" : "Add Task"}
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="p-4 border-destructive text-destructive text-sm">
            {(error as Error).message}
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No tasks yet. Add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={() => toggle.mutate(t)}
                onDelete={() => remove.mutate(t.id)}
                onSaved={invalidate}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onSaved,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  const save = useMutation({
    mutationFn: () =>
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
      }),
    onSuccess: () => {
      setEditing(false);
      onSaved();
    },
  });

  return (
    <Card className="p-3 flex gap-3 items-start">
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        ) : (
          <>
            <p
              className={`font-medium break-words ${
                task.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground break-words mt-0.5">
                {task.description}
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex gap-1">
        {editing ? (
          <>
            <Button size="icon" variant="ghost" onClick={() => save.mutate()} disabled={save.isPending}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
