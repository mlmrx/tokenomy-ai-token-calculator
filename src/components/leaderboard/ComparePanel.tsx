
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, BarChart3 } from "lucide-react";

interface ComparePanelProps {
  selectedVendors: string[];
  onClearSelection: () => void;
}

interface VendorData {
  id: string;
  name: string;
  tokens_per_month: number;
  max_tokens_per_second: number;
  cost_per_million_tokens: number;
  kwh_per_million_tokens: number;
  co2_grams_per_million_tokens: number;
}

const ComparePanel: React.FC<ComparePanelProps> = ({ selectedVendors, onClearSelection }) => {
  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['compare-vendors', selectedVendors],
    queryFn: async () => {
      if (selectedVendors.length === 0) return [];
      
      const { data, error } = await supabase
        .from('leaderboard_token_metrics')
        .select(`
          vendor_id,
          tokens_per_month,
          max_tokens_per_second,
          cost_per_million_tokens,
          kwh_per_million_tokens,
          co2_grams_per_million_tokens,
          leaderboard_vendor_profiles (
            id,
            name
          )
        `)
        .in('vendor_id', selectedVendors);

      if (error) throw error;
      
      return data?.map(item => ({
        id: item.vendor_id,
        name: item.leaderboard_vendor_profiles?.name || 'Unknown',
        tokens_per_month: item.tokens_per_month,
        max_tokens_per_second: item.max_tokens_per_second,
        cost_per_million_tokens: item.cost_per_million_tokens,
        kwh_per_million_tokens: item.kwh_per_million_tokens,
        co2_grams_per_million_tokens: item.co2_grams_per_million_tokens,
      })) || [];
    },
    enabled: selectedVendors.length > 0,
  });

  const formatNumber = (num: number, decimals = 1) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const getBestValue = (metric: keyof VendorData, isLowerBetter = false) => {
    if (!vendorData || vendorData.length === 0) return null;
    
    const values = vendorData.map(v => v[metric] as number);
    return isLowerBetter ? Math.min(...values) : Math.max(...values);
  };

  if (selectedVendors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compare Vendors
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Select up to 3 vendors from the leaderboard to compare their metrics side by side.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compare ({selectedVendors.length}/3)
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {selectedVendors.map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          vendorData?.map((vendor) => (
            <div key={vendor.id} className="p-3 border rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">{vendor.name}</h4>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tokens/Month:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatNumber(vendor.tokens_per_month)}</span>
                    {getBestValue('tokens_per_month') === vendor.tokens_per_month && (
                      <Badge variant="default" className="text-xs px-1">Best</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max TPS:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatNumber(vendor.max_tokens_per_second, 0)}</span>
                    {getBestValue('max_tokens_per_second') === vendor.max_tokens_per_second && (
                      <Badge variant="default" className="text-xs px-1">Best</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cost/1M:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">${vendor.cost_per_million_tokens}</span>
                    {getBestValue('cost_per_million_tokens', true) === vendor.cost_per_million_tokens && (
                      <Badge variant="default" className="text-xs px-1">Best</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Energy:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{vendor.kwh_per_million_tokens} kWh</span>
                    {getBestValue('kwh_per_million_tokens', true) === vendor.kwh_per_million_tokens && (
                      <Badge variant="default" className="text-xs px-1">Best</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CO2:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatNumber(vendor.co2_grams_per_million_tokens, 0)}g</span>
                    {getBestValue('co2_grams_per_million_tokens', true) === vendor.co2_grams_per_million_tokens && (
                      <Badge variant="default" className="text-xs px-1">Best</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {selectedVendors.length < 3 && (
          <div className="text-center text-xs text-muted-foreground">
            Select {3 - selectedVendors.length} more vendor{3 - selectedVendors.length !== 1 ? 's' : ''} to compare
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparePanel;
