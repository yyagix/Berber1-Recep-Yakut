"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadGalleryImageAction, deleteGalleryImageAction } from "@/app/actions/gallery";
import toast from "react-hot-toast";

type PendingFile = {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
};

export default function GalleryManager({ barberId, initialGallery }: { barberId: string, initialGallery: string[] }) {
  const [gallery, setGallery] = useState(initialGallery);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      pendingFiles.forEach(pf => URL.revokeObjectURL(pf.preview));
    };
  }, [pendingFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`"${file.name}" 50MB'den büyük olduğu için atlandı.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const newPending: PendingFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setPendingFiles(prev => [...prev, ...newPending]);
    e.target.value = ''; // Reset input
  };

  const removePending = (id: string) => {
    setPendingFiles(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const toRemove = prev.find(p => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.preview);
      return filtered;
    });
  };

  const startUpload = async () => {
    const filesToUpload = pendingFiles.filter(pf => pf.status === 'pending' || pf.status === 'error');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;

    for (const pf of filesToUpload) {
      // Update status to uploading
      setPendingFiles(prev => prev.map(p => p.id === pf.id ? { ...p, status: 'uploading', error: undefined } : p));

      const formData = new FormData();
      formData.append("barberId", barberId);
      formData.append("image", pf.file);

      const result = await uploadGalleryImageAction(formData);

      if (result.error) {
        setPendingFiles(prev => prev.map(p => p.id === pf.id ? { ...p, status: 'error', error: result.error } : p));
      } else {
        setPendingFiles(prev => prev.map(p => p.id === pf.id ? { ...p, status: 'success' } : p));
        uploadedCount++;
      }
    }

    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} görsel başarıyla yüklendi.`);
      // Reload to reflect new gallery images from DB, or we can wait a bit
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    setIsUploading(false);
  };

  const confirmDelete = async (url: string) => {
    setDeletingUrl(url); // Just in case we want to show loading state, but for now we'll just wait
    const result = await deleteGalleryImageAction(barberId, url);
    if (!result.error) {
      setGallery(gallery.filter(img => img !== url));
      toast.success("Görsel silindi.");
    } else {
      toast.error(result.error);
    }
    setDeletingUrl(null);
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl space-y-10">
      
      {/* Upload Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            Yeni Görseller Seç
          </h2>
          
          <div>
            <input 
              type="file" 
              id="gallery-upload" 
              accept="image/*" 
              multiple
              className="hidden" 
              onChange={handleFileSelect} 
              disabled={isUploading}
            />
            <label 
              htmlFor="gallery-upload"
              className="px-6 py-2.5 bg-[#1a1a1a] border border-white/10 text-white font-bold rounded-lg cursor-pointer hover:bg-white/10 transition-colors disabled:opacity-50 inline-block shadow-lg"
            >
              Cihazdan Fotoğraf Seç
            </label>
          </div>
        </div>

        {/* Pending Files Queue */}
        {pendingFiles.length > 0 && (
          <div className="bg-[#151515] p-6 rounded-xl border border-[#d4af37]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">Yükleme Bekleyenler ({pendingFiles.length})</h3>
              <button 
                onClick={startUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                {isUploading ? "Yükleniyor..." : "Seçilenleri Yükle"}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pendingFiles.map((pf) => (
                <div key={pf.id} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${pf.status === 'error' ? 'border-red-500' : pf.status === 'success' ? 'border-green-500' : 'border-white/10'} group bg-[#1a1a1a]`}>
                  <Image src={pf.preview} alt="Preview" fill className="object-cover opacity-80" />
                  
                  {/* Status Overlay */}
                  {pf.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Yükleniyor</span>
                    </div>
                  )}
                  {pf.status === 'success' && (
                    <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  {pf.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center p-2 text-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span className="text-[10px] font-bold text-white leading-tight">{pf.error}</span>
                    </div>
                  )}

                  {/* Remove Button (only if not uploading/success) */}
                  {(pf.status === 'pending' || pf.status === 'error') && (
                    <button 
                      onClick={() => removePending(pf.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-white/5"></div>

      {/* Existing Gallery Section */}
      <div>
        <h2 className="text-xl font-bold font-heading text-white mb-6">Mevcut Galeri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {gallery.length === 0 ? (
            <div className="col-span-full py-8 text-center text-[#666666]">Galeride henüz fotoğraf yok.</div>
          ) : (
            gallery.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-black/80 transition-opacity flex items-center justify-center ${deletingUrl === url ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {deletingUrl === url ? (
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-white text-sm font-bold">Silinsin mi?</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => confirmDelete(url)}
                          className="px-4 py-1.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg text-sm"
                        >
                          Evet
                        </button>
                        <button 
                          onClick={() => setDeletingUrl(null)}
                          className="px-4 py-1.5 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors shadow-lg text-sm"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeletingUrl(url)}
                      className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
