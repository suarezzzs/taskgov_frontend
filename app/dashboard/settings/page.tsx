'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogOut, Save, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User>({ id: '', name: '', email: '' });
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const token = Cookies.get('task_token');
      try {
        const res = await fetch('http://localhost:3000/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUser(data);
            setName(data.name);
        }
      } catch (error) {
        toast.error("Error loading profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  function handleLogout() {
    Cookies.remove('task_token');
    router.push('/');
  }

  async function handleUpdate() {
    setUpdating(true);
    const token = Cookies.get('task_token');

    try {
        const payload: any = { name };
        if (password) payload.password = password;

        const res = await fetch('http://localhost:3000/users/me', { 
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success("Profile updated successfully!");
            setUser(prev => ({ ...prev, name }));
            setPassword(''); 
        } else {
            const errorData = await res.json().catch(() => null);
            toast.error(errorData?.message || "Error updating profile.");
        }
    } catch (error) {
        toast.error("Connection error.");
    } finally {
        setUpdating(false);
    }
  }

  return (
    <div className="space-y-6 p-8 md:p-12 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your personal information and security.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Update your identification data.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your name"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly className="bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-slate-400">
                Email cannot be changed. Contact support for critical changes.
            </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your access password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    placeholder="Leave blank to keep current" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-4 bg-slate-50 rounded-b-lg">
            <Button onClick={handleUpdate} disabled={updating || loading}>
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </CardFooter>
      </Card>

      <div className="pt-6 border-t">
        <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}