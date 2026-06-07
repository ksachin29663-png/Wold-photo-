import { useState, useRef, useEffect } from "react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tag: string;
  imageUrl: string;
  createdAt: number;
}

const STORAGE_KEY = "picworld_blogs";
const TAGS = ["🏏 क्रिकेट स्पेशल", "🌿 4K वॉलपेपर", "🔥 बड़ी खबर", "🌍 दुनिया की खबर", "⚽ खेल समाचार", "🎬 मनोरंजन"];

function getLocalBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBlogs(blogs: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
}

interface AdminModalProps {
  onClose: () => void;
}

export default function AdminModal({ onClose }: AdminModalProps) {
  const [tab, setTab] = useState<"post" | "manage">("post");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState(TAGS[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [success, setSuccess] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBlogs(getLocalBlogs());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const editorContent = editorRef.current?.innerHTML || content;
    if (!title.trim() || !imageUrl.trim() || !editorContent.trim()) {
      alert("कृपया सभी फील्ड भरें!");
      return;
    }
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: title.trim(),
      tag,
      imageUrl: imageUrl.trim(),
      content: editorContent,
      createdAt: Date.now(),
    };
    const updated = [newPost, ...getLocalBlogs()];
    saveBlogs(updated);
    setBlogs(updated);
    setTitle(""); setImageUrl(""); setContent("");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const deletePost = (id: string) => {
    if (!confirm("क्या आप इस पोस्ट को हटाना चाहते हैं?")) return;
    const updated = getLocalBlogs().filter((b) => b.id !== id);
    saveBlogs(updated);
    setBlogs(updated);
  };

  const formatTag = (text: string, command: string) => {
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl">✕</button>
        <h2 className="text-xl font-black text-gray-900 border-b pb-2 mb-4">📰 Admin Panel</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setTab("post")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition ${tab === "post" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            ✍️ नई पोस्ट
          </button>
          <button
            type="button"
            onClick={() => setTab("manage")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition ${tab === "manage" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            📋 पोस्ट्स ({blogs.length})
          </button>
        </div>

        {tab === "post" && (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {success && (
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 font-bold text-center">
                ✅ ब्लॉग पोस्ट सफलतापूर्वक पब्लिश हो गई!
              </div>
            )}
            <div>
              <label className="block font-bold text-gray-700 mb-1">शीर्षक (Title) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="ब्लॉग का शीर्षक लिखें..."
                className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">टैग</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:border-red-400"
                >
                  {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">फोटो लिंक (Image URL) *</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full p-2.5 border rounded-lg bg-gray-50 text-xs focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
            {/* Simple Rich Text Editor */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">समाचार लेख *</label>
              <div className="border rounded-t-lg bg-gray-100 p-2 flex gap-1 flex-wrap">
                {[
                  { label: "B", cmd: "bold", title: "Bold" },
                  { label: "I", cmd: "italic", title: "Italic" },
                  { label: "U", cmd: "underline", title: "Underline" },
                ].map(({ label, cmd, title }) => (
                  <button
                    key={cmd}
                    type="button"
                    title={title}
                    onMouseDown={(e) => { e.preventDefault(); formatTag("", cmd); }}
                    className="px-2 py-1 text-xs font-bold bg-white border rounded hover:bg-gray-50 transition"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full p-3 border border-t-0 rounded-b-lg bg-gray-50 min-h-[150px] text-sm focus:outline-none focus:border-red-400"
                data-placeholder="यहाँ लेख लिखें या लिंक पेस्ट करें..."
                style={{ outline: "none" }}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-black py-3 rounded-xl shadow-md hover:bg-red-700 transition"
            >
              🚀 पब्लिश करें
            </button>
          </form>
        )}

        {tab === "manage" && (
          <div className="space-y-3">
            {blogs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-bold">कोई पोस्ट नहीं है</p>
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://picsum.photos/100/100"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{blog.tag}</span>
                    <p className="font-bold text-sm text-gray-900 mt-0.5 line-clamp-1">{blog.title}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(blog.createdAt).toLocaleDateString("hi-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePost(blog.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                  >
                    🗑️ हटाएं
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
