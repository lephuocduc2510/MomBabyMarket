import { CrawlTarget, CrawlerConfig } from '../types';

export const crawlTargets: CrawlTarget[] = [
  // Facebook Pages
  { url: 'https://www.facebook.com/mamako.mgl/', platform: 'facebook', name: 'Mamako Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/novomgl', platform: 'facebook', name: 'Novo Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/jivhbabymomsuperstore', platform: 'facebook', name: 'Jivh Baby Mom Superstore', maxPosts: 5 },
  { url: 'https://www.facebook.com/pigeonmongolia', platform: 'facebook', name: 'Pigeon Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/DrBrownsMongolia', platform: 'facebook', name: 'Dr Browns Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/baboomongolia', platform: 'facebook', name: 'Baboo Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/Twistshakemongolia', platform: 'facebook', name: 'Twistshake Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/nuby.monos', platform: 'facebook', name: 'Nuby Monos', maxPosts: 5 },
  { url: 'https://www.facebook.com/AsiaPharmaDistributionllc', platform: 'facebook', name: 'Asia Pharma Distribution', maxPosts: 5 },
  { url: 'https://www.facebook.com/MunchkinMongolia', platform: 'facebook', name: 'Munchkin Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/HaakaaMongolia/', platform: 'facebook', name: 'Haakaa Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/@humana.mongolei/', platform: 'facebook', name: 'Humana Mongolia', maxPosts: 5 },
  { url: 'https://www.facebook.com/tubabyshopping/', platform: 'facebook', name: 'Tu Baby Shopping', maxPosts: 5 },
  { url: 'https://www.facebook.com/babybiomn', platform: 'facebook', name: 'Baby Bio MN', maxPosts: 5 },
  { url: 'https://www.facebook.com/www.nomin.mn', platform: 'facebook', name: 'Nomin Facebook', maxPosts: 5 },
  { url: 'https://www.facebook.com/babyworldmn/', platform: 'facebook', name: 'Baby World MN', maxPosts: 5 },
  
  // Instagram Pages
  { url: 'https://www.instagram.com/jivhkhurgelt/', platform: 'instagram', name: 'Jivh Khurgelt', maxPosts: 5 },
  { url: 'https://www.instagram.com/tushopping2/', platform: 'instagram', name: 'Tu Shopping 2', maxPosts: 5 },
  { url: 'https://www.instagram.com/nominmn.official/', platform: 'instagram', name: 'Nomin MN Official', maxPosts: 5 },
  { url: 'https://www.instagram.com/haakaamongolia/', platform: 'instagram', name: 'Haakaa Mongolia IG', maxPosts: 5 },
  { url: 'https://www.instagram.com/baby_world_mongolia/', platform: 'instagram', name: 'Baby World Mongolia IG', maxPosts: 5 },
  { url: 'https://www.instagram.com/mamako.mgl/', platform: 'instagram', name: 'Mamako MGL IG', maxPosts: 5 },
  
  // E-commerce Websites
  { url: 'https://www.emonos.mn/product/41074', platform: 'website', name: 'Emonos Product', maxPosts: 5 },
  { url: 'https://www.emonos.mn/category/259', platform: 'website', name: 'Emonos Category 259', maxPosts: 5 },
  { url: 'https://emonos.mn/category/258', platform: 'website', name: 'Emonos Category 258', maxPosts: 5 },
  { url: 'https://www.emonos.mn/category/243', platform: 'website', name: 'Emonos Category 243', maxPosts: 5 },
  { url: 'https://jivh-hurgelt.mn/products?category_id=13252', platform: 'website', name: 'Jivh Hurgelt 13252', maxPosts: 5 },
  { url: 'https://jivh-hurgelt.mn/products?category_id=13253', platform: 'website', name: 'Jivh Hurgelt 13253', maxPosts: 5 },
  { url: 'https://jivh-hurgelt.mn/products?category_id=13254', platform: 'website', name: 'Jivh Hurgelt 13254', maxPosts: 5 },
  { url: 'https://babyworld.mn/', platform: 'website', name: 'Baby World', maxPosts: 5 },
  { url: 'https://nomin.mn/', platform: 'website', name: 'Nomin Website', maxPosts: 5 },
  { url: 'https://nomin.mn/t/28164', platform: 'website', name: 'Nomin Topic 28164', maxPosts: 5 }
];

export const crawlerConfig: CrawlerConfig = {
  headless: process.env.HEADLESS === 'true',
  timeout: parseInt(process.env.TIMEOUT || '30000'),
  delay: parseInt(process.env.CRAWL_DELAY || '2000'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  batchSize: parseInt(process.env.CRAWL_BATCH_SIZE || '5'),
  userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH || '1920'),
    height: parseInt(process.env.VIEWPORT_HEIGHT || '1080')
  }
};
