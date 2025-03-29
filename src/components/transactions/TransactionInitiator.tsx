import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Select, 
  SelectItem,
  Input
} from '@nextui-org/react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { TransactionTypeEnum } from '@/lib/types/TransactionTypes';
import { transactionService } from '@/lib/transaction-service';
import { toastService, ToastType } from '@/lib/services/ToastService';
import { LoadingIndicator } from '@/components/LoadingIndicator';

// Enhanced Transaction Initiation Schema
const TransactionInitiationSchema = z.object({
  type: z.nativeEnum(TransactionTypeEnum),
  sourceStoreroom: z.string().optional(),
  destinationStoreroom: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const TransactionInitiator: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableStorerooms, setAvailableStorerooms] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(TransactionInitiationSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    // Fetch available storerooms (mock implementation)
    const fetchStorerooms = async () => {
      try {
        // Replace with actual storeroom fetching logic
        const rooms = ['Storeroom A', 'Storeroom B', 'Storeroom C'];
        setAvailableStorerooms(rooms);
      } catch (error) {
        toastService.error('Failed to load storerooms');
      }
    };

    fetchStorerooms();
  }, []);

  const onSubmit = async (data: z.infer<typeof TransactionInitiationSchema>) => {
    setIsLoading(true);
    try {
      await transactionService.createTransaction({
        type: data.type,
        sourceStoreroom: data.sourceStoreroom,
        destinationStoreroom: data.destinationStoreroom,
        referenceNumber: data.referenceNumber,
        notes: data.notes
      });

      toastService.success(`${data.type} Transaction initiated successfully`);
      reset();
      setIsModalOpen(false);
    } catch (error) {
      toastService.error('Transaction creation failed');
      console.error('Transaction creation error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Initiate Transaction
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            Initiate New Transaction
          </ModalHeader>

          <ModalBody>
            {isLoading ? (
              <LoadingIndicator 
                isLoading={isLoading} 
                message="Creating transaction..." 
              />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Transaction Type"
                      placeholder="Select transaction type"
                      error={!!errors.type}
                    >
                      {Object.values(TransactionTypeEnum).map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="sourceStoreroom"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Source Storeroom"
                      placeholder="Select source storeroom"
                      error={!!errors.sourceStoreroom}
                    >
                      {availableStorerooms.map(room => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="destinationStoreroom"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Destination Storeroom"
                      placeholder="Select destination storeroom"
                      error={!!errors.destinationStoreroom}
                    >
                      {availableStorerooms.map(room => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="referenceNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Reference Number"
                      placeholder="Enter reference number"
                      error={!!errors.referenceNumber}
                    />
                  )}
                />

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Notes"
                      placeholder="Additional transaction notes"
                      error={!!errors.notes}
                    />
                  )}
                />

                <ModalFooter>
                  <Button type="submit" color="primary">
                    Create Transaction
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
