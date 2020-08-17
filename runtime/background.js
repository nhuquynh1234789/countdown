chrome.runtime.onInstalled.addListener(function(ev) {
    if (ev.reason === "install") {
        clearAllData();
        createDefaultData();
        showNotification("Installed successfully", "You have install Countdown extenstion successfully");
    } else if (ev.reason === "update") {
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
        ui_daily: {
            lastUpdate: 0,
            background: {
                url: "",
            },
            quote: {
                text: ""
            },
        },
        time_mark: {
            lastUpdate: 0,
        },
        bookmark: [{
                id: 377672,
                title: "FB",
                url: "https://www.facebook.com/",
                icon_url: "https://www.google.com/s2/favicons?sz=64&domain_url=fb.com"
            },
            {
                id: 231665,
                title: "Google",
                url: "https://www.google.com.vn",
                icon_url: "https://www.google.com/s2/favicons?sz=64&domain_url=google.com.vn"
            }
        ],
        settings: {
            time_server: true,
            is_static_image: false
        }
    }
    chrome.storage.sync.set({ data });
}