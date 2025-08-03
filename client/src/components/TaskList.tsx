import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, AlertCircle } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  help_needed: boolean;
  due_date: string | null;
  created_at: string;
}

interface TaskListProps {
  dreamId: number;
}

export const TaskList = ({ dreamId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    help_needed: false,
    due_date: '',
  });

  useEffect(() => {
    checkAuth();
    fetchTasks();
  }, [dreamId]);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/dreams/${dreamId}/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Você precisa estar logado para criar tarefas');
        return;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dream_id: dreamId,
          ...newTask,
          due_date: newTask.due_date || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const task = await response.json();
      setTasks(prev => [task, ...prev]);
      setNewTask({
        title: '',
        description: '',
        priority: 'MEDIUM',
        help_needed: false,
        due_date: '',
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Falha ao criar tarefa. Por favor, tente novamente.');
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Você precisa estar logado para atualizar tarefas');
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          assignee_id: status === 'IN_PROGRESS' ? null : null, // Let backend handle assignee
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Falha ao atualizar tarefa. Por favor, tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando tarefas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tarefas ({tasks.length})</h3>
        {isAuthenticated && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Título</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título da tarefa"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Descrição</Label>
                  <textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da tarefa"
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task-priority">Prioridade</Label>
                    <select
                      id="task-priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' }))}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="task-due-date">Data Limite</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="help-needed"
                    checked={newTask.help_needed}
                    onChange={(e) => setNewTask(prev => ({ ...prev, help_needed: e.target.checked }))}
                  />
                  <Label htmlFor="help-needed">Precisa de Ajuda</Label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createTask} disabled={!newTask.title}>
                    Criar Tarefa
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium">{task.title}</h4>
                  {task.help_needed && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === 'OPEN' ? 'Aberta' : 
                     task.status === 'IN_PROGRESS' ? 'Em Progresso' : 'Concluída'}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority === 'LOW' ? 'Baixa' : 
                     task.priority === 'MEDIUM' ? 'Média' : 'Alta'}
                  </Badge>
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              {isAuthenticated && (
                <div className="flex space-x-2">
                  {task.status === 'OPEN' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Ainda não há tarefas. {isAuthenticated ? 'Crie a primeira tarefa!' : 'Faça login para criar tarefas.'}
          </p>
        </Card>
      )}
    </div>
  );
};
