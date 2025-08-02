import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db/index.js';
import { DreamService } from './services/dreamService.js';
import { EnergyService } from './services/energyService.js';
import { MarketplaceService } from './services/marketplaceService.js';
import { LocalizationService } from './services/localizationService.js';
import authRoutes from './routes/auth.js';

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
const energyService = new EnergyService();
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Language detection middleware - only for API routes
app.use('/api/*splat', (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'] || 'en-US';
  const preferredLanguage = acceptLanguage.split(',')[0] || 'en-US';
  req.detectedLanguage = preferredLanguage;
  next();
});

// Auth routes
app.use('/api/auth', authRoutes);

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

// Dreams endpoints
app.get('/api/dreams/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 2000;
    
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'Valid latitude and longitude are required' });
      return;
    }
    
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
    
    // Validate required fields
    if (!dreamData.title || !dreamData.description || !dreamData.user_id) {
      res.status(400).json({ error: 'Title, description, and user_id are required' });
      return;
    }
    
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
    if (isNaN(dreamId)) {
      res.status(400).json({ error: 'Invalid dream ID' });
      return;
    }
    
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
    if (isNaN(dreamId)) {
      res.status(400).json({ error: 'Invalid dream ID' });
      return;
    }
    
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
    const { dream_id, creator_id, title } = req.body;
    
    if (!dream_id || !creator_id || !title) {
      res.status(400).json({ error: 'dream_id, creator_id, and title are required' });
      return;
    }
    
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
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }
    
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
    if (isNaN(dreamId)) {
      res.status(400).json({ error: 'Invalid dream ID' });
      return;
    }
    
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
    const { seller_id, title, description, category } = req.body;
    
    if (!seller_id || !title || !description || !category) {
      res.status(400).json({ error: 'seller_id, title, description, and category are required' });
      return;
    }
    
    const listing = await marketplaceService.createListing(req.body);
    res.json(listing);
  } catch (error) {
    console.error('Error creating marketplace listing:', error);
    res.status(500).json({ error: 'Failed to create marketplace listing' });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
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
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Data directory: ${process.env.DATA_DIRECTORY || './data'}`);
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