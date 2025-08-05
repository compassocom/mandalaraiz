import { db } from '../db/index.js';
import { EnergyLog } from '../db/schema.js';

export class EnergyService {
  constructor() {
    console.log('EnergyService initialized');
  }

  // Get current energy status for a dream
  async getCurrentEnergyStatus(dreamId: number): Promise<{
    health_score: number;
    collaboration_wave: number;
    diversity_gauge: number;
    recorded_at: string;
  }> {
    // Get the latest energy log for this dream
    const latestLog = await db
      .selectFrom('energy_logs')
      .selectAll()
      .where('dream_id', '=', dreamId)
      .orderBy('recorded_at', 'desc')
      .executeTakeFirst();

    if (latestLog) {
      return {
        health_score: latestLog.health_score,
        collaboration_wave: latestLog.collaboration_wave,
        diversity_gauge: latestLog.diversity_gauge,
        recorded_at: latestLog.recorded_at
      };
    }

    // If no log exists, calculate and create one
    const energyData = await this.calculateEnergyMetrics(dreamId);
    
    // Save the calculated metrics
    await db
      .insertInto('energy_logs')
      .values({
        dream_id: dreamId,
        health_score: energyData.health_score,
        collaboration_wave: energyData.collaboration_wave,
        diversity_gauge: energyData.diversity_gauge,
        recorded_at: new Date().toISOString()
      })
      .execute();

    return energyData;
  }

  // Calculate energy metrics for a dream
  private async calculateEnergyMetrics(dreamId: number): Promise<{
    health_score: number;
    collaboration_wave: number;
    diversity_gauge: number;
    recorded_at: string;
  }> {
    // Get dream info
    const dream = await db
      .selectFrom('dreams')
      .select(['participant_limit', 'activation_threshold', 'created_at'])
      .where('id', '=', dreamId)
      .executeTakeFirst();

    if (!dream) {
      return {
        health_score: 0,
        collaboration_wave: 0,
        diversity_gauge: 0,
        recorded_at: new Date().toISOString()
      };
    }

    // Get participant count
    const participantCount = await db
      .selectFrom('dream_participants')
      .select((eb) => eb.fn.countAll().as('count'))
      .where('dream_id', '=', dreamId)
      .executeTakeFirst();

    const participants = Number(participantCount?.count || 0);

    // Get task completion stats
    const taskStats = await db
      .selectFrom('tasks')
      .select([
        (eb) => eb.fn.countAll<number>().as('total_tasks'),
        (eb) => eb.fn.count<number>('id').filterWhere('status', '=', 'COMPLETED').as('completed_tasks'),
        (eb) => eb.fn.count<number>('id').filterWhere('status', '=', 'IN_PROGRESS').as('in_progress_tasks')
      ])
      .where('dream_id', '=', dreamId)
      .executeTakeFirst();

    const totalTasks = Number(taskStats?.total_tasks || 0);
    const completedTasks = Number(taskStats?.completed_tasks || 0);
    const inProgressTasks = Number(taskStats?.in_progress_tasks || 0);

    // Calculate metrics (0-100 scale)
    
    // Health Score: based on task completion and participant engagement
    let health_score = 50; // Base score
    if (totalTasks > 0) {
      const completionRate = completedTasks / totalTasks;
      const progressRate = (completedTasks + inProgressTasks) / totalTasks;
      health_score = Math.min(100, 30 + (completionRate * 40) + (progressRate * 30));
    }

    // Collaboration Wave: based on participant count vs limits
    let collaboration_wave = 25; // Base score
    if (participants >= dream.activation_threshold) {
      const participationRate = Math.min(1, participants / dream.participant_limit);
      collaboration_wave = Math.min(100, 40 + (participationRate * 60));
    }

    // Diversity Gauge: based on different creators of tasks and participants
    const uniqueCreators = await db
      .selectFrom('tasks')
      .select((eb) => eb.fn.count('creator_id').distinct().as('unique_creators'))
      .where('dream_id', '=', dreamId)
      .executeTakeFirst();

    const creators = Number(uniqueCreators?.unique_creators || 0);
    let diversity_gauge = 30; // Base score
    if (participants > 0) {
      const diversityRate = Math.min(1, creators / Math.max(1, participants));
      diversity_gauge = Math.min(100, 20 + (diversityRate * 80));
    }

    console.log(`Calculated energy for dream ${dreamId}: health=${health_score}, collaboration=${collaboration_wave}, diversity=${diversity_gauge}`);

    return {
      health_score: Math.round(health_score),
      collaboration_wave: Math.round(collaboration_wave),
      diversity_gauge: Math.round(diversity_gauge),
      recorded_at: new Date().toISOString()
    };
  }

  // Get health status description
  getHealthStatus(healthScore: number): string {
    if (healthScore >= 80) return 'Florescendo';
    if (healthScore >= 60) return 'Saudável';
    if (healthScore >= 40) return 'Crescendo';
    if (healthScore >= 20) return 'Frágil';
    return 'Dormindo';
  }

  // Update energy metrics for a dream (can be called periodically)
  async updateEnergyMetrics(dreamId: number): Promise<void> {
    const energyData = await this.calculateEnergyMetrics(dreamId);
    
    await db
      .insertInto('energy_logs')
      .values({
        dream_id: dreamId,
        health_score: energyData.health_score,
        collaboration_wave: energyData.collaboration_wave,
        diversity_gauge: energyData.diversity_gauge,
        recorded_at: new Date().toISOString()
      })
      .execute();

    console.log(`Updated energy metrics for dream ${dreamId}`);
  }
}
