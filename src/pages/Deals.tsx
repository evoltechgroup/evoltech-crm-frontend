import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockDeals, mockContacts, mockCompanies } from '@/data/mockData';
import { Deal, DealStage } from '@/types/crm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const stageConfig: Record<DealStage, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-muted-foreground' },
  qualified: { label: 'Qualified', color: 'bg-info' },
  proposal: { label: 'Proposal', color: 'bg-primary' },
  negotiation: { label: 'Negotiation', color: 'bg-warning' },
  closed_won: { label: 'Won', color: 'bg-success' },
  closed_lost: { label: 'Lost', color: 'bg-destructive' },
};

const stageOrder: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    closeDate: '',
    notes: '',
  });

  const getContactName = (contactId?: string) => {
    if (!contactId) return null;
    return mockContacts.find((c) => c.id === contactId)?.name;
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return null;
    return mockCompanies.find((c) => c.id === companyId)?.name;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    setDeals(deals.map(d => 
      d.id === dealId ? { ...d, stage, updatedAt: new Date() } : d
    ));
    toast({ title: 'Deal moved', description: `Deal moved to ${stageConfig[stage].label}` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDeal) {
      setDeals(deals.map(d => 
        d.id === editingDeal.id 
          ? { 
              ...d, 
              name: formData.name,
              value: Number(formData.value),
              closeDate: new Date(formData.closeDate),
              notes: formData.notes,
              updatedAt: new Date() 
            }
          : d
      ));
      toast({ title: 'Deal updated', description: `${formData.name} has been updated.` });
    } else {
      const newDeal: Deal = {
        id: String(Date.now()),
        name: formData.name,
        value: Number(formData.value),
        stage: 'lead',
        closeDate: new Date(formData.closeDate),
        probability: 20,
        notes: formData.notes,
        ownerId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDeals([newDeal, ...deals]);
      toast({ title: 'Deal created', description: `${formData.name} has been added.` });
    }
    
    resetForm();
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      value: String(deal.value),
      closeDate: format(deal.closeDate, 'yyyy-MM-dd'),
      notes: deal.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const deal = deals.find(d => d.id === id);
    setDeals(deals.filter((d) => d.id !== id));
    toast({ title: 'Deal deleted', description: `${deal?.name} has been removed.` });
  };

  const resetForm = () => {
    setFormData({ name: '', value: '', closeDate: '', notes: '' });
    setEditingDeal(null);
    setIsDialogOpen(false);
  };

  const getStageDeals = (stage: DealStage) => {
    return deals.filter(d => d.stage === stage);
  };

  const getStageValue = (stage: DealStage) => {
    return getStageDeals(stage).reduce((sum, d) => sum + d.value, 0);
  };

  return (
    <MainLayout
      title="Deals"
      subtitle={`${deals.length} total deals · ${formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))} pipeline value`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDeal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Deal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeDate">Close Date</Label>
                  <Input
                    id="closeDate"
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDeal ? 'Update' : 'Create'} Deal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stageOrder.map((stage) => (
            <div
              key={stage}
              className="kanban-column w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', stageConfig[stage].color)} />
                  <h3 className="font-semibold text-foreground">{stageConfig[stage].label}</h3>
                  <span className="text-sm text-muted-foreground">({getStageDeals(stage).length})</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(getStageValue(stage))}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {getStageDeals(stage).map((deal) => (
                  <div
                    key={deal.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-foreground line-clamp-2">{deal.name}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(deal)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(deal.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-3">
                      <DollarSign className="h-4 w-4 text-success" />
                      {formatCurrency(deal.value)}
                    </div>

                    <div className="space-y-2 text-sm">
                      {getContactName(deal.contactId) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{getContactName(deal.contactId)}</span>
                        </div>
                      )}
                      {getCompanyName(deal.companyId) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{getCompanyName(deal.companyId)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Closes {format(deal.closeDate, 'MMM d, yyyy')}</span>
                      </div>
                    </div>

                    {deal.notes && (
                      <p className="mt-3 text-xs text-muted-foreground line-clamp-2 pt-3 border-t">
                        {deal.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Deals;
