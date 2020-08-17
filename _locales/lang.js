const element = document.querySelectorAll("[code]");

for (item of element) {
    item.innerHTML = chrome.i18n.getMessage(item.attributes.code.value);
    console.log(item.attributes.code.value);
}