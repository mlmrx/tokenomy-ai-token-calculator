import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Download, CreditCard } from "lucide-react";

export const BillingPortal = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing & Invoices</h2>
          <p className="text-muted-foreground">Phase 3: Commerce & monetization</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,347.50</div>
            <p className="text-xs text-muted-foreground mt-1">Due: Dec 31, 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Credits Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">$500.00</div>
            <p className="text-xs text-muted-foreground mt-1">Expires: Mar 31, 2026</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Next Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$1,847.50</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated (after credits)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">INV-2025-{String(12 - i).padStart(2, "0")}-ABC123</p>
                    <p className="text-sm text-muted-foreground">Oct {i}, 2025 - Nov {i}, 2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={i === 1 ? "default" : "outline"}>
                    {i === 1 ? "Paid" : "Pending"}
                  </Badge>
                  <span className="font-bold">${(2000 + i * 100).toFixed(2)}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
