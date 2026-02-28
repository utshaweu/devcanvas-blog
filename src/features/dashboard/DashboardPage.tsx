import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PenSquare, FileText, Eye, Heart } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock data - replace with actual data from store
  const stats = {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{t(TranslationKey.DASHBOARD)}</h1>
            <p className="text-muted-foreground mt-2">{t(TranslationKey.WELCOME_BACK)}, {user?.name}!</p>
          </div>
          <Button onClick={() => navigate('/create')}>
            <PenSquare className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_TOTAL_POSTS)}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_PUBLISHED)}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedPosts}</div>
              <p className="text-xs text-muted-foreground">
                {t(TranslationKey.STATS_LIVE_ON_BLOG)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_TOTAL_VIEWS)}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                {t(TranslationKey.STATS_ACROSS_ALL_POSTS)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_TOTAL_LIKES)}</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                {t(TranslationKey.STATS_FROM_YOUR_READERS)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t(TranslationKey.RECENT_POSTS)}</CardTitle>
            <CardDescription>{t(TranslationKey.RECENT_POSTS_DESCRIPTION)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>{t(TranslationKey.NO_POSTS_YET)}</p>
              <Button className="mt-4" onClick={() => navigate('/create')}>
                <PenSquare className="mr-2 h-4 w-4" />
                {t(TranslationKey.CREATE_YOUR_FIRST_POST)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
