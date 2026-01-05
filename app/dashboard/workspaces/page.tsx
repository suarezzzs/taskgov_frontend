'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { ArrowRight, Briefcase, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
}

export default function WorkspacesListPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function fetchWorkspaces() {
    const token = Cookies.get('task_token');
    try {
      const response = await fetch('http://localhost:3000/workspaces', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setWorkspaces(await response.json());
      }
    } catch (error) {
      console.error("Error loading workspaces");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName) return;
    setIsCreating(true);
    const token = Cookies.get('task_token');
    
    try {
      const res = await fetch('http://localhost:3000/workspaces', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
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

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault(); 
    if(!confirm("Are you sure you want to delete this workspace? All tasks will be lost.")) return;

    const token = Cookies.get('task_token');
    try {
        const res = await fetch(`http://localhost:3000/workspaces/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            toast.success("Workspace deleted.");
            setWorkspaces(prev => prev.filter(w => w.id !== id));
        } else {
            toast.error("Error removing. Verify if you are the owner.");
        }
    } catch (err) {
        toast.error("Connection error.");
    }
  }

  useEffect(() => { fetchWorkspaces(); }, []);

  return (
    <div className="space-y-6 p-8 md:p-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Workspaces</h2>
          <p className="text-slate-500">Manage your projects and teams.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Workspace
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>Name your new workspace.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Workspace Name</Label>
                        <Input 
                            id="name" 
                            placeholder="Ex: Marketing, IT, Finance..." 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={isCreating}>
                        {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-10 bg-slate-50">
            <Briefcase className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-slate-500">No workspace found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/dashboard/workspace/${ws.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {ws.name.substring(0, 2).toUpperCase()}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(ws.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-lg">{ws.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Created on {new Date(ws.createdAt).toLocaleDateString()}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                    Open Workspace <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}