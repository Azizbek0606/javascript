import { createModal } from "../modals/modal.js";
import { showMessage } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let settingsBtn = document.querySelector(".settingsBtn");
    settingsBtn.addEventListener("click", () => {
        openSettingsModal();
    });
});

async function openSettingsModal() {
    let userSettingData = await window.electronAPI.getSettings();

    createModal({
        title: "Settings",
        inputs: [
            {
                label: "Image interval (in seconds)",
                type: "number",
                value: userSettingData.image_changes_interval,
                placeholder: "Example: 3600 (1 hour)"
            },
            {
                label: "location", type: "select",
                options: [
                    { value: "tashkent", text: "Toshkent" },
                    { value: "andijan", text: "Andijon" },
                    { value: "bukhara", text: "Buxoro" },
                    { value: "gulistan", text: "Guliston" },
                    { value: "jizzakh", text: "Jizzax" },
                    { value: "zarafshan", text: "Zarafshon" },
                    { value: "karshi", text: "Qarshi" },
                    { value: "navoi", text: "Navoiy" },
                    { value: "namangan", text: "Namangan" },
                    { value: "nukus", text: "Nukus" },
                    { value: "samarkand", text: "Samarqand" },
                    { value: "termez", text: "Termiz" },
                    { value: "urgench", text: "Urganch" },
                    { value: "ferghana", text: "Farg‘ona" },
                    { value: "khiva", text: "Xiva" },
                ],
                value: userSettingData.location
            },
            { label: "Allow special group", type: "checkbox", checked: userSettingData.allow_special, complex: "1" },
            { label: "Auto switch groups", type: "checkbox", checked: userSettingData.auto_switch, complex: "1" },
        ],
        buttons: [
            { text: "Cancel", class: "cancel-btn", action: () => { } },
            {
                text: "Save", class: "apply-btn", action: async(values) => {
                    if (values[2] < 599){
                        showMessage("Image interval should be greater than 600 seconds", "error");
                        return;
                    }
                    let status = await window.electronAPI.updateUserSetting(values);
                    if(status.success){
                        showMessage(`Settings updated successfully`, "success");
                    }else{
                        showMessage(`Failed to update settings`, "error");
                    }
                }
            }
        ]
    })
}