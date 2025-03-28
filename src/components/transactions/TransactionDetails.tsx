import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Chip, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@nextui-org/react';
import { transactionService } from '@/lib/transaction-service';
import { 
  TransactionStatusEnum, 
  TransactionTypeEnum,
  TransactionSchema,
  TransactionItemDetailsSchema
} from '@/lib/schema-validation';
import { z } from 'zod';

interface TransactionDetailsProps {
  transactionId: string;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transactionId }) => {
  const [transaction, setTransaction] = useState<z.infer<typeof TransactionSchema> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const details = await transactionService.getTransactionDetails(transactionId);
        setTransaction(details);
      } catch (err) {
        setError('Failed to fetch transaction details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  const renderStatusChip = (status: z.infer<typeof TransactionStatusEnum>) => {
    const statusColorMap: Record<z.infer<typeof TransactionStatusEnum>, 'success' | 'warning' | 'danger' | 'default'> = {
      'completed': 'success',
      'pending': 'warning',
      'rejected': 'danger',
      'draft': 'default',
      'approved': 'success'
    };

    return (
      <Chip color={statusColorMap[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Chip>
    );
  };

  if (loading) return <div>Loading transaction details...</div>;
  if (error) return <div>{error}</div>;
  if (!transaction) return <div>No transaction found</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between w-full">
          <h2>Transaction Details</h2>
          {renderStatusChip(transaction.status)}
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Transaction ID:</strong> {transaction.id}
            <br />
            <strong>Type:</strong> {transaction.type.toUpperCase()}
            <br />
            <strong>Created At:</strong> {new Date(transaction.created_at).toLocaleString()}
            <br />
            <strong>Created By:</strong> {transaction.created_by}
          </div>
          <div>
            <strong>Source Storeroom:</strong> {transaction.source_storeroom_id || 'N/A'}
            <br />
            <strong>Destination Storeroom:</strong> {transaction.dest_storeroom_id || 'N/A'}
            <br />
            <strong>Reference Number:</strong> {transaction.reference_number || 'N/A'}
            <br />
            <strong>Notes:</strong> {transaction.notes || 'No additional notes'}
          </div>
        </div>

        <h3 className="mt-4 mb-2">Transaction Items</h3>
        <Table>
          <TableHeader>
            <TableColumn>Item ID</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Unit Price</TableColumn>
            <TableColumn>Total Value</TableColumn>
          </TableHeader>
          <TableBody>
            {transaction.transaction_items.map((item: z.infer<typeof TransactionItemDetailsSchema>) => (
              <TableRow key={item.id}>
                <TableCell>{item.inventory_item_id}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit_price ? `$${item.unit_price.toFixed(2)}` : 'N/A'}</TableCell>
                <TableCell>
                  {item.unit_price && item.quantity 
                    ? `$${(item.quantity * item.unit_price).toFixed(2)}` 
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};
