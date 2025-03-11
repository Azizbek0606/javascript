import { createModal } from "../modals/modal.js";
import { showMessage } from "../utils/utils.js"
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".createImageBtn").addEventListener("click", () => {
        openCreateImageModal();
    });
    document.querySelectorAll(".open_update_window").forEach((elem) => {
        elem.addEventListener("click", () => {
            openAllImagesWindow();
        });
    });
});


function openCreateImageModal() {
    try {
        window.myAPI.getGroupRequest();

        window.electronAPI.groupsResponse((groups) => {
            console.log("Backenddan kelgan ma'lumot:", groups);

            if (!Array.isArray(groups)) {
                console.error("Invalid response format. Expected an array.");
                return;
            }

            const options = [
                { value: "", text: "No Group (Optional)" },
                ...groups.map(group => ({
                    value: group.id.toString(),
                    text: group.group_name
                }))
            ];

            createModal({
                title: "Create Image",
                inputs: [
                    { type: "file", label: "Upload Image", placeholder: "Enter Image" },
                    {
                        label: "Choose image group (optional)",
                        type: "select",
                        options: options
                    },
                ],
                buttons: [
                    { text: "Cancel", class: "cancel-btn", action: () => { } },
                    {
                        text: "Submit", class: "apply-btn", action: (values) => {
                            if (values && values[0]) {
                                const file = values[0];
                                const group = values[1] || "";
                                const reader = new FileReader();

                                reader.onload = function (event) {
                                    const buffer = event.target.result;
                                    window.myAPI.uploadWallpaper({
                                        name: file.name,
                                        group_id: group,
                                        buffer
                                    });
                                };

                                reader.readAsArrayBuffer(file);
                            }
                        }
                    }
                ]
            });
        });

    } catch (error) {
        console.error("Failed to load groups:", error);
    }
}
window.electronAPI.saveImagesResponse((data) => {
    showMessage(data.message, data.status);
});

let allImageWindowHeloper = false;
function openAllImagesWindow() {
    let allImageWindow = document.querySelector(".galary_box")
    if (!allImageWindowHeloper) {
        allImageWindow.style.display = "block";
        allImageWindowHeloper = true;
    } else {
        allImageWindow.style.display = "none";
        allImageWindowHeloper = false;
    }

}