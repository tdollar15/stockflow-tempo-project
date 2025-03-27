"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssuanceForm from "./IssuanceForm";
import ReceiptForm from "./ReceiptForm";
import TransferForm from "./TransferForm";
import SwapForm from "./SwapForm";
import { supabase } from "@/lib/supabase";

interface TransactionModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TransactionModal = ({
  trigger,
  open,
  onOpenChange,
}: TransactionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("issuance");

  const handleIssuanceSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Generate a transaction number
      const transactionNumber = `TX-${Date.now().toString().slice(-6)}`;

      // Create the transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          transaction_number: transactionNumber,
          type: "issuance",
          status: "pending",
          source_storeroom_id: values.sourceStoreroomId,
          created_by: values.requestedBy,
          notes: values.justification,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Add transaction items
      const transactionItems = values.items.map((item: any) => ({
        transaction_id: transactionData.id,
        item_id: item.itemId,
        quantity: item.quantity,
        purpose: item.purpose,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Create approval workflow
      const { error: approvalError } = await supabase
        .from("approval_workflows")
        .insert({
          transaction_id: transactionData.id,
          approver_role: "Supervisor",
          sequence_number: 1,
          status: "pending",
        });

      if (approvalError) throw approvalError;

      // Close the modal on success
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error submitting issuance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Generate a transaction number
      const transactionNumber = `TX-${Date.now().toString().slice(-6)}`;

      // Create the transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          transaction_number: transactionNumber,
          type: "receipt",
          status: "pending",
          dest_storeroom_id: values.destStoreroomId,
          created_by: values.supplierName, // Using supplier name as created_by for receipts
          notes: values.notes,
          reference_number: values.supplierReference,
          supplier_name: values.supplierName,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Add transaction items
      const transactionItems = values.items.map((item: any) => ({
        transaction_id: transactionData.id,
        item_id: item.itemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Create approval workflow
      const { error: approvalError } = await supabase
        .from("approval_workflows")
        .insert({
          transaction_id: transactionData.id,
          approver_role: "Storeman",
          sequence_number: 1,
          status: "pending",
        });

      if (approvalError) throw approvalError;

      // Close the modal on success
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error submitting receipt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Generate a transaction number
      const transactionNumber = `TX-${Date.now().toString().slice(-6)}`;

      // Create the transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          transaction_number: transactionNumber,
          type: "transfer",
          status: "pending",
          source_storeroom_id: values.sourceStoreroomId,
          dest_storeroom_id: values.destStoreroomId,
          created_by: values.requestedBy,
          notes: values.notes,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Add transaction items
      const transactionItems = values.items.map((item: any) => ({
        transaction_id: transactionData.id,
        item_id: item.itemId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Create approval workflow
      const { error: approvalError } = await supabase
        .from("approval_workflows")
        .insert({
          transaction_id: transactionData.id,
          approver_role: "Supervisor",
          sequence_number: 1,
          status: "pending",
        });

      if (approvalError) throw approvalError;

      // Close the modal on success
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error submitting transfer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Generate a transaction number
      const transactionNumber = `TX-${Date.now().toString().slice(-6)}`;

      // Create the transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          transaction_number: transactionNumber,
          type: "swap",
          status: "pending",
          source_storeroom_id: values.sourceStoreroomId,
          created_by: values.requestedBy,
          notes: values.justification,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Add transaction items for items being swapped out
      const outgoingItems = values.outgoingItems.map((item: any) => ({
        transaction_id: transactionData.id,
        item_id: item.itemId,
        quantity: item.quantity,
        is_outgoing: true,
      }));

      // Add transaction items for items being swapped in
      const incomingItems = values.incomingItems.map((item: any) => ({
        transaction_id: transactionData.id,
        item_id: item.itemId,
        quantity: item.quantity,
        is_outgoing: false,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert([...outgoingItems, ...incomingItems]);

      if (itemsError) throw itemsError;

      // Create approval workflow
      const { error: approvalError } = await supabase
        .from("approval_workflows")
        .insert({
          transaction_id: transactionData.id,
          approver_role: "Supervisor",
          sequence_number: 1,
          status: "pending",
        });

      if (approvalError) throw approvalError;

      // Close the modal on success
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error submitting swap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Create a new inventory transaction
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="issuance">Issuance</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
          </TabsList>
          <TabsContent value="issuance">
            <IssuanceForm
              onSubmit={handleIssuanceSubmit}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="receipt">
            <ReceiptForm onSubmit={handleReceiptSubmit} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="transfer">
            <TransferForm
              onSubmit={handleTransferSubmit}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="swap">
            <SwapForm onSubmit={handleSwapSubmit} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
