import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { DreamService } from './services/dreamService.js';
import { EnergyService } from './services/energyService.js';
import { MarketplaceService } from './services/marketplaceService.js';
import { LocalizationService } from './services/localizationService.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import passport from './config/passport.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

// A declaração global permanece a mesma
declare global {
  namespace Express {
    interface Request {
      detectedLanguage?: string;
    }
    interface User {
      id: number;
      email: string;
      name: string;
      location_lat: number | null;
      location_lng: number | null;
      role: 'USER' | 'MODERATOR' | 'ADMIN';
      password_hash?: string;
      google_id?: string | null;
      facebook_id?: string | null;
      github_id?: string | null;
      avatar_url?: string | null;
      created_at: string;
      updated_at: string;
    }
  }
}

const app = express();
const dreamService = new DreamService();
const energyService = new EnergyService();
const marketplaceService = new MarketplaceService();
const localizationService = new LocalizationService();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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

// Admin routes
app.use('/api/admin', adminRoutes);

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

app.post('/api/dreams', authenticateToken, async (req, res) => {
  try {
    const { tags, ...dreamData } = req.body;
    
    if (!dreamData.title || !dreamData.description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    if (dreamData.user_id !== req.user!.id) {
      res.status(403).json({ error: 'Cannot create dream for another user' });
      return;
    }
    
    const dream = await dreamService.createDream(dreamData, tags || []);
    console.log(`Dream created: ${dream.title} by user ${req.user!.id}`);
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
      // .orderBy('created_at', 'desc') // Removido orderBy para compatibilidade
      .execute();
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});
// No seu ficheiro server/index.ts

// --- CORREÇÃO PARA A CRIAÇÃO DE TAREFAS ---
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    // 1. Desestruturamos apenas os campos que esperamos receber do frontend.
    const { dream_id, title, description, priority, due_date, help_needed, assignee_id } = req.body;
    
    if (!dream_id || !title) {
      res.status(400).json({ error: 'dream_id and title are required' });
      return;
    }
    
    const task = await db
      .insertInto('tasks')
      // 2. Construímos o objeto de valores explicitamente, garantindo que o status é 'OPEN'.
      .values({
        dream_id,
        title,
        description,
        priority: priority || 'MEDIUM',
        due_date,
        help_needed: help_needed || false,
        assignee_id,
        status: 'OPEN', // <-- A CORREÇÃO PRINCIPAL
        creator_id: req.user!.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    console.log(`Task created: ${task.title} by user ${req.user!.id}`);
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});


// --- CORREÇÃO PARA A CRIAÇÃO DE ITENS NO MARKETPLACE ---
app.post('/api/marketplace/listings', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, subcategory, location_lat, location_lng, location_text, images } = req.body;
    
    if (!title || !description || !category) {
      res.status(400).json({ error: 'title, description, and category are required' });
      return;
    }
    
    // Construímos o objeto de dados explicitamente para segurança.
    const listingData = {
      title,
      description,
      category,
      subcategory,
      location_lat,
      location_lng,
      location_text,
      images,
      seller_id: req.user!.id,
      is_active: true,      // Valor padrão
      is_approved: false,   // <-- CORREÇÃO DE SEGURANÇA: Itens novos não são aprovados automaticamente.
      view_count: 0         // Valor padrão
    };
    
    // Assumindo que o marketplaceService.createListing simplesmente insere estes dados.
    const listing = await marketplaceService.createListing(listingData);
    console.log(`Marketplace listing created: ${listing.title} by user ${req.user!.id}`);
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

// --- ALTERAÇÃO PRINCIPAL ---
// Removemos toda a lógica de `startServer`, `app.listen`, e `setupStaticServing`.
// A Vercel precisa que o ficheiro simplesmente exporte o objeto `app` do Express.
export default app;
