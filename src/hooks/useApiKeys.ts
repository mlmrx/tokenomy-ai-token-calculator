
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type ApiKey = Tables<'api_keys'>;
export type ApiKeyInsert = TablesInsert<'api_keys'>;

export function useApiKeys() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApiKeys = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (keyData: Omit<ApiKeyInsert, 'api_key_hash' | 'api_key_prefix'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create API keys",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-api-key', {
        body: keyData
      });

      if (error) throw error;
      
      await fetchApiKeys();
      toast({
        title: "Success",
        description: "API key created successfully. Make sure to copy it now!",
      });
      return data;
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
      throw error;
    }
  };

  const revokeApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, is_active: false } : key
      ));
      toast({
        title: "Success",
        description: "API key revoked successfully",
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setApiKeys(prev => prev.filter(key => key.id !== id));
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  return {
    apiKeys,
    loading,
    createApiKey,
    revokeApiKey,
    deleteApiKey,
    refetch: fetchApiKeys,
  };
}
