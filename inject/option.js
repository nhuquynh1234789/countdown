const btn_option = document.getElementById("btn_option");
const btn_cancel_option = document.getElementById("cancel_option");
const btn_add_bookmark = document.getElementById("btn_add_bookmark");
const btn_cancel_add_bookmark = document.getElementById("btn_cancel_add_bookmark");

const option_wraper = document.getElementById("option_wraper");
const app = document.getElementById("app");
const bookmark_wraper = document.getElementById("bookmark_wraper");

const background = document.getElementById("bg");
const quotePragraph = document.getElementById("quote");

const tm_days = document.getElementById("tm_days");
const tm_hours = document.getElementById("tm_hours");
const tm_mins = document.getElementById("tm_mins");
const tm_secs = document.getElementById("tm_secs");
var TIME_MARK = 0;

btn_option.addEventListener("click", function() {
    option_wraper.classList.add("option_wraper_actived");
    app.classList.add("app_actived");
});

btn_cancel_option.addEventListener("click", function() {
    option_wraper.classList.remove("option_wraper_actived");
    app.classList.remove("app_actived");
});

btn_add_bookmark.addEventListener("click", function() {
    bookmark_wraper.classList.add("option_wraper_actived");
    app.classList.add("app_actived");
});

btn_cancel_add_bookmark.addEventListener("click", function() {
    bookmark_wraper.classList.remove("option_wraper_actived");
    app.classList.remove("app_actived");
});

async function getData(type) {
    let result;
    switch (type) {
        case "ui":
            {
                result = await fetch("https://raw.githubusercontent.com/NghiaCaNgao/countdown_json/master/data.json");
                break;
            }
        case "time_mark":
            {
                result = await fetch("https://raw.githubusercontent.com/NghiaCaNgao/countdown_json/master/time_mark.json");
                break;
            }
    }
    if (result.ok) return result.json();
    else return Promise.reject(result.statusText);
}

async function getLocalData() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(function(data) {
            resolve(data);
        });
    });
}

async function getDataUI() {
    let dataUI = await getData("ui");
    if (dataUI != void 0) {
        window.localStorage.setItem("ui", JSON.stringify(dataUI));
        let data_save = (await getLocalData()).data;
        data_save.ui.lastUpdate = (new Date).getTime();
        chrome.storage.sync.set({ data: data_save });
    }
}

async function getDataTimeMark() {
    let dataTM = await getData("time_mark");
    if (dataTM != void 0) {
        window.localStorage.setItem("time_mark", JSON.stringify(dataTM));
        let data_save = (await getLocalData()).data;
        data_save.time_mark.lastUpdate = (new Date).getTime();
        chrome.storage.sync.set({ data: data_save });
    }
}

async function processDataUI() {
    let dataUI = JSON.parse(window.localStorage.getItem("ui"));
    let data = (await getLocalData()).data;
    data.ui_daily.lastUpdate = (new Date).getTime();
    data.ui_daily.background.url = dataUI.images[Math.round(Math.random() * dataUI.images.length)];
    data.ui_daily.quote.text = dataUI.quotes[Math.round(Math.random() * dataUI.quotes.length)];
    chrome.storage.sync.set({ data: data });
}
async function processDataTM() {
    let dataTM = JSON.parse(window.localStorage.getItem("time_mark"));
    window.localStorage.setItem("end_point", JSON.stringify(dataTM.default));
}

async function isOldData(type, compareByDays) {
    let lastUpdate = 0;
    switch (type) {
        case "ui_update":
            {
                lastUpdate = (await getLocalData()).data.ui.lastUpdate;
                if (window.localStorage.getItem("ui") == void 0) {
                    lastUpdate = 0;
                }
                break;
            }
        case "ui_daily":
            {
                let lastUpdate_tmp = (await getLocalData()).data.ui_daily.lastUpdate;
                let lastUpdate_parse = new Date(lastUpdate_tmp);
                let year = lastUpdate_parse.getFullYear();
                let month = lastUpdate_parse.getMonth();
                let day = lastUpdate_parse.getDay();
                lastUpdate = new Date(year, month, day).getTime;
            }
        case "time_mark":
            {
                lastUpdate = (await getLocalData()).data.time_mark.lastUpdate;
                if (window.localStorage.getItem("time_mark") == void 0) {
                    lastUpdate = 0;
                }
                break;
            }
        default:
            {
                return false;
                break;
            }
    }
    let now = (new Date).getTime();
    let distance = Math.round((now - lastUpdate) / 1000);
    if (distance > compareByDays * 24 * 60 * 60) return true;
    else return false;
}

async function loadData() {
    try {
        if (await isOldData("ui_update", 60)) {
            await getDataUI();
            await processDataUI();
            console.log("a");
        };
        if (await isOldData("time_mark", 1)) {
            await getDataTimeMark();
            await processDataTM();
            console.log("b")
        };
        if (await isOldData("ui_daily", 1)) {
            await processDataUI();
            await processDataTM();
            console.log("c");
        }
    } catch (er) {
        alert("Have an error happened in loading data process. Please close this dialog, press 'ctrl+shift+i', capture your screen and send it to author to fix this problem. Thank!");
        console.log(er);
    }
}

function countdown() {
    let now = (new Date).getTime();
    let remain = Math.round((TIME_MARK - now) / 1000);

    let days = Math.floor(remain / 86400);
    let hours = Math.floor((remain % 86400) / 3600);
    let mins = Math.floor(((remain % 86400) % 3600) / 60);
    let secs = Math.floor(((remain % 86400) % 3600) % 60);

    tm_days.innerHTML = days;
    tm_hours.innerHTML = hours;
    tm_mins.innerHTML = mins;
    tm_secs.innerHTML = secs;
}

function PrepareCountdown() {
    TIME_MARK = JSON.parse(window.localStorage.getItem("end_point"));
    countdown();
    setInterval(function() {
        countdown();
    }, 1000);
}

async function applyData() {
    let dataUI = (await getLocalData()).data.ui_daily;
    let link = dataUI.background.url;
    let quote = dataUI.quote.text;
    background.style.backgroundImage = `url("${link}")`;
    quotePragraph.innerHTML = quote;
}

async function start() {
    await loadData();
    await applyData();
    PrepareCountdown();
}

start();