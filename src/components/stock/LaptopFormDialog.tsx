import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import LaptopForm from './LaptopForm';
import { Laptop } from './LaptopForm';
import { Category, Depot } from '@/services/supabase/parametres';
import { TeamMember } from '@/services/supabase/team';

type LaptopFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Laptop, 'id' | 'reference' | 'created_at' | 'updated_at'>) => void;
  initialValues?: Laptop;
  depots: Depot[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  title: string;
};

const LaptopFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  depots,
  teamMembers,
  isLoading,
  title
}: LaptopFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <LaptopForm
          onSubmit={onSubmit}
          initialValues={initialValues}
          depots={depots}
          teamMembers={teamMembers}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LaptopFormDialog; 