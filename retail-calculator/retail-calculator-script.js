let selectedType = null;
window.currentType = null;


    function setRate(type) {
        localStorage.setItem("selectedType", type);   // save selected type
        const rate = localStorage.getItem(`rate_${type}`);
        document.getElementById("rate").value = rate;
        window.currentType = type;

        const readable = type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        document.getElementById("selectedTypeLabel").textContent = readable;

        recalcAfterRateUpdate();
        focusKg();

        highlightSelectedButton(type);
        hideReportIfOpen();
    }


    function highlightSelectedButton(type) {
        document.querySelectorAll(".choice-btn").forEach(btn => btn.classList.remove("active"));
        const activeBtn = document.querySelector(`.choice-btn[data-type="${type}"]`);
        if (activeBtn) activeBtn.classList.add("active");
    }

//window.onload = () => {
//    const savedType =
//    if (savedType) {
//        setRate(savedType);            // auto-fill rate & label
//        highlightSelectedButton(savedType);
//    }
//};


document.addEventListener("DOMContentLoaded", () => {
    const savedType = localStorage.getItem("selectedType");

    if (savedType) {
        const savedRate = localStorage.getItem(`rate_${savedType}`) || "";

        // Set rate input
        const rateInput = document.getElementById("rate");
        if (rateInput) {
            rateInput.value = savedRate;
        }

        // Restore label + button active state
        updateSelectionUI(savedType);
    }
});


function updateSelectionUI(type) {
    window.currentType = type;
    // Human-readable text
    const readable = type
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    const labelEl = document.getElementById("selectedTypeLabel");
    if (labelEl) {
        labelEl.textContent = readable;
    }

    // Highlight active button
    document.querySelectorAll(".choice-btn").forEach(btn => {
        const btnType = btn.getAttribute("data-type");
        btn.classList.toggle("active", btnType === type);
    });

    focusKg();
}



function recalcAfterRateUpdate() {
    const rate = Number(document.getElementById("rate").value);
    const kg = Number(document.getElementById("kg").value);
    const amount = Number(document.getElementById("amount").value);

    if (kg > 0 && rate > 0) {
        document.getElementById("amount").value = (rate * kg).toFixed(2); // amount → 2
    } else if (amount > 0 && rate > 0) {
        document.getElementById("kg").value = (amount / rate).toFixed(3); // kg → 3
    }
}



    // Auto calculate based on user change
    function autoCalc(changed) {
        const rate   = parseFloat(document.getElementById("rate").value);
        const kg     = parseFloat(document.getElementById("kg").value);
        const amount = parseFloat(document.getElementById("amount").value);

        if (!rate || rate <= 0) return;

        if (changed === "kg" && kg > 0) {
            document.getElementById("amount").value = (kg * rate).toFixed(2); // ✅ amount
        }

        if (changed === "amount" && amount > 0) {
            document.getElementById("kg").value = (amount / rate).toFixed(3); // ✅ kg
        }

        if (changed === "rate" && kg > 0) {
            document.getElementById("amount").value = (kg * rate).toFixed(2); // ✅ amount
        }

        // Save rate per type
        if (selectedType && rate) {
            localStorage.setItem("rate_" + selectedType, rate);
        }
    }

    function saveShopName() {
      localStorage.setItem("shop_name", document.getElementById("shopName").value);
    }

    window.onload = function () {
      const saved = localStorage.getItem("shop_name");
      if (saved) {
        document.getElementById("shopName").value = saved;
      }
    }

    function autoExpand(el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }

    window.onload = function () {
      const saved = localStorage.getItem("shop_name");
      if (saved) {
        const el = document.getElementById("shopName");
        el.value = saved;
        autoExpand(el);
      }
    };

    function openSettings() {
      document.getElementById("settingsModal").style.display = "flex";
      loadRateFields();
    }

    function closeSettings() {
      document.getElementById("settingsModal").style.display = "none";
    }

    function loadRateFields() {
      document.getElementById("rate_broiler_live").value = localStorage.getItem("rate_broiler_live") || "";
      document.getElementById("rate_broiler_cut").value = localStorage.getItem("rate_broiler_cut") || "";
      document.getElementById("rate_culbird_live").value = localStorage.getItem("rate_culbird_live") || "";
      document.getElementById("rate_culbird_cut").value = localStorage.getItem("rate_culbird_cut") || "";
    }

    function saveSettings() {
      localStorage.setItem("rate_broiler_live", document.getElementById("rate_broiler_live").value);
      localStorage.setItem("rate_broiler_cut", document.getElementById("rate_broiler_cut").value);
      localStorage.setItem("rate_culbird_live", document.getElementById("rate_culbird_live").value);
      localStorage.setItem("rate_culbird_cut", document.getElementById("rate_culbird_cut").value);

      const logMessage = `Rate Set: BL=${localStorage.getItem("rate_broiler_live")}, BC=${localStorage.getItem("rate_broiler_cut")}, CL=${localStorage.getItem("rate_culbird_live")}, CC=${localStorage.getItem("rate_culbird_cut")}`;
      trackEvent(`RCalc: Rate Set: ${logMessage}`)

      // Clear current calculator values
      document.getElementById("rate").value = "";
      document.getElementById("kg").value = "";
      document.getElementById("amount").value = "";

      // Optional placeholder reset
      document.getElementById("rate").placeholder = "Rate";
      location.reload();
      closeSettings();
      checkRatesAndToggleCalcCard();
    }

function saveAndClearKgAmount() {
    const kgRaw = parseFloat(document.getElementById("kg").value);
    const rate  = parseFloat(document.getElementById("rate").value);

    if (!window.currentType || !kgRaw || !rate) return;

    const kg = Number(kgRaw.toFixed(3));                 // ✅ kg → 3
    const amount = Number((kg * rate).toFixed(2));       // ✅ amount → 2

    logSale(window.currentType, kg, rate, getISTISOString());

    document.getElementById("kg").value = "";
    document.getElementById("amount").value = "";

    focusKg();
    trackEvent("RCalc: Saved");
    hideReportIfOpen();
}



function clearKgAmount() {
  document.getElementById("kg").value = "";
  document.getElementById("amount").value = "";
  focusKg();
  trackEvent(`RCalc: Cleared`)
}


document.addEventListener("DOMContentLoaded", () => {
            const rateKeys = [
                { key: "rate_broiler_live", btnClass: "broiler_live" },
                { key: "rate_broiler_cut", btnClass: "broiler_cut" },
                { key: "rate_culbird_live", btnClass: "culbird_live" },
                { key: "rate_culbird_cut", btnClass: "culbird_cut" }
            ];

            rateKeys.forEach(({ key, btnClass }) => {
                const savedRate = localStorage.getItem(key);
                const btn = document.querySelector(`.${btnClass}`);

                if (!savedRate || savedRate.trim() === "" || Number(savedRate) === 0) {
                    btn.style.display = "none";      // hide if not set
                } else {
                    btn.style.display = "block";     // show if set
                }
            });
        });

function clearField(id) {
    const input = document.getElementById(id);
    input.value = "";
}

function focusKg() {
    const kgInput = document.getElementById("kg");
    kgInput.focus();
    kgInput.select();  // optional: highlights current text for typing quickly
}

function checkRatesAndToggleCalcCard() {
    const r1 = localStorage.getItem("rate_broiler_live");
    const r2 = localStorage.getItem("rate_broiler_cut");
    const r3 = localStorage.getItem("rate_culbird_live");
    const r4 = localStorage.getItem("rate_culbird_cut");

    const hasRate =
        (r1 && r1 !== "0") ||
        (r2 && r2 !== "0") ||
        (r3 && r3 !== "0") ||
        (r4 && r4 !== "0");

    const card = document.querySelector(".calc-card");
    const msg = document.getElementById("noRateMessage");

    if (!hasRate) {
        card.style.display = "none";
        msg.style.display = "block";
    } else {
        card.style.display = "block";
        msg.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", checkRatesAndToggleCalcCard);

function goHome() {
    window.location.href = "../index.html";
    // Or put the correct path of your home screen
}



function downloadPdf(type) {
    if (type === "full") {
        console.log("Download PDF - Full Data");
    } else {
        console.log("Download PDF - Daywise Data");
    }
}

function downloadCsv(type) {
    if (type === "full") {
        console.log("Download CSV - Full Data");
    } else {
        console.log("Download CSV - Daywise Data");
    }
}


async function downloadPdf(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const salesLog = JSON.parse(localStorage.getItem("salesLog") || "[]");
    if (!salesLog.length) {
        alert("No sales data available");
        return;
    }

    const shopName = localStorage.getItem("shop_name") || "Shop";
    const today = new Date().toISOString().split("T")[0];

    // ---------- HEADER ----------
    doc.setFontSize(16);
    doc.text(`${shopName} - Sales Report`, 14, 16);

    doc.setFontSize(11);
    doc.text(
        `Report Type: ${type === "full" ? "Full Data" : "Daywise Summary"}`,
        14,
        24
    );
    doc.text(`Generated: ${today}`, 150, 24);

    let y = 34;

    // ================= FULL DATA =================
    if (type === "full") {
        doc.setFont(undefined, "bold");
        doc.text("Date", 14, y);
        doc.text("Type", 45, y);
        doc.text("KG", 95, y);
        doc.text("Rate", 115, y);
        doc.text("Amount", 145, y);
        doc.setFont(undefined, "normal");

        y += 6;

        let totalKg = 0;
        let totalAmount = 0;

        salesLog.forEach(row => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            const date = row.saleTimestamp.split("T")[0];
            const typeLabel = row.type.replace(/_/g, " ");
            const kg = Number(row.kg);
            const amount = kg * row.rate;

            doc.text(date, 14, y);
            doc.text(typeLabel, 45, y);
            doc.text(kg.toFixed(3), 95, y, { align: "right" });
            doc.text(Number(row.rate).toFixed(2), 120, y, { align: "right" });
            doc.text(amount.toFixed(2), 160, y, { align: "right" });

            totalKg += kg;
            totalAmount += amount;
            y += 6;
        });

        y += 6;
        doc.setFont(undefined, "bold");
        doc.text("TOTAL", 45, y);
        doc.text(totalKg.toFixed(3), 95, y, { align: "right" });
        doc.text(totalAmount.toFixed(2), 160, y, { align: "right" });
    }

    // ================= DAYWISE SUMMARY =================
    if (type === "daywise") {
        const grouped = {};

        salesLog.forEach(row => {
            const date = row.saleTimestamp.split("T")[0];
            const key = `${date}|${row.type}`;

            if (!grouped[key]) {
                grouped[key] = {
                    date,
                    type: row.type,
                    totalKg: 0,
                    totalAmount: 0
                };
            }

            grouped[key].totalKg += Number(row.kg);
            grouped[key].totalAmount += row.kg * row.rate;
        });

        doc.setFont(undefined, "bold");
        doc.text("Date", 14, y);
        doc.text("Type", 55, y);
        doc.text("Total KG", 120, y);
        doc.text("Total Amount", 155, y);
        doc.setFont(undefined, "normal");

        y += 6;

        Object.values(grouped).forEach(row => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.text(row.date, 14, y);
            doc.text(row.type.replace(/_/g, " "), 55, y);
            doc.text(row.totalKg.toFixed(3), 130, y, { align: "right" });
            doc.text(row.totalAmount.toFixed(2), 170, y, { align: "right" });

            y += 6;
        });
    }

    // ---------- FILE NAME ----------
    const safeShop = shopName.replace(/\s+/g, "");
    const reportTag = type === "full" ? "Sales_Full" : "Sales_Daily";

    const fileName = `MB_${safeShop}_${reportTag}_${today}.pdf`;

    doc.save(fileName);

    trackEvent(`RCalc: PDF Downloaded (${type})`);
}


