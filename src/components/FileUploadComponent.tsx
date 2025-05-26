import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileCheck, AlertTriangle, X } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
}

interface UploadedFile {
  id: string;
  filename: string;
  file_size_bytes: number;
  validation_status: string;
  validation_errors?: any;
  uploaded_at: string;
}

export function FileUploadComponent({ onUploadComplete }: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateConfigurationFile = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('File must contain valid JSON or YAML data');
      return { isValid: false, errors };
    }

    // Validate GPU configurations
    if (data.gpu_configurations) {
      if (!Array.isArray(data.gpu_configurations)) {
        errors.push('gpu_configurations must be an array');
      } else {
        data.gpu_configurations.forEach((config: any, index: number) => {
          if (!config.gpu_uuid) {
            errors.push(`GPU configuration ${index + 1}: gpu_uuid is required`);
          }
          if (config.hourly_cost_usd && (typeof config.hourly_cost_usd !== 'number' || config.hourly_cost_usd < 0)) {
            errors.push(`GPU configuration ${index + 1}: hourly_cost_usd must be a positive number`);
          }
        });
      }
    }

    // Validate pricing models
    if (data.pricing_models) {
      if (!Array.isArray(data.pricing_models)) {
        errors.push('pricing_models must be an array');
      } else {
        data.pricing_models.forEach((model: any, index: number) => {
          if (!model.name) {
            errors.push(`Pricing model ${index + 1}: name is required`);
          }
        });
      }
    }

    // Validate alert thresholds
    if (data.alert_thresholds) {
      if (!Array.isArray(data.alert_thresholds)) {
        errors.push('alert_thresholds must be an array');
      } else {
        data.alert_thresholds.forEach((threshold: any, index: number) => {
          if (!threshold.metric_name) {
            errors.push(`Alert threshold ${index + 1}: metric_name is required`);
          }
          if (typeof threshold.threshold_value !== 'number') {
            errors.push(`Alert threshold ${index + 1}: threshold_value must be a number`);
          }
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const processFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Read file content
      const text = await file.text();
      let data;

      try {
        // Try parsing as JSON
        data = JSON.parse(text);
      } catch {
        toast({
          title: "Error",
          description: "File must be valid JSON format",
          variant: "destructive",
        });
        return;
      }

      setUploadProgress(25);

      // Validate configuration
      const { isValid, errors } = validateConfigurationFile(data);
      
      setUploadProgress(50);

      // Calculate file hash
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(text));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setUploadProgress(75);

      // Store in database
      const { data: uploadedFile, error } = await supabase
        .from('file_configurations')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_hash: fileHash,
          file_size_bytes: file.size,
          configuration_data: data,
          validation_status: isValid ? 'valid' : 'invalid',
          validation_errors: isValid ? null : errors,
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "Success",
        description: `File uploaded successfully${isValid ? '' : ' with validation warnings'}`,
        variant: isValid ? "default" : "destructive",
      });

      setUploadedFiles(prev => [uploadedFile, ...prev]);
      onUploadComplete?.(uploadedFile.id);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to upload configuration files.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : uploading 
                ? 'border-muted-foreground/25 bg-muted/50'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-medium">Uploading and validating...</p>
                  <Progress value={uploadProgress} className="mt-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Upload Configuration File</h3>
                  <p className="text-muted-foreground">
                    Drag and drop your JSON configuration file here, or click to browse
                  </p>
                </div>
                <Button asChild>
                  <label className="cursor-pointer">
                    Select File
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={handleChange}
                      disabled={uploading}
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Supported format:</strong> JSON files containing gpu_configurations, pricing_models, and/or alert_thresholds arrays.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{file.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.file_size_bytes / 1024).toFixed(1)} KB • {new Date(file.uploaded_at).toLocaleString()}
                      </div>
                      {file.validation_errors && (
                        <div className="text-sm text-destructive mt-1">
                          {file.validation_errors.slice(0, 2).join(', ')}
                          {file.validation_errors.length > 2 && ` +${file.validation_errors.length - 2} more`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(file.validation_status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
