import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Pagination,
  Select,
  SelectItem
} from '@nextui-org/react';
import { transactionService } from '@/lib/transaction-service';
import { TransactionTypeEnum, TransactionStatusEnum } from '@/lib/schema-validation';

export const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const result = await transactionService.getTransactions({
        page,
        type: typeFilter as any,
        status: statusFilter as any
      });

      setTransactions(result.transactions);
      setTotalPages(Math.ceil(result.totalCount / result.pageSize));
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, statusFilter]);

  const renderStatusChip = (status: string) => {
    const statusColorMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      'completed': 'success',
      'pending': 'warning',
      'rejected': 'danger',
      'draft': 'default'
    };

    return (
      <Chip color={statusColorMap[status] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Chip>
    );
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <Select 
          label="Transaction Type" 
          onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string)}
        >
          {Object.values(TransactionTypeEnum.enum).map((type) => (
            <SelectItem key={type} value={type}>
              {type.toUpperCase()}
            </SelectItem>
          ))}
        </Select>

        <Select 
          label="Transaction Status" 
          onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
        >
          {Object.values(TransactionStatusEnum.enum).map((status) => (
            <SelectItem key={status} value={status}>
              {status.replace('_', ' ').toUpperCase()}
            </SelectItem>
          ))}
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Created At</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.type.toUpperCase()}</TableCell>
              <TableCell>
                {renderStatusChip(transaction.status)}
              </TableCell>
              <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
              <TableCell>
                {/* Add view details and actions */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination 
        total={totalPages}
        page={page}
        onChange={setPage}
      />
    </div>
  );
};
