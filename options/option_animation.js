const btn_collapse = document.getElementById("btn_collapse");
const nav_bar = document.getElementById("nav_bar");

btn_collapse.addEventListener("click", function() {
    let isCollapse = nav_bar.classList.contains("collapse");
    console.log(isCollapse);
    if (!isCollapse) {
        nav_bar.classList.add("collapse");
    } else {
        nav_bar.classList.remove("collapse");
    }
});