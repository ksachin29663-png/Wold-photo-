import { useState, useEffect, useRef } from "react";
import { useSearchImages } from "@workspace/api-client-react";
import type { ImageItem } from "@workspace/api-client-react";
import BlogSection from "@/components/BlogSection";
import Modal from "@/components/Modal";
import AdminModal from "@/components/AdminModal";
import ImageModal from "@/components/ImageModal";

const QUICK_SEARCHES = [
  { label: "🏏 क्रिकेट", query: "India Cricket" },
  { label: "🔥 सूर्या", query: "Suryakumar Yadav" },
  { label: "🌿 प्रकृति", query: "Nature Wallpaper 4K" },
  { label: "🏎️ कारें", query: "Sports Car" },
  { label: "🌊 समुद्र", query: "Beautiful Ocean" },
  { label: "🌄 सूर्यास्त", query: "Sunset Wallpaper" },
  { label: "🦁 जानवर", query: "Wild Animals" },
  { label: "🏔️ पहाड़", query: "Mountain Landscape" },
];

type Page = "photos" | "blogs";

export default function Home() {
  const [page, setPage] = useState<Page>("photos");
  const [searchQuery, setSearchQuery] = useState("India Cricket");
  const [activeQuery, setActiveQuery] = useState("India Cricket");
  const [displayedImages, setDisplayedImages] = useState<ImageItem[]>([]);
  const [allImages, setAllImages] = useState<ImageItem[]>([]);
  const [showCount, setShowCount] = useState(36);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const ADMIN_PASSWORD = "picworld2026";

  const { data, isLoading, isFetching } = useSearchImages(
    { q: activeQuery },
    { query: { enabled: !!activeQuery, staleTime: 1000 * 60 * 5 } }
  );

  useEffect(() => {
    if (data?.results) {
      setAllImages(data.results);
      setShowCount(36);
      setDisplayedImages(data.results.slice(0, 36));
    }
  }, [data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  const quickSearch = (query: string) => {
    setSearchQuery(query);
    setActiveQuery(query);
  };

  const loadMore = () => {
    const next = showCount + 36;
    setDisplayedImages(allImages.slice(0, next));
    setShowCount(next);
  };

  const checkAdminAccess = () => {
    setShowAdminPasswordPrompt(true);
    setOpenModal(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setShowAdminPasswordPrompt(false);
      setAdminPassword("");
      setAdminPasswordError("");
      setOpenModal("admin");
    } else {
      setAdminPasswordError("गलत पासवर्ड! दोबारा कोशिश करें।");
    }
  };

  const downloading = useRef<Record<string, boolean>>({});

  const downloadImage = async (img: ImageItem) => {
    const url = img.fullUrl || img.url;
    if (downloading.current[url]) return;
    downloading.current[url] = true;
    try {
      window.open(url, "_blank");
    } finally {
      delete downloading.current[url];
    }
  };

  const shareImage = (img: ImageItem) => {
    const url = img.url;
    if (navigator.share) {
      navigator.share({ url, title: "PicWorld से शेयर की गई फोटो" }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => alert("लिंक कॉपी हो गया!"));
    }
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-950 flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm z-40 py-3 px-4 flex flex-col gap-3 border-b border-gray-200">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage("photos")}>
            <div className="bg-red-600 text-white p-2 rounded-xl font-black text-xl w-10 h-10 flex items-center justify-center shadow">P</div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-red-600">PicWorld</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">लाइव इमेज सर्च इंजन</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="w-full sm:w-5/12 flex items-center bg-gray-100 p-2 rounded-full border border-gray-300 focus-within:border-red-500 focus-within:bg-white transition-all shadow-inner">
            <div className="pl-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="क्रिकेट, सूर्या, धोनी, वॉलपेपर... यहाँ सब मिलेगा"
              className="w-full bg-transparent outline-none px-3 text-sm text-gray-700 font-medium"
            />
            <button type="submit" className="bg-red-600 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow hover:bg-red-700 transition">
              खोजें
            </button>
          </form>

          <button
            type="button"
            onClick={() => setPage("blogs")}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-black py-2.5 px-4 rounded-full shadow-md hover:from-red-600 hover:to-orange-500 transition flex items-center justify-center gap-1.5"
          >
            🌐 हमारी वेबसाइट और ब्लॉग देखें
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex-grow w-full">
        {/* Photo Page */}
        {page === "photos" && (
          <div>
            {/* Quick Search Buttons */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start items-center">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => quickSearch(item.query)}
                  className={`border rounded-full px-4 py-1 text-xs font-semibold transition shadow-sm ${
                    activeQuery === item.query
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white hover:bg-red-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Status */}
            {(isLoading || isFetching) && (
              <div className="text-center text-gray-500 my-6 text-sm font-semibold flex items-center justify-center gap-2">
                <span className="spinner"></span>
                लाइव तस्वीरें निकाली जा रही हैं...
              </div>
            )}

            {/* Gallery Grid */}
            {displayedImages.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                  {displayedImages.map((img, i) => (
                    <div key={img.url + i} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                      <div className="image-card-wrapper">
                        <img
                          src={img.thumb || img.url}
                          alt={img.alt || `Photo ${i + 1}`}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).parentElement!.parentElement!.style.display = "none";
                          }}
                        />
                      </div>
                      {/* Overlay buttons */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setSelectedImage(img)}
                          className="bg-white text-gray-900 rounded-full p-2.5 shadow-lg hover:bg-gray-100 transition text-sm font-bold"
                          title="बड़ा देखें"
                        >
                          🔍
                        </button>
                        <button
                          onClick={() => downloadImage(img)}
                          className="bg-red-600 text-white rounded-full p-2.5 shadow-lg hover:bg-red-700 transition text-sm font-bold"
                          title="डाउनलोड करें"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => shareImage(img)}
                          className="bg-green-600 text-white rounded-full p-2.5 shadow-lg hover:bg-green-700 transition text-sm font-bold"
                          title="शेयर करें"
                        >
                          📤
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {allImages.length > showCount && (
                  <div className="text-center my-6">
                    <button
                      type="button"
                      onClick={loadMore}
                      className="bg-white hover:bg-gray-100 text-gray-800 font-black py-3 px-8 border border-gray-300 rounded-full shadow-sm transition inline-flex items-center gap-2 text-sm"
                    >
                      <span className="text-red-600 animate-bounce">⬇</span> और इमेज चाहिए
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLoading && !isFetching && displayedImages.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-bold">कोई फोटो नहीं मिली</p>
                <p className="text-sm mt-2">कुछ और सर्च करके देखें</p>
              </div>
            )}

            {/* Blog CTA */}
            <div className="text-center my-12 border-t pt-8">
              <button
                type="button"
                onClick={() => setPage("blogs")}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-black py-3 px-8 rounded-full shadow-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 mx-auto"
              >
                🌏 हमारी वेबसाइट, ब्लॉग और दुनिया के बारे में जानें
              </button>
            </div>
          </div>
        )}

        {/* Blog Page */}
        {page === "blogs" && (
          <BlogSection onBack={() => setPage("photos")} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p
              onClick={checkAdminAccess}
              className="font-bold text-gray-700 text-sm mb-1 cursor-pointer hover:text-red-600 transition"
            >
              PicWorld Network 🔒
            </p>
            <p>© 2026 photoworld.online. सर्वाधिकार सुरक्षित।</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 font-bold text-gray-600 text-sm">
            <button type="button" onClick={() => setOpenModal("about")} className="hover:text-red-600">ℹ️ About Us</button>
            <button type="button" onClick={() => setOpenModal("contact")} className="hover:text-red-600">📞 Contact Us</button>
            <button type="button" onClick={() => setOpenModal("disclaimer")} className="hover:text-red-600">⚠️ Disclaimer</button>
            <button type="button" onClick={() => setOpenModal("privacy")} className="hover:text-red-600">🔒 Privacy Policy</button>
            <button type="button" onClick={() => setOpenModal("terms")} className="hover:text-red-600">📝 Terms & Conditions</button>
          </div>
        </div>
      </footer>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageModal
          img={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDownload={() => downloadImage(selectedImage)}
          onShare={() => shareImage(selectedImage)}
        />
      )}

      {/* Admin Password Prompt */}
      {showAdminPasswordPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-lg font-black text-gray-900 mb-4">🔒 Admin Access</h2>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="पासवर्ड डालें"
                className="w-full p-3 border rounded-lg text-sm"
                autoFocus
              />
              {adminPasswordError && <p className="text-red-600 text-xs font-bold">{adminPasswordError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm">Login</button>
                <button
                  type="button"
                  onClick={() => { setShowAdminPasswordPrompt(false); setAdminPassword(""); setAdminPasswordError(""); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg text-sm"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {openModal === "admin" && (
        <AdminModal onClose={() => setOpenModal(null)} />
      )}

      {/* About Modal */}
      <Modal id="about" isOpen={openModal === "about"} onClose={() => setOpenModal(null)} title="ℹ️ About Us - PicWorld के बारे में जानें">
        <div className="text-xs text-gray-700 leading-relaxed space-y-3 legal-text-box">
          <p><strong>PicWorld (photoworld.online)</strong> पर आपका हार्दिक स्वागत है। यह एक अत्याधुनिक, अत्यंत तीव्रगामी और शक्तिशाली लाइव इमेज सर्च इंजन एवं समाचार-ब्लॉगिंग प्लेटफॉर्म है।</p>
          <h3>हमारा मिशन और विज़न</h3>
          <p>PicWorld एक ऐसा इंटेलिजेंट इमेज एग्रीगेटर और सर्च इंजन है जो एक सिंगल क्लिक पर एक साथ 36 सबसे खूबसूरत और प्रासंगिक तस्वीरें स्क्रीन पर लाकर खड़ा कर देता है। आप इन तस्वीरों को बिना किसी रुकावट के सीधे डाउनलोड कर सकते हैं और व्हाट्सएप या अन्य सोशल मीडिया पर तुरंत साझा कर सकते हैं।</p>
          <h3>हम क्या सेवाएँ प्रदान करते हैं?</h3>
          <p>1. <strong>लाइव इमेज इंजन:</strong> हमारे शक्तिशाली सर्च बार के ज़रिए आप भारतीय क्रिकेट, 4K नेचर वॉलपेपर्स, स्पोर्ट्स कारें, और बहुत कुछ खोज सकते हैं।</p>
          <p>2. <strong>ताज़ा समाचार और ब्लॉगिंग:</strong> PicWorld नेटवर्क न केवल आपको विजुअल्स देता है बल्कि दुनिया की बड़ी खबरों से भी रूबरू कराता है।</p>
          <p>3. <strong>यूजर-फ्रेंडली मोबाइल एक्सपीरियंस:</strong> यह पूरी वेबसाइट मोबाइल, टैबलेट और स्मार्टफोन पर सुचारू रूप से काम करने के लिए ऑप्टिमाइज़ की गई है।</p>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal id="contact" isOpen={openModal === "contact"} onClose={() => setOpenModal(null)} title="📞 Contact Us - संपर्क करें">
        <div className="text-xs text-gray-700 leading-relaxed space-y-3 legal-text-box">
          <p>PicWorld टीम अपने पाठकों, उपयोगकर्ताओं और व्यावसायिक भागीदारों के साथ निरंतर संचार बनाए रखने में विश्वास रखती है।</p>
          <h3>हमसे संपर्क करने के माध्यम:</h3>
          <p><strong>आधिकारिक ईमेल:</strong> support@photoworld.online</p>
          <p>हमारी तकनीकी टीम आपकी समस्याओं का समाधान करने के लिए प्रतिबद्ध है। आमतौर पर हम सभी वैध ईमेल और प्रश्नों का उत्तर 24 से 48 कार्य घंटों के भीतर देने का पूरा प्रयास करते हैं।</p>
          <h3>आप हमसे किन विषयों पर संपर्क कर सकते हैं?</h3>
          <p>1. <strong>तकनीकी सहायता:</strong> यदि वेबसाइट पर लाइव फोटो लोड होने में कोई समस्या आ रही है।</p>
          <p>2. <strong>कंटेंट और कॉपीराइट:</strong> यदि आपको लगता है कि कोई इमेज आपके कॉपीराइट का उल्लंघन करती है।</p>
          <p>3. <strong>बिजनेस एवं एडवरटाइजिंग:</strong> यदि आप हमारी वेबसाइट पर विज्ञापन प्रदर्शित करना चाहते हैं।</p>
        </div>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal id="disclaimer" isOpen={openModal === "disclaimer"} onClose={() => setOpenModal(null)} title="⚠️ Disclaimer - अस्वीकरण नीति">
        <div className="text-xs text-gray-700 leading-relaxed space-y-3 legal-text-box">
          <p>वेबसाइट <strong>photoworld.online (PicWorld)</strong> पर उपलब्ध सभी जानकारी और डेटा केवल सामान्य सूचनात्मक और शैक्षिक उद्देश्यों के लिए नेक नियति (Good Faith) से प्रकाशित किया गया है।</p>
          <h3>लाइव सर्च और छवियों का प्रकटीकरण</h3>
          <p>PicWorld मुख्य रूप से एक स्वचालित इमेज सर्च एग्रीगेटर के रूप में कार्य करता है। इस वेबसाइट पर प्रदर्शित होने वाली तस्वीरें और वॉलपेपर्स इंटरनेट पर सार्वजनिक रूप से उपलब्ध विभिन्न स्रोतों से लाइव रेंडर की जाती हैं। इन छवियों पर हमारा कोई मालिकाना हक या कॉपीराइट नहीं है।</p>
          <h3>सहमति और अपडेट</h3>
          <p>हमारी वेबसाइट का उपयोग करके, आप हमारे इस अस्वीकरण (Disclaimer) को स्वीकार करते हैं और इसकी शर्तों से पूरी तरह सहमत होते हैं।</p>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal id="privacy" isOpen={openModal === "privacy"} onClose={() => setOpenModal(null)} title="🔒 Privacy Policy - गोपनीयता नीति">
        <div className="text-xs text-gray-700 leading-relaxed space-y-3 legal-text-box">
          <p>PicWorld (photoworld.online) पर, हमारे आगंतुकों (Visitors) की गोपनीयता हमारी सर्वोच्च प्राथमिकता में से एक है।</p>
          <h3>हम कौन सी जानकारी एकत्र करते हैं?</h3>
          <p>हम Google Analytics और AdSense के माध्यम से बुनियादी उपयोग डेटा (जैसे पेज व्यू, बाउंस रेट, डिवाइस प्रकार) एकत्र कर सकते हैं। हम व्यक्तिगत रूप से पहचान योग्य जानकारी (PII) जैसे नाम, ईमेल, या फोन नंबर एकत्र नहीं करते।</p>
          <h3>कुकीज़ (Cookies)</h3>
          <p>हमारी वेबसाइट Google AdSense के माध्यम से तृतीय-पक्ष कुकीज़ का उपयोग कर सकती है। आप अपने ब्राउज़र सेटिंग्स से कुकीज़ को अक्षम कर सकते हैं।</p>
          <h3>संपर्क करें</h3>
          <p>यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया support@photoworld.online पर संपर्क करें।</p>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal id="terms" isOpen={openModal === "terms"} onClose={() => setOpenModal(null)} title="📝 Terms & Conditions - नियम और शर्तें">
        <div className="text-xs text-gray-700 leading-relaxed space-y-3 legal-text-box">
          <p>PicWorld (photoworld.online) का उपयोग करके, आप निम्नलिखित नियमों और शर्तों से बाध्य होने के लिए सहमत होते हैं।</p>
          <h3>सेवाओं का उपयोग</h3>
          <p>आप सहमत हैं कि आप इस वेबसाइट का उपयोग केवल वैध उद्देश्यों के लिए करेंगे। आप इस वेबसाइट का उपयोग किसी भी तरीके से नहीं करेंगे जो किसी तीसरे पक्ष के अधिकारों का उल्लंघन करे।</p>
          <h3>बौद्धिक संपदा</h3>
          <p>PicWorld के लोगो, नाम, और वेबसाइट डिज़ाइन photoworld.online की बौद्धिक संपदा हैं। इमेज सर्च के माध्यम से प्रदर्शित तस्वीरें उनके मूल लेखकों और फोटोग्राफरों की हैं।</p>
          <h3>दायित्व की सीमा</h3>
          <p>PicWorld किसी भी प्रत्यक्ष, अप्रत्यक्ष, या आकस्मिक क्षति के लिए उत्तरदायी नहीं होगा जो इस वेबसाइट के उपयोग से उत्पन्न हो।</p>
        </div>
      </Modal>
    </div>
  );
}
