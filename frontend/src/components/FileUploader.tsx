import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, FileJson, File, AlertCircle, Loader2, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/Progress';
import { API_BASE_URL } from '../config';

interface Props {
  onSuccess: (jobId: string, fileName?: string) => void;
}

interface FilePreview {
  file: File;
  type: 'csv' | 'excel' | 'json';
  size: string;
}

const fileTypeConfig = {
  csv: {
    icon: FileSpreadsheet,
    color: 'text-[var(--color-success)]',
    bgColor: 'bg-[var(--color-success)]/10',
    label: 'CSV',
  },
  excel: {
    icon: FileSpreadsheet,
    color: 'text-[var(--color-brand)]',
    bgColor: 'bg-[var(--color-brand)]/10',
    label: 'Excel',
  },
  json: {
    icon: FileJson,
    color: 'text-[var(--color-warning)]',
    bgColor: 'bg-[var(--color-warning)]/10',
    label: 'JSON',
  },
};

function getFileType(file: File): 'csv' | 'excel' | 'json' | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') return 'csv';
  if (['xlsx', 'xls'].includes(extension || '')) return 'excel';
  if (extension === 'json') return 'json';
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FileUploader: React.FC<Props> = ({ onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const type = getFileType(file);
    if (!type) {
      return 'Invalid file type. Please upload a CSV, Excel, or JSON file.';
    }
    if (file.size > 50 * 1024 * 1024) {
      return 'File too large. Maximum size is 50MB.';
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    const type = getFileType(file)!;
    setFilePreview({
      file,
      type,
      size: formatFileSize(file.size),
    });
  }, [validateFile]);

  const handleUpload = async () => {
    if (!filePreview) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', filePreview.file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('File uploaded successfully!');
      onSuccess(response.data.job_id, filePreview.file.name);
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.detail || 'Failed to upload file'
        : 'Failed to upload file';
      setError(errorMessage);
      toast.error(errorMessage);
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setFilePreview(null);
    setError(null);
    setUploadProgress(0);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const config = filePreview ? fileTypeConfig[filePreview.type] : null;
  const FileIcon = config?.icon || File;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!filePreview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card
              padding="none"
              className={clsx(
                'relative overflow-hidden cursor-pointer',
                'border-2 border-dashed transition-all duration-300',
                dragActive
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-light)]'
              )}
            >
              <div
                className="p-12 lg:p-16"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                <div className="flex flex-col items-center gap-6 text-center">
                  {/* Upload icon */}
                  <div
                    className={clsx(
                      'p-5 rounded-full transition-all duration-300',
                      dragActive
                        ? 'bg-[var(--color-brand)]/20 scale-110'
                        : 'bg-[var(--color-surface)]'
                    )}
                  >
                    <Upload
                      size={36}
                      className={clsx(
                        'transition-colors duration-300',
                        dragActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'
                      )}
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                      {dragActive ? 'Drop your file here' : 'Drop your dataset here'}
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                      or <span className="text-[var(--color-brand)] font-medium">browse</span> to choose a file
                    </p>
                  </div>

                  {/* Supported formats */}
                  <div className="flex items-center gap-6 pt-4">
                    {Object.entries(fileTypeConfig).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                        <config.icon size={16} className={config.color} />
                        <span>{config.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Size limit */}
                  <p className="text-xs text-[var(--color-text-dim)]">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-brand)]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card padding="lg" className="relative">
              {/* Clear button */}
              {!uploading && (
                <button
                  onClick={handleClearFile}
                  className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-all"
                >
                  <X size={18} />
                </button>
              )}

              <div className="flex flex-col items-center gap-6 text-center">
                {/* File icon */}
                <div className={clsx('p-5 rounded-2xl', config?.bgColor)}>
                  <FileIcon size={40} className={config?.color} />
                </div>

                {/* File info */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                    {filePreview.file.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {config?.label} File &middot; {filePreview.size}
                  </p>
                </div>

                {/* Progress or action */}
                {uploading ? (
                  <div className="w-full max-w-xs space-y-3">
                    <ProgressBar value={uploadProgress} size="md" />
                    <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                      <Loader2 size={16} className="animate-spin text-[var(--color-brand)]" />
                      <span>
                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleClearFile}>
                      Change File
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpload}
                      icon={<CheckCircle2 size={18} />}
                    >
                      Start Profiling
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20">
              <AlertCircle size={18} className="text-[var(--color-danger)] shrink-0" />
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
