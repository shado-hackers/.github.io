const {ipcRenderer, shell} = require('electron');

import * as tools from "./tools.js";

// TODO: Comment
window.onload = async () => {
    const title = document.getElementsByTagName("title")[0];

    ipcRenderer.send("app_version");
    ipcRenderer.once("app_version", (event, arg) => {
        title.textContent += " " + arg.version;
    });

    ipcRenderer.send("dir_name");
    ipcRenderer.once("dir_name", (event, dirname) => {
        tools.setRealDir(dirname);
    });

    await tools.initialize();

    if (tools.getCookie("cache") !== null) tools.loadAllData();

    const notification = document.getElementById("updateNotification");
    const message = notification.querySelector(".message");
    const restartButton = notification.querySelector('.restart-button');

    ipcRenderer.once("update_available", (event, version) => {
        message.innerText = tools.languageDB[tools.selectedLang]["js"]["newVersion"].replaceAll("XXX", version);
        notification.classList.remove("hidden");
    });

    ipcRenderer.once("app_upto_date", () => {
        ipcRenderer.send("app_upto_date");
        tools.updateYtDl();
    });

    ipcRenderer.once("update_downloaded", () => {
        message.innerText = tools.languageDB[tools.selectedLang]["js"]["updateDownloaded"];
        restartButton.classList.remove("hidden");
        notification.classList.remove("hidden");
    });

    ipcRenderer.send("lang", tools.selectedLang ?? tools.getCookie("lang") ?? "en", tools.languageDB[tools.selectedLang]["tray"]);
}

// TODO: Comment
tools.bindEvent("click", "button[data-href],a[data-href]", function () {
    shell.openExternal(this.getAttribute("data-href"));
});

// TODO: Comment
tools.bindEvent("click", "a[href]", function (e) {
    e.preventDefault();
});

// TODO: Comment
tools.bindEvent("click", "#info-close", () => {
    let info = document.getElementById("info");

    info.classList.remove("show");
    document.body.style.overflow = "";
});