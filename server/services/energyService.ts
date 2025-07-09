import { db } from '../db/index.js';
import { EnergyLog } from '../db/schema.js';

export class EnergyService {
  // Calculate health score based on task completion and activity
  async calculateHealthScore(dreamId: number): Promise<number> {
    const tasks = await db
      .selectFrom('tasks')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .execute();

    if (tasks.length === 0) return 0.5; // Neutral for new dreams

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'COMPLETED'
    ).length;

    let score = 0;
    
    // Completion rate (40% of score)
    if (tasks.length > 0) {
      score += (completedTasks / tasks.length) * 0.4;
    }

    // Activity level (30% of score)
    score += Math.min(inProgressTasks / 3, 1) * 0.3;

    // Penalty for overdue tasks (30% of score)
    const overdueRate = tasks.length > 0 ? overdueTasks / tasks.length : 0;
    score += (1 - overdueRate) * 0.3;

    return Math.max(0, Math.min(1, score));
  }

  // Calculate collaboration wave based on recent activity
  async calculateCollaborationWave(dreamId: number): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Recent task activity
    const recentTasks = await db
      .selectFrom('tasks')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .where('updated_at', '>=', sevenDaysAgo.toISOString())
      .execute();

    // Recent participant joins
    const recentParticipants = await db
      .selectFrom('dream_participants')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .where('joined_at', '>=', sevenDaysAgo.toISOString())
      .execute();

    // Calculate wave intensity
    const taskActivity = Math.min(recentTasks.length / 5, 1); // Max 5 tasks per week
    const participantActivity = Math.min(recentParticipants.length / 2, 1); // Max 2 new participants per week

    const wave = (taskActivity * 0.7) + (participantActivity * 0.3);
    return Math.max(0, Math.min(1, wave));
  }

  // Calculate diversity gauge based on participant variety
  async calculateDiversityGauge(dreamId: number): Promise<number> {
    const participants = await db
      .selectFrom('dream_participants')
      .innerJoin('users', 'users.id', 'dream_participants.user_id')
      .select(['users.id', 'users.email'])
      .where('dream_participants.dream_id', '=', dreamId)
      .execute();

    if (participants.length === 0) return 0;

    // Simple diversity metric based on participant count
    // In a real implementation, this could consider skills, backgrounds, etc.
    const diversityScore = Math.min(participants.length / 8, 1); // Optimal around 8 participants
    
    return diversityScore;
  }

  // Record energy metrics
  async recordEnergyMetrics(dreamId: number): Promise<EnergyLog> {
    const healthScore = await this.calculateHealthScore(dreamId);
    const collaborationWave = await this.calculateCollaborationWave(dreamId);
    const diversityGauge = await this.calculateDiversityGauge(dreamId);

    const energyLog = await db
      .insertInto('energy_logs')
      .values({
        dream_id: dreamId,
        health_score: healthScore,
        collaboration_wave: collaborationWave,
        diversity_gauge: diversityGauge,
        recorded_at: new Date().toISOString(),
      })
      .returning(['id', 'dream_id', 'health_score', 'collaboration_wave', 'diversity_gauge', 'recorded_at'])
      .executeTakeFirstOrThrow();

    console.log(`Recorded energy metrics for dream ${dreamId}: Health=${healthScore.toFixed(2)}, Wave=${collaborationWave.toFixed(2)}, Diversity=${diversityGauge.toFixed(2)}`);
    return energyLog;
  }

  // Get energy history for visualization
  async getEnergyHistory(dreamId: number, days: number = 30): Promise<EnergyLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db
      .selectFrom('energy_logs')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .where('recorded_at', '>=', startDate.toISOString())
      .orderBy('recorded_at', 'desc')
      .execute();
  }

  // Get current energy status
  async getCurrentEnergyStatus(dreamId: number) {
    const latest = await db
      .selectFrom('energy_logs')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .orderBy('recorded_at', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!latest) {
      // Calculate and record if no history exists
      return await this.recordEnergyMetrics(dreamId);
    }

    return latest;
  }

  // Get traffic light status for health
  getHealthStatus(healthScore: number): 'GREEN' | 'YELLOW' | 'RED' {
    if (healthScore >= 0.7) return 'GREEN';
    if (healthScore >= 0.4) return 'YELLOW';
    return 'RED';
  }
}