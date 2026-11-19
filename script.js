/* =========================================================
   Solar Quotation — Interactive Engine
   Edit mode · BOQ calc · LocalStorage · Print · i18n
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "nc_solar_quotation_v1";
  const VAT_DEFAULT = 5;

  const state = {
    editMode: false,
    lang: "en",
    hidePrices: false,
    showOption01: true,
    showOption02: true,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- i18n dictionary ---------- */
  const i18n = {
    en: {
      toolbarBrand: "Solar EPC Proposal",
      editMode: "Edit Mode",
      print: "Print Quotation",
      pdf: "Save as PDF",
      hidePrices: "Hide Prices",
      showOpt1: "Option 01",
      showOpt2: "Option 02",
      langBtn: "العربية",
      save: "Save Data",
      reset: "Reset Data",
      addRow: "Add BOQ Row",
    },
    ar: {
      toolbarBrand: "عرض سعر أنظمة الطاقة الشمسية",
      editMode: "وضع التعديل",
      print: "طباعة العرض",
      pdf: "حفظ PDF",
      hidePrices: "إخفاء الأسعار",
      showOpt1: "الخيار 01",
      showOpt2: "الخيار 02",
      langBtn: "English",
      save: "حفظ البيانات",
      reset: "إعادة التعيين",
      addRow: "إضافة بند",
    },
  };

  function applyToolbarLang() {
    const t = i18n[state.lang];
    const map = {
      "[data-i18n=toolbarBrand]": t.toolbarBrand,
      "[data-i18n=editMode]": t.editMode,
      "[data-i18n=print]": t.print,
      "[data-i18n=pdf]": t.pdf,
      "[data-i18n=hidePrices]": t.hidePrices,
      "[data-i18n=showOpt1]": t.showOpt1,
      "[data-i18n=showOpt2]": t.showOpt2,
      "[data-i18n=langBtn]": t.langBtn,
      "[data-i18n=save]": t.save,
      "[data-i18n=reset]": t.reset,
    };
    Object.entries(map).forEach(([sel, text]) => {
      $$(sel).forEach((el) => (el.textContent = text));
    });
    $$("[data-i18n-addrow]").forEach((el) => (el.textContent = t.addRow));
  }

  function setLanguage(lang) {
    state.lang = lang === "ar" ? "ar" : "en";
    // Use is-ar on body — class name "lang-ar" is reserved for translatable nodes
    document.body.classList.toggle("is-ar", state.lang === "ar");
    document.body.classList.remove("lang-ar");
    document.body.classList.toggle("rtl", state.lang === "ar");
    document.documentElement.lang = state.lang === "ar" ? "ar" : "en";
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    applyToolbarLang();
    persist();
  }

  /* ---------- Edit mode ---------- */
  function setEditMode(on) {
    state.editMode = !!on;
    document.body.classList.toggle("edit-mode", state.editMode);
    $$("[data-editable]").forEach((el) => {
      el.contentEditable = state.editMode ? "true" : "false";
    });
    $$("input.editable, textarea.editable").forEach((el) => {
      el.readOnly = !state.editMode;
    });
    const btn = $("#btn-edit");
    if (btn) btn.classList.toggle("active", state.editMode);
    persist();
  }

  /* ---------- Visibility toggles ---------- */
  function applyVisibility() {
    document.body.classList.toggle("hide-prices", state.hidePrices);
    document.body.classList.toggle("hide-option-01", !state.showOption01);
    document.body.classList.toggle("hide-option-02", !state.showOption02);
    const p = $("#chk-prices");
    const o1 = $("#chk-opt1");
    const o2 = $("#chk-opt2");
    if (p) p.checked = state.hidePrices;
    if (o1) o1.checked = state.showOption01;
    if (o2) o2.checked = state.showOption02;
  }

  /* ---------- Money helpers ---------- */
  function toNumber(v) {
    if (v === null || v === undefined || v === "") return 0;
    const n = parseFloat(String(v).replace(/,/g, "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function formatMoney(n) {
    return toNumber(n).toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /* ---------- BOQ calculations ---------- */
  function recalcTable(table) {
    if (!table) return { subtotal: 0 };
    let subtotal = 0;
    $$("tbody tr", table).forEach((row) => {
      const qtyEl = row.querySelector('[data-field="qty"]');
      const priceEl = row.querySelector('[data-field="unitPrice"]');
      const totalEl = row.querySelector('[data-field="lineTotal"]');
      if (!qtyEl || !priceEl || !totalEl) return;
      const qty = toNumber(qtyEl.value);
      const price = toNumber(priceEl.value);
      const line = qty * price;
      totalEl.value = priceEl.value === "" && qtyEl.value === "" ? "" : formatMoney(line);
      if (priceEl.value !== "" || (qty > 0 && price > 0)) subtotal += line;
    });
    return { subtotal };
  }

  function recalcOption(optionKey) {
    const table = document.querySelector(`table.boq-table[data-option="${optionKey}"]`);
    const { subtotal } = recalcTable(table);
    const discount = toNumber($(`[data-fin="${optionKey}-discount"]`)?.value);
    const vatRate = toNumber($(`[data-fin="${optionKey}-vatRate"]`)?.value ?? VAT_DEFAULT);
    const afterDiscount = Math.max(0, subtotal - discount);
    const vat = afterDiscount * (vatRate / 100);
    const grand = afterDiscount + vat;

    const setVal = (key, val, asMoney = true) => {
      const el = $(`[data-fin="${key}"]`);
      if (!el) return;
      if (el.tagName === "INPUT") {
        if (key.endsWith("vatRate") || key.endsWith("discount")) return;
        el.value = asMoney ? formatMoney(val) : val;
      } else {
        el.textContent = asMoney ? formatMoney(val) : String(val);
      }
    };

    setVal(`${optionKey}-subtotal`, subtotal);
    setVal(`${optionKey}-vatAmount`, vat);
    setVal(`${optionKey}-grand`, grand);

    const kpi = $(`[data-kpi="${optionKey}"]`);
    if (kpi) kpi.textContent = formatMoney(grand) + " AED";

    return { subtotal, discount, vat, grand, vatRate };
  }

  function recalcAll() {
    const o1 = recalcOption("opt1");
    const o2 = recalcOption("opt2");
    const deltaEl = $("[data-fin=delta]");
    if (deltaEl) {
      const delta = o1.grand - o2.grand;
      const abs = Math.abs(delta);
      const label =
        delta === 0
          ? "Equal"
          : delta > 0
            ? `Option 01 higher by ${formatMoney(abs)} AED`
            : `Option 02 higher by ${formatMoney(abs)} AED`;
      const labelAr =
        delta === 0
          ? "متساويان"
          : delta > 0
            ? `الخيار 01 أعلى بمقدار ${formatMoney(abs)} درهم`
            : `الخيار 02 أعلى بمقدار ${formatMoney(abs)} درهم`;
      deltaEl.innerHTML = `<span class="lang-en">${label}</span><span class="lang-ar">${labelAr}</span>`;
    }
    updatePageNumbers();
  }

  /* ---------- BOQ row management ---------- */
  function bindRowEvents(row) {
    $$('[data-field="qty"], [data-field="unitPrice"]', row).forEach((input) => {
      input.addEventListener("input", () => {
        recalcAll();
        persist();
      });
    });
    $$('[data-field="desc"], [data-field="brand"], [data-field="unit"]', row).forEach((input) => {
      input.addEventListener("input", () => persist());
    });
    const del = row.querySelector(".row-delete");
    if (del) {
      del.addEventListener("click", () => {
        row.remove();
        recalcAll();
        persist();
      });
    }
  }

  function createBoqRow(data = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="item-no"></td>
      <td><input type="text" class="editable" data-field="desc" value="${escapeAttr(data.desc || "")}"></td>
      <td><input type="text" class="editable" data-field="brand" value="${escapeAttr(data.brand || "")}"></td>
      <td class="img-cell">${data.image ? `<img class="thumb" src="${escapeAttr(data.image)}" alt="">` : "—"}</td>
      <td><input type="number" min="0" step="1" class="editable num" data-field="qty" value="${data.qty ?? ""}"></td>
      <td><input type="text" class="editable" data-field="unit" value="${escapeAttr(data.unit || "Lot")}"></td>
      <td class="price-col"><input type="number" min="0" step="0.01" class="editable num" data-field="unitPrice" value="${data.unitPrice ?? ""}" placeholder="—"></td>
      <td class="price-col"><input type="text" class="num" data-field="lineTotal" readonly value=""></td>
      <td class="edit-only"><button type="button" class="row-delete" title="Delete">✕</button></td>
    `;
    return tr;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function renumberBoq(table) {
    $$("tbody tr", table).forEach((row, i) => {
      const cell = row.querySelector(".item-no");
      if (cell) cell.textContent = String(i + 1).padStart(2, "0");
    });
  }

  function addBoqRow(optionKey) {
    const table = document.querySelector(`table.boq-table[data-option="${optionKey}"]`);
    if (!table) return;
    const tr = createBoqRow({ unit: "Lot" });
    table.querySelector("tbody").appendChild(tr);
    bindRowEvents(tr);
    renumberBoq(table);
    setEditMode(true);
    recalcAll();
    persist();
  }

  /* ---------- Persistence ---------- */
  function collectFormData() {
    const data = {
      version: 1,
      state: { ...state },
      fields: {},
      editable: {},
      boq: { opt1: [], opt2: [] },
      sizing: {},
      financial: {},
    };

    $$("[data-store]").forEach((el) => {
      const key = el.getAttribute("data-store");
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
        data.fields[key] = el.value;
      } else {
        data.editable[key] = el.innerHTML;
      }
    });

    $$("[data-editable][data-store]").forEach((el) => {
      data.editable[el.getAttribute("data-store")] = el.innerHTML;
    });

    ["opt1", "opt2"].forEach((opt) => {
      const table = document.querySelector(`table.boq-table[data-option="${opt}"]`);
      if (!table) return;
      data.boq[opt] = $$("tbody tr", table).map((row) => ({
        desc: row.querySelector('[data-field="desc"]')?.value || "",
        brand: row.querySelector('[data-field="brand"]')?.value || "",
        image: row.querySelector("img.thumb")?.getAttribute("src") || "",
        qty: row.querySelector('[data-field="qty"]')?.value || "",
        unit: row.querySelector('[data-field="unit"]')?.value || "",
        unitPrice: row.querySelector('[data-field="unitPrice"]')?.value || "",
      }));
    });

    $$("[data-sizing]").forEach((el) => {
      data.sizing[el.getAttribute("data-sizing")] = el.value;
    });

    $$("[data-fin]").forEach((el) => {
      if (el.tagName === "INPUT") {
        data.financial[el.getAttribute("data-fin")] = el.value;
      }
    });

    return data;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectFormData()));
    } catch (e) {
      console.warn("LocalStorage save failed", e);
    }
  }

  function restoreBoq(optionKey, rows) {
    const table = document.querySelector(`table.boq-table[data-option="${optionKey}"]`);
    if (!table || !Array.isArray(rows) || !rows.length) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    rows.forEach((r) => {
      const tr = createBoqRow(r);
      tbody.appendChild(tr);
      bindRowEvents(tr);
    });
    renumberBoq(table);
  }

  function loadPersisted() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return;
    }
    if (!raw) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      return;
    }

    if (data.state) {
      Object.assign(state, data.state);
    }

    if (data.fields) {
      Object.entries(data.fields).forEach(([key, val]) => {
        const el = document.querySelector(`[data-store="${key}"]`);
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) {
          el.value = val;
        }
      });
    }

    if (data.editable) {
      Object.entries(data.editable).forEach(([key, html]) => {
        const el = document.querySelector(`[data-store="${key}"]`);
        if (el && el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") {
          el.innerHTML = html;
        }
      });
    }

    if (data.sizing) {
      Object.entries(data.sizing).forEach(([key, val]) => {
        const el = document.querySelector(`[data-sizing="${key}"]`);
        if (el) el.value = val;
      });
    }

    if (data.financial) {
      Object.entries(data.financial).forEach(([key, val]) => {
        const el = document.querySelector(`[data-fin="${key}"]`);
        if (el && el.tagName === "INPUT") el.value = val;
      });
    }

    if (data.boq) {
      if (data.boq.opt1?.length) restoreBoq("opt1", data.boq.opt1);
      if (data.boq.opt2?.length) restoreBoq("opt2", data.boq.opt2);
    }

    setLanguage(state.lang);
    setEditMode(state.editMode);
    applyVisibility();
  }

  function resetData() {
    if (!confirm(state.lang === "ar" ? "إعادة تعيين جميع التعديلات؟" : "Reset all saved edits?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  /* ---------- Page numbers ---------- */
  function updatePageNumbers() {
    const pages = $$(".page:not([hidden])").filter((p) => {
      if (p.classList.contains("option-01") && !state.showOption01) return false;
      if (p.classList.contains("option-02") && !state.showOption02) return false;
      return getComputedStyle(p).display !== "none";
    });
    pages.forEach((page, idx) => {
      const el = page.querySelector(".page-num");
      if (el) el.textContent = String(idx + 1);
      const total = page.querySelector(".page-total");
      if (total) total.textContent = String(pages.length);
    });
  }

  /* ---------- Print ---------- */
  function printDoc() {
    window.print();
  }

  /* ---------- Init default BOQ if empty ---------- */
  function ensureDefaultBoqBound() {
    $$("table.boq-table").forEach((table) => {
      $$("tbody tr", table).forEach(bindRowEvents);
      renumberBoq(table);
    });
  }

  /* ---------- Events ---------- */
  function bindGlobalEvents() {
    $("#btn-edit")?.addEventListener("click", () => setEditMode(!state.editMode));
    $("#btn-print")?.addEventListener("click", printDoc);
    $("#btn-pdf")?.addEventListener("click", printDoc);
    $("#btn-lang")?.addEventListener("click", () => setLanguage(state.lang === "en" ? "ar" : "en"));
    $("#btn-save")?.addEventListener("click", () => {
      persist();
      alert(state.lang === "ar" ? "تم حفظ البيانات محليًا." : "Data saved to LocalStorage.");
    });
    $("#btn-reset")?.addEventListener("click", resetData);

    $("#chk-prices")?.addEventListener("change", (e) => {
      state.hidePrices = e.target.checked;
      applyVisibility();
      persist();
    });
    $("#chk-opt1")?.addEventListener("change", (e) => {
      state.showOption01 = e.target.checked;
      applyVisibility();
      updatePageNumbers();
      persist();
    });
    $("#chk-opt2")?.addEventListener("change", (e) => {
      state.showOption02 = e.target.checked;
      applyVisibility();
      updatePageNumbers();
      persist();
    });

    $$("[data-add-boq]").forEach((btn) => {
      btn.addEventListener("click", () => addBoqRow(btn.getAttribute("data-add-boq")));
    });

    document.addEventListener("input", (e) => {
      const t = e.target;
      if (t.matches("[data-fin], [data-sizing], [data-store], .editable, [data-field]")) {
        if (t.matches("[data-fin], [data-field=qty], [data-field=unitPrice]")) recalcAll();
        persist();
      }
    });

    document.addEventListener("blur", (e) => {
      if (e.target.matches("[data-editable], [data-store]")) persist();
    }, true);

    window.addEventListener("beforeprint", () => {
      document.body.classList.remove("edit-mode");
      updatePageNumbers();
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.toggle("edit-mode", state.editMode);
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    ensureDefaultBoqBound();
    bindGlobalEvents();
    loadPersisted();
    if (!localStorage.getItem(STORAGE_KEY)) {
      setLanguage("ar");
      setEditMode(false);
      applyVisibility();
    }
    recalcAll();
    updatePageNumbers();
  });
})();
