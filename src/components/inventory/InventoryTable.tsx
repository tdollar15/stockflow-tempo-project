import React, { useState, useEffect, useMemo } from 'react';
import type { Key } from 'react';
import { z } from 'zod';
import { 
  InventoryItem, 
  InventoryFilter,
  InventoryItemStatus
} from '@/types/inventory';
import { InventoryItemUpdateSchema } from '@/lib/schema-validation';
import { InventoryUIService } from '@/lib/inventory-ui-service';
import { StoreroomService } from '@/lib/storeroom-service';
import { RBACService, Role } from '@/lib/security/rbac-service';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  ChipProps,
  Spinner,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure
} from '@nextui-org/react';
import { 
  FaFilter, 
  FaEdit, 
  FaDownload,
  FaEye,
  FaLock,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Define status color mapping
const STATUS_COLOR_MAP: Record<InventoryItem['status'], ChipProps['color']> = {
  'low_stock': 'warning',
  'optimal': 'success',
  'overstocked': 'danger'
};

// Define filter options for dropdown
const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'unit_price', label: 'Unit Price' },
  { key: 'last_updated', label: 'Last Updated' }
] as const;

// Props type for InventoryTable
interface InventoryTableProps {
  userRole: Role;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ userRole }) => {
  // State management
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem>({
    id: '',
    name: '',
    category: '',
    storeroom_id: '',
    storeroom_name: '',
    quantity: 0,
    unit_price: 0,
    status: 'low_stock',
    last_updated: '',
    low_stock_warning: false
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [availableStorerooms, setAvailableStorerooms] = useState<{
    id: string;
    name: string;
  }[]>([]);
  const [isStoreroomLoading, setIsStoreroomLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal management
  const { isOpen: isViewModalOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  // Filter and pagination state
  const [filters, setFilters] = useState<InventoryFilter & {
    sort_by?: typeof SORT_OPTIONS[number]['key'],
    sort_order?: 'asc' | 'desc',
    page?: number,
    page_size?: number
  }>({
    search: '',
    category: undefined,
    storeroom: undefined,
    status: undefined,
    sort_by: 'name',
    sort_order: 'asc',
    page: 1,
    page_size: 10
  });

  // Determine available actions based on user role
  const canViewDetails = RBACService.hasPermission(userRole, 'view', 'inventory');
  const canEditInventory = RBACService.hasPermission(userRole, 'manage', 'inventory');
  const canExportInventory = RBACService.hasPermission(userRole, 'export', 'inventory');

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      const result = await InventoryUIService.filterInventoryItems({
        ...filters,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        page: filters.page,
        page_size: filters.page_size
      });
      
      setInventoryItems(result.data || []);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch inventory items');
      setIsLoading(false);
      console.error(err);
    }
  };

  // Trigger fetch on filter or sort changes
  useEffect(() => {
    fetchInventoryItems();
  }, [
    filters.search, 
    filters.category, 
    filters.storeroom, 
    filters.status,
    filters.sort_by, 
    filters.sort_order, 
    filters.page, 
    filters.page_size
  ]);

  // Fetch available storerooms when edit modal opens
  useEffect(() => {
    const fetchStorerooms = async () => {
      if (isEditModalOpen) {
        try {
          setIsStoreroomLoading(true);
          const storerooms = await StoreroomService.getAvailableStorerooms();
          setAvailableStorerooms(
            storerooms.map(storeroom => ({
              id: storeroom.id,
              name: storeroom.name
            }))
          );
        } catch (error) {
          console.error('Failed to fetch storerooms:', error);
          // Optionally set an error state to show in the UI
        } finally {
          setIsStoreroomLoading(false);
        }
      }
    };

    fetchStorerooms();
  }, [isEditModalOpen]);

  // Export inventory data
  const handleExport = async () => {
    if (!canExportInventory) {
      alert('You do not have permission to export inventory');
      return;
    }

    try {
      const exportData = await InventoryUIService.generateInventoryExport({
        ...filters,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      });
      
      // Create and trigger CSV download
      const csvContent = [
        'ID,Name,Category,Storeroom,Quantity,Unit Price,Status',
        ...exportData.map(item => 
          `${item.id},${item.name},${item.category},${item.storeroom_name},${item.quantity},${item.unit_price},${item.status}`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'inventory_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  // View item details
  const handleViewDetails = (item: InventoryItem) => {
    if (!canViewDetails) {
      alert('You do not have permission to view inventory details');
      return;
    }
    setSelectedItem(item);
    onViewOpen();
  };

  // Edit item 
  const handleEditItem = (item: InventoryItem) => {
    if (!canEditInventory) {
      alert('You do not have permission to edit inventory');
      return;
    }
    
    // Ensure all required fields are present
    setEditingItem({
      id: item.id,
      name: item.name,
      category: item.category ?? '',
      storeroom_id: item.storeroom_id,
      storeroom_name: item.storeroom_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      status: item.status,
      last_updated: item.last_updated,
      low_stock_warning: item.low_stock_warning ?? false
    });
    
    onEditOpen();
  };

  // Handle edit item submission
  const handleEditSubmit = async () => {
    try {
      // Validate the editing item before submission
      const validationResult = InventoryItemUpdateSchema.safeParse({
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity,
        unit_price: editingItem.unit_price,
        storeroom_id: editingItem.storeroom_id,
        status: editingItem.status
      });
      
      if (!validationResult.success) {
        // Set validation errors
        const errors: Record<string, string> = {};
        validationResult.error.errors.forEach(err => {
          errors[err.path[0]] = err.message;
        });
        setEditErrors(errors);
        
        // Show toast notification
        toast.error('Please correct the errors before submitting');
        return;
      }

      // Clear previous errors
      setEditErrors({});

      // Call update method from InventoryUIService
      const updateResult = await InventoryUIService.updateInventoryItem(
        editingItem.id, 
        {
          name: editingItem.name,
          category: editingItem.category,
          quantity: editingItem.quantity,
          unit_price: editingItem.unit_price,
          storeroom_id: editingItem.storeroom_id,
          status: editingItem.status
        }
      );

      // Handle update result
      if (updateResult.success) {
        // Update the items list
        setInventoryItems(prevItems => 
          prevItems.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...editingItem } 
              : item
          )
        );

        // Show success toast
        toast.success(updateResult.message || 'Inventory item updated successfully');

        // Close the modal
        onEditClose();
      } else {
        // Show error toast
        toast.error(updateResult.message || 'Failed to update inventory item');
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Modify state update methods to ensure type safety
  const updateInventoryItemStatus = (status: InventoryItemStatus) => {
    setEditingItem(prev => ({
      ...prev,
      status: status
    }));
  };

  const updateInventoryItemCategory = (category: string) => {
    setEditingItem(prev => ({
      ...prev,
      category: category || ''
    }));
  };

  const updateInventoryItemQuantity = (quantity: number) => {
    setEditingItem(prev => ({
      ...prev,
      quantity: Math.max(0, quantity)
    }));
  };

  const updateInventoryItemUnitPrice = (unitPrice: number) => {
    setEditingItem(prev => ({
      ...prev,
      unit_price: Math.max(0, unitPrice)
    }));
  };

  const updateInventoryItemStoreroom = (storeroomId: string) => {
    const selectedStoreroom = availableStorerooms.find(sr => sr.id === storeroomId);
    
    setEditingItem(prev => ({
      ...prev,
      storeroom_id: storeroomId,
      storeroom_name: selectedStoreroom?.name || ''
    }));
  };

  // Render status chip
  const renderStatusChip = (status: InventoryItem['status']) => (
    <Chip 
      color={STATUS_COLOR_MAP[status]} 
      size="sm" 
      variant="flat"
    >
      {status.replace('_', ' ')}
    </Chip>
  );

  // Render table content
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            <Spinner label="Loading inventory..." />
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center text-danger">
            {error}
          </TableCell>
        </TableRow>
      );
    }

    if (inventoryItems.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            No inventory items found
          </TableCell>
        </TableRow>
      );
    }

    return inventoryItems.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.category}</TableCell>
        <TableCell>{item.storeroom_name}</TableCell>
        <TableCell>{item.quantity}</TableCell>
        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
        <TableCell>
          {renderStatusChip(item.status)}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button 
              isIconOnly 
              size="sm" 
              variant="light" 
              color="primary"
              onClick={() => handleViewDetails(item)}
              title="View Details"
            >
              {canViewDetails ? <FaEye /> : <FaLock />}
            </Button>
            {canEditInventory && (
              <Button 
                isIconOnly 
                size="sm" 
                variant="light" 
                color="secondary"
                onClick={() => handleEditItem(item)}
                title="Edit Item"
              >
                <FaEdit />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <div className="flex space-x-2">
          {/* Sort Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                startContent={<FaFilter />} 
                variant="bordered"
              >
                Sort By: {SORT_OPTIONS.find(opt => opt.key === filters.sort_by)?.label}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort Options"
              onAction={(key: Key) => {
                const stringKey = key.toString();
                const validKey = SORT_OPTIONS.find(opt => opt.key === stringKey);
                if (validKey) {
                  setFilters(prev => ({
                    ...prev,
                    sort_by: validKey.key
                  }));
                }
              }}
            >
              {SORT_OPTIONS.map(option => (
                <DropdownItem key={option.key}>
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Export Button */}
          {canExportInventory && (
            <Button 
              startContent={<FaDownload />} 
              color="secondary"
              onClick={handleExport}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      <Table 
        aria-label="Inventory Items Table"
        selectionMode="multiple"
        className="w-full"
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Storeroom</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Unit Price</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {renderTableContent()}
        </TableBody>
      </Table>

      {/* Item Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewClose}>
        <ModalContent>
          {selectedItem && (
            <>
              <ModalHeader>Inventory Item Details</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Name:</strong> {selectedItem.name}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedItem.category}
                  </div>
                  <div>
                    <strong>Storeroom:</strong> {selectedItem.storeroom_name}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {selectedItem.quantity}
                  </div>
                  <div>
                    <strong>Unit Price:</strong> ${selectedItem.unit_price.toFixed(2)}
                  </div>
                  <div>
                    <strong>Status:</strong> {renderStatusChip(selectedItem.status)}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onViewClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditClose}>
        <ModalContent>
          {editingItem && (
            <>
              <ModalHeader>Edit Inventory Item</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Name:</strong> 
                    <Input 
                      type="text" 
                      value={editingItem.name} 
                      onChange={(e) => setEditingItem(prev => ({ 
                        ...prev, 
                        name: e.target.value 
                      }))}
                    />
                  </div>
                  <div>
                    <strong>Category:</strong> 
                    <Input 
                      type="text" 
                      value={editingItem.category} 
                      onChange={(e) => updateInventoryItemCategory(e.target.value)}
                    />
                  </div>
                  <div>
                    <strong>Storeroom:</strong> 
                    <Select
                      label="Storeroom"
                      isLoading={isStoreroomLoading}
                      selectedKeys={editingItem.storeroom_id ? [editingItem.storeroom_id] : []}
                      onChange={(e) => updateInventoryItemStoreroom(e.target.value)}
                      errorMessage={editErrors.storeroom_id}
                      color={editErrors.storeroom_id ? 'danger' : 'default'}
                    >
                      {availableStorerooms.map(storeroom => (
                        <SelectItem key={storeroom.id} value={storeroom.id}>
                          {storeroom.name}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <strong>Quantity:</strong> 
                    <Select
                      label="Quantity"
                      selectedKeys={editingItem.quantity ? [editingItem.quantity.toString()] : []}
                      onChange={(e) => updateInventoryItemQuantity(parseInt(e.target.value, 10))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(quantity => (
                        <SelectItem key={quantity} value={quantity.toString()}>
                          {quantity}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <strong>Unit Price:</strong> 
                    <Select
                      label="Unit Price"
                      selectedKeys={editingItem.unit_price ? [editingItem.unit_price.toString()] : []}
                      onChange={(e) => updateInventoryItemUnitPrice(parseFloat(e.target.value))}
                    >
                      {[1.00, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00].map(price => (
                        <SelectItem key={price} value={price.toString()}>
                          ${price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <Select
                      label="Status"
                      selectedKeys={[editingItem.status]}
                      onChange={(e) => updateInventoryItemStatus(e.target.value as InventoryItemStatus)}
                    >
                      {['low_stock', 'optimal', 'overstocked'].map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onEditClose}>
                  Cancel
                </Button>
                <Button 
                  color="secondary" 
                  onPress={handleEditSubmit}
                  isLoading={isUpdating}
                  disabled={isUpdating}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
