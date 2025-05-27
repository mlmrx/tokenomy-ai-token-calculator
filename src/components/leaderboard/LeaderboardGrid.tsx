
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, ExternalLink, Plus, Check } from "lucide-react";

interface LeaderboardGridProps {
  onVendorSelect: (vendorId: string) => void;
  selectedVendors: string[];
}

interface VendorData {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  description: string;
  headquarters: string;
  tokens_per_month: number;
  max_tokens_per_second: number;
  tokens_per_query_avg: number;
  cost_per_million_tokens: number;
  kwh_per_million_tokens: number;
  co2_grams_per_million_tokens: number;
}

const LeaderboardGrid: React.FC<LeaderboardGridProps> = ({ onVendorSelect, selectedVendors }) => {
  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ['leaderboard-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_token_metrics')
        .select(`
          *,
          leaderboard_vendor_profiles (
            id,
            name,
            slug,
            logo_url,
            website_url,
            description,
            headquarters
          )
        `)
        .order('tokens_per_month', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => ({
        id: item.vendor_id,
        name: item.leaderboard_vendor_profiles?.name || 'Unknown',
        slug: item.leaderboard_vendor_profiles?.slug || '',
        logo_url: item.leaderboard_vendor_profiles?.logo_url || '',
        website_url: item.leaderboard_vendor_profiles?.website_url || '',
        description: item.leaderboard_vendor_profiles?.description || '',
        headquarters: item.leaderboard_vendor_profiles?.headquarters || '',
        tokens_per_month: item.tokens_per_month,
        max_tokens_per_second: item.max_tokens_per_second,
        tokens_per_query_avg: item.tokens_per_query_avg,
        cost_per_million_tokens: item.cost_per_million_tokens,
        kwh_per_million_tokens: item.kwh_per_million_tokens,
        co2_grams_per_million_tokens: item.co2_grams_per_million_tokens,
      })) || [];
    },
  });

  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Error loading leaderboard data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            AI Token Processing Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {leaderboardData?.map((vendor, index) => (
              <div 
                key={vendor.id}
                className="flex items-center gap-4 p-6 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Logo & Basic Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img 
                    src={vendor.logo_url} 
                    alt={vendor.name}
                    className="w-10 h-10 rounded-full object-contain bg-white p-1"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{vendor.name}</h3>
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
                    <p className="text-xs text-muted-foreground truncate">{vendor.headquarters}</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="hidden sm:flex flex-col text-right min-w-0">
                  <span className="text-sm font-semibold">{formatNumber(vendor.tokens_per_month, 1)}</span>
                  <span className="text-xs text-muted-foreground">tokens/month</span>
                </div>

                <div className="hidden md:flex flex-col text-right min-w-0">
                  <span className="text-sm font-semibold">{formatNumber(vendor.max_tokens_per_second)}</span>
                  <span className="text-xs text-muted-foreground">TPS</span>
                </div>

                <div className="hidden lg:flex flex-col text-right min-w-0">
                  <span className="text-sm font-semibold">${vendor.cost_per_million_tokens}</span>
                  <span className="text-xs text-muted-foreground">per 1M tokens</span>
                </div>

                {/* Efficiency Badge */}
                <Badge 
                  variant={vendor.kwh_per_million_tokens < 10 ? "default" : "secondary"}
                  className="hidden xl:flex"
                >
                  {vendor.kwh_per_million_tokens} kWh/1M
                </Badge>

                {/* Select Button */}
                <Button
                  variant={selectedVendors.includes(vendor.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVendorSelect(vendor.id)}
                  disabled={!selectedVendors.includes(vendor.id) && selectedVendors.length >= 3}
                >
                  {selectedVendors.includes(vendor.id) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardGrid;
