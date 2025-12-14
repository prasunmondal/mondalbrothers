/* --------------------------
   GLOBAL TRACKING CONSTANTS
--------------------------- */
const EVENT_KEY = "eventQueue";
let userLocation = localStorage.getItem("user_location") || null;
let coords = localStorage.getItem("coords") || null;
const userNameCacheKey = "customerName"
const userShopNameCacheKey = "shop_name"

function getName() {
    if (!localStorage.getItem(userNameCacheKey)) {
        return ""
    } else {
        return localStorage.getItem(userNameCacheKey)
    }
}

function getShopName() {
    if (!localStorage.getItem(userShopNameCacheKey)) {
        return ""
    } else {
        return localStorage.getItem(userShopNameCacheKey)
    }
}

/* --------------------------
   GET USER LOCATION (ASYNC)
--------------------------- */
async function getCoordinates() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: "GPS"
                });
            },
            async () => {
                try {
                    const res = await fetch("https://ipapi.co/json/");
                    const data = await res.json();
                    resolve({
                        lat: data.latitude,
                        lon: data.longitude,
                        accuracy: "IP",
                        city: data.city,
                        region: data.region,
                        country: data.country_name
                    });
                } catch {
                    resolve({ lat: null, lon: null, accuracy: "UNKNOWN" });
                }
            }
        );
    });
}

async function initLocation() {
    if (!coords) {
        const c = await getCoordinates();
        coords = `${c.lat},${c.lon}`;
        userLocation = `${c.city || ""}, ${c.region || ""}, ${c.country || ""}`.trim();
        localStorage.setItem("coords", coords);
        localStorage.setItem("user_location", userLocation);
    }
}
initLocation(); // start async silently


/* --------------------------
   TRACK EVENT
--------------------------- */
async function trackEvent(actionMsg) {
    await initLocation();  // ensure location resolves eventually

    const name = getName();
    const shop = getShopName();

    const event = {
        timestamp: new Date().toISOString().replace("T"," ").substring(0,16),
        name: getName(),
         shop: getShopName(),
         location: localStorage.getItem("user_location"),
         coords: localStorage.getItem("coords"),
         action: actionMsg
     };

    let queue = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]");
    queue.push(event);
    localStorage.setItem(EVENT_KEY, JSON.stringify(queue));
    console.log("📥 Event queued:", event);
    console.log("🧾 Current queue:", queue);
}

 async function initLocation() {
     if (!localStorage.getItem("coords")) {
         const c = await getCoordinates();
         localStorage.setItem("coords", `${c.lat},${c.lon}`);
         localStorage.setItem("user_location", `${c.city || ""}, ${c.region || ""}, ${c.country || ""}`.trim());
     }
 }
 initLocation();


/* --------------------------
   SEND DATA BATCH (ASYNC)
--------------------------- */
 async function flushEvents(useBeacon = false) {
    let queue = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]");
    console.log("🚚 Flushing events... count =", queue.length);

    if (queue.length === 0) return;

    const payload = {
        operations: [
            {
                opId: crypto.randomUUID(),
                opCode: "INSERT_BATCH",
                sheetId: "1X6HriHjIE0XfAblDlE7Uf5a8JTHu00kW2SWvTFKL78w",
                tabName: "webTrack",
                objectList: queue
            }
        ]
    };

    console.log("📦 Payload to send:", payload);
    console.log("🔗 Mode:", useBeacon ? "Beacon" : "Fetch POST");

    try {
        if (useBeacon && navigator.sendBeacon) {
            navigator.sendBeacon(url, JSON.stringify(payload));
            console.log("📤 Beacon sent");
        } else {
            sendData(payload)
//            .then(r => r.json())
//            .then(data => console.log(data));
            console.log("📤 Fetch POST sent");
        }
        localStorage.removeItem(EVENT_KEY);
        console.log("🧹 Queue cleared");
    } catch (e) {
        console.log("Send failed, will retry");
        console.error("❌ Send failed:", e);
    }
 }

async function sendData(payload) {
    const url = "https://script.google.com/macros/s/AKfycbz4Ewsq6qbheE4v3Yan0LlvhMmTu3BLz9bwizUUWUwfWVB6yqh7YE7GThpiDOWOU0q_/exec";

  try {
    const res = await fetch(url, {
      method: "POST",
      mode:"no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Response status:", res.status);
    const data = await res.text();   // can't always parse json in dev
    console.log("Response body:", data);

  } catch (err) {
    console.error("❌ sendData error:", err);
  }
}



/* --------------------------
   BACKGROUND SEND TRIGGERS
--------------------------- */
setInterval(() => flushEvents(), 1000/*5 * 60 * 1000*/);  // every 5 min async


// on closing tab
window.addEventListener("beforeunload", () => {
   console.log("🚪 Page closing — forcing flush via beacon");
   flushEvents(true);
});