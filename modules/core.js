// Generate ID by number 
function generateID(length) {
    let id = ""
    if (typeof(length) == "number" && length >= 0) {
        for (i = 1; i <= length; i++) {
            id += Math.round(Math.random() * 10).toString();
        }
        return id;
    } else return void 0
}


// Check user input info befor creating bookmark
function isVaildInput(title, url) {
    if (title.trim() == "" || url.trim() == "") {
        alert(renderLangJs("_error_input_empty"));
        return false
    }
    if (url.search(/chrome:\/\//g) >= 0) {
        alert(renderLangJs("_error_input_chrome"));
        return false;
    }
    if (url.search(/https?:\/\//g) < 0) {
        alert(renderLangJs("_error_input_http"));
        return false;
    }
    return true;
}

// Check whether data is out of date
async function isOldData(type, compareByDays) {
    let lastUpdate = 0;
    switch (type) {
        case "ui_update":
            {
                lastUpdate = (await getLocalData()).ui.lastUpdate;
                if (window.localStorage.getItem("ui") == void 0) {
                    lastUpdate = 0;
                }
                break;
            }
        case "ui_daily":
            {
                lastUpdate = (await getLocalData()).ui_daily.lastUpdate;
                break;
            }
        case "time_mark":
            {
                lastUpdate = (await getLocalData()).time_mark.lastUpdate;
                if (window.localStorage.getItem("time_mark") == void 0) {
                    lastUpdate = 0;
                }
                break;
            }
        default:
            return false;
    }

    if (type == "ui_daily") {
        // if next to new day, return true
        let DayOfNow = (new Date()).getDate();
        let DayOfLastUpdate = (new Date(lastUpdate)).getDate();
        if (DayOfNow != DayOfLastUpdate) return true;
        else false
    } else {
        let now = (new Date).getTime();
        let distance = Math.round((now - lastUpdate) / 1000);
        if ((distance >= compareByDays * 24 * 60 * 60) || (distance < 0)) return true;
        else return false;
    }
}

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

async function getData(type) {
    let result;
    switch (type) {
        case "ui":
            {
                result = await fetch("https://raw.githubusercontent.com/NghiaCaNgao/countdown/master/data.json");
                break;
            }
        case "time_mark":
            {
                result = await fetch("https://raw.githubusercontent.com/NghiaCaNgao/countdown/master/time_mark.json");
                break;
            }
    }
    if (result.ok) return result.json();
    else return Promise.reject(result.statusText);
}

async function getDataUI() {
    let dataUI = await getData("ui");
    if (dataUI != void 0) {

        // Save fetched data to brower local storage
        window.localStorage.setItem("ui", JSON.stringify(dataUI));
        // Update last update timestamp
        let data = await getLocalData();
        data.ui.lastUpdate = (new Date).getTime();

        setLocalData(data);
        return dataUI;
    }
    return;
}

async function getDataTimeMark() {
    let dataTM = await getData("time_mark");
    if (dataTM != void 0) {

        // Save fetched data to brower local storage
        window.localStorage.setItem("time_mark", JSON.stringify(dataTM));
        // Update last update timestamp
        let data = await getLocalData();
        data.time_mark.lastUpdate = (new Date).getTime();

        setLocalData(data);
        return dataTM;
    }
    return;
}
async function checkDamagedData(type) {
    // Check whether data is lost and return full data
    // type = ui | time_mark
    let field = window.localStorage.getItem(type);
    console.log(field);
    if (field == void 0) {
        if (type == "time_mark") data = await getDataTimeMark();
        else if (type == "ui") data = await getDataUI();
    } else
        data = JSON.parse(field);
    return data;
}

async function processDataUI() {
    let dataUI = await checkDamagedData("ui");
    let data = await getLocalData();

    // Update last update timestamp
    data.ui_daily.lastUpdate = (new Date).getTime();
    // if static image settings is false, get random an image from local data
    if (!data.settings.is_static_image)
        data.ui_daily.background.url = dataUI.images[Math.round(Math.random() * dataUI.images.length)];
    // get random quote
    data.ui_daily.quote.text = dataUI.quotes[Math.round(Math.random() * dataUI.quotes.length)];

    setLocalData(data);
}

async function processDataTM() {
    let dataTM = await checkDamagedData("time_mark");
    // save end of countdown to extesion storage
    let data = await getLocalData();
    data.end_time = dataTM.default;
    setLocalData(data);
}