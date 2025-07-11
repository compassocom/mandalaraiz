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

declare global {
  namespace Express {
    interface Request {
      detectedLanguage?: string;
    }
  }
}

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
  const acceptLanguage = req.headers['accept-language'] || 'en-US';
  const preferredLanguage = acceptLanguage.split(',')[0] || 'en-US';
  req.detectedLanguage = preferredLanguage;
  next();
});

// Localization endpoints
app.get('/api/detect-language', async (req, res) => {
  try {
    const ipAddress = req.ip || req.socket?.remoteAddress || '127.0.0.1';
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
    const fromUserId = parseInt(req.params.id);
    const { to_user_id, amount, description } = req.body;
    
    const result = await tokenService.transferSeeds(fromUserId, to_user_id, amount, description);
    res.json(result);
  } catch (error) {
    console.error('Error transferring seeds:', error);
    res.status(500).json({ error: 'Failed to transfer seeds' });
  }
});

app.get('/api/users/:id/transaction-history', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await tokenService.getUserTransactionHistory(userId, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

app.get('/api/token-statistics', async (req, res) => {
  try {
    const statistics = await tokenService.getTokenStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching token statistics:', error);
    res.status(500).json({ error: 'Failed to fetch token statistics' });
  }
});

// Marketplace endpoints
app.get('/api/marketplace/listings', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      searchTerm: req.query.search as string,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };
    
    const result = await marketplaceService.getListings(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
});

app.post('/api/marketplace/listings', async (req, res) => {
  try {
    const listing = await marketplaceService.createListing(req.body);
    res.json(listing);
  } catch (error) {
    console.error('Error creating marketplace listing:', error);
    res.status(500).json({ error: 'Failed to create marketplace listing' });
  }
});

app.get('/api/marketplace/listings/:id', async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const listing = await marketplaceService.getListingDetails(listingId);
    
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    
    res.json(listing);
  } catch (error) {
    console.error('Error fetching marketplace listing:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace listing' });
  }
});

app.post('/api/marketplace/purchase/:id', async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const { buyer_id } = req.body;
    
    const result = await marketplaceService.purchaseItem(listingId, buyer_id);
    res.json(result);
  } catch (error) {
    console.error('Error purchasing marketplace item:', error);
    res.status(500).json({ error: 'Failed to purchase marketplace item' });
  }
});

app.get('/api/users/:id/marketplace-history', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const history = await marketplaceService.getUserMarketplaceHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching marketplace history:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace history' });
  }
});

// Dreams endpoints
app.get('/api/dreams/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 2000;
    
    const dreams = await dreamService.findNearbyDreams(lat, lng, radius);
    res.json(dreams);
  } catch (error) {
    console.error('Error fetching nearby dreams:', error);
    res.status(500).json({ error: 'Failed to fetch nearby dreams' });
  }
});

app.post('/api/dreams', async (req, res) => {
  try {
    const { tags, ...dreamData } = req.body;
    const dream = await dreamService.createDream(dreamData, tags || []);
    res.json(dream);
  } catch (error) {
    console.error('Error creating dream:', error);
    res.status(500).json({ error: 'Failed to create dream' });
  }
});

app.get('/api/dreams/:id', async (req, res) => {
  try {
    const dreamId = parseInt(req.params.id);
    const dream = await dreamService.getDreamDetails(dreamId);
    
    if (!dream) {
      res.status(404).json({ error: 'Dream not found' });
      return;
    }
    
    res.json(dream);
  } catch (error) {
    console.error('Error fetching dream:', error);
    res.status(500).json({ error: 'Failed to fetch dream' });
  }
});

// Tasks endpoints
app.get('/api/dreams/:id/tasks', async (req, res) => {
  try {
    const dreamId = parseInt(req.params.id);
    const tasks = await db
      .selectFrom('tasks')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .orderBy('created_at', 'desc')
      .execute();
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await db
      .insertInto('tasks')
      .values({
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'dream_id', 'creator_id', 'assignee_id', 'title', 'description', 'status', 'priority', 'help_needed', 'due_date', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();
    
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updatedTask = await db
      .updateTable('tasks')
      .set({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', taskId)
      .returning(['id', 'dream_id', 'creator_id', 'assignee_id', 'title', 'description', 'status', 'priority', 'help_needed', 'due_date', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Energy endpoints
app.get('/api/dreams/:id/energy', async (req, res) => {
  try {
    const dreamId = parseInt(req.params.id);
    const energy = await energyService.getCurrentEnergyStatus(dreamId);
    
    const result = {
      ...energy,
      health_status: energyService.getHealthStatus(energy.health_score)
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching energy status:', error);
    res.status(500).json({ error: 'Failed to fetch energy status' });
  }
});

// Seed wallet endpoints
app.get('/api/users/:id/wallet', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const wallet = await seedService.getWalletBalance(userId);
    
    if (!wallet) {
      const newWallet = await seedService.initializeWallet(userId);
      res.json(newWallet);
      return;
    }
    
    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

app.get('/api/users/:id/transactions', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await seedService.getTransactionHistory(userId, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Donation endpoints
app.post('/api/donors', async (req, res) => {
  try {
    const { email, name, preferred_currency } = req.body;
    const donor = await donationService.registerDonor(email, name, preferred_currency);
    res.json(donor);
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ error: 'Failed to register donor' });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const {
      donor_id,
      amount,
      currency,
      donation_type,
      target_dream_id,
      target_category,
      donor_message,
      payment_reference
    } = req.body;
    
    const donation = await donationService.processDonation(
      donor_id,
      amount,
      currency,
      donation_type,
      target_dream_id,
      target_category,
      donor_message,
      payment_reference
    );
    
    res.json(donation);
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// Static file serving and catch-all (only in production)
if (process.env.NODE_ENV === 'production') {
  setupStaticServing(app);
}

const PORT = process.env.PORT || 3001;

export const startServer = async (port = PORT) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        resolve();
      });
      
      server.on('error', (err) => {
        console.error('Server error:', err);
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}