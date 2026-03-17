class CurrencyWidget extends HTMLElement {
  async connectedCallback() {
    this.currencies = ["EUR","PLN", "USD","GBP","JPY","CHF","AUD","CAD","NZD","CNY","SEK","NOK","MXN"];
    this.fromCurrency = "EUR";
    this.toCurrency = "PLN";
    this.requestId = 0;

    this.render();
    this.bindEvents();
    await this.loadRates();
    this.update();
  }

  render() {
    const shadow = this.attachShadow({mode:"open"});
    shadow.innerHTML = `
      <style>
        .box { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 360px; padding: 30px; background: linear-gradient(145deg,#0f1e42,#1a2b6b);
          color: #fff; border-radius:25px; font-family: Arial; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.4); }
        h2 { margin:0 0 20px 0; font-size:24px; color:#cce0ff; }
        .row { display:flex; gap:10px; margin-top:15px; margin-bottom:10px;}
        select, input { flex:1; padding:12px; border-radius:12px; border:none; font-size:16px; outline:none;
          background: rgba(255,255,255,0.05); color:#fff; transition: all 0.3s; }
        select option { background-color:#0f1e42; color:#fff; }
        select:hover, input:hover { background: rgba(255,255,255,0.1); }
        select:focus, input:focus { background: rgba(255,255,255,0.15); box-shadow: 0 0 8px rgba(102,153,255,0.6);}
        .amount-label { display:block; margin-top:20px; margin-bottom:5px; font-size:14px; color:#cce0ff; text-align:left;}
        .result { margin-top:25px; font-weight:bold; font-size:20px; background: rgba(255,255,255,0.1); padding:10px; border-radius:12px;}
        .loading { font-size:13px; color:#cce0ff; margin-top:5px; height:18px; visibility: visible; }
        .loading.hidden { visibility: hidden; }
      </style>

      <div class="box">
        <h2>Currency Converter</h2>
        <div class="row">
          <select id="fromCurrency">${this.currencies.map(c=>`<option value="${c}">${c}</option>`).join("")}</select>
          <select id="toCurrency">${this.currencies.map(c=>`<option value="${c}">${c}</option>`).join("")}</select>
        </div>
        <input id="amountInput" type="number" placeholder="Enter amount" />
        <div class="result">-</div>
        <div class="loading">Loading rates...</div>
      </div>
    `;
    this.input = shadow.querySelector("#amountInput");
    this.result = shadow.querySelector(".result");
    this.fromSelect = shadow.querySelector("#fromCurrency");
    this.toSelect = shadow.querySelector("#toCurrency");
    this.loading = shadow.querySelector(".loading");

    this.fromSelect.value = this.fromCurrency;
    this.toSelect.value = this.toCurrency;
  }

  bindEvents() {
    this.input.addEventListener("input", () => this.update());
    this.fromSelect.addEventListener("change", () => this.reloadRates());
    this.toSelect.addEventListener("change", () => this.reloadRates());
  }

  async reloadRates() {
    this.fromCurrency = this.fromSelect.value;
    this.toCurrency = this.toSelect.value;
    this.loading.classList.remove("hidden");
    await this.loadRates();
    this.update();
  }

  async loadRates() {
    const currentRequestId = ++this.requestId;
    try {
      const res = await fetch(`/api/rates?currency=${this.fromCurrency}`);
      const data = await res.json();
      if (currentRequestId !== this.requestId) return;
      this.rates = data.conversion_rates;
      this.loading.classList.add("hidden");
      this.update();
    } catch(err) {
      if (currentRequestId !== this.requestId) return;
      console.error(err);
      this.loading.textContent = "Error loading rates";
    }
  }

  update() {
    if (!this.rates) return;
    const value = parseFloat(this.input.value) || 0;
    const rate = this.rates[this.toCurrency];
    const result = value * rate;
    this.result.textContent = `${result.toFixed(2)} ${this.toCurrency}`;
  }
}

customElements.define("currency-widget", CurrencyWidget);