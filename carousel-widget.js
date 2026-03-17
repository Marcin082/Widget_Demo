class CurrencyCarousel extends HTMLElement {
  async connectedCallback() {
    this.base = "PLN";
    this.currencies = ["EUR","USD","GBP","JPY","CHF","AUD","CAD", "NZD", "CNY", "SEK"];

    this.render();
    await this.loadRates();
  }

  render() {
    const shadow = this.shadowRoot || this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        .carousel-wrapper {
          position: fixed;
          bottom: 0;
          width: 100%;
          overflow: hidden;
          padding: 15px 0;
        }

        .carousel-track {
          display: flex;
          gap: 15px;
          white-space: nowrap;
          width: max-content;
          animation: scroll 20s linear infinite;
        }

        .carousel-wrapper:hover .carousel-track {
          animation-play-state: paused;
        }

        .currency-box {
          min-width: 120px;
          background: linear-gradient(135deg, #1a2b6b, #3b5ca5);
          color: #ffffff;
          text-align: center;
          padding: 15px;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: 'Arial', sans-serif;
        }

        .currency-code {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }

        .currency-value {
          font-size: 14px;
        }

        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      </style>

      <div class="carousel-wrapper">
        <div class="carousel-track"></div>
      </div>
    `;

    this.track = shadow.querySelector(".carousel-track");
  }

  async loadRates() {
    try {
      const res = await fetch(`/api/rates?currency=${this.base}`);
      const data = await res.json();

      [...this.currencies, ...this.currencies, ...this.currencies].forEach(code => {
        const ratePLNperUnit = (1 / data.conversion_rates[code]).toFixed(2);
        const box = document.createElement("div");
        box.className = "currency-box";
        box.innerHTML = `
          <div class="currency-code">${code}</div>
          <div class="currency-value">${ratePLNperUnit} ${this.base}</div>
        `;
        this.track.appendChild(box);
      });
    } catch (err) {
      console.error(err);
      const errorBox = document.createElement("div");
      errorBox.textContent = "Error";
      this.track.appendChild(errorBox);
    }
  }
}

customElements.define("currency-carousel", CurrencyCarousel);