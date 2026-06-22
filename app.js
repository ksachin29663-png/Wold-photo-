// 🔥 100% फ्री नो-अपग्रेड फायरबेस इंजन Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYIOpjA-7nBiV6FCivGlbr4oMX-CYAufg",
  authDomain: "appmarket24.firebaseapp.com",
  projectId: "appmarket24",
  storageBucket: "appmarket24.firebasestorage.app",
  messagingSenderId: "699175743000",
  appId: "1:699175743000:web:6b90fff09ad722729edd6d",
  measurementId: "G-Q4B6LSKS5S"
};

// फायरबेस इनिशियलाइज करें (सिर्फ डेटाबेस इस्तेमाल करेंगे, स्टोरेज नहीं)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 📸 फोटो को टेक्स्ट (Base64) में बदलने का जादुई फंक्शन
function convertImageToText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 🏠 होमपेज फीड लोड करने का फंक्शन
async function loadFirebaseFeed() {
    const postsFeed = document.getElementById("posts-feed");
    if (!postsFeed) return;

    try {
        // Firestore से बिना किसी रूल्स के झंझट के रियल-टाइम डेटा लोड करना
        db.collection("posts").orderBy("created_at", "desc").onSnapshot((snapshot) => {
            
            if (snapshot.empty) {
                postsFeed.innerHTML = `<div style="text-align:center; padding:40px; color:#888; font-size:16px; font-weight:bold;">
                    📸 अभी तक इस वेबसाइट पर कोई पोस्ट नहीं हुई है।
                </div>`;
                return;
            }

            postsFeed.innerHTML = "";
            snapshot.forEach((doc) => {
                const post = doc.data();
                const card = document.createElement("div");
                card.className = "post-card";
                card.innerHTML = `
                    <div class="card-header">
                        <div class="author-info">
                            <div class="post-title" style="font-weight:bold; font-size:18px; margin-bottom:4px;">${post.title || 'बिना शीर्षक'}</div>
                            <div class="post-location" style="color:#555; font-size:14px;">📍 ${post.location || 'Lucknow'}</div>
                        </div>
                    </div>
                    <div class="post-image-box" style="margin:10px 0; text-align:center;">
                        <img src="${post.image_url}" alt="Post Image" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px;" loading="lazy">
                    </div>
                    <div class="post-details">
                        <p class="post-description" style="color:#333; font-size:15px; line-height:1.4;">${post.description || ''}</p>
                    </div>
                `;
                postsFeed.appendChild(card);
            });
        }, (error) => {
            console.error(error);
            postsFeed.innerHTML = `<p style="color:red; text-align:center; padding:20px;">डेटाबेस एरर: अगर रूल्स ब्लॉक हैं, तो कृपया एडमिन को बताएं।</p>`;
        });

    } catch (e) {
        postsFeed.innerHTML = `<p style="color:red; text-align:center;">क्रैश सुरक्षा: ${e.message}</p>`;
    }
}

// 📝 एडमिन पैनल फॉर्म हैंडलर
function setupAdminForm() {
    const form = document.getElementById("upload-form");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("post-image");
        const title = document.getElementById("post-title").value.trim();
        const location = document.getElementById("post-location").value.trim();
        const description = document.getElementById("post-desc").value.trim();
        const file = fileInput.files[0];

        if (!file) return alert("कृपया एक फोटो चुनें!");

        // बटन लॉक करें ताकि डबल क्लिक न हो
        submitBtn.disabled = true;
        submitBtn.innerText = "सुपरफास्ट लाइव हो रहा है...";

        try {
            // 1. फोटो को बिना स्टोरेज के सीधे टेक्स्ट में बदलो
            const base64ImageUrl = await convertImageToText(file);

            // 2. सीधे रियल-टाइम डेटाबेस (Firestore) में सब कुछ एक साथ सेव करो
            await db.collection("posts").add({
                title: title,
                location: location,
                description: description,
                image_url: base64ImageUrl, // यहाँ हमारा फोटो टेक्स्ट फॉर्म में जा रहा है
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 🎉 सफलता का मैसेज
            alert("सचिन भाई, आपकी पोस्ट सफलतापूर्वक लाइव हो चुकी है! 🎉");
            form.reset();
            window.location.href = "index.html"; // वापस होमपेज पर भेजें

        } catch (error) {
            alert("🚨 अपलोड फेल हुआ!\nवजह: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "वेबसाइट पर लाइव करें";
        }
    });
}

// इंजन स्टार्ट करें
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("posts-feed")) {
        loadFirebaseFeed();
    }
    if (document.getElementById("upload-form")) {
        setupAdminForm();
    }
});
              
