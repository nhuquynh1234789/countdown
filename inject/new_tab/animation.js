const btn_option = document.getElementById("btn_option");
const btn_add_bookmark = document.getElementById("btn_add_bookmark")
const btn_cancel_option = document.getElementById("cancel_option");;
const btn_cancel_add_bookmark = document.getElementById("btn_cancel_add_bookmark");

const option_wraper = document.getElementById("option_wraper");
const app = document.getElementById("app");
const bookmark_wraper = document.getElementById("bookmark_wraper");

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