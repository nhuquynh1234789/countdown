const list = [
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "https://www.youtube.com/"
];

const STEP = 1; //by second

var LIMIT_TIME = 3;
var lastActive = false;
var totalTime = 0;
var loop;

function isRestrictList() {
    let href = window.location.href;
    let pos = 0;
    for (i = 0; i < list.length; i++) {
        pos = href.search(list[i]);
        if (pos == 0) break;
    }
    return (pos == 0);
}

function isVisibility() {
    return (document.visibilityState == "visible");
}

async function isOver() {
    if (isVisibility()) {
        lastActive = true;
        if (lastActive) totalTime += STEP;

        let dataLI = await core.getLocalData("limit_time");
        dataLI.total_time = totalTime;
        core.setLocalData("limit_time", dataLI);

        if (totalTime >= LIMIT_TIME) block();
    } else lastActive = false;
}

function block() {
    console.log("Block");
    let body = document.getElementsByTagName("body")[0];
    let head = document.getElementsByTagName("head")[0];
    head.innerHTML = "";
    head.innerHTML = `

    <title>Nghỉ chơi fb</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Pacifico&display=swap">

    `
    body.innerHTML = "";
    body.innerHTML = `

    <section class="app">
        <div class="content">
            <div class="text">
                <div>
                    <h1>Thôi học đi</h1>
                    <p>Học đi mà làm người, dăm ba cái fb dùng nhiều là tốn thời gian </p>
                    <br/>
                    <p>Bạn có thể thay đổi thiết lập giới hạn thời gian bằng cách vào options/restrict </p>
                </div>
                <div class="button">
                    <button id = "btn_skip">Continue anyway</button>
                </div>
            </div>
            <div class="image">
                <img src="https://i.imgur.com/ej4syjH.gif">
            </div>
        </div>
    </section>

    `;
    if (loop != void 0) clearInterval(loop);
    activity();
}

function activity() {
    const btn_skip = document.getElementById("btn_skip");
    const btn_option = document.getElementById("btn_option");

    btn_skip.addEventListener("click", async function() {
        let dataLI = await core.getLocalData("limit_time");
        dataLI.isSkip = true;
        core.setLocalData("limit_time", dataLI);

        window.location.reload();
    });
}

function checkCycle() {
    loop = setInterval(isOver, STEP * 1000 * 60);
}

async function init() {
    let dataST = await core.getLocalData("settings");
    if (dataST.limit_time.isActive) {
        if (isRestrictList()) {
            let isOld = await core.isOldData("limit", 1);
            if (isOld) await core.processDataLimit();
            let restrict = await core.getLocalData("limit_time");
            LIMIT_TIME = restrict.limit_time;
            totalTime = restrict.total_time;

            if (restrict.isSkip) {
                let dataLI = await core.getLocalData("limit_time");
                dataLI.isSkip = false;
                core.setLocalData("limit_time", dataLI);
            } else {
                if (totalTime >= LIMIT_TIME) block();
                checkCycle();
            }
        }
    }
}


init();