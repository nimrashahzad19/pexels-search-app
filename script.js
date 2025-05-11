const API_KEY = "dcANyHdEOFi4ejg6DvxhXzxkfQAiwuCiWEzIR9AWR8RsdBR5Ss6SFbCz";

window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery");
  const searchBtn = document.getElementById("searchBtn");
  const videoSearchBtn = document.getElementById("videoSearchBtn");
  const searchInput = document.getElementById("searchInput");
  const loader = document.getElementById("loader");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }

  // Dark mode toggle
  darkModeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  // Image search
  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (!q) return;
    searchImages(q);
  });

  // Video search
  videoSearchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (!q) return;
    searchVideos(q);
  });

  // Search images
  function searchImages(query) {
    loader.classList.remove("hidden");
    fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=15`, {
      headers: { Authorization: API_KEY }
    })
      .then(res => res.json())
      .then(data => {
        loader.classList.add("hidden");
        gallery.innerHTML = "";
        if (!data.photos.length) {
          gallery.innerHTML = `<p class="text-center col-span-full text-red-500">No results found.</p>`;
          return;
        }

        data.photos.forEach(photo => {
          const c = document.createElement("div");
          c.className = "relative group";

          const img = document.createElement("img");
          img.src = photo.src.medium;
          img.alt = photo.alt;
          img.className = "w-full h-auto rounded shadow-md transition-transform duration-200 hover:scale-105";

          const fav = document.createElement("button");
          fav.innerText = "❤️";
          fav.title = "Add to favorites";
          fav.className = "absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow opacity-0 group-hover:opacity-100";
          fav.onclick = () => saveToFavorites(photo);

          const dl = document.createElement("a");
          dl.href = photo.src.original;
          dl.download = "";
          dl.innerText = "⬇️";
          dl.title = "Download image";
          dl.className = "absolute bottom-2 left-2 bg-white rounded-full px-2 py-1 shadow opacity-0 group-hover:opacity-100";

          const sh = document.createElement("button");
          sh.innerText = "🔗";
          sh.title = "Copy image link";
          sh.className = "absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 shadow opacity-0 group-hover:opacity-100";
          sh.onclick = () => {
            navigator.clipboard.writeText(photo.src.original);
            alert("Image link copied! 📋");
          };

          [img, fav, dl, sh].forEach(el => c.appendChild(el));
          gallery.appendChild(c);
        });
      })
      .catch(err => {
        loader.classList.add("hidden");
        console.error(err);
      });
  }

  // Search videos
  function searchVideos(query) {
    loader.classList.remove("hidden");
    fetch(`https://api.pexels.com/videos/search?query=${query}&per_page=10`, {
      headers: { Authorization: API_KEY }
    })
      .then(res => res.json())
      .then(data => {
        loader.classList.add("hidden");
        gallery.innerHTML = "";
        if (!data.videos.length) {
          gallery.innerHTML = `<p class="text-center text-red-500">No videos found.</p>`;
          return;
        }

        data.videos.forEach(video => {
          const file = video.video_files.find(f => f.file_type === "video/mp4" && f.quality === "sd");
          if (!file) return;

          const container = document.createElement("div");
          container.className = "relative group";

          const v = document.createElement("video");
          v.src = file.link;
          v.controls = true;
          v.className = "w-full rounded shadow-md";

          const fav = document.createElement("button");
          fav.innerText = "❤️";
          fav.title = "Add video to favorites";
          fav.className = "absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow opacity-0 group-hover:opacity-100";
          fav.onclick = () => saveVideoToFavorites(video, file.link);

          container.appendChild(v);
          container.appendChild(fav);
          gallery.appendChild(container);
        });
      })
      .catch(err => {
        loader.classList.add("hidden");
        console.error(err);
      });
  }

  // Save image to favorites
  function saveToFavorites(photo) {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favs.some(f => f.id === photo.id && f.mediaType === "image")) {
      favs.push({
        ...photo,
        mediaType: "image"
      });
      localStorage.setItem("favorites", JSON.stringify(favs));
      alert("Added to favorites ❤️");
    } else {
      alert("Already in favorites!");
    }
  }

  // Save video to favorites
  function saveVideoToFavorites(video, videoLink) {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favs.some(f => f.id === video.id && f.mediaType === "video")) {
      favs.push({
        id: video.id,
        mediaType: "video",
        image: video.image,          // poster image
        video: videoLink,            // actual video link
        video_files: video.video_files // optional, for detail use
      });
      localStorage.setItem("favorites", JSON.stringify(favs));
      alert("Video added to favorites ❤️");
    } else {
      alert("Video already in favorites!");
    }
  }
});
