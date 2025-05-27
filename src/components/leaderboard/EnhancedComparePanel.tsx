
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { X, Crown, TrendingUp, DollarSign, Zap, Leaf, ExternalLink } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface EnhancedComparePanelProps {
  selectedVendors: string[];
  onClearSelection: () => void;
}

interface VendorData {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  headquarters: string;
  tokens_per_month: number;
  max_tokens_per_second: number;
  cost_per_million_tokens: number;
  kwh_per_million_tokens: number;
  co2_grams_per_million_tokens: number;
}

const EnhancedComparePanel: React.FC<EnhancedComparePanelProps> = ({ 
  selectedVendors, 
  onClearSelection 
}) => {
  const { data: compareData, isLoading } = useQuery({
    queryKey: ['compare-vendors', selectedVendors],
    queryFn: async () => {
      if (selectedVendors.length === 0) return [];
      
      const { data, error } = await supabase
        .from('leaderboard_token_metrics')
        .select(`
          *,
          leaderboard_vendor_profiles (
            id, name, logo_url, website_url, headquarters
          )
        `)
        .in('vendor_id', selectedVendors);

      if (error) throw error;
      
      return data?.map(item => ({
        id: item.vendor_id,
        name: item.leaderboard_vendor_profiles?.name || 'Unknown',
        logo_url: item.leaderboard_vendor_profiles?.logo_url || '',
        website_url: item.leaderboard_vendor_profiles?.website_url || '',
        headquarters: item.leaderboard_vendor_profiles?.headquarters || '',
        tokens_per_month: item.tokens_per_month,
        max_tokens_per_second: item.max_tokens_per_second,
        cost_per_million_tokens: item.cost_per_million_tokens,
        kwh_per_million_tokens: item.kwh_per_million_tokens,
        co2_grams_per_million_tokens: item.co2_grams_per_million_tokens,
      })) || [];
    },
    enabled: selectedVendors.length > 0,
  });

  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const generateRadarData = () => {
    if (!compareData || compareData.length === 0) return [];
    
    // Normalize values for radar chart (0-100 scale)
    const maxValues = {
      tokens: Math.max(...compareData.map(v => v.tokens_per_month)),
      tps: Math.max(...compareData.map(v => v.max_tokens_per_second)),
      cost: Math.max(...compareData.map(v => v.cost_per_million_tokens)),
      efficiency: Math.max(...compareData.map(v => v.kwh_per_million_tokens)),
    };

    return [
      {
        metric: 'Volume',
        ...compareData.reduce((acc, vendor, index) => ({
          ...acc,
          [vendor.name]: (vendor.tokens_per_month / maxValues.tokens) * 100
        }), {})
      },
      {
        metric: 'Speed',
        ...compareData.reduce((acc, vendor) => ({
          ...acc,
          [vendor.name]: (vendor.max_tokens_per_second / maxValues.tps) * 100
        }), {})
      },
      {
        metric: 'Cost Efficiency',
        ...compareData.reduce((acc, vendor) => ({
          ...acc,
          [vendor.name]: 100 - (vendor.cost_per_million_tokens / maxValues.cost) * 100 // Inverted: lower cost = higher score
        }), {})
      },
      {
        metric: 'Energy Efficiency',
        ...compareData.reduce((acc, vendor) => ({
          ...acc,
          [vendor.name]: 100 - (vendor.kwh_per_million_tokens / maxValues.efficiency) * 100 // Inverted: lower energy = higher score
        }), {})
      },
    ];
  };

  const radarData = generateRadarData();
  const vendorColors = ['#10B981', '#3B82F6', '#8B5CF6'];

  if (selectedVendors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Compare AI Providers</p>
          <p className="text-sm">Select up to 3 vendors from the leaderboard to compare their performance metrics</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Comparing Vendors
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(selectedVendors.length)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance Comparison
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {radarData.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                {compareData?.map((vendor, index) => (
                  <Radar
                    key={vendor.id}
                    name={vendor.name}
                    dataKey={vendor.name}
                    stroke={vendorColors[index]}
                    fill={vendorColors[index]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {compareData?.map((vendor, index) => (
            <div key={vendor.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src={vendor.logo_url} 
                  alt={vendor.name}
                  className="w-8 h-8 rounded-full object-contain bg-white p-1"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{vendor.name}</h3>
                    {vendor.website_url && (
                      <a 
                        href={vendor.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{vendor.headquarters}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-medium">{formatNumber(vendor.tokens_per_month, 1)}/mo</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium">{formatNumber(vendor.max_tokens_per_second)} TPS</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-medium">${vendor.cost_per_million_tokens}/1M</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Energy:</span>
                  <span className="font-medium">{vendor.kwh_per_million_tokens} kWh/1M</span>
                </div>
              </div>

              {index < compareData.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedComparePanel;
