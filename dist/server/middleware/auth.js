import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
// User type is declared in server/index.ts to avoid conflicts
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Token de acesso necessário' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
        const user = await db
            .selectFrom('users')
            .select(['id', 'email', 'name', 'location_lat', 'location_lng', 'role', 'avatar_url', 'created_at', 'updated_at'])
            .where('id', '=', decoded.userId)
            .executeTakeFirst();
        if (!user) {
            res.status(401).json({ error: 'Usuário não encontrado' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Token inválido' });
        return;
    }
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Acesso negado - privilégios insuficientes' });
            return;
        }
        next();
    };
};
export const requireAdmin = requireRole(['ADMIN']);
export const requireModerator = requireRole(['MODERATOR', 'ADMIN']);
