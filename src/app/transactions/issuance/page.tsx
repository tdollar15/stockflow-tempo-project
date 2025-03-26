import React from "react";
import IssuanceForm from "@/components/transactions/IssuanceForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function IssuanceTransactionPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Issuance Transaction
            </h1>
            <p className="text-gray-500 mt-1">
              Request items to be issued from inventory
            </p>
          </div>
          <Link href="/transactions">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
        </div>

        <IssuanceForm />
      </div>
    </div>
  );
}
