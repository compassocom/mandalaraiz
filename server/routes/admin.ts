import express from 'express';
import { db } from '../db/index.js';
import { authenticateToken, requireAdmin, requireModerator } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);

// Get system statistics (Admin/Moderator only)
router.get('/stats', requireModerator, async (req, res) => {
  try {
    const [users, dreams, tasks, listings] = await Promise.all([
      db.selectFrom('users').select(eb => eb.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('dreams').select(eb => eb.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('tasks').select(eb => eb.fn.count('id').as('count')).executeTakeFirst(),
      db.selectFrom('marketplace_listings').select(eb => eb.fn.count('id').as('count')).executeTakeFirst()
    ]);

    const recentUsers = await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(10)
      .execute();

    console.log(`Admin stats requested by user ${req.user!.id} (${req.user!.role})`);

    res.json({
      stats: {
        total_users: Number(users?.count) || 0,
        total_dreams: Number(dreams?.count) || 0,
        total_tasks: Number(tasks?.count) || 0,
        total_listings: Number(listings?.count) || 0
      },
      recent_users: recentUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Get all users (Admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const users = await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role', 'avatar_url', 'created_at', 'updated_at'])
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalUsersResult = await db
      .selectFrom('users')
      .select(eb => eb.fn.count('id').as('count'))
      .executeTakeFirst();

    const totalUsers = Number(totalUsersResult?.count) || 0;

    console.log(`Admin ${req.user!.email} requested users list (page ${page})`);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Role inválido' });
      return;
    }

    // Prevent changing own role
    if (userId === req.user!.id) {
      res.status(400).json({ error: 'Não é possível alterar seu próprio role' });
      return;
    }

    const updatedUser = await db
      .updateTable('users')
      .set({
        role,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', userId)
      .returning(['id', 'name', 'email', 'role'])
      .executeTakeFirstOrThrow();

    console.log(`Admin ${req.user!.email} changed user ${updatedUser.email} role to ${role}`);

    res.json({
      message: 'Role atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Erro ao atualizar role do usuário' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting own account
    if (userId === req.user!.id) {
      res.status(400).json({ error: 'Não é possível deletar sua própria conta' });
      return;
    }

    const user = await db
      .selectFrom('users')
      .select(['name', 'email'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Delete user (cascade will handle related records)
    await db
      .deleteFrom('users')
      .where('id', '=', userId)
      .execute();

    console.log(`Admin ${req.user!.email} deleted user ${user.email}`);

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Get all dreams (Moderator/Admin)
router.get('/dreams', requireModerator, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const dreams = await db
      .selectFrom('dreams')
      .innerJoin('users', 'users.id', 'dreams.user_id')
      .select([
        'dreams.id',
        'dreams.title',
        'dreams.description',
        'dreams.phase',
        'dreams.is_active',
        'dreams.created_at',
        'users.name as creator_name',
        'users.email as creator_email'
      ])
      .orderBy('dreams.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalDreamsResult = await db
      .selectFrom('dreams')
      .select(eb => eb.fn.count('id').as('count'))
      .executeTakeFirst();

    const totalDreams = Number(totalDreamsResult?.count) || 0;

    console.log(`${req.user!.role} ${req.user!.email} requested dreams list (page ${page})`);

    res.json({
      dreams,
      pagination: {
        page,
        limit,
        total: totalDreams,
        pages: Math.ceil(totalDreams / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching dreams:', error);
    res.status(500).json({ error: 'Erro ao buscar sonhos' });
  }
});

// Toggle dream active status (Moderator/Admin)
router.put('/dreams/:id/toggle', requireModerator, async (req, res) => {
  try {
    const dreamId = parseInt(req.params.id);

    const dream = await db
      .selectFrom('dreams')
      .select(['is_active', 'title'])
      .where('id', '=', dreamId)
      .executeTakeFirst();

    if (!dream) {
      res.status(404).json({ error: 'Sonho não encontrado' });
      return;
    }

    const updatedDream = await db
      .updateTable('dreams')
      .set({
        is_active: !dream.is_active,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', dreamId)
      .returning(['id', 'title', 'is_active'])
      .executeTakeFirstOrThrow();

    console.log(`${req.user!.role} ${req.user!.email} ${updatedDream.is_active ? 'activated' : 'deactivated'} dream: ${updatedDream.title}`);

    res.json({
      message: `Sonho ${updatedDream.is_active ? 'ativado' : 'desativado'} com sucesso`,
      dream: updatedDream
    });
  } catch (error) {
    console.error('Error toggling dream status:', error);
    res.status(500).json({ error: 'Erro ao alterar status do sonho' });
  }
});

// Get all marketplace listings (Moderator/Admin)
router.get('/marketplace', requireModerator, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const listings = await db
      .selectFrom('marketplace_listings')
      .innerJoin('users', 'users.id', 'marketplace_listings.seller_id')
      .select([
        'marketplace_listings.id',
        'marketplace_listings.title',
        'marketplace_listings.category',
        'marketplace_listings.is_active',
        'marketplace_listings.is_approved',
        'marketplace_listings.created_at',
        'users.name as seller_name',
        'users.email as seller_email'
      ])
      .orderBy('marketplace_listings.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const totalListingsResult = await db
      .selectFrom('marketplace_listings')
      .select(eb => eb.fn.count('id').as('count'))
      .executeTakeFirst();

    const totalListings = Number(totalListingsResult?.count) || 0;

    console.log(`${req.user!.role} ${req.user!.email} requested marketplace listings (page ${page})`);

    res.json({
      listings,
      pagination: {
        page,
        limit,
        total: totalListings,
        pages: Math.ceil(totalListings / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    res.status(500).json({ error: 'Erro ao buscar anúncios' });
  }
});

// Approve/reject marketplace listing (Moderator/Admin)
router.put('/marketplace/:id/approve', requireModerator, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const { approved } = req.body;

    const updatedListing = await db
      .updateTable('marketplace_listings')
      .set({
        is_approved: approved,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', listingId)
      .returning(['id', 'title', 'is_approved'])
      .executeTakeFirstOrThrow();

    console.log(`${req.user!.role} ${req.user!.email} ${approved ? 'approved' : 'rejected'} listing: ${updatedListing.title}`);

    res.json({
      message: `Anúncio ${approved ? 'aprovado' : 'rejeitado'} com sucesso`,
      listing: updatedListing
    });
  } catch (error) {
    console.error('Error updating listing approval:', error);
    res.status(500).json({ error: 'Erro ao atualizar aprovação do anúncio' });
  }
});

export default router;
