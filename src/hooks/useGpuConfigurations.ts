
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type GpuConfiguration = Tables<'gpu_configurations'>;
export type GpuConfigurationInsert = TablesInsert<'gpu_configurations'>;
export type GpuConfigurationUpdate = TablesUpdate<'gpu_configurations'>;

export function useGpuConfigurations() {
  const [configurations, setConfigurations] = useState<GpuConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('gpu_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error) {
      console.error('Error fetching GPU configurations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch GPU configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConfiguration = async (config: GpuConfigurationInsert) => {
    try {
      const { data, error } = await supabase
        .from('gpu_configurations')
        .insert(config)
        .select()
        .single();

      if (error) throw error;
      
      setConfigurations(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "GPU configuration created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating GPU configuration:', error);
      toast({
        title: "Error",
        description: "Failed to create GPU configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateConfiguration = async (id: string, updates: GpuConfigurationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('gpu_configurations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setConfigurations(prev => prev.map(config => 
        config.id === id ? data : config
      ));
      toast({
        title: "Success",
        description: "GPU configuration updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating GPU configuration:', error);
      toast({
        title: "Error",
        description: "Failed to update GPU configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gpu_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setConfigurations(prev => prev.filter(config => config.id !== id));
      toast({
        title: "Success",
        description: "GPU configuration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting GPU configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete GPU configuration",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  return {
    configurations,
    loading,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    refetch: fetchConfigurations,
  };
}
