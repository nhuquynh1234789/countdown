// When install, initial data
chrome.runtime.onInstalled.addListener(function(ev) {
    if (ev.reason === "install") {
        clearAllData();
        createDefaultData();
        showNotification("Installed successfully", "You have install Countdown extenstion successfully");
        chrome.alarms.create("daily_infor", {
            when: Date.now() + 1000,
            periodInMinutes: 1440
        });
    } else if (ev.reason === "update") {
        showNotification("Updated successfully", "You have updated Countdown extenstion successfully");
    }
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {});
// --------------------------------------

// Context menu
// Clear context menu to create new
chrome.contextMenus.removeAll();
// Create context
chrome.contextMenus.create({
    type: "normal",
    id: "set_all_days",
    title: "All days",
    visible: true,
    contexts: ["image"]
});

// Event handel
chrome.contextMenus.onClicked.addListener(async function(info) {
    switch (info.menuItemId) {
        case "set_all_days":
            {
                if (isValidUrl(info.srcUrl))
                    await setAllDays(info.srcUrl);
                break;
            }
        default:
            return;
    }
});

// Inform daily
chrome.alarms.onAlarm.addListener(async function() {
    await loadData();
    let timeRemaining = await getTimeRemaining();
    let quote = await getQuote();
    showNotification(timeRemaining + " days remaining", quote);
});
// --------------------------------------

function isValidUrl(url) {
    if (url.length > 250) {
        alert("url too long");
        return false;
    } else return true;
}

async function setInDay(url) {
    let data = await getLocalData();
    data.ui_daily.background.url = url;
    setLocalData(data);
}
async function setAllDays(url) {
    let data = await getLocalData();
    data.settings.is_static_image = !0;
    data.settings.is_static_image_device = !1;
    data.ui_daily.background.url = url;
    setLocalData(data);
}

async function getTimeRemaining() {
    await processDataTM();
    let endTime = (await getLocalData()).end_time;
    let remaining = Math.floor((endTime - Date.now()) / 1000);
    if (remaining < 0) return "End up";
    else return Math.floor(remaining / 86400).toString();
}

async function getQuote() {
    await processDataUI();
    return (await getLocalData()).ui_daily.quote.text;
}

function clearNotification(id) {
    chrome.notifications.clear(id);
}

function clearAllData() {
    chrome.storage.sync.clear();
}

function showNotification(title, message, buttons) {
    let options = {
        "type": "basic",
        "iconUrl": "./assets/images/favicon.png",
        "title": title,
        "message": message,
        "buttons": buttons
    }
    console.log(options);
    chrome.notifications.create(options);
}

async function createDefaultData() {
    var data = {
        // ui timestamp
        ui: {
            lastUpdate: 0,
        },

        // daily image and quote
        ui_daily: {
            lastUpdate: 0,
            background: {
                url: "",
            },
            quote: {
                text: ""
            },
        },

        // time mark timestamp
        time_mark: {
            lastUpdate: 0,
        },

        // end of countdown
        end_time: 0,

        // bookmark 
        bookmark: [{
                id: 377672,
                title: "FB",
                url: "https://www.facebook.com/",
                icon: "https://www.google.com/s2/favicons?sz=64&domain_url=fb.com"
            },
            {
                id: 231665,
                title: "Google",
                url: "https://www.google.com.vn",
                icon: "https://www.google.com/s2/favicons?sz=64&domain_url=google.com.vn"
            }
        ],

        // settings
        settings: {
            is_time_server: true,
            is_static_image: false,
            is_static_image_device: false
        }
    }
    await setLocalData(data)
}
// --------------------------------------