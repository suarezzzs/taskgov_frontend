'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Plus, Briefcase, Trash2, ArrowRight, Loader2, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string; 
}

export default function MyWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function fetchWorkspaces() {
    const token = Cookies.get('task_token');
    try {
      const res = await fetch('http://localhost:3000/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setWorkspaces(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWorkspaces(); }, []);

  async function handleCreate() {
    if (!newName) return;
    setIsCreating(true);
    const token = Cookies.get('task_token');
    
    try {
      const res = await fetch('http://localhost:3000/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        toast.success("Workspace created successfully");
        setNewName('');
        setIsCreating(false);
        setIsCreateOpen(false);
        fetchWorkspaces();
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete ALL tasks in this project forever.")) return;
    
    setWorkspaces(prev => prev.filter(w => w.id !== id));

    const token = Cookies.get('task_token');
    try {
      const res = await fetch(`http://localhost:3000/workspaces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Workspace deleted");
      } else {
        toast.error("Error deleting. You might not be the owner.");
        fetchWorkspaces();
      }
    } catch (error) {
      toast.error("Connection error");
      fetchWorkspaces();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Workspaces</h2>
          <p className="text-slate-500">Manage your projects and teams.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> New Work
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>Name your new workspace.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Marketing, Development..." 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-300" /></div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-12 text-center bg-slate-50">
          <FolderOpen className="h-10 w-10 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No workspaces found</h3>
          <p className="text-sm text-slate-500 mb-4">You don't have any projects yet.</p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create the first one</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="flex flex-col justify-between transition-all hover:border-blue-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <CardDescription>Created on {new Date(workspace.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 mt-4">
                  <Link href={`/dashboard/workspace/${workspace.id}`} className="w-full">
                    <Button className="w-full" variant="outline">
                      Open <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(workspace.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}