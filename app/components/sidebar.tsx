'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Command, Home, LayoutList, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Loading...', email: '...' });

  useEffect(() => {
    async function fetchUser() {
      const token = Cookies.get('task_token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3000/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name || 'User', email: data.email || '' });
        }
      } catch (error) { console.error("Error fetching user"); }
    }
    fetchUser();
  }, []);

  function handleLogout() {
    Cookies.remove('task_token'); 
    router.push('/'); 
  }

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    if (path === '/dashboard/workspaces' && pathname.includes('/workspace/')) return true;
    return false;
  };

  return (
    <div className="flex h-full w-full flex-col bg-white p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Command className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">Task Gov</span>
      </div>

      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="block">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-2 ${isActive('/dashboard') ? 'bg-slate-100 text-blue-700 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Home className="h-4 w-4" /> Home
          </Button>
        </Link>
        
        <Link href="/dashboard/workspaces" className="block">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-2 ${isActive('/dashboard/workspaces') ? 'bg-slate-100 text-blue-700 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <LayoutList className="h-4 w-4" /> My Workspaces
          </Button>
        </Link>
        
        <Link href="/dashboard/settings" className="block">
          <Button 
            variant="ghost" 
            className={`w-full justify-start gap-2 ${isActive('/dashboard/settings') ? 'bg-slate-100 text-blue-700 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </Link>
      </nav>

      <div>
        <Separator className="my-4" />
        <div className="flex items-center gap-3 px-2 mb-4">
          <Avatar>
            <AvatarImage src="" /> 
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-900 truncate" title={user.name}>{user.name}</span>
            <span className="text-xs text-slate-500 truncate" title={user.email}>{user.email}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full gap-2 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
}