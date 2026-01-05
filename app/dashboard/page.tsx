'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Briefcase, CheckCircle2, Clock, Layout, 
  ArrowRight, Activity, AlertCircle, 
  History as HistoryIcon, Plus, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  workspaceId: string;
  createdAt: string;
}

interface DashboardStats {
  totalWorkspaces: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  productivity: number;
}

export default function DashboardPage() {
  const router = useRouter();
  
  const [user, setUser] = useState({ name: 'User', email: '' });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [myPriorities, setMyPriorities] = useState<Task[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkspaces: 0, totalTasks: 0, pendingTasks: 0, completedTasks: 0, productivity: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function fetchDashboardData() {
    const token = Cookies.get('task_token');
    if (!token) return;

    try {
      const resUser = await fetch('http://localhost:3000/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
      });
      if (resUser.ok) setUser(await resUser.json());

      const resWs = await fetch('http://localhost:3000/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let wsData: Workspace[] = [];
      if (resWs.ok) {
          wsData = await resWs.json();
          setWorkspaces(wsData);
      }

      const tasksPromises = wsData.map(ws => 
          fetch(`http://localhost:3000/tasks/workspace/${ws.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : [])
      );

      const tasksResults = await Promise.all(tasksPromises);
      const allTasks: Task[] = tasksResults.flat(); 

      const total = allTasks.length;
      const completed = allTasks.filter(t => t.status === 'DONE').length;
      const pending = total - completed;
      const prodRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
          totalWorkspaces: wsData.length,
          totalTasks: total,
          pendingTasks: pending,
          completedTasks: completed,
          productivity: prodRate
      });

      const priorities = allTasks
          .filter(t => t.status !== 'DONE' && (t.priority === 'HIGH' || t.priority === 'MEDIUM'))
          .sort((a, b) => (a.priority === 'HIGH' ? -1 : 1))
          .slice(0, 5);
      
      setMyPriorities(priorities);

      const recent = [...allTasks]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
      
      setRecentTasks(recent);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleCreateWorkspace() {
    if (!newWorkspaceName) return;
    setIsCreating(true);
    const token = Cookies.get('task_token');

    try {
        const res = await fetch('http://localhost:3000/workspaces', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ name: newWorkspaceName })
        });

        if (res.ok) {
            toast.success("Workspace created successfully!");
            setNewWorkspaceName('');
            setIsCreateOpen(false);
            fetchDashboardData(); 
        } else {
            toast.error("Error creating workspace.");
        }
    } catch (error) {
        toast.error("Connection error.");
    } finally {
        setIsCreating(false);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function getPriorityColor(priority: string) {
    if (priority === 'HIGH') return 'bg-red-500';
    if (priority === 'MEDIUM') return 'bg-yellow-500';
    return 'bg-blue-500';
  }

  function getWorkspaceName(id: string) {
      return workspaces.find(w => w.id === id)?.name || 'Workspace';
  }

  return (
    <div className="space-y-6 p-8 md:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {user.name ? user.name.split(' ')[0] : 'User'}!
          </h1>
          <p className="text-slate-500">
            Here is your activity summary for today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}.
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Layout className="h-4 w-4" /> New Workspace
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                        Create a space to manage your team's tasks.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Workspace Name</Label>
                        <Input 
                            id="name" 
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="Ex: Marketing, IT, Finance..." 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateWorkspace} disabled={isCreating}>
                        {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workspaces</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalWorkspaces}</div>
            <p className="text-xs text-slate-500">Projects you participate in</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalTasks}</div>
            <p className="text-xs text-slate-500">{stats.pendingTasks} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.completedTasks}</div>
            <p className="text-xs text-slate-500">Total accumulated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Productivity</CardTitle>
             <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : `${stats.productivity}%`}</div>
            <p className="text-xs text-slate-500">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        
        <div className="md:col-span-4 space-y-6">
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Workspaces</CardTitle>
                    <CardDescription>Manage your projects and teams.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center p-4"><p className="text-sm text-slate-500">Loading...</p></div>
                    ) : workspaces.length === 0 ? (
                        <div className="text-center py-6 border border-dashed rounded-lg bg-slate-50">
                            <p className="text-sm text-slate-500">No workspace found.</p>
                        </div>
                    ) : (
                        workspaces.map((ws) => (
                            <div key={ws.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold">
                                        {ws.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="grid gap-1">
                                        <p className="font-medium text-sm">{ws.name}</p>
                                        <p className="text-xs text-slate-500">Role: {ws.role || 'Member'}</p>
                                    </div>
                                </div>
                                <Link href={`/dashboard/workspace/${ws.id}`}>
                                    <Button variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700">
                                        Open <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" /> My Priorities
                    </CardTitle>
                    <CardDescription>Urgent pending tasks across all your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                             <p className="text-sm text-slate-500">Calculating priorities...</p>
                        ) : myPriorities.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 border border-dashed rounded-md">
                                No urgent tasks pending.
                            </div>
                        ) : (
                            myPriorities.map((task) => (
                                <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                        <div>
                                            <p className="text-sm font-medium">{task.title}</p>
                                            <p className="text-xs text-slate-500">{getWorkspaceName(task.workspaceId)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline">{task.priority}</Badge>
                                        <Link href={`/dashboard/workspace/${task.workspaceId}`}>
                                            <Button size="sm" variant="secondary">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-3">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Latest Updates</CardTitle>
                    <CardDescription>New tasks created.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] pr-4 overflow-y-auto">
                        <div className="space-y-6">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading feed...</p>
                            ) : recentTasks.length === 0 ? (
                                <p className="text-sm text-slate-500">No recent activity.</p>
                            ) : (
                                recentTasks.map((task, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-600">
                                                TK
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="text-sm leading-none text-slate-600">
                                                New task <span className="font-semibold text-slate-900">"{task.title}"</span> in <span className="font-medium text-blue-600">{getWorkspaceName(task.workspaceId)}</span>.
                                            </p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <HistoryIcon className="h-3 w-3"/> {new Date(task.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}