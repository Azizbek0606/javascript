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
document.querySelector(".reloadBtn").addEventListener("click", () => {
    reloadImages();
});
async function openCreateImageModal() {
    try {
        const groups = await window.electronAPI.getGroup();


        if (!Array.isArray(groups)) {
            console.error("Invalid response format. Expected an array.");
            return;
        }

        const options = [
            { value: "", text: "No Group (Optional)" },
            ...groups.map(group => ({
                value: group.group_id.toString(),
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
                    text: "Submit", class: "apply-btn", action: async (values) => {
                        if (values && values[0]) {
                            const file = values[0];
                            const group = values[1] || "";

                            try {
                                const buffer = await file.arrayBuffer();

                                await window.myAPI.uploadWallpaper({
                                    name: file.name,
                                    group_id: group,
                                    buffer
                                });

                            } catch (error) {
                                console.error("Image upload failed:", error);
                            }
                        }
                    }
                }
            ]
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
    let allImageWindow = document.querySelector(".galary_box");
    let container = document.querySelector(".image_box_wrapper");

    if (!allImageWindowHeloper) {
        allImageWindow.style.display = "block";
        allImageWindowHeloper = true;
        window.myAPI.getAllWallpaper();
    } else {
        allImageWindow.style.display = "none";
        allImageWindowHeloper = false;
    }
}
let offset = 0;
const limit = 6;
let isLoading = false;
let hasMoreImages = true;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function loadMoreImages() {
    await sleep(100);
    if (isLoading || !hasMoreImages) return;
    isLoading = true;

    const wallpapers = await window.electronAPI.loadImages(limit, offset);

    if (wallpapers.length > 0) {
        renderWallpapers(wallpapers);
        offset += limit;
    }

    if (wallpapers.length < limit) {
        hasMoreImages = false;
        removeLoadMoreButton();
    }

    isLoading = false;
}
function removeLoadMoreButton() {
    const loadMoreBtn = document.querySelector(".load_more_images");
    if (loadMoreBtn) {
        loadMoreBtn.remove();
    }
}
loadMoreImages();
const wallpapersMap = new Map();
export async function renderWallpapers(wallpapers) {
    const container = document.querySelector(".image_box_wrapper");
    const fragment = document.createDocumentFragment();

    wallpapers.forEach(async (wallpaper) => {
        wallpapersMap.set(wallpaper.id, wallpaper);
        const imageBox = document.createElement("div");
        imageBox.classList.add("image_box");
        imageBox.setAttribute("data-id", wallpaper.id)
        imageBox.innerHTML = ` 
            <div class="img_side">
                <img src="${wallpaper.file_path}" loading="lazy" alt="Wallpaper">
                <span class="updateBtn" data-id="${wallpaper.id}">Update</span>
                <span class="likeBtn" data-id="${wallpaper.id}">
                    ${wallpaper.liked ? "❤️" : "🤍"}
                </span>
                <span class="deleteBtn" data-id="${wallpaper.id}" >Delete</span>
                <span class="about_this_image">Detail</span>
            </div>
            <div class="img_info">
                <p title="${wallpaper.group_name}" >Group: ${wallpaper.group_name}</p>
            </div>
        `;

        fragment.appendChild(imageBox);
    });

    removeLoadMoreButton();

    if (hasMoreImages) {
        const loadMoreBtn = document.createElement("div");
        loadMoreBtn.classList.add("load_more_images");
        loadMoreBtn.textContent = "Load More Images";

        loadMoreBtn.addEventListener("click", loadMoreImages);
        fragment.appendChild(loadMoreBtn);
    }

    container.appendChild(fragment);
}
async function getGroupsAsync() {
    try {
        const data = await window.electronAPI.getGroup();

        return data;
    } catch (error) {
        console.error("Failed to fetch groups:", error);
        return [];
    }
}
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("updateBtn")) {
        const imageId = event.target.dataset.id;

        const wallpaper = await window.electronAPI.getWallpaperById(imageId);

        if (!wallpaper) return;

        const groups = await getGroupsAsync();
        let groupOptions;
        groupOptions = groups.map(group => ({ value: group.group_id, text: group.group_name }));
        groupOptions.push({ value: "", text: "No groups" });


        createModal({
            title: "Update Wallpaper Group",
            customHTML: `
                <div class="modal-image-preview">
                    <img src="${wallpaper.file_path}" alt="Wallpaper" style="width: 400px; height:300; border-radius: 10px;">
                </div>
            `,
            inputs: [
                {
                    label: "Group",
                    type: "select",
                    options: groupOptions,
                    value: wallpaper.group_id
                }
            ],
            buttons: [
                {
                    text: "Save",
                    class: "apply-btn",
                    action: async ([newGroup]) => {
                        const selectElement = document.querySelector("select");
                        const selectedOption = selectElement.options[selectElement.selectedIndex];
                        const newGroupText = selectedOption.text;
                        if (newGroup != wallpaper.group_id) {
                            await window.electronAPI.updateWallpaperGroup(imageId, newGroup);
                            updateImageGroupInUI(imageId, newGroupText);
                        }
                    }
                },
                { text: "Cancel", class: "cancel-btn", action: () => { } }
            ]
        });
    }
});
function updateImageGroupInUI(imageId, newGroup) {
    const imageBox = document.querySelector(`.likeBtn[data-id="${imageId}"]`).closest(".image_box");
    if (imageBox) {
        imageBox.querySelector(".img_info p").textContent = `Group: ${newGroup}`;
        showMessage("Image group updated successfully", "success");
    } else {
        showMessage("Failed to update image group", "error");
    }
}
document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("deleteBtn")) {
        const imageId = event.target.dataset.id;
        if (!imageId) return;

        const wallpaper = await window.electronAPI.getWallpaperById(imageId);
        if (!wallpaper) return;

        createModal({
            title: "Delete Wallpaper",
            customHTML: `
                <div class="modal-image-preview" style="width: 400px; height: 300px; border-radius: 10px;">
                    <img src="${wallpaper.file_path}" alt="Wallpaper" style="width: 100%; height: 100%; object-fit:cover; border-radius: 10px;">
                </div>
            `,
            buttons: [
                {
                    text: "Yes, Delete",
                    class: "cancel-btn",
                    action: async () => {
                        const success = await window.electronAPI.deleteWallpaper(imageId);
                        if (success) {
                            removeImageFromUI(imageId);
                        } else {
                            console.error("Failed to delete image.");
                        }
                    }
                },
                { text: "Cancel", class: "apply-btn", action: () => { } }
            ]
        });
    }
});
function removeImageFromUI(imageId) {
    const imageBox = document.querySelector(`.image_box[data-id="${imageId}"]`);
    if (imageBox) {
        imageBox.remove();
        showMessage("Image deleted successfully", "success");
    } else {
        showMessage("Failed to delete image", "error");
    }
}
function reloadImages() {
    const container = document.querySelector(".image_box_wrapper");
    container.innerHTML = "";
    const context = document.querySelector(".reloadBtn");
    context.textContent = "Loading...";

    offset = 0;
    hasMoreImages = true;

    loadMoreImages().then(() => {
        const loadingText = context
        if (loadingText.textContent == "Loading...") loadingText.textContent = "Reload";
    });
}
document.body.addEventListener("click", async (event) => {
    const imageBox = event.target.closest(".image_box");

    if (!imageBox) return;

    if (event.target.classList.contains("about_this_image") ||
        event.target.closest(".about_this_image")) {

        const imageId = imageBox.dataset.id;
        const wallpaper = wallpapersMap.get(Number(imageId));

        if (!wallpaper) return;
        const is_favorited = wallpaper.liked ? `
        <div class="is_favorited">
            <p>
                Favorited
            </p>
        </div>` : "";
        const modal = createModal({
            title: "Wallpaper Details",
            customHTML: `
                <div class="modal-image-preview" style="position:relative;  width: 750px; height: 400px; border-radius: 10px;">
                    <img src="${wallpaper.file_path}" alt="Wallpaper" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
                    <div class="modal-info">
                        <p>ID: ${wallpaper.id}</p>
                        <p>Group: ${wallpaper.group_name}</p>
                        <p>Uploaded at: ${wallpaper.created_at}</p>
                        <p>Uploaded by: ${wallpaper.user_name}</p>
                        <p>From Bot: ${wallpaper.from_bot ? "Yes" : "No"}</p>
                    </div>
                    ${is_favorited}
                </div>
            `,
            buttons: [
                { text: "Close", class: "apply-btn", action: () => { } }
            ]
        });

        if (modal && typeof modal.open === "function") {
            modal.open();
        }
    }
});
document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("likeBtn")) {
        const imageBox = event.target.closest(".image_box");
        const imageId = imageBox.dataset.id;

        try {
            const currentStatus = await window.myAPI.getLikeStatus(imageId);

            const newStatus = !currentStatus;

            await window.electronAPI.updateLikeStatus(imageId, newStatus);

            event.target.innerHTML = newStatus ? "❤️" : "🤍";

        } catch (error) {
            console.error("Like statusni o‘zgartirishda xatolik:", error);
        }
    }
});
document.querySelector(".create_new_group_btn").addEventListener("click", () => {
    createModalGroup();
});
async function createModalGroup() {
    try {
        let groupData = await window.electronAPI.getCategory();

        createModal({
            title: "Create New Group",
            inputs: [
                {
                    label: "Group Name",
                    type: "text",
                },
                {
                    label: "Category",
                    type: "select",
                    options: groupData.map(group => ({ value: group.id, text: group.name }))
                }
            ],
            buttons: [
                {
                    text: "Cancel",
                    class: "cancel-btn",
                    action: () => { }
                },
                {
                    text: "Create",
                    class: "apply-btn",
                    action: async (value) => {
                        try {
                            let groupName = value[0]?.trim();
                            let categoryId = value[1];

                            if (!groupName || !categoryId) {
                                showMessage("Please fill all fields", "error");
                                return;
                            }

                            let status = await window.electronAPI.createGroup({"name":groupName, "category":categoryId});

                            if (status) {
                                showMessage("Group created successfully", "success");
                            } else {
                                showMessage("Failed to create group", "error");
                            }
                        } catch (error) {
                            console.error("Error creating group:", error);
                            showMessage("An unexpected error occurred", "error");
                        }
                    }
                }
            ]
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        showMessage("Failed to load categories", "error");
    }
}
