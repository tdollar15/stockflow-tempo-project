import React, { useState } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Select, 
  SelectItem
} from '@nextui-org/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  TransactionTypeEnum, 
  TransactionItemSchema,
  CreateTransactionSchema 
} from '@/lib/schema-validation';
import { transactionService } from '@/lib/transaction-service';

export const TransactionForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    reset
  } = useForm({
    resolver: zodResolver(CreateTransactionSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: z.infer<typeof CreateTransactionSchema>) => {
    try {
      await transactionService.createTransaction(data);
      reset();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Transaction creation failed', error);
    }
  };

  const renderTransactionTypeStep = () => (
    <div className="flex flex-col gap-4">
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Select Transaction Type"
            onChange={(e) => {
              field.onChange(e.target.value);
              setTransactionType(e.target.value);
            }}
          >
            {Object.values(TransactionTypeEnum.enum).map((type) => (
              <SelectItem key={type} value={type}>
                {type.toUpperCase()}
              </SelectItem>
            ))}
          </Select>
        )}
      />
      {errors.type && <p className="text-red-500">{errors.type.message}</p>}
    </div>
  );

  const renderTransactionDetailsStep = () => (
    <div className="flex flex-col gap-4">
      <Controller
        name="source_storeroom_id"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Source Storeroom ID"
            placeholder="Enter source storeroom ID"
            value={field.value ?? ''}
          />
        )}
      />
      {errors.source_storeroom_id && <p className="text-red-500">{errors.source_storeroom_id.message}</p>}

      <Controller
        name="dest_storeroom_id"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Destination Storeroom ID"
            placeholder="Enter destination storeroom ID"
            value={field.value ?? ''}
          />
        )}
      />
      {errors.dest_storeroom_id && <p className="text-red-500">{errors.dest_storeroom_id.message}</p>}
    </div>
  );

  const renderTransactionItemsStep = () => (
    <div className="flex flex-col gap-4">
      <Controller
        name="items"
        control={control}
        render={({ field }) => (
          <div>
            {field.value?.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  label="Item ID"
                  value={item.item_id}
                  onChange={(e) => {
                    const newItems = [...field.value];
                    newItems[index] = { ...newItems[index], item_id: e.target.value };
                    field.onChange(newItems);
                  }}
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={item.quantity.toString()}
                  onChange={(e) => {
                    const newItems = [...field.value];
                    newItems[index] = { ...newItems[index], quantity: Number(e.target.value) };
                    field.onChange(newItems);
                  }}
                />
              </div>
            ))}
            <Button 
              onClick={() => {
                const newItems = [...(field.value || []), { item_id: '', quantity: 0 }];
                field.onChange(newItems);
              }}
            >
              Add Item
            </Button>
          </div>
        )}
      />
      {errors.items && <p className="text-red-500">{errors.items.message}</p>}
    </div>
  );

  const renderConfirmationStep = () => (
    <div>
      <p>Review your transaction details before submission</p>
      {/* Add summary of transaction details */}
    </div>
  );

  const steps = [
    renderTransactionTypeStep,
    renderTransactionDetailsStep,
    renderTransactionItemsStep,
    renderConfirmationStep
  ];

  const handleNextStep = async () => {
    const isStepValid = await trigger(currentStep === 0 ? 'type' : 
      currentStep === 1 ? ['source_storeroom_id', 'dest_storeroom_id'] : 
      currentStep === 2 ? 'items' : undefined);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  return (
    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
      <ModalContent>
        <ModalHeader>Create Transaction</ModalHeader>
        <ModalBody>
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`w-full h-1 mx-2 ${
                  currentStep >= index ? 'bg-primary' : 'bg-gray-300'
                }`} 
              />
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {steps[currentStep]()}

            <ModalFooter>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}>
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNextStep}>Next</Button>
              ) : (
                <Button type="submit">Submit Transaction</Button>
              )}
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
