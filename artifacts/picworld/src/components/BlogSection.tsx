import { useState, useEffect } from "react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tag: string;
  imageUrl: string;
  createdAt: number;
}

interface BlogSectionProps {
  onBack: () => void;
}

const STORAGE_KEY = "picworld_blogs";

function getLocalBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function BlogSection({ onBack }: BlogSectionProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getLocalBlogs();
    setBlogs(stored);
    setLoading(false);
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("hi-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 bg-gray-200 text-gray-800 text-xs font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center gap-1.5"
      >
        ← फोटो गैलरी पर वापस जाएं
      </button>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-2.5 h-7 bg-red-600 rounded"></div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">PicWorld ताजा खबरें और ट्रेंडिंग ब्लॉग्स</h2>
      </div>

      {loading ? (
        <div className="text-center py-6 text-sm font-bold text-gray-500">
          <span className="spinner mr-2 inline-block"></span>
          ब्लॉग्स लोड हो रहे हैं...
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📰</div>
          <p className="font-bold text-lg">अभी कोई ब्लॉग नहीं है</p>
          <p className="text-sm mt-2">Admin पैनल से ब्लॉग पोस्ट करें</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-100"
            >
              <div className="image-card-wrapper">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/600/400"; }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-2">
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md">{blog.tag}</span>
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
                <h3 className="font-black text-gray-900 text-sm leading-snug line-clamp-2">{blog.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]+>/g, "").slice(0, 120) + "..." }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBlog(null); }}
        >
          <div className="bg-white rounded-2xl max-w-xl w-full relative shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left">
            <button
              type="button"
              onClick={() => setSelectedBlog(null)}
              className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/80 text-xl z-20 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            <div className="image-card-wrapper flex-shrink-0">
              <img
                src={selectedBlog.imageUrl}
                alt={selectedBlog.title}
                onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/600/400"; }}
              />
            </div>
            <div className="p-4 overflow-y-auto modal-scroll flex-grow space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md">{selectedBlog.tag}</span>
                <span>{formatDate(selectedBlog.createdAt)}</span>
              </div>
              <h2 className="text-base font-black text-gray-900 leading-snug">{selectedBlog.title}</h2>
              <div
                className="text-sm text-gray-800 leading-relaxed pt-2"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
