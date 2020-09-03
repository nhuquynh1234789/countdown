const list = [
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "https://www.youtube.com/"
];

var isActive = false;

function isRestrictList() {
    let href = window.location.href;
    let pos = 0;
    for (i = 0; i < list.length; i++) {
        pos = href.search(list[i]);
        if (pos == 0) break;
    }
    return (pos == 0);
}