// Set data to extension storage
function setLocalData(data) {
    chrome.storage.sync.set({ data: data });
};

// Get data from extension storage
async function getLocalData() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(function(data) {
            resolve(data.data);
        });
    });
}

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
    data.ui_daily.background.url = url;
    setLocalData(data);
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
        "buttons": [{
            "title": "Change log",
        }]

    }
    chrome.notifications.create(options);
}

function createDefaultData() {
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
            is_static_image: false
        }
    }
    chrome.storage.sync.set({ data });
}

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

// Context menu
// Clear context menu to create new
chrome.contextMenus.removeAll();

// Create context
chrome.contextMenus.create({
    type: "normal",
    id: "set_in_day",
    title: "In day",
    visible: true,
    contexts: ["image"]
});

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
        case "set_in_day":
            {
                if (isValidUrl(info.srcUrl))
                    await setInDay(info.srcUrl);
                break;
            }
        case "set_all_days":
            {
                if (isValidUrl(info.srcUrl))
                    await setAllDays(info.srcUrl);
                break;
            }
        default:
            return;
    }
})