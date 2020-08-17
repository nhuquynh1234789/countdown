const btn_ok_add_bookmark = document.getElementById("btn_ok_add_bookmark");

const input_bookmark_title = document.getElementById("input_bookmark_title")
const input_bookmark_url = document.getElementById("input_bookmark_url");
const input_end_time = document.getElementById("sle_timer");
const input_static_image_url = document.getElementById("input_static_image_url");

const switch_time_server = document.getElementById("switch_time_server");
const switch_static_image = document.getElementById("switch_static_image");

const bookmarkBar = document.getElementById("bookmarkBar");
const background = document.getElementById("bg");
const quotePragraph = document.getElementById("quote");
const item_name = document.getElementById("item_name");
const delete_zone = document.getElementById("delete_zone");


const remain_days = document.getElementById("tm_days");
const remain_hours = document.getElementById("tm_hours");
const remain_mins = document.getElementById("tm_mins");
const remain_secs = document.getElementById("tm_secs");

var TIME_MARK = 0;
var dataST;

function generateID(length) {
    let id = ""
    if (typeof(length) == "number" && length >= 0) {
        for (i = 1; i <= length; i++) {
            id += Math.round(Math.random() * 10).toString();
        }
        return id;
    } else return void 0
}

function isVaildInput(title, url) {
    if (title.trim() == "" || url.trim() == "") {
        alert("Khong dc de trang");
        return false
    }
    if (url.search(/chrome:\/\//g) >= 0) {
        alert("Ko nhap url thuoc ve chrome");
        return false;
    } else if (url.search(/https?:\/\//g) < 0) {
        alert("Phai co http hoac https")
        return false;
    }
    return true;
}

async function setLocalData(data) {
    chrome.storage.sync.set({ data: data });
};

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

async function getLocalData() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(function(data) {
            resolve(data.data);
        });
    });
}

async function getDataUI() {
    let dataUI = await getData("ui");
    if (dataUI != void 0) {
        window.localStorage.setItem("ui", JSON.stringify(dataUI));
        let data_save = (await getLocalData());
        data_save.ui.lastUpdate = (new Date).getTime();
        setLocalData(data_save);
    }
}

async function getDataTimeMark() {
    let dataTM = await getData("time_mark");
    if (dataTM != void 0) {
        window.localStorage.setItem("time_mark", JSON.stringify(dataTM));
        let data_save = (await getLocalData());
        data_save.time_mark.lastUpdate = (new Date).getTime();
        setLocalData(data_save);
    }
}

function countdown() {
    let now = (new Date).getTime();
    let remain = Math.round((TIME_MARK - now) / 1000);

    if (remain >= 0) {
        let days = Math.floor(remain / 86400);
        let hours = Math.floor((remain % 86400) / 3600);
        let mins = Math.floor(((remain % 86400) % 3600) / 60);
        let secs = Math.floor(((remain % 86400) % 3600) % 60);
        remain_days.innerHTML = days;
        remain_hours.innerHTML = hours;
        remain_mins.innerHTML = mins;
        remain_secs.innerHTML = secs
    } else {
        remain_days.innerHTML = "Good luck";
        remain_hours.innerHTML = "0";
        remain_mins.innerHTML = "0";
        remain_secs.innerHTML = "0"
    }
}

async function PrepareCountdown() {
    if (TIME_MARK == void 0) processDataTM();

    TIME_MARK = (await getLocalData()).endTime;
    countdown();
    setInterval(function() {
        countdown();
    }, 1000);
}




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
        let DayOfNow = (new Date()).getDate();
        let DayOfLastUpdate = (new Date(lastUpdate)).getDate();
        if (DayOfNow != DayOfLastUpdate) return true;
        else false
    } else {
        let now = (new Date).getTime();
        let distance = Math.round((now - lastUpdate) / 1000);
        if (distance >= compareByDays * 24 * 60 * 60) return true;
        else return false;
    }
}

async function addBookmark() {
    let title = input_bookmark_title.value;
    let url = input_bookmark_url.value;
    if (isVaildInput(title, url)) {
        let icon = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
        let properties = {
            title,
            url,
            icon,
            id: generateID(6)
        }
        createBookmark(properties);

        let data = await getLocalData();
        data.bookmark.push(el);
        await setLocalData(data);

        //refresh input field
        input_bookmark_url.value = "";
        input_bookmark_title.value = "";
        bookmark_wraper.classList.remove("option_wraper_actived");
        app.classList.remove("app_actived");
    } else return false
}
async function processDataUI() {
    let dataUI = JSON.parse(window.localStorage.getItem("ui"));
    let data = (await getLocalData());
    data.ui_daily.lastUpdate = (new Date).getTime();
    if (!dataST.is_static_image) {
        data.ui_daily.background.url = dataUI.images[Math.round(Math.random() * dataUI.images.length)];
    }
    data.ui_daily.quote.text = dataUI.quotes[Math.round(Math.random() * dataUI.quotes.length)];
    setLocalData(data);
}
async function processDataTM() {
    let dataTM = JSON.parse(window.localStorage.getItem("time_mark"));
    let data = await getLocalData();
    data.endTime = dataTM.default;
}

async function removeBookmark(id) {
    let data = (await getLocalData());
    let index = -1
    for (i = 0; i < data.bookmark.length; i++) {
        if (data.bookmark[i].id == id) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        data.bookmark.splice(index, 1);
        await setLocalData(data);
    } else return false;
    return true;
}

async function prepareRemoveBookmark(elNode) {
    if (elNode != void 0) {
        await removeBookmark(elNode.id);
        elNode.remove();
    }
}

async function updateEndTime() {
    let isCheck = switch_time_server.checked;
    let data = await getLocalData();

    if (isCheck) {
        await processDataTM();
        TIME_MARK = (await getLocalData()).endTime;
    } else {
        TIME_MARK = input_end_time.valueAsNumber;
    }
    data.settings.time_server = isSync;
    dataST = data.settings;
    data.endTime = TIME_MARK;
    input_end_time.disabled = isCheck;
    setLocalData(data);
}

async function updateStaticImage() {
    let isCheck = switch_static_image.checked;;
    let data = await getLocalData();

    if (isCheck) {
        data.ui_daily.background.url = input_static_image_url.value;
    } else {
        await processDataUI();
    }
    data.settings.switch_static_image = isCheck;
    await setLocalData(data);
    input_static_image_url.disabled = !isCheck
}

async function loadData() {
    try {
        if (await isOldData("ui_update", 60)) {
            await getDataUI();
            console.log("a");
        };
        if (dataST.time_server) {
            if (await isOldData("time_mark", 1)) {
                await getDataTimeMark();
                await processDataTM();
                console.log("b")
            };
        }
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



function createBookmark(el) {
    let linkElement = document.createElement("a");
    linkElement.href = el.url;
    linkElement.id = el.id;
    linkElement.draggable = "true";

    let icon = document.createElement("img");
    icon.style.height = "40px"
    icon.src = el.icon_url;

    let name = document.createElement("span");
    name.innerHTML = el.title;

    linkElement.appendChild(icon);
    linkElement.appendChild(name);

    linkElement.addEventListener("dragstart", function(event) {
        delete_zone.style.opacity = 1;
        event.dataTransfer.setData("Text", event.target.id);
    });
    linkElement.addEventListener("dragend", function() {
        delete_zone.style.opacity = 0;
    });

    bookmarkBar.insertAdjacentElement("afterbegin", linkElement);
}

async function applyBookmark() {
    let dataBM = (await getLocalData()).bookmark;
    dataBM.forEach(element => {
        createBookmark(element);
    });
}
async function applyDataUI() {
    let dataUI = (await getLocalData()).ui_daily;
    let link = dataUI.background.url;
    let quote = dataUI.quote.text;

    input_static_image_url.value = link;
    switch_time_server.checked = dataST.time_server;
    switch_static_image.checked = dataST.is_static_image;
    input_end_time.valueAsNumber = TIME_MARK;

    if (dataST.time_server) {
        input_end_time.disabled = true;
    } else {
        input_end_time.disabled = false;
    }
    if (dataST.is_static_image) {
        input_static_image_url.disabled = false;
    } else {
        input_static_image_url.disabled = true;
    }
    background.style.backgroundImage = `url("${link}")`;
    quotePragraph.innerHTML = quote;
}

async function loadSettings() {
    dataST = (await getLocalData()).settings;
}

delete_zone.addEventListener("drop", function(event) {
    let data = event.dataTransfer.getData("Text");
    prepareRemoveBookmark(document.getElementById(data));
    event.preventDefault();
});

delete_zone.addEventListener("dragover", function(event) {
    event.preventDefault();
});

switch_static_image.addEventListener("change", async function() {
    await updateStaticImage();
});

switch_time_server.addEventListener("change", async function() {
    await updateEndTime();
});

input_end_time.addEventListener("change", async function() {
    await updateEndTime();
});

input_static_image_url.addEventListener("change", async function() {
    await updateStaticImage();
});

input_bookmark_url.addEventListener("keyup", async function(key) {
    if (key.key == "Enter") {
        return addBookmark();
    }
});

btn_ok_add_bookmark.addEventListener("click", async function() {
    return addBookmark();
});

async function start() {
    await loadSettings();
    await loadData();
    await applyBookmark();
    await PrepareCountdown();
    await applyDataUI();
}

start();