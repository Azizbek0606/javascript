import { createModal } from "../modals/modal.js";
import { showMessage } from "../utils/utils.js";


document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#updateProfileBtn").addEventListener("click", () => {
        chooseUpdateOption();
    });
});
function chooseUpdateOption() {
    createModal({
        title: "Choose an option",
        message: "What do you want to update?",
        buttons: [
            { text: "User Name", class: "option-btn", action: dataUpdateUserName },
            { text: "Profile Image", class: "option-btn", action: dataUpdateProfileImage },
            { text: "Password", class: "option-btn", action: dataUpdatePassword },
            { text: "Email", class: "option-btn", action: dataUpdateEmail },
            { text: "Cancel", class: "cancel-btn", action: () => { } }
        ]
    });
}

function dataUpdateUserName() {
    createModal({
        title: "Update User Name",
        inputs: [{ label: "New User Name", type: "text", placeholder: "Enter new name" }],
        buttons: [
            { text: "Cancel", class: "cancel-btn", action: () => { } },
            { text: "Save", class: "apply-btn", action: (values) => window.myAPI.updateUsername(values[0]) }
        ]
    });
}
window.electronAPI.showUpdatedNameStatus((data) =>{
    showMessage(data.message, data.status);
})
function dataUpdateEmail() {
    createModal({
        title: "Update Email",
        inputs: [{ label: "New Email", type: "text", placeholder: "Enter new Email" }],
        buttons: [
            { text: "Cancel", class: "cancel-btn", action: () => { } },
            { text: "Save", class: "apply-btn", action: (values) => console.log("New Email:", values[0]) }
        ]
    });
}
function dataUpdateProfileImage() {
    createModal({
        title: "Update Profile Image",
        inputs: [{ label: "Profile Image", type: "file" }],
        buttons: [
            { text: "Cancel", class: "cancel-btn", action: () => { } },
            { text: "Upload", class: "apply-btn", action: (values) => console.log("Uploaded image:", values[0]) }
        ]
    });
}

function dataUpdatePassword() {
    createModal({
        title: "Update Password",
        inputs: [
            { label: "Old Password", type: "password", placeholder: "Enter old password" },
            { label: "New Password", type: "password", placeholder: "Enter new password" }
        ],
        buttons: [
            { text: "Cancel", class: "cancel-btn", action: () => { } },
            { text: "Change", class: "apply-btn", action: (values) => console.log("New password:", values[1]) }
        ]
    });
}


