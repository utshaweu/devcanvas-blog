import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PenSquare, User, LogOut, BarChart3, Key, Type, ALargeSmall, LineChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFontFamily } from '@/hooks/useFontFamily';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { SpotlightSearch } from '@/components/common/SpotlightSearch';
import { UpdatePasswordDialog } from '@/features/auth/UpdatePasswordDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success: toastSuccess } = useGlobalToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { fontFamily, toggleFontFamily } = useFontFamily();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    toastSuccess(
      t(TranslationKey.LOGOUT_SUCCESS_TITLE),
      t(TranslationKey.LOGOUT_SUCCESS_MESSAGE)
    );
    navigate('/');
  };

  const handleFontFamilyToggle = () => {
    toggleFontFamily();
  };

  const fontToggleLabel =
    fontFamily === 'inter'
      ? t(TranslationKey.SWITCH_TO_ACME_FONT)
      : t(TranslationKey.SWITCH_TO_INTER_FONT);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-secondary hover:text-accent transition-colors">
            <PenSquare className="h-6 w-6 text-accent" />
            <span className="hidden md:inline">DevCanvas</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6">
            {([
              { to: '/blog', label: t(TranslationKey.BLOG) },
              ...(isAuthenticated
                ? [
                    { to: '/dashboard', label: t(TranslationKey.DASHBOARD) },
                    { to: '/analytics', label: t(TranslationKey.ANALYTICS) },
                    { to: '/create', label: t(TranslationKey.CREATE_POST) },
                  ]
                : []),
            ] as { to: string; label: string }[]).map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-accent font-semibold'
                      : 'text-foreground hover:text-accent'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <SpotlightSearch />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFontFamilyToggle}
            aria-label={fontToggleLabel}
            title={fontToggleLabel}
          >
            {fontFamily === 'inter' ? (
              <Type className="h-4 w-4" />
            ) : (
              <ALargeSmall className="h-4 w-4" />
            )}
          </Button>
          <ThemeToggle />
          {/* language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setLanguage('en')}>EN</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('bn')}>BN</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || 'User'}
                      className="h-8 w-8 rounded-full object-contain border-2 border-accent"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className={pathname === '/dashboard' ? 'text-accent font-semibold' : ''}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>{t(TranslationKey.DASHBOARD)}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')} className={pathname === '/analytics' ? 'text-accent font-semibold' : ''}>
                  <LineChart className="mr-2 h-4 w-4" />
                  <span>{t(TranslationKey.ANALYTICS)}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className={pathname === '/profile' ? 'text-accent font-semibold' : ''}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t(TranslationKey.PROFILE)}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  <span>{t(TranslationKey.CHANGE_PASSWORD)}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t(TranslationKey.LOG_OUT)}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:px-4"
                onClick={() => navigate('/login')}
              >
                {t(TranslationKey.LOG_IN_BUTTON)}
              </Button>
              <Button
                size="sm"
                className="px-2 sm:px-4"
                onClick={() => navigate('/signup')}
              >
                {t(TranslationKey.SIGN_UP_BUTTON)}
              </Button>
            </div>
          )}
        </div>
      </div>

      <UpdatePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </header>
  );
};
