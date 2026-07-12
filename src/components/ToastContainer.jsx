import { CheckCircle, XCircle } from 'lucide-react';
import useToastStore from '../stores/useToastStore';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-card"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
          )}
          <p className="text-sm font-medium text-slate-800">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
