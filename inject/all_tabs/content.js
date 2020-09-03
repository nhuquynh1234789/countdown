var shiftX = 0;
var shiftY = 0;

function create(type) {
    let content = document.createElement("div");
    let delete_zone = document.createElement("div");
    delete_zone.id = "delete_zone";
    delete_zone.innerHTML = `<p>Delete icon</p>`

    content.id = "countdown_content";
    content.innerHTML = "<h1></h1>";
    content.draggable = true;

    document.getElementsByTagName("body")[0].append(content);
    document.getElementsByTagName("body")[0].append(delete_zone);
}

async function load() {
    create("normal");
    await countdown();
    let content = document.getElementById("countdown_content");
    let delete_zone = document.getElementById("delete_zone");

    content.addEventListener("mousedown", function(event) {
        shiftX = event.pageX - this.getBoundingClientRect().left;
        shiftY = event.pageY - this.getBoundingClientRect().top;
    });
    content.addEventListener("dragstart", function(event) {
        if (!delete_zone.classList.contains("no_hidden")) delete_zone.classList.add("no_hidden");
        if (!this.classList.contains("active")) this.classList.add("active");
    });

    content.addEventListener("dragend", function(event) {
        if (delete_zone.classList.contains("no_hidden")) delete_zone.classList.remove("no_hidden");
        if (delete_zone.classList.contains("active")) delete_zone.classList.remove("active");
        if (this.classList.contains("active")) this.classList.remove("active");
        this.style.top = event.pageY - shiftY + "px";
        this.style.left = event.pageX - shiftX + "px";
    });

    delete_zone.addEventListener("dragover", function(event) {
        event.preventDefault();
        if (!this.classList.contains("active")) this.classList.add("active");
    });

    delete_zone.addEventListener("dragleave", function(event) {
        event.preventDefault();
        if (this.classList.contains("active")) this.classList.remove("active");
    });

    delete_zone.addEventListener("drop", function(event) {
        event.preventDefault();
        content.remove();
    });
}

async function countdown() {
    let end = (await core.getLocalData("time")).end_time;
    let timeLeft = Math.floor((end - Date.now()) / 1000);
    timeLeft = Math.floor(timeLeft / 86400);
    document.querySelector("#countdown_content h1").innerHTML = `<span>#</span>` + timeLeft.toString();
}

load();

window.addEventListener("visibilitychange", function(ev) {
    console.log(ev);
});