// When install, initial data
chrome.runtime.onInstalled.addListener(function(ev) {
    if (ev.reason === "install") {
        clearAllData();
        core.rewriteData();
        showNotification("Installed successfully", "You have install Countdown extenstion successfully");
        chrome.alarms.create("daily_infor", {
            when: Date.now() + 2000,
            periodInMinutes: 120
        });
    } else if (ev.reason === "update") {
        showNotification("Updated successfully", "You have updated Countdown extenstion successfully");
    }
});
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

chrome.contextMenus.create({
    "type": "normal",
    "title": "Full settings",
    "contexts": ["browser_action"],
    "id": "settings"
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
        case "settings":
            {
                window.open("/options/options.html", "_blank");
                break;
            }
        default:
            return;
    }
});

// Inform daily
chrome.alarms.onAlarm.addListener(async function() {
    let timeRemaining = await getTimeRemaining();
    let quote = await getQuote();
    console.log(timeRemaining);
    console.log(quote);
    showNotification("#" + timeRemaining + "Left", quote);
});
// --------------------------------------

function isValidUrl(url) {
    if (url.length > 250) {
        alert("url too long");
        return false;
    } else return true;
}

async function setAllDays(url) {
    let dataUI = await core.getLocalData("ui");
    let dataST = await core.getLocalData("settings");
    dataST.ui_setting.is_static_image = !0;
    dataST.ui_setting.is_static_image_device = !1;
    dataUI.ui_daily.background.url = url;
    core.setLocalData("ui", dataUI);
    core.setLocalData("settings", dataST);
}

async function getTimeRemaining() {
    let endTime;
    endTime = (await core.getLocalData("time")).end_time
    if (endTime == 0) {
        await core.processDataTM();
        endTime = (await core.getLocalData("time")).end_time
    }
    let remaining = Math.floor((endTime - Date.now()) / 1000);
    if (remaining < 0) return "End up";
    else return Math.floor(remaining / 86400).toString();
}

async function getQuote() {
    let quote;
    quote = (await core.getLocalData("ui")).ui_daily.quote.text;
    if (quote == "") {
        await core.processDataUI();
        quote = (await core.getLocalData("ui")).ui_daily.quote.text
    }
    return quote;
}

function clearNotification(id) {
    chrome.notifications.clear(id);
}

function clearAllData() {
    chrome.storage.sync.clear();
}

function showNotification(title, message) {
    let options = {
        "type": "basic",
        "iconUrl": "./assets/images/favicon.png",
        "title": title,
        "message": message,
    }
    chrome.notifications.create(options);
}