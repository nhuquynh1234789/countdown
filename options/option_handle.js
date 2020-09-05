const switch_restriction = document.getElementById("switch_restriction");
const switch_bubble = document.getElementById("switch_bubble");
const input_limit_time = document.getElementById("input_limit_time");

async function loadData() {
    let dataST = await core.getLocalData("settings");
    let dataLI = await core.getLocalData("limit_time");
    switch_bubble.checked = dataST.bubble.isActive;
    switch_restriction.checked = dataST.limit_time.isActive;
    input_limit_time.disabled = !dataST.limit_time.isActive;
    input_limit_time.value = dataLI.limit_time;
}

input_limit_time.addEventListener("change", async function() {
    if (Number(this.value) >= 5) {
        let dataLI = await core.getLocalData("limit_time");
        dataLI.limit_time = this.value;
        core.setLocalData("limit_time", dataLI);
    } else alert("Must be greater than 5 minutes")
});

switch_restriction.addEventListener("change", async function() {
    let dataST = await core.getLocalData("settings");
    dataST.limit_time.isActive = this.checked;
    core.setLocalData("settings", dataST);
});
switch_bubble.addEventListener("change", async function() {
    let dataST = await core.getLocalData("settings");
    dataST.bubble.isActive = this.checked;
    core.setLocalData("settings", dataST);
});

loadData();