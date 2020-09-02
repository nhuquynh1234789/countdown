const btn_ok_add_bookmark = document.getElementById("btn_ok_add_bookmark");
const btn_sync_time = document.getElementById("btn_sync_time");

const input_bookmark_title = document.getElementById("input_bookmark_title")
const input_bookmark_url = document.getElementById("input_bookmark_url");
const input_end_time = document.getElementById("sle_timer");
const input_static_image_url = document.getElementById("input_static_image_url");
const input_image_file = document.getElementById("input_image_file");

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

function isVaildImageUrl(url) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.src = url;
        image.onload = function() {
            resolve(!0)
        };
        image.onerror = function() {
            resolve(!1);
        }
    })
}

async function updateEndTime() {
    let isCheck = switch_time_server.checked;
    let dataTM = await core.getLocalData("time")
    let dataST = await core.getLocalData("settings")

    // if user turns on sync time setting, load data from server
    if (isCheck) {
        await core.processDataTM();
        TIME_MARK = (await core.getLocalData("time")).end_time;
        dataTM.end_time = TIME_MARK;
        input_end_time.valueAsNumber = TIME_MARK;
    } else {
        // if not set TIME_MARK as custom settings
        TIME_MARK = input_end_time.valueAsNumber;
        dataTM.end_time = TIME_MARK;
    }
    dataST.time_settings.is_time_server = isCheck;
    input_end_time.disabled = isCheck;
    core.setLocalData("time", dataTM);
    core.setLocalData("settings", dataST);
}

async function updateStaticImage() {
    let isCheck = switch_static_image.checked;;
    let dataUI = await core.getLocalData("ui");
    let dataST = await core.getLocalData("settings");

    // if user turn on static image settings, use custom url image
    if (isCheck) {
        if (input_image_file.files.length > 0) {
            dataST.ui_setting.is_static_image_device = !0;
            dataUI.ui_daily.background.url = input_image_file.files[0].name;
        } else {
            let isValid = await isVaildImageUrl(input_static_image_url.value);
            if (isValid) {
                dataST.ui_setting.is_static_image_device = !1;
                dataUI.ui_daily.background.url = input_static_image_url.value;
            } else {
                alert(renderLangJs("_error_invaild_url"));
            }
        }

    } else {
        await core.processDataUI();
    }
    dataST.ui_setting.is_static_image = isCheck;
    core.setLocalData("ui", dataUI);
    core.setLocalData("settings", dataST);
    input_static_image_url.disabled = !isCheck;
    input_image_file.disabled = !isCheck;
}

async function applyDataUI() {
    let dataUI = (await core.getLocalData("ui")).ui_daily;
    let dataST = await core.getLocalData("settings");
    let link = dataUI.background.url;
    let quote = dataUI.quote.text;

    // Fill info
    input_static_image_url.value = link;
    switch_time_server.checked = dataST.is_time_server;
    switch_static_image.checked = dataST.is_static_image;
    input_end_time.valueAsNumber = TIME_MARK;

    input_end_time.disabled = dataST.is_time_server;
    input_static_image_url.disabled = !dataST.is_static_image;
    input_image_file.disabled = !dataST.is_static_image;

    if (dataST.ui_setting.is_static_image_device) {
        let img_device = window.localStorage.getItem("device_image");
        background.style.backgroundImage = `url("${img_device}")`;
    } else {
        background.style.backgroundImage = `url("${link}")`;
    }

    quotePragraph.innerHTML = quote;
}

async function applyCountdown() {
    // update TIME_MARK const
    if (TIME_MARK == void 0) core.processDataTM();
    TIME_MARK = (await core.getLocalData("time")).end_time;

    // start countdown
    countdown();
    setInterval(function() {
        countdown();
    }, 1000);
}

function countdown() {
    let now = Date.now();
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


async function applyAddBookmark() {
    // Fill bookmark on screen
    let dataBM = await core.getLocalData("bookmarks")
    dataBM.content.forEach(element => {
        createBookmark(element);
    });
}

async function applyRemoveBookmark(elNode) {
    if (elNode != void 0) {
        let status = await removeBookmark(elNode.id);
        if (status)
            elNode.remove();
        else
            alert(renderLangJs("_error_delete_bookmark"))
    }
}

async function addBookmark() {
    // create new bookmark
    let title = input_bookmark_title.value;
    let url = input_bookmark_url.value;
    if (core.isVaildInput(title, url)) {
        let icon = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
        let properties = {
            title,
            url,
            icon,
            id: core.generateID(6)
        }
        createBookmark(properties);

        let dataBM = await core.getLocalData("bookmarks");
        dataBM.content.push(properties);
        core.setLocalData("bookmarks", dataBM);

        //refresh input field
        input_bookmark_url.value = "";
        input_bookmark_title.value = "";
        bookmark_wraper.classList.remove("option_wraper_actived");
        app.classList.remove("app_actived");
    } else return false
}

function createBookmark(el) {
    let linkElement = document.createElement("a");
    linkElement.href = el.url;
    linkElement.id = el.id;
    linkElement.draggable = "true";

    let icon = document.createElement("img");
    icon.style.height = "40px"
    icon.src = el.icon;

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

async function removeBookmark(id) {
    let dataBM = await core.getLocalData("bookmarks");
    let index = -1;
    for (i = 0; i < dataBM.content.length; i++) {
        if (dataBM.content[i].id == id) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        dataBM.content.splice(index, 1);
        core.setLocalData("bookmark", dataBM);
    } else return false;
    return true;
}

delete_zone.addEventListener("drop", function(event) {
    let data = event.dataTransfer.getData("Text");
    applyRemoveBookmark(document.getElementById(data));
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

input_static_image_url.addEventListener("change", async function() {
    await updateStaticImage();
});

input_end_time.addEventListener("change", async function() {
    await updateEndTime();
});

input_image_file.addEventListener("change", async function() {
    if (this.files.length > 0) {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(this.files[0]);
        fileReader.onload = async function() {
            window.localStorage.setItem("device_image", fileReader.result);
            input_static_image_url.value = input_image_file.files[0].name;
            await updateStaticImage();
            await applyDataUI();
        }
    }

});

input_bookmark_url.addEventListener("keyup", async function(key) {
    if (key.key == "Enter") return addBookmark();
});

btn_ok_add_bookmark.addEventListener("click", async function() {
    return addBookmark();
});
btn_sync_time.addEventListener("click", async function() {
    this.innerHTML = renderLangJs("_syncing_time");
    await core.processDataTM();
    TIME_MARK = (await core.getLocalData("time")).end_time;
    this.innerHTML = renderLangJs("_sync_time_completed");
});



async function start() {
    await core.loadData();
    await applyAddBookmark();
    await applyCountdown();
    await applyDataUI();
}

start();