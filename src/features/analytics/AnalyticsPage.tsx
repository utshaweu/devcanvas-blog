import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Heart, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/common/StatCard';
import { LineChartView } from '@/components/common/LineChartView';
import { BarChartView } from '@/components/common/BarChartView';
import { PieChartView } from '@/components/common/PieChartView';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useBlogStore } from '@/stores/blogStore';
import type {
  BlogPost,
  AnalyticsMonthlyDataPoint,
  AnalyticsTopPostDataPoint,
  AnalyticsDistributionDataPoint,
  ReusableLineChartSeries,
} from '@/types';

const CHART_COLORS = ['#3B82F6', '#0EA5E9', '#22C55E', '#F59E0B', '#F97316', '#EC4899'];

const truncateTitle = (title: string, maxLength = 24): string => {
  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, maxLength)}...`;
};

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const fetchUserPostsStats = useBlogStore((state) => state.fetchUserPostsStats);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      if (!user?.id) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const userPosts = await fetchUserPostsStats(user.id);

      if (!isMounted) {
        return;
      }

      setPosts(userPosts);
      setIsLoading(false);
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [user?.id, fetchUserPostsStats]);

  const totalPosts = posts.length;
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);

  const averageViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
  const averageInteractionsPerPost = totalPosts > 0 ? Math.round((totalLikes + totalComments) / totalPosts) : 0;

  const monthlyPerformanceData = useMemo<AnalyticsMonthlyDataPoint[]>(() => {
    const monthFormatter = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
    });

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      return {
        key,
        month: monthFormatter.format(date),
        views: 0,
        likes: 0,
        comments: 0,
        posts: 0,
      };
    });

    const monthIndexMap = new Map(months.map((month, index) => [month.key, index]));

    posts.forEach((post) => {
      const baseDate = post.published_at || post.created_at;
      const date = new Date(baseDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const index = monthIndexMap.get(key);

      if (index === undefined) {
        return;
      }

      months[index].views += post.views;
      months[index].likes += post.likes;
      months[index].comments += post.comments;
      months[index].posts += 1;
    });

    return months;
  }, [language, posts]);

  const topPostsByEngagement = useMemo<AnalyticsTopPostDataPoint[]>(() => {
    return [...posts]
      .map((post) => {
        const engagementScore = post.views + post.likes * 3 + post.comments * 5;

        return {
          title: truncateTitle(post.title),
          fullTitle: post.title,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          engagementScore,
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 6);
  }, [posts]);

  const publishStatusData = useMemo<AnalyticsDistributionDataPoint[]>(() => {
    const publishedCount = posts.filter((post) => post.published).length;

    return [
      { name: t(TranslationKey.PUBLISHED), value: publishedCount },
      { name: t(TranslationKey.DRAFT), value: posts.length - publishedCount },
    ];
  }, [posts, t]);

  const categoryDistributionData = useMemo<AnalyticsDistributionDataPoint[]>(() => {
    const counts = new Map<string, number>();

    posts.forEach((post) => {
      const categoryName = post.category?.name || t(TranslationKey.ANALYTICS_UNCATEGORIZED);
      counts.set(categoryName, (counts.get(categoryName) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [posts, t]);

  const monthlyChartSeries = useMemo<ReusableLineChartSeries[]>(() => {
    return [
      { dataKey: 'views', name: t(TranslationKey.ANALYTICS_VIEWS), stroke: '#3B82F6' },
      { dataKey: 'likes', name: t(TranslationKey.ANALYTICS_LIKES), stroke: '#16A34A' },
      { dataKey: 'comments', name: t(TranslationKey.ANALYTICS_COMMENTS), stroke: '#F59E0B' },
    ];
  }, [t]);

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{t(TranslationKey.ANALYTICS_LOADING)}</p>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="container-custom py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>{t(TranslationKey.ANALYTICS_EMPTY_TITLE)}</CardTitle>
            <CardDescription>{t(TranslationKey.ANALYTICS_EMPTY_DESCRIPTION)}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/create')}>{t(TranslationKey.CREATE_NEW_POST)}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{t(TranslationKey.ANALYTICS)}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t(TranslationKey.ANALYTICS_DESCRIPTION)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t(TranslationKey.STATS_TOTAL_POSTS)}
            value={totalPosts}
            description={`${averageViewsPerPost} ${t(TranslationKey.ANALYTICS_AVG_VIEWS_PER_POST)}`}
            icon={FileText}
          />
          <StatCard
            title={t(TranslationKey.STATS_TOTAL_VIEWS)}
            value={totalViews}
            description={t(TranslationKey.STATS_ACROSS_ALL_POSTS)}
            icon={Eye}
          />
          <StatCard
            title={t(TranslationKey.STATS_TOTAL_LIKES)}
            value={totalLikes}
            description={`${averageInteractionsPerPost} ${t(TranslationKey.ANALYTICS_AVG_INTERACTIONS_PER_POST)}`}
            icon={Heart}
          />
          <StatCard
            title={t(TranslationKey.COMMENTS)}
            value={totalComments}
            description={t(TranslationKey.STATS_FROM_YOUR_READERS)}
            icon={MessageSquare}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t(TranslationKey.ANALYTICS_MONTHLY_PERFORMANCE)}</CardTitle>
              <CardDescription>{t(TranslationKey.ANALYTICS_MONTHLY_PERFORMANCE_DESCRIPTION)}</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartView
                data={monthlyPerformanceData}
                xDataKey="month"
                series={monthlyChartSeries}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(TranslationKey.ANALYTICS_TOP_POSTS)}</CardTitle>
              <CardDescription>{t(TranslationKey.ANALYTICS_TOP_POSTS_DESCRIPTION)}</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartView
                data={topPostsByEngagement}
                xDataKey="title"
                barDataKey="engagementScore"
                barName={t(TranslationKey.ANALYTICS_ENGAGEMENT_SCORE)}
                tooltipLabelKey="fullTitle"
                showXAxisLabels={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(TranslationKey.ANALYTICS_PUBLISHING_STATUS)}</CardTitle>
              <CardDescription>{t(TranslationKey.ANALYTICS_PUBLISHING_STATUS_DESCRIPTION)}</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartView
                data={publishStatusData}
                colors={CHART_COLORS}
                outerRadius={96}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t(TranslationKey.ANALYTICS_CATEGORY_DISTRIBUTION)}</CardTitle>
              <CardDescription>{t(TranslationKey.ANALYTICS_CATEGORY_DISTRIBUTION_DESCRIPTION)}</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartView
                data={categoryDistributionData}
                colors={CHART_COLORS}
                innerRadius={56}
                outerRadius={96}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
