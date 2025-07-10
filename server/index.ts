import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db/index.js';
import { DreamService } from './services/dreamService.js';
import { SeedService } from './services/seedService.js';
import { EnergyService } from './services/energyService.js';
import { DonationService } from './services/donationService.js';
import { TokenService } from './services/tokenService.js';
import { MarketplaceService } from './services/marketplaceService.js';
import { LocalizationService } from './services/localizationService.js';

dotenv.config();

const app = express();
const dreamService = new DreamService();
const seedService = new SeedService();
const energyService = new EnergyService();
const donationService = new DonationService();
const tokenService = new TokenService();
const marketplaceService = new MarketplaceService();
const localizationService = new LocalizationService();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Language detection middleware
app.use('/api/*', (req, res, next) => {
  // In production, you could detect language from:
  // - CF-IPCountry header (Cloudflare)
  // - X-Forwarded-For IP geolocation
  // - Accept-Language header fallback
  
  const acceptLanguage = req.headers['accept-language'] || 'en-US';
  const preferredLanguage = acceptLanguage.split(',')[0] || 'en-US';
  
  // Store detected language for potential use in responses
  req.detectedLanguage = preferredLanguage;
  next();
});

// Localization endpoints
app.get('/api/detect-language', async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const detectedLanguage = await localizationService.detectLanguageFromIP(ipAddress);
    
    res.json({
      language: detectedLanguage,
      supported_languages: localizationService.getSupportedLanguages()
    });
  } catch (error) {
    console.error('Error detecting language:', error);
    res.status(500).json({ error: 'Failed to detect language' });
  }
});

// Token economy endpoints
app.get('/api/users/:id/tokens', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const tokens = await tokenService.getUserTokens(userId);
    res.json(tokens);
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    res.status(500).json({ error: 'Failed to fetch user tokens' });
  }
});

app.post('/api/users/:id/award-seeds', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { amount, description } = req.body;
    
    const success = await tokenService.awardSeeds(userId, amount, description);
    if (success) {
      res.json({ success: true, message: 'Seeds awarded successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Daily Seeds cap reached' });
    }
  } catch (error) {
    console.error('Error awarding seeds:', error);
    res.status(500).json({ error: 'Failed to award seeds' });
  }
});

app.post('/api/users/:id/convert-seeds', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { seeds_amount } = req.body;
    
    const result = await tokenService.convertSeedsToRoots(userId, seeds_amount);
    res.json(result);
  } catch (error) {
    console.error('Error converting seeds:', error);
    res.status(500).json({ error: 'Failed to convert seeds' });
  }
});

app.post('/api/users/:id/transfer-seeds', async (req, res) => {
  try {
    const from