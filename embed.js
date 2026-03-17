(function() {
  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const BASE = "https://astounding-fenglisu-694c18.netlify.app";

  Promise.all([
    loadScript(`${BASE}/currency-widget.js`),
    loadScript(`${BASE}/carousel-widget.js`)
  ]).then(() => {
    document.body.appendChild(document.createElement("currency-widget"));
    document.body.appendChild(document.createElement("currency-carousel"));
  }).catch(err => {
    console.error("Widget load failed:", err);
  });
})();