import React from "react";
import ReceiptForm from "@/components/transactions/ReceiptForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReceiptTransactionPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Receipt Transaction
            </h1>
            <p className="text-gray-500 mt-1">
              Record items received from suppliers
            </p>
          </div>
          <Link href="/transactions">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
        </div>

        <ReceiptForm />
      </div>
    </div>
  );
}
