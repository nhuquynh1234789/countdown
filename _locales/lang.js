function renderLangHTML() {
    let element = document.querySelectorAll("[code]");
    for (item of element) {
        item.innerHTML = chrome.i18n.getMessage(item.attributes.code.value);
    }
}

function renderLangJs(code) {
    if ((code == void 0) || (code.trim() == "")) return;
    let ans = chrome.i18n.getMessage(code);
    if (ans == "") return
    else return ans
}

function renderLang() {
    renderLangHTML();
}

renderLang();