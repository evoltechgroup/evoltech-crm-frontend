import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockTasks, mockContacts, mockDeals } from '@/data/mockData';
import { Task, TaskType } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Phone,
  Mail,
  Users,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';

const taskTypeConfig: Record<TaskType, { label: string; icon: typeof Phone; color: string }> = {
  call: { label: 'Call', icon: Phone, color: 'bg-info/10 text-info' },
  email: { label: 'Email', icon: Mail, color: 'bg-accent/10 text-accent' },
  meeting: { label: 'Meeting', icon: Users, color: 'bg-warning/10 text-warning' },
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    type: 'call' as TaskType,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const getContactName = (contactId?: string) => {
    if (!contactId) return null;
    return mockContacts.find((c) => c.id === contactId)?.name;
  };

  const getDealName = (dealId?: string) => {
    if (!dealId) return null;
    return mockDeals.find((d) => d.id === dealId)?.name;
  };

  const filteredTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    switch (filter) {
      case 'today':
        return isToday(dueDate) && !task.completed;
      case 'upcoming':
        return dueDate > new Date() && !task.completed;
      case 'overdue':
        return isPast(dueDate) && !isToday(dueDate) && !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
    ));
    const task = tasks.find(t => t.id === taskId);
    toast({ 
      title: task?.completed ? 'Task reopened' : 'Task completed',
      description: task?.title
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id 
          ? { 
              ...t, 
              title: formData.title,
              type: formData.type,
              dueDate: new Date(formData.dueDate),
              updatedAt: new Date() 
            }
          : t
      ));
      toast({ title: 'Task updated', description: `${formData.title} has been updated.` });
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        title: formData.title,
        type: formData.type,
        dueDate: new Date(formData.dueDate),
        completed: false,
        ownerId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks([newTask, ...tasks]);
      toast({ title: 'Task created', description: `${formData.title} has been added.` });
    }
    
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      type: task.type,
      dueDate: format(task.dueDate, 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter((t) => t.id !== id));
    toast({ title: 'Task deleted', description: `${task?.title} has been removed.` });
  };

  const resetForm = () => {
    setFormData({ title: '', type: 'call', dueDate: format(new Date(), 'yyyy-MM-dd') });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const getDueDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Overdue';
    return format(date, 'MMM d');
  };

  const getDueDateColor = (date: Date, completed: boolean) => {
    if (completed) return 'text-muted-foreground';
    if (isPast(date) && !isToday(date)) return 'text-destructive';
    if (isToday(date)) return 'text-primary';
    return 'text-muted-foreground';
  };

  const taskCounts = {
    all: tasks.length,
    today: tasks.filter(t => isToday(new Date(t.dueDate)) && !t.completed).length,
    upcoming: tasks.filter(t => new Date(t.dueDate) > new Date() && !t.completed).length,
    overdue: tasks.filter(t => isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <MainLayout
      title="Tasks"
      subtitle={`${taskCounts.today} tasks due today`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: TaskType) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTask ? 'Update' : 'Create'} Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'today', 'upcoming', 'overdue', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f} ({taskCounts[f]})
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-card rounded-xl border shadow-sm divide-y">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const TypeIcon = taskTypeConfig[task.type].icon;
            return (
              <div
                key={task.id}
                className={cn(
                  'p-4 flex items-center gap-4 transition-colors hover:bg-muted/30',
                  task.completed && 'opacity-60'
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id)}
                  className="h-5 w-5"
                />

                <div className={cn('rounded-lg p-2', taskTypeConfig[task.type].color)}>
                  <TypeIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-foreground', task.completed && 'line-through')}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="capitalize">{task.type}</span>
                    {getContactName(task.contactId) && (
                      <>
                        <span>·</span>
                        <span>{getContactName(task.contactId)}</span>
                      </>
                    )}
                    {getDealName(task.dealId) && (
                      <>
                        <span>·</span>
                        <span>{getDealName(task.dealId)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={cn('flex items-center gap-2 text-sm', getDueDateColor(new Date(task.dueDate), task.completed))}>
                  <Calendar className="h-4 w-4" />
                  <span>{getDueDateLabel(new Date(task.dueDate))}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(task.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>
    </MainLayout>
  );
};

export default Tasks;
