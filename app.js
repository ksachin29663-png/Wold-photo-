// app.js - Photo World Online Smart Engine (With Email Lock)
const SUPABASE_URL = "https://xlysqwrqdltianfcegur.supabase.co";
const SUPABASE_ANON_KEY = "Sb_publishable_B7LrL0zT69h0cWdsbvNtOQ_aGA6y1ua";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("posts-feed")) {
        loadSmartFeed();
    }
    if (document.getElementById("upload-form")) {
        setupAdminForm();
        setupLiveEditor(); // लाइव एडिटिंग प्रीव्यू चालू करने के लिए
    }
});

// 🔐 सीक्रेट मास्टर ईमेल सुरक्षा वेरिफिकेशन
function verifyAdminEmail() {
    const inputEmail = document.getElementById("admin-email-input").value.trim().toLowerCase();
    
    // 🌟 सचिन, यहाँ उद्धरण चिह्नों (" ") के अंदर अपना वो सीक्रेट ईमेल लिख दो जिससे तुम अनलॉक करना चाहते हो!
    const MASTER_EMAIL = "sachin@gmail.com"; 

    if (inputEmail === MASTER_EMAIL.toLowerCase()) {
        document.getElementById("lock-screen").style.display = "none";
        document.getElementById("admin-main-form").style.display = "block";
    } else {
        alert("💥 एक्सेस डिनाइड! यह ईमेल एडमिन डेटाबेस से मैच नहीं करता।");
    }
}

// 👁️ लाइव टेक्स्ट एडिटर फंक्शन (टाइप करते ही नीचे चेंज होगा)
function setupLiveEditor() {
    const titleInput = document.getElementById("post-title");
    const locationInput = document.getElementById("post-location");
    const descInput = document.getElementById("post-desc");

    const previewTitle = document.getElementById("live-preview-title");
    const previewLocation = document.getElementById("live-preview-location");
    const previewDesc = document.getElementById("live-preview-desc");

    titleInput.addEventListener("input", () => {
        previewTitle.innerText = titleInput.value.trim() || "शीर्षक यहाँ दिखेगा...";
    });

    locationInput.addEventListener("input", () => {
        previewLocation.innerText = locationInput.value.trim() ? `📍 ${locationInput.value.trim()}` : "📍 लोकेशन यहाँ दिखेगी";
    });

    descInput.addEventListener("input", () => {
        previewDesc.innerText = descInput.value.trim() || "आपकी कहानी का लाइव प्रीव्यू यहाँ दिखेगा...";
    });
}

// 三 थ्री-डॉट मेनू चालू-बंद करने के लिए
function toggleMenu(postId) {
    const menu = document.getElementById(`menu-${postId}`);
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        if(m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
}

// थ्री-डॉट के अंदर के बटन्स का एक्शन
function showAction(type, title, location) {
    if(type === 'disclaimer') {
        alert(`[डिस्क्लेमर]: Photo World Online पर दिखाई गई यह तस्वीर मौलिक है। बिना अनुमति के इसका व्यावसायिक उपयोग वर्जित है।`);
    } else if(type === 'about') {
        alert(`[अबाउट टास्क]: यह फोटो '${location}' की सुंदरता को बढ़ावा देने के लिए एडमिन सचिन द्वारा अपलोड की गई है।`);
    } else if(type === 'approval') {
        alert(`[अडिशनल अप्रूवल]: Verified Content Tag ✓. यह पोस्ट Photo World Online के सभी सुरक्षा और क्वालिटी मानकों पर पूरी तरह अप्रूव्ड है।`);
    }
}

// 🚀 वायरल + न्यू पोस्ट मिक्सिंग एल्गोरिदम फीड (यूजर साइड)
async function loadSmartFeed() {
    const feedContainer = document.getElementById("posts-feed");
    
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*');

    if (error) {
        feedContainer.innerHTML = `<p style="text-align:center; padding:20px; color:red;">डेटा लोड करने में समस्या आई!</p>`;
        return;
    }

    if (!posts || posts.length === 0) {
        feedContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#606060;">अभी तक कोई पोस्ट नहीं है।</p>`;
        return;
    }

    // एल्गोरिदम कैलकुलेशन
    const scoredPosts = posts.map(post => {
        const postTime = new Date(post.created_at).getTime();
        const now = Date.now();
        
        const hoursAgo = (now - postTime) / (1000 * 60 * 60);
        const freshnessScore = Math.max(0, 100 - hoursAgo * 2); 

        const viralFactor = (post.id % 5 === 0 || post.title.length > 15) ? 40 : 10;
        const totalScore = freshnessScore + viralFactor;

        return { ...post, score: totalScore, isTrending: viralFactor > 30 };
    });

    // सॉर्टिंग (हाई स्कोर टॉप पर)
    scoredPosts.sort((a, b) => b.score - a.score);

    feedContainer.innerHTML = "";
    scoredPosts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
            <div class="card-header">
                <div class="author-info">
                    <div class="post-title">${post.title}</div>
                    <div class="post-location">📍 ${post.location}</div>
                </div>
                <button class="three-dot-btn" onclick="toggleMenu(${post.id})">⋮</button>
                <div class="dropdown-menu" id="menu-${post.id}">
                    <div class="dropdown-item" onclick="showAction('about', '${post.title}', '${post.location}')">ℹ️ About Content</div>
                    <div class="dropdown-item" onclick="showAction('disclaimer')">⚠️ Disclaimer</div>
                    <div class="dropdown-item" onclick="showAction('approval')">✅ Additional Approval</div>
                </div>
            </div>
            <div class="post-image-box">
                <img src="${post.image_url}" alt="${post.title}" loading="lazy">
                ${post.isTrending ? `<span class="trending-tag">🔥 VIRAL</span>` : ''}
            </div>
            <div class="post-details">
                <p class="post-description">${post.description}</p>
            </div>
        `;
        feedContainer.appendChild(card);
    });
}

// ADMIN FORM: UPLOAD AND SAVE TO SUPABASE
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

        if (!file) return alert("कृपया फोटो चुनें!");

        submitBtn.disabled = true;
        submitBtn.innerText = "लाइव हो रहा है...";

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: storageError } = await supabase.storage
                .from('vlog-images')
                .upload(filePath, file);

            if (storageError) throw storageError;

            const { data: urlData } = supabase.storage
                .from('vlog-images')
                .getPublicUrl(filePath);

            const imageUrl = urlData.publicUrl;

            const { error: dbError } = await supabase
                .from('posts')
                .insert([{ title, location, description, image_url: imageUrl }]);

            if (dbError) throw dbError;

            alert("बधाई हो सचिन! आपकी पोस्ट 'Photo World Online' पर सफलतापूर्वक लाइव हो चुकी है।");
            form.reset();
            window.location.href = "index.html";
        } catch (error) {
            alert("गड़बड़ हुई: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "वेबसाइट पर लाइव करें";
        }
    });
}
