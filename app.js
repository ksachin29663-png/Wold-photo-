// 🟢 अपने Supabase का सही URL और KEY यहाँ डालो
const SUPABASE_URL = "https://xlysqwrqdltianfcegur.supabase.co"; 
const SUPABASE_KEY = "YOUR_ACTUAL_SUPABASE_KEY_HERE"; // अपनी असली की (Key) यहाँ लिखना

const supabase = { createClient } = supabase;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🏠 होमपेज पर पोस्ट लोड करने का फंक्शन
async function loadPosts() {
    const feedStatus = document.getElementById("feed-status");
    const postsFeed = document.getElementById("posts-feed");
    
    if (!postsFeed) return; // अगर एडमिन पैनल पर हैं तो यह रन नहीं होगा

    try {
        let { data: posts, error } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 🎯 तुम्हारी पसंद का मैसेज: अगर डेटाबेस में कोई पोस्ट नहीं है
        if (!posts || posts.length === 0) {
            postsFeed.innerHTML = `<div style="text-align:center; padding:40px; color:#888; font-size:16px; font-weight:bold;">
                📸 अभी तक इस वेबसाइट पर कोई पोस्ट नहीं हुई है।
            </div>`;
            return;
        }

        // अगर पोस्ट हैं, तो उन्हें दिखाओ
        postsFeed.innerHTML = "";
        posts.forEach(post => {
            const postCard = document.createElement("div");
            postCard.className = "post-card";
            postCard.innerHTML = `
                <div class="post-header">
                    <span class="post-location">📍 ${post.location || 'Lucknow'}</span>
                </div>
                <img src="${post.image_url}" class="post-image" alt="${post.title}">
                <div class="post-body">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-desc">${post.description || ''}</p>
                </div>
            `;
            postsFeed.appendChild(postCard);
        });

    } catch (error) {
        console.error(error);
        if (feedStatus) feedStatus.innerText = "⚙️ फीड लोड करने में समस्या आई: " + error.message;
    }
}

// 📝 एडमिन पैनल से पोस्ट सबमिट करने का फंक्शन
async function handlePostSubmit(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector("button");
    const originalText = submitBtn.innerText;
    
    // बटन को लॉक करें ताकि बार-बार क्लिक न हो
    submitBtn.disabled = true;
    submitBtn.innerText = "लाइव किया जा रहा है...";

    const title = document.getElementById("post-title").value;
    const location = document.getElementById("post-location").value;
    const description = document.getElementById("post-desc").value;
    const imageFile = document.getElementById("post-image").files[0];

    if (!imageFile) {
        alert("कृपया एक फोटो चुनें!");
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        return;
    }

    try {
        // 1. फोटो को Supabase Storage में अपलोड करें
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        let { error: uploadError } = await client.storage
            .from('vlog-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            throw new Error("स्टोरेज अपलोड गड़बड़: " + uploadError.message);
        }

        // 2. अपलोड की गई फोटो का पब्लिक लिंक लें
        const { data: urlData } = client.storage
            .from('vlog-images')
            .getPublicUrl(fileName);
            
        const imageUrl = urlData.publicUrl;

        // 3. डेटाबेस की 'posts' टेबल में टेक्स्ट सेव करें
        let { error: insertError } = await client
            .from('posts')
            .insert([
                { 
                    title: title, 
                    location: location, 
                    description: description, 
                    image_url: imageUrl 
                }
            ]);

        if (insertError) {
            throw new Error("डेटाबेस सेव गड़बड़: " + insertError.message);
        }

        // 🌟 सफलता का मैसेज! अब पेज क्रैश नहीं होगा
        alert("सचिन भाई, आपकी पोस्ट सफलतापूर्वक लाइव हो चुकी है! 🎉");
        window.location.href = "index.html"; // अब होमपेज पर भेजें

    } catch (error) {
        // 🚨 अगर कोई भी गड़बड़ होगी, तो बाहर फेंकने के बजाय यह अलर्ट दिखेगा
        alert("🚨 पोस्ट लाइव नहीं हो पाई!\nवजह: " + error.message);
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
}

// पेज लोड होने पर सही फंक्शन चलाएं
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("posts-feed")) {
        loadPosts();
    }
    const uploadForm = document.getElementById("upload-form");
    if (uploadForm) {
        uploadForm.addEventListener("submit", handlePostSubmit);
    }
});
