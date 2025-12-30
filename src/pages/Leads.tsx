import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockLeads, mockContacts } from '@/data/mockData';
import { Lead, LeadStatus } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
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

const statusConfig: Record<LeadStatus, { label: string; class: string }> = {
  new: { label: 'New', class: 'status-new' },
  contacted: { label: 'Contacted', class: 'status-contacted' },
  qualified: { label: 'Qualified', class: 'status-qualified' },
  won: { label: 'Won', class: 'status-won' },
  lost: { label: 'Lost', class: 'status-lost' },
};

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredLeads = leads.filter((lead) => {
    const contact = mockContacts.find((c) => c.id === lead.contactId);
    const matchesSearch = contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getContactName = (contactId: string) => {
    return mockContacts.find((c) => c.id === contactId)?.name || 'Unknown';
  };

  const getContactEmail = (contactId: string) => {
    return mockContacts.find((c) => c.id === contactId)?.email || '';
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads(leads.map(l => 
      l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date() } : l
    ));
    toast({ title: 'Status updated', description: `Lead status changed to ${statusConfig[newStatus].label}` });
  };

  const handleDelete = (id: string) => {
    const lead = leads.find(l => l.id === id);
    const contact = mockContacts.find(c => c.id === lead?.contactId);
    setLeads(leads.filter((l) => l.id !== id));
    toast({ title: 'Lead deleted', description: `Lead for ${contact?.name} has been removed.` });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <MainLayout
      title="Leads"
      subtitle={`${leads.length} total leads`}
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="table-row-hover">
                  <TableCell>
                    <div>
                      <p className="font-medium">{getContactName(lead.contactId)}</p>
                      <p className="text-sm text-muted-foreground">{getContactEmail(lead.contactId)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                    >
                      <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent p-0">
                        <span className={cn('status-badge', statusConfig[lead.status].class)}>
                          {statusConfig[lead.status].label}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(lead.value)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(lead.createdAt, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(lead.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
};

export default Leads;
