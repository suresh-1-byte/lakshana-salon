'use client';

// ═══════════════════════════════════════════════════════
//  Customer Delete/Restore Dialog
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import type { Customer } from '@/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface CustomerDeleteDialogProps {
  customer: Customer;
  isDeleted: boolean;
  onClose: () => void;
}

export default function CustomerDeleteDialog({ 
  customer, 
  isDeleted,
  onClose 
}: CustomerDeleteDialogProps) {
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    setProcessing(true);

    try {
      const endpoint = isDeleted ? 'restore' : 'delete';
      const response = await fetch(`/api/admin/customers/${customer.id}/${endpoint}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: isDeleted 
            ? 'Customer restored successfully' 
            : 'Customer deleted successfully',
        });
        onClose();
      } else {
        throw new Error(data.error || `Failed to ${endpoint} customer`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDeleted ? (
              <>
                <RotateCcw className="h-5 w-5 text-green-600" />
                Restore Customer
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Delete Customer
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDeleted ? (
              <>
                Are you sure you want to restore <strong>{customer.name}</strong>?
                <br />
                This will make the customer active again.
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{customer.name}</strong>?
                <br />
                This is a soft delete and can be restored later.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={processing}
            variant={isDeleted ? 'default' : 'destructive'}
          >
            {isDeleted ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                {processing ? 'Restoring...' : 'Restore Customer'}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {processing ? 'Deleting...' : 'Delete Customer'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
