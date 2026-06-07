import type { ImageItem } from "@workspace/api-client-react";

interface ImageModalProps {
  img: ImageItem;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function ImageModal({ img, onClose, onDownload, onShare }: ImageModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 text-xl z-20 rounded-full w-10 h-10 flex items-center justify-center"
      >
        ✕
      </button>
      <img
        src={img.url}
        alt={img.alt || "Full view"}
        className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
        onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/800/600"; }}
      />
      <div className="flex gap-4 mt-5">
        <button
          onClick={onDownload}
          className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-full shadow hover:bg-red-700 transition flex items-center gap-2"
        >
          ⬇️ डाउनलोड
        </button>
        <button
          onClick={onShare}
          className="bg-green-600 text-white font-bold px-6 py-2.5 rounded-full shadow hover:bg-green-700 transition flex items-center gap-2"
        >
          📤 शेयर
        </button>
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-full shadow hover:bg-gray-300 transition"
        >
          बंद करें
        </button>
      </div>
    </div>
  );
}
