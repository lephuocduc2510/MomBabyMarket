export interface CrawlResult {
  title: string;
  content?: string;
  imageUrl?: string;
  localImagePath?: string;
  articleUrl: string;
  publishedAt: Date;
  source: string;
  platform: 'facebook' | 'instagram' | 'website';
  crawledAt: Date;
}

export interface CrawlTarget {
  url: string;
  platform: 'facebook' | 'instagram' | 'website';
  name: string;
  maxPosts: number;
}

export interface CrawlerConfig {
  headless: boolean;
  timeout: number;
  delay: number;
  maxRetries: number;
  batchSize: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface CrawlStats {
  totalTargets: number;
  successfulTargets: number;
  failedTargets: number;
  totalPosts: number;
  totalImages: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}
