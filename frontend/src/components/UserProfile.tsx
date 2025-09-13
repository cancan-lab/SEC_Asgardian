import React from 'react';
import { User, Settings, LogOut, BarChart3, History } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserData {
  email: string;
  name: string;
  picture?: string;
}

interface UserProfileProps {
  user: UserData;
  onLogout: () => void;
  analysisCount?: number;
}

export function UserProfile({ user, onLogout, analysisCount = 0 }: UserProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatEmail = (email: string) => {
    if (email.length > 20) {
      return email.slice(0, 17) + '...';
    }
    return email;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-[var(--pastel-blue)]/10">
          <Avatar className="h-10 w-10 bg-[var(--pastel-blue)] text-white">
            {user.picture ? (
              <ImageWithFallback
                src={user.picture}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-sm font-medium">
                {getInitials(user.name)}
              </div>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-0" align="end" forceMount>
        <div className="p-4 bg-gradient-to-r from-[var(--pastel-blue)]/10 to-[var(--pastel-lavender)]/10">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 bg-[var(--pastel-blue)] text-white">
              {user.picture ? (
                <ImageWithFallback
                  src={user.picture}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full font-medium">
                  {getInitials(user.name)}
                </div>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--neutral-text)] truncate">
                {user.name}
              </p>
              <p className="text-sm text-[var(--neutral-text)]/70 truncate">
                {formatEmail(user.email)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary" className="bg-[var(--pastel-green)]/20 text-[var(--neutral-text)] border-[var(--pastel-green)]/30">
              <BarChart3 className="w-3 h-3 mr-1" />
              {analysisCount} Analyses
            </Badge>
            <Badge variant="outline" className="border-[var(--pastel-blue)]/30 text-[var(--pastel-blue)]">
              Pro User
            </Badge>
          </div>
        </div>
        
        <div className="p-2">
          <DropdownMenuLabel className="text-xs text-[var(--neutral-text)]/60 uppercase tracking-wider px-2">
            Account
          </DropdownMenuLabel>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-[var(--pastel-blue)]/10 rounded-lg mx-1">
            <User className="w-4 h-4 mr-3 text-[var(--neutral-text)]/60" />
            <span className="text-[var(--neutral-text)]">Profile Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-[var(--pastel-blue)]/10 rounded-lg mx-1">
            <History className="w-4 h-4 mr-3 text-[var(--neutral-text)]/60" />
            <span className="text-[var(--neutral-text)]">Analysis History</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-[var(--pastel-blue)]/10 rounded-lg mx-1">
            <Settings className="w-4 h-4 mr-3 text-[var(--neutral-text)]/60" />
            <span className="text-[var(--neutral-text)]">Preferences</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="my-2" />
          
          <DropdownMenuItem 
            onClick={onLogout}
            className="cursor-pointer hover:bg-[var(--pastel-red)]/10 rounded-lg mx-1 text-[var(--pastel-red)] focus:text-[var(--pastel-red)]"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}