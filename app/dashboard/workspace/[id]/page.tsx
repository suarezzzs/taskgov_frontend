'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, Circle, Plus, Trash2, 
  Loader2, Paperclip, FileText, History, UserPlus, UserX, AlertTriangle, Download
} from "lucide-react";
import { toast } from "sonner"; 
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  userName: string;
}

interface TaskDetails extends Task {
  checklists: ChecklistItem[];
  attachments: Attachment[];
}

export default function WorkspacePage() {
  const params = useParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('LOW');
  const [isCreating, setIsCreating] = useState(false);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null); 
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);


  async function fetchTasks() {
    const token = Cookies.get('task_token');
    try {
      const response = await fetch(`http://localhost:3000/tasks/workspace/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) { 
      toast.error("Error loading tasks.");
    } finally { 
      setLoading(false); 
    }
  }

  async function fetchMembers() {
    const token = Cookies.get('task_token');
    try {
      const response = await fetch(`http://localhost:3000/workspaces/${params.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error loading members");
    }
  }

  useEffect(() => { 
    if (params.id) {
      fetchTasks(); 
      fetchMembers();
    }
  }, [params.id]);

  async function handleCreateTask() {
    if (!newTitle) return;
    setIsCreating(true);
    const token = Cookies.get('task_token');
    
    try {
      const res = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          title: newTitle, 
          description: newDescription,
          priority: newPriority, 
          workspaceId: params.id 
        }),
      });

      if (res.ok) {
        const createdTask = await res.json();
        setNewTitle(''); setNewDescription(''); setNewPriority('LOW');
        setIsCreateOpen(false);
        fetchTasks();
        openTaskDetails(createdTask); 
        toast.success("Task created!");
      } else {
        toast.error("Error creating task.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleInviteMember() {
    if (!inviteEmail) return;
    setIsInviting(true);
    const token = Cookies.get('task_token');

    try {
      const res = await fetch(`http://localhost:3000/workspaces/${params.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (res.ok) {
        toast.success(`Invitation sent to ${inviteEmail}!`);
        setInviteEmail('');
        fetchMembers(); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Error inviting member.");
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsInviting(false);
    }
  }

  async function confirmRemoveMember() {
    if (!memberToDelete) return;
    setIsRemovingMember(true);
    const token = Cookies.get('task_token');

    const url = `http://localhost:3000/workspaces/${params.id}/members/${memberToDelete}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Member removed successfully.");
        setMembers(prev => prev.filter(m => m.id !== memberToDelete));
        setMemberToDelete(null); 
      } else {
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.message || `Error ${res.status}: Could not remove.`;
        toast.error(msg);
      }
    } catch (error) {
      toast.error("Connection error.");
    } finally {
      setIsRemovingMember(false);
    }
  }

  async function handleDeleteTask(taskId: string, e: React.MouseEvent) {
    e.stopPropagation(); 
    if(!confirm("Are you sure? This will delete the task and all attachments.")) return;

    setTasks(prev => prev.filter(t => t.id !== taskId)); 

    const token = Cookies.get('task_token');
    await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Task deleted.");
  }

  async function handleToggleStatus(task: Task, e: React.MouseEvent) {
    e.stopPropagation(); 
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t)); 

    const token = Cookies.get('task_token');
    await fetch(`http://localhost:3000/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function fetchLogs(taskId: string) {
    const token = Cookies.get('task_token');
    try {
        const res = await fetch(`http://localhost:3000/logs/task/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setLogs(await res.json());
        }
    } catch (err) {
        console.error("Error fetching logs", err);
    }
  }

  async function openTaskDetails(task: Task) {
    setIsDetailsOpen(true);
    setLoadingDetails(true);
    setSelectedTask(null); 
    setLogs([]); 

    const token = Cookies.get('task_token');
    try {
      const res = await fetch(`http://localhost:3000/tasks/${task.id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTask(data);
        fetchLogs(task.id); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function addChecklistItem() {
    if (!selectedTask || !newChecklistItem) return;
    const token = Cookies.get('task_token');
    
    const res = await fetch(`http://localhost:3000/tasks/${selectedTask.id}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newChecklistItem })
    });
    
    if (res.ok) {
      const newItem = await res.json();
      setSelectedTask({
        ...selectedTask,
        checklists: [...selectedTask.checklists, newItem]
      });
      setNewChecklistItem('');
      fetchLogs(selectedTask.id); 
    }
  }

  async function toggleChecklist(item: ChecklistItem) {
    if (!selectedTask) return;
    const token = Cookies.get('task_token');
    
    const updatedList = selectedTask.checklists.map(i => 
      i.id === item.id ? { ...i, isCompleted: !item.isCompleted } : i
    );
    setSelectedTask({ ...selectedTask, checklists: updatedList });

    await fetch(`http://localhost:3000/tasks/checklist/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isCompleted: !item.isCompleted })
    });
    
    setTimeout(() => fetchLogs(selectedTask.id), 500);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedTask || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', selectedTask.id);

    const token = Cookies.get('task_token');
    const res = await fetch('http://localhost:3000/attachments/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    
    if (res.ok) {
      const newFile = await res.json();
      setSelectedTask({
        ...selectedTask,
        attachments: [...selectedTask.attachments, newFile]
      });
      toast.success("File attached!");
      fetchLogs(selectedTask.id);
    }
  }

  async function handleDownload(attachmentId: string, fileName: string) {
    const token = Cookies.get('task_token');
    try {
      const response = await fetch(`http://localhost:3000/attachments/download/${attachmentId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; 
        document.body.appendChild(a);
        a.click(); 
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Error downloading file (401). Check your permissions.");
      }
    } catch (error) {
      toast.error("Connection error during download.");
    }
  }

  async function confirmDeleteAttachment() {
    if (!attachmentToDelete || !selectedTask) return;
    setIsDeletingAttachment(true);
    const token = Cookies.get('task_token');

    try {
        const res = await fetch(`http://localhost:3000/attachments/${attachmentToDelete}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success("File removed.");
            setSelectedTask({
                ...selectedTask,
                attachments: selectedTask.attachments.filter(a => a.id !== attachmentToDelete)
            });
            fetchLogs(selectedTask.id);
            setAttachmentToDelete(null); 
        } else {
            toast.error("Error removing file.");
        }
    } catch (err) {
        toast.error("Connection error.");
    } finally {
        setIsDeletingAttachment(false);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  return (
    <div className="space-y-6 p-8 md:p-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Project Tasks</h2>
          <p className="text-slate-500">Click on a task to view details.</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle>Manage Members</DialogTitle>
                  <DialogDescription>
                    Add new users or manage current access.
                  </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex gap-2 items-end">
                  <div className="grid gap-2 flex-1">
                    <Label>User Email</Label>
                    <Input 
                      value={inviteEmail} 
                      onChange={(e) => setInviteEmail(e.target.value)} 
                      placeholder="example@gov.br" 
                    />
                  </div>
                  <Button onClick={handleInviteMember} disabled={isInviting}>
                    {isInviting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Invite'}
                  </Button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3 text-slate-700">Current Members ({members.length})</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {members.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No members found.</p>
                    ) : members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                             <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {member.name ? member.name.substring(0,2).toUpperCase() : 'US'}
                             </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <span className="text-sm font-medium text-slate-900">{member.name || 'Unnamed'}</span>
                            <span className="text-xs text-slate-500">{member.email}</span>
                          </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setMemberToDelete(member.id)} 
                        >
                            <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Remove Member
                    </DialogTitle>
                    <DialogDescription className="py-2">
                        Are you sure you want to remove this user from the workspace? They will lose access to tasks immediately.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setMemberToDelete(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmRemoveMember} disabled={isRemovingMember}>
                        {isRemovingMember ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Confirm Removal
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!attachmentToDelete} onOpenChange={(open) => !open && setAttachmentToDelete(null)}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <Trash2 className="h-5 w-5" /> Delete File
                    </DialogTitle>
                    <DialogDescription className="py-2">
                        Are you sure you want to permanently delete this file? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setAttachmentToDelete(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDeleteAttachment} disabled={isDeletingAttachment}>
                        {isDeletingAttachment ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> New Task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                  <DialogTitle>New Task</DialogTitle>
                  <DialogDescription>Fill in the initial information.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What needs to be done?" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Additional details..." />
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={newPriority} onValueChange={(v:any) => setNewPriority(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTask} disabled={isCreating}>
                  {isCreating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create and Add Details'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-400" /></div>
      ) : tasks.length === 0 ? (
        <div className="border-dashed border border-slate-300 p-10 text-center rounded-lg text-slate-500">
          No tasks found.
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className="group flex flex-row items-center p-4 transition-all hover:shadow-md hover:border-blue-300 cursor-pointer bg-white"
              onClick={() => openTaskDetails(task)}
            >
              <div className="mr-4 p-1 rounded-full hover:bg-slate-100" onClick={(e) => handleToggleStatus(task, e)}>
                {task.status === 'DONE' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-slate-300 group-hover:text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`text-base font-medium ${task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {task.title}
                </h4>
                <div className="mt-1 flex items-center gap-3">
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => handleDeleteTask(task.id, e)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {(loadingDetails || !selectedTask) ? (
             <div className="flex flex-col items-center justify-center p-10">
                <DialogHeader>
                    <DialogTitle className="text-center text-slate-500">Loading...</DialogTitle>
                    <DialogDescription className="hidden">Wait</DialogDescription>
                </DialogHeader>
                <Loader2 className="animate-spin text-slate-400 mt-4 h-8 w-8" />
             </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                  <span className="text-sm text-slate-500">Created today</span>
                </div>
                <DialogTitle className="text-xl mt-2">{selectedTask.title}</DialogTitle>
                <DialogDescription>Complete task details.</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="checklist">Checklist ({selectedTask.checklists.length})</TabsTrigger>
                  <TabsTrigger value="files">Files ({selectedTask.attachments.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        className="min-h-[100px]" 
                        defaultValue={selectedTask.description || ''} 
                        readOnly 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="checklist" className="space-y-4 py-4">
                  <div className="flex gap-2">
                    <Input placeholder="New item..." value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} />
                    <Button onClick={addChecklistItem} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-2 mt-4">
                    {selectedTask.checklists.map(item => (
                      <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                        <Checkbox checked={item.isCompleted} onCheckedChange={() => toggleChecklist(item)} />
                        <span className={item.isCompleted ? 'line-through text-slate-400' : ''}>{item.title}</span>
                      </div>
                    ))}
                    {selectedTask.checklists.length === 0 && <p className="text-sm text-slate-400 text-center">No items.</p>}
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4 py-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Paperclip className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="text-sm text-slate-500">Click to attach file</p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <div className="grid gap-2">
                    {selectedTask.attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium">{file.fileName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => handleDownload(file.id, file.fileName)}
                            >
                                <Download className="h-4 w-4" /> Download
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setAttachmentToDelete(file.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4 py-4">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <History className="h-8 w-8 mb-2 opacity-50"/>
                        <p className="text-sm">No activity recorded.</p>
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs border border-blue-200">
                            {log.userName ? log.userName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="grid gap-1">
                            <p className="font-medium text-slate-900">
                              {log.userName || 'User'} <span className="font-normal text-slate-500 ml-1">
                                {log.action === 'CHECK_ITEM_DONE' ? 'completed a checklist item' : 
                                 log.action === 'CHECK_ITEM_UNDONE' ? 'unchecked an item' : 
                                 log.action === 'ATTACHMENT_UPLOAD' ? 'uploaded a file' :
                                 log.action === 'ATTACHMENT_REMOVE' ? 'removed a file' :
                                 log.action === 'CHECK_ITEM_ADD' ? 'added an item' : 'updated the task'}
                              </span>
                            </p>
                            <p className="text-slate-600 bg-slate-50 p-2 rounded-md italic">"{log.details}"</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                               <History className="h-3 w-3"/> {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}