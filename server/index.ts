import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './db/index.js';
import { DreamService } from './services/dreamService.js';
import { SeedService } from './services/seedService.js';
import { EnergyService } from './services/energyService.js';

dotenv.config();

const app = express();
const dreamService = new DreamService();
const seedService = new SeedService();
const energyService = new EnergyService();

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

// Dream endpoints
app.post('/api/dreams', async (req, res) => {
  try {
    const { title, description, location_lat, location_lng, visibility_radius, tags, user_id } = req.body;
    
    console.log('Creating new dream:', { title, location_lat, location_lng });
    
    const dream = await dreamService.createDream({
      user_id,
      title,
      description,
      location_lat,
      location_lng,
      visibility_radius: visibility_radius || 1000,
      phase: 'DREAM',
      participant_limit: 10,
      activation_threshold: 3,
      is_active: true,
    }, tags || []);

    res.json(dream);
  } catch (error) {
    console.error('Error creating dream:', error);
    res.status(500).json({ error: 'Failed to create dream' });
  }
});

app.get('/api/dreams/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      res.status(400).json({ error: 'Latitude and longitude required' });
      return;
    }

    const dreams = await dreamService.findNearbyDreams(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseInt(radius as string) || 2000
    );

    res.json(dreams);
  } catch (error) {
    console.error('Error finding nearby dreams:', error);
    res.status(500).json({ error: 'Failed to find nearby dreams' });
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

app.get('/api/dreams/:id/matches', async (req, res) => {
  try {
    const dreamId = parseInt(req.params.id);
    const matches = await dreamService.findMatchingDreams(dreamId);
    res.json(matches);
  } catch (error) {
    console.error('Error finding matching dreams:', error);
    res.status(500).json({ error: 'Failed to find matching dreams' });
  }
});

// Task endpoints
app.post('/api/tasks', async (req, res) => {
  try {
    const { dream_id, creator_id, title, description, priority, help_needed, due_date } = req.body;
    
    const task = await db
      .insertInto('tasks')
      .values({
        dream_id,
        creator_id,
        title,
        description,
        priority: priority || 'MEDIUM',
        help_needed: help_needed || false,
        due_date,
        status: 'OPEN',
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

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status, assignee_id } = req.body;
    
    const task = await db
      .updateTable('tasks')
      .set({
        status,
        assignee_id,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', taskId)
      .returning(['id', 'dream_id', 'creator_id', 'assignee_id', 'title', 'description', 'status', 'priority', 'help_needed', 'due_date', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    res.json(task);
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
    
    const status = {
      ...energy,
      health_status: energyService.getHealthStatus(energy.health_score)
    };

    res.json(status);
  } catch (error) {
    console.error('Error fetching energy status:', error);
    res.status(500).json({ error: 'Failed to fetch energy status' });
  }
});

app.get('/api/dreams/:id/energy/history', async (req, res) => {
  try {
    const dreamId = parseInt(req.params.id);
    const days = parseInt(req.query.days as string) || 30;
    const history = await energyService.getEnergyHistory(dreamId, days);
    res.json(history);
  } catch (error) {
    console.error('Error fetching energy history:', error);
    res.status(500).json({ error: 'Failed to fetch energy history' });
  }
});

// Seed currency endpoints
app.get('/api/users/:id/wallet', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    let wallet = await seedService.getWalletBalance(userId);
    
    if (!wallet) {
      wallet = await seedService.initializeWallet(userId);
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

app.post('/api/transactions', async (req, res) => {
  try {
    const { from_user_id, to_user_id, amount, type, description, dream_id } = req.body;
    
    const transaction = await seedService.processTransaction(
      from_user_id,
      to_user_id,
      amount,
      type,
      description,
      dream_id
    );

    res.json(transaction);
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// User endpoints
app.post('/api/users', async (req, res) => {
  try {
    const { email, name, location_lat, location_lng } = req.body;
    
    const user = await db
      .insertInto('users')
      .values({
        email,
        name,
        location_lat,
        location_lng,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'email', 'name', 'location_lat', 'location_lng', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    // Initialize wallet
    await seedService.initializeWallet(user.id);

    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}