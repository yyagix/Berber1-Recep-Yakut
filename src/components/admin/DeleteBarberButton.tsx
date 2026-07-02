"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBarberAction } from "@/app/actions/barber";
import toast from "react-hot-toast";

export default function DeleteBarberButton({ id, name }: { id: string, name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBarberAction(id);

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
      setShowConfirm(false);
    } else {
      toast.success(`${name} başarıyla silindi.`);
      router.push("/admin/barbers");
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 py-2 text-center bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50 flex items-center justify-center min-w-[80px]"
        >
          {isDeleting ? "..." : "Evet, Sil"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="flex-1 py-2 text-center bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-xs font-semibold disabled:opacity-50 flex items-center justify-center min-w-[60px]"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowConfirm(true)}
      className="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors flex items-center justify-center"
      title="Berberi Sil"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
    </button>
  );
}
