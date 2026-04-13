import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Decorative Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-background/50 pointer-events-none" />
      
      {/* Animated Blobs */}
      <div className="absolute top-0 -left-32 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-1/2 -right-32 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute bottom-10 left-1/3 -translate-x-1/2 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="space-y-3">
          <div className="text-8xl md:text-9xl font-bold text-accent opacity-20">
            404
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {t(TranslationKey.PAGE_NOT_FOUND)}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t(TranslationKey.PAGE_NOT_FOUND_DESCRIPTION)}
          </p>
        </div>

        {/* Description */}
        <div>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t(TranslationKey.PAGE_NOT_FOUND_MESSAGE)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover text-accent-foreground font-medium rounded-lg transition-all duration-300"
          >
            <Home size={18} />
            {t(TranslationKey.GO_HOME)}
          </Button>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center justify-center gap-2 px-8 py-3 font-medium rounded-lg transition-all duration-300"
          >
            <ArrowLeft size={18} />
            {t(TranslationKey.GO_BACK)}
          </Button>
        </div>
      </div>
    </div>
  );
};
