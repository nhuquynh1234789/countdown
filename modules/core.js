class core {
    static generateID(length) { // Generate ID by number
        let id = "";
        if (typeof(length) == "number" && length >= 0) {
            for (i = 1; i <= length; i++) {
                id += Math.round(Math.random() * 10).toString();
            }
            return id;
        } else return;
    }

    static isVaildInput(title, url) { // Check user input info befor creating bookmark
        if (title.trim() == "" || url.trim() == "") {
            alert(renderLangJs("_error_input_empty"));
            return false
        }
        if (url.search(/chrome:\/\//g) >= 0) {
            alert(renderLangJs("_error_input_chrome"));
            return false;
        }
        if (url.search(/https?:\/\//g) < 0) {
            alert(renderLangJs("_error_input_http"));
            return false;
        }
        return true;
    }

    static async isOldData(type, distanceByDays) { // Check whether data is out of date
        let lastUpdate = 0;
        switch (type) {
            case "limit":
                {
                    lastUpdate = (await this.getLocalData("limit_time")).lastUpdate;
                    break;
                }
            case "ui_daily":
                {
                    lastUpdate = (await this.getLocalData("ui")).ui_daily.lastUpdate;
                    break;
                }
            case "ui_update":
                {
                    lastUpdate = (await this.getLocalData("ui")).lastUpdate;
                    if (window.localStorage.getItem("ui") == void 0) lastUpdate = 0;
                    break;
                }
            case "time_mark":
                {
                    lastUpdate = (await this.getLocalData("time")).lastUpdate;
                    if (window.localStorage.getItem("time_mark") == void 0) lastUpdate = 0;
                    break;
                }

            default:
                return false;
        }

        if (type == "ui_daily" || type == "limit") {
            // if next to new day, return true
            let DayOfNow = (new Date()).getDate();
            let DayOfLastUpdate = (new Date(lastUpdate)).getDate();
            if (DayOfNow != DayOfLastUpdate) return true;
            else false
        } else {
            let now = Date.now();
            let distance = Math.round((now - lastUpdate) / 1000);
            if ((distance >= distanceByDays * 24 * 60 * 60) || (distance < 0)) return true;
            else return false;
        }
    }

    static rewriteData() {
        let ui = {
            lastUpdate: 0,
            ui_daily: {
                lastUpdate: 0,
                background: {
                    url: "",
                },
                quote: {
                    text: ""
                }
            }
        }

        let time = {
            lastUpdate: 0,
            // end of countdown
            end_time: 0,
        }

        let bookmarks = {
            lastUpdate: 0,
            content: [{
                    id: 377672,
                    title: "FB",
                    url: "https://www.facebook.com/",
                    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=fb.com"
                },
                {
                    id: 231665,
                    title: "Google",
                    url: "https://www.google.com.vn",
                    icon: "https://www.google.com/s2/favicons?sz=64&domain_url=google.com.vn"
                }
            ],
        }

        let settings = {
            time_settings: {
                is_time_server: true
            },
            ui_setting: {
                is_static_image: false,
                is_static_image_device: false
            },
            limit_time: {
                isActive: true
            },
            bubble: {
                isActive: true
            }
        }

        let limit_time = {
            lastUpdate: 0,
            total_time: 0,
            limit_time: 20,
            isSkip: true
        }

        this.setLocalData("ui", ui);
        this.setLocalData("time", time);
        this.setLocalData("bookmarks", bookmarks);
        this.setLocalData("settings", settings);
        this.setLocalData("limit_time", limit_time);
    }

    static setLocalData(type, data) { //set data
        if (type == "ui") chrome.storage.sync.set({ ui: data });
        else if (type == "time") chrome.storage.sync.set({ time: data });
        else if (type == "bookmarks") chrome.storage.sync.set({ bookmarks: data });
        else if (type == "settings") chrome.storage.sync.set({ settings: data });
        else if (type == "limit_time") chrome.storage.sync.set({ limit_time: data });

    };

    // Get data from extension storage
    static async getLocalData(type) {
        return new Promise((resolve, reject) => {
            if (type == "all") {
                chrome.storage.sync.get(function(data) {
                    resolve(data);
                });
            } else {
                chrome.storage.sync.get(type, function(data) {
                    resolve(data[type]);
                });
            }
        });
    }

    static async fetchData(type) {
        let result;
        let ui_src = "https://raw.githubusercontent.com/NghiaCaNgao/countdown/master/data/data.json";
        let time_src = "https://raw.githubusercontent.com/NghiaCaNgao/countdown/master/data/time_mark.json";
        switch (type) {
            case "ui":
                {
                    result = await fetch(ui_src);
                    break;
                }
            case "time_mark":
                {
                    result = await fetch(time_src);
                    break;
                }
        }
        if (result.ok) return result.json();
        else return Promise.reject(result.statusText);
    }

    static async getDataUI() {
        let dataUI = await this.fetchData("ui");
        if (dataUI != void 0) {
            // Save fetched data to browser local storage
            window.localStorage.setItem("ui", JSON.stringify(dataUI));
            // Update last update timestamp
            let data = await this.getLocalData("ui");
            data.lastUpdate = Date.now();

            this.setLocalData("ui", data);
            return dataUI;
        }
        return;
    }

    static async getDataTimeMark() {
        let dataTM = await this.fetchData("time_mark");
        if (dataTM != void 0) {
            // Save fetched data to brower local storage
            window.localStorage.setItem("time_mark", JSON.stringify(dataTM));
            // Update last update timestamp
            let data = await this.getLocalData("time");
            data.lastUpdate = Date.now();

            this.setLocalData("time", data);
            return dataTM;
        }
        return;
    }
    static async fixDamagedData(type) {
        // Check whether data is lost and return full data
        // type = ui | time_mark
        let data;
        let field = window.localStorage.getItem(type);
        if (field == void 0) {
            if (type == "time_mark") data = await this.getDataTimeMark();
            else if (type == "ui") data = await this.getDataUI();
        } else
            data = JSON.parse(field);
        return data;
    }

    static async processDataUI() {
        // Update data daily
        let dataUIRaw = await this.fixDamagedData("ui");
        let dataUI = await this.getLocalData("ui");
        let dataST = await this.getLocalData("settings");
        let data_images = dataUIRaw.images;
        let data_quotes = dataUIRaw.quotes;
        let data_ui_daily = dataUI.ui_daily;
        let data_ui_settings = dataST.ui_setting;

        // Update last update timestamp
        data_ui_daily.lastUpdate = Date.now();
        // if static image settings is false, get random an image from local data
        if (!data_ui_settings.is_static_image)
            data_ui_daily.background.url = data_images[Math.round(Math.random() * data_images.length)];
        // get random quote
        data_ui_daily.quote.text = data_quotes[Math.round(Math.random() * data_quotes.length)];

        dataUI.ui_daily = data_ui_daily;
        dataST.ui_setting = data_ui_settings;
        this.setLocalData("ui", dataUI);
        this.setLocalData("settings", dataST);
    }

    static async processDataTM() {
        // Update data daily
        let dataTM = await this.fixDamagedData("time_mark");
        // save end of countdown to extesion storage
        let data = await this.getLocalData("time");
        data.end_time = dataTM.default;
        this.setLocalData("time", data);
    }

    static async processDataLimit() {
        let dataLI = await this.getLocalData("limit_time");
        dataLI.lastUpdate = Date.now();
        dataLI.total_time = 0;
        dataLI.isSkip = false;
        this.setLocalData("limit_time", dataLI);
    }

    static async loadData() {
        let dataST = await this.getLocalData("settings");
        try {
            if (await this.isOldData("ui_update", 60)) {
                await this.fixDamagedData("ui");
                console.log("reload data_ui");
            };
            if (dataST.time_settings.is_time_server) {
                if (await this.isOldData("time_mark", 1)) {
                    await this.processDataTM();
                    console.log("reload data_time");
                };
            }
            if (await this.isOldData("ui_daily", 1)) {
                await this.processDataUI();
                await this.processDataTM();
                console.log("refresh data");
            }
        } catch (er) {
            alert(renderLangJs("_error_load_data"));
            console.log(er);
        }
    }
}