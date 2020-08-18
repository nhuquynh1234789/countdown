function renderLangHTML() {
    let element = document.querySelectorAll("[code]");
    for (item of element) {
        item.innerHTML = chrome.i18n.getMessage(item.attributes.code.value);
    }
}

function renderLangJs(code) {
    let ans = chrome.i18n.getMessage(code);
    if (ans == "") return
    else return ans
}

function renderLang() {
    renderLangHTML();
    renderLangJs();
}

renderLang();