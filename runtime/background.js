chrome.runtime.onInstalled.addListener(function(ev) {
    if (ev.reason === "install") {
        clearAllData();
        chrome.storage.sync.get(function(data) { console.log(data) })
        createDefaultData();
        showNotification("Installed successfully", "You have install Countdown extenstion successfully");
    } else if (ev.reason === "update") {
        clearAllData();
        chrome.storage.sync.get(function(data) { console.log(data) })
        createDefaultData();
        showNotification("Updated successfully", "You have updated Countdown extenstion successfully");
    }
});
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    if (buttonIndex == 0) {
        window.open("", "blank");
    }
});

function clearAllData() {
    chrome.storage.sync.clear();
}

function showNotification(title, message) {
    let options = {
        "type": "basic",
        "iconUrl": "./assets/images/favicon.png",
        "title": title,
        "message": message,
        "buttons": [{
            "title": "Change log",
        }]

    }
    chrome.notifications.create(options);
}

function createDefaultData() {
    var data = {
        ui: {
            lastUpdate: 0,
        },
        time_mark: {
            lastUpdate: 0,
        },
        ui_daily: {
            lastUpdate: 0,
            background: {
                url: "",
            },
            quote: {
                text: ""
            },
        },
        settings: {

        }
    }
    chrome.storage.sync.set({ data });
}