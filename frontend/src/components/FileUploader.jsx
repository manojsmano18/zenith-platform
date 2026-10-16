import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Copy, Check, Loader2 } from 'lucide-react';

export default function FileUploader({ 
  onUploadSuccess, 
  defaultUrl = '', 
  compact = false, 
  label = 'Upload Image File',
  description = 'Drag & drop or browse from your device (PNG, JPG, WEBP, GIF)'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(defaultUrl);
  const [previewUrl, setPreviewUrl] = useState(defaultUrl);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG, JPG, WEBP, GIF, SVG)');
      return;
    }

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB limit.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setUploadedUrl(data.url);
      setPreviewUrl(data.url);

      if (onUploadSuccess) {
        onUploadSuccess(data.url, data);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMsg('Failed to upload file: ' + err.message);
      setPreviewUrl(uploadedUrl || defaultUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setUploadedUrl('');
    setPreviewUrl('');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadSuccess) {
      onUploadSuccess('', null);
    }
  };

  const handleCopyUrl = () => {
    if (!uploadedUrl) return;
    const fullUrl = window.location.origin + uploadedUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-3">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : previewUrl
            ? 'border-slate-700 hover:border-emerald-500/50 bg-slate-950/60'
            : 'border-slate-800 hover:border-slate-600 bg-slate-950/40'
        } ${compact ? 'p-3' : 'p-6'}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-200">Uploading and saving to project storage...</p>
            <p className="text-[11px] text-slate-400">Storing in local Zenith uploads directory</p>
          </div>
        ) : previewUrl ? (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 relative group">
              <img
                src={previewUrl}
                alt="Upload Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Image Attached</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Saved & ready for storefront display
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Click box to replace with another image</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 border border-emerald-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-white">{label}</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{description}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold transition-colors">
              <ImageIcon className="w-3.5 h-3.5" /> Browse Computer Files
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Copy link quick utility (in full media uploader) */}
      {!compact && uploadedUrl && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium truncate text-[11px]">Media Asset Uploaded</span>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] ml-2 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}
