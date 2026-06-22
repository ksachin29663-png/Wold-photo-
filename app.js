// app.js - Photo World Online Backend Logic

// 1. Supabase क्रेडेंशियल्स सेटअप
const SUPABASE_URL = "https://xlysqwrqdltianfcegur.supabase.co";
const SUPABASE_ANON_KEY = "Sb_publishable_B7LrL0zT69h0cWdsbvNtOQ_aGA6y1ua";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. पेज लोड होते ही सही फंक्शन रन करें
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("posts-feed")) {
        loadPosts(); // अगर होमपेज है तो पोस्ट लोड करो
    }
    if (document.getElementById("upload-form")) {
        setupAdminForm(); // अगर एडमिन पेज है तो फॉर्म सेटअप करो
    }
});

// ================= USER SIDE: POSTS LOAD KARNA =================
async function loadPosts() {
    const feedContainer = document.getElementById("posts-feed");
    
    // डेटाबेस से पोस्ट्स लाना (नई पोस्ट सबसे ऊपर दिखेगी)
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error loading posts:", error);
        feedContainer.innerHTML = `<p style="text-align:center; padding:20px; color:red;">डेटा लोड करने में समस्या आई!</p>`;
        return;
    }

    if (!posts || posts.length === 0) {
        feedContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#606060;">अभी तक कोई पोस्ट नहीं है। एडमिन पैनल से पहली फोटो पोस्ट करें!</p>`;
        return;
    }

    // पोस्ट्स को स्क्रीन पर दिखाना
    feedContainer.innerHTML = ""; // 'लोड हो रहा है' को हटाएं
    posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
            <div class="post-image-box">
                <img src="${post.image_url}" alt="${post.title}" loading="lazy">
            </div>
            <div class="post-details">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-location">${post.location}</div>
                <p class="post-description">${post.description}</p>
            </div>
        `;
        feedContainer.appendChild(card);
    });
}

// ================= ADMIN SIDE: PHOTO UPLOAD & POST SAVE =================
function setupAdminForm() {
    const form = document.getElementById("upload-form");
    const submitBtn = document.getElementById("submit-btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById("post-image");
        const title = document.getElementById("post-title").value.trim();
        const location = document.getElementById("post-location").value.trim();
        const description = document.getElementById("post-desc").value.trim();
        const file = fileInput.files[0];

        if (!file) {
            alert("कृपया एक फोटो चुनें!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "अपलोड हो रहा है, कृपया रुकें...";

        try {
            // A. फोटो का एक यूनिक नाम बनाना ताकि नाम आपस में न टकराएं
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            // B. Supabase Storage (vlog-images बकेट) में फोटो अपलोड करना
            const { data: storageData, error: storageError } = await supabase.storage
                .from('vlog-images')
                .upload(filePath, file);

            if (storageError) throw storageError;

            // C. अपलोडेड फोटो का पब्लिक URL निकालना
            const { data: urlData } = supabase.storage
                .from('vlog-images')
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;

            // D. डेटाबेस ('posts' टेबल) में एंट्री सेव करना
            const { error: dbError } = await supabase
                .from('posts')
                .insert([
                    { title: title, location: location, description: description, image_url: imageUrl }
                ]);

            if (dbError) throw dbError;

            // सफलता का मैसेज और फॉर्म रीसेट
            alert("बधाई हो! आपकी पोस्ट Photo World Online पर लाइव हो चुकी है।");
            form.reset();
            window.location.href = "index.html"; // वापस होमपेज पर भेजें

        } catch (error) {
            console.error("Error creating post:", error);
            alert("पोस्ट करने में गड़बड़ हुई: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "वेबसाइट पर लाइव करें";
        }
    });
          }
          
