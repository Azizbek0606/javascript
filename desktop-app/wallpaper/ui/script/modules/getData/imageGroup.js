import { createModal } from "../modals/modal.js";
import { showMessage } from "../utils/utils.js";
import { createImageGallery } from "../modals/modalHelperer.js"
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".openGroupsWindow").forEach((elem) => {
        elem.addEventListener("click", () => {
            openImageGroupsWindow();
        });
    });
});

let allImageWindowHelper = false;
async function openImageGroupsWindow() {
    let allGroupWindow = document.querySelector(".allGroupWindow");
    let hasImageWrapper = document.querySelector(".hasImage .xWrapper");
    let noImageWrapper = document.querySelector(".noImage");

    const groups = await window.electronAPI.getGroup();

    if (!allImageWindowHelper) {
        allGroupWindow.style.display = "block";
        allImageWindowHelper = true;
        hasImageWrapper.innerHTML = "";
        noImageWrapper.innerHTML = "";

        let rowFirst = document.createElement("div");
        rowFirst.classList.add("rowFirst");

        let rowSecond = document.createElement("div");
        rowSecond.classList.add("rowSecond");

        let counter = 0;

        groups.forEach(group => {
            if (group.total_images > 0) {
                let groupBox = document.createElement("div");
                groupBox.classList.add("groupBox");
                groupBox.setAttribute("data-id", group.group_id);
                groupBox.innerHTML = `
                    <div class="groupImageSide" data-category_id="${group.category_id}" data-time="${group.applied_at}">
                        <img src="${group.first_image}" id="group_image" alt="Group Image">
                        <div class="imageCount" data-id="${group.group_id}">${group.total_images}</div>
                        <div class="groupUpdateBtn" data-id="${group.group_id}">Update</div>
                        <div class="groupDeleteBtn" data-id="${group.group_id}" data-count="${group.total_images}">Delete</div>
                    </div>
                    <div class="groupInfoSide">
                        <p>${group.group_name}</p>
                    </div>
                `;

                if (counter % 2 === 0) {
                    rowFirst.appendChild(groupBox);
                } else {
                    rowSecond.appendChild(groupBox);
                }
                counter++;

            } else {
                let noImageGroup = document.createElement("div");
                noImageGroup.classList.add("noImageGroupBox");
                noImageGroup.setAttribute("data-id", group.group_id)
                noImageGroup.innerHTML = `
                    <p>No Image</p>
                    <p class="groupNameBox">${group.group_name}</p>
                    <p>Created by: ${group.uploaded_by}</p>
                    <p>Date: ${group.created_at}</p>
                    <div class="deleteNoImageGroup" data-id="${group.group_id}">Delete</div>
                `;

                noImageWrapper.appendChild(noImageGroup);
            }
        });

        hasImageWrapper.appendChild(rowFirst);
        hasImageWrapper.appendChild(rowSecond);

    } else {
        allGroupWindow.style.display = "none";
        allImageWindowHelper = false;
    }
}
document.body.addEventListener("click", async function (event) {
    if (event.target.classList.contains("groupUpdateBtn")) {
        let groupId = event.target.dataset.id;
        let groupImageSide = event.target.closest(".groupImageSide");
        let groupBox = groupImageSide.parentElement;
        let groupName = groupBox.querySelector(".groupInfoSide p").textContent.trim();
        let category_id = groupImageSide.dataset.category_id;
        let currentTime = groupImageSide.dataset.time;
        updateGroup(groupId, groupName, category_id, currentTime);
    }
});
document.body.addEventListener("click", async function (event) {
    if (event.target.classList.contains("groupDeleteBtn")) {
        let groupId = event.target.dataset.id;
        let groupImageCount = event.target.dataset.count;
        let groupImageSide = event.target.closest(".groupImageSide");
        let imgElement = groupImageSide.querySelector("img").src;

        deleteGroup(groupId, imgElement, groupImageCount);
    }
});
async function updateGroup(groupId, groupName, category_id, currentTime) {
    let groupAndCategory = await window.electronAPI.getGroupById();

    if (!groupAndCategory) {
        console.error("Group not found!");
        return;
    }

    createModal({
        title: "Update Group",
        inputs: [
            {
                label: "Group Name",
                type: "text",
                value: groupName,
            },
            {
                label: "Category",
                type: "select",
                options: groupAndCategory.categories.map(cat => ({
                    value: cat.id,
                    text: cat.name
                })),
                value: category_id
            },
            {
                label: "Set apply time",
                type: "time",
                value: currentTime || ""
            }
        ],
        buttons: [
            { text: "Cancel", class: "cancel-btn", action: () => { } },
            {
                text: "Save",
                class: "apply-btn",
                action: async (values) => {

                    let [newGroupName, categoryId, newTime] = values;
                    let isNameChanged = newGroupName.trim() !== groupName.trim();
                    let isCategoryChanged = Number(categoryId) !== Number(category_id);
                    let isTimeChanged = (currentTime === "null" && newTime) || (currentTime !== "null" && newTime !== currentTime);
                    if (isNameChanged || isCategoryChanged || isTimeChanged) {
                        let status = await window.electronAPI.updateGroup({
                            name: newGroupName,
                            category: categoryId,
                            time: newTime,
                            id: groupId
                        });
                        showMessage(status.message, status.status);
                    }
                }
            }
        ],
    });
}
async function deleteGroup(groupId, imgUrl, groupImageCount) {
    if (!groupId) {
        showMessage("Group not found", "error");
        return;
    }
    createModal(
        {
            title: "Are you sure you want to delete this group?",
            customHTML: `</br><h6>With this operation, you can only delete the group name.</h6>
            </br>
            <div style="width=:400px; height:250px; border-radius:20px; overflow:hidden; position:relative;">
            <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">
            <div style="padding:10px 20px; border-radius:15px; background:rgba(255,255,255,0.1); position:absolute; bottom:10px; left:10px; backdrop-filter:blur(5px);">
                <p>
                    Contains Image: ${groupImageCount}
                </p>
            </div>
            </div>
            
            `,
            buttons: [
                { text: "Cancel", class: "apply-btn", action: () => { } },
                {
                    text: "Delete",
                    class: "cancel-btn",
                    action: async () => {
                        let status = await window.electronAPI.deleteGroup(groupId);
                        removeGroupFromUI(groupId);
                        showMessage(status.message, status.status);
                    }
                }
            ]
        }
    );
}
document.body.addEventListener("click", async function (event) {
    if (event.target.classList.contains("imageCount")) {
        let groupId = event.target.dataset.id;
        groupDetail(groupId);
    }
});
document.body.addEventListener("click", async function (event) {
    if (event.target.classList.contains("deleteNoImageGroup")) {
        let groupId = event.target.dataset.id;
        delateNoGroup(groupId);
    }
});
async function groupDetail(group_id) {
    if (!group_id) {
        showMessage("No group found", "error");
        return;
    }
    let thisGroup = await window.electronAPI.getImageGroupById(group_id);
    if (!thisGroup) {
        showMessage("No group found", "error");
        return;
    }
    
    createModal({
        title: "Group Detail",
        message: "The Group Includes Images",
        customHTML: `
        <div style="width:auto; height:380px; display:flex; flex-direction:column; justify-content:flex-start; position:relative;">
        ${createImageGallery(thisGroup.all_images)}
        <div class="groupDetailInfo">
            <p>Id: ${thisGroup.group_id}</p>
            <p>Category: ${thisGroup.category_name}</p>
            <p>Created By: ${thisGroup.uploaded_by}</p>
            <p>Created At: ${thisGroup.created_at}</p>
            <p>Name: ${thisGroup.group_name}</p>
            <p>Total Images: ${thisGroup.total_images}</p>
        </div>
        </div>
        `,
        buttons: [
            { text: "Close", class: "apply-btn", action: () => { } }
        ]
    })
}
async function delateNoGroup(groupId) {
    if (!groupId) {
        showMessage("No group found", "error");
        return;
    }
    createModal({
        title: "Are you sure you want to delete this group?",
        message: "This group name will be completely deleted from the system",
        buttons: [
            { text: "Cancel", class: "apply-btn", action: () => { } },
            {
                text: "Delete",
                class: "cancel-btn",
                action: async () => {
                    let status = await window.electronAPI.deleteGroup(groupId);
                    removeNoImageGroupFromUI(groupId);
                    showMessage(status.message, status.status);
                }
            }
        ]
    })
}
function removeGroupFromUI(imageId) {
    const imageBox = document.querySelector(`.groupBox[data-id="${imageId}"]`);
    if (imageBox) {
        imageBox.remove();
    } else {
        showMessage("Failed to delete image from ui please reload", "error");
    }
}
function removeNoImageGroupFromUI(imageId) {
    const imageBox = document.querySelector(`.noImageGroupBox[data-id="${imageId}"]`);
    if (imageBox) {
        imageBox.remove();
    } else {
        showMessage("Failed to delete image from ui please reload", "error");
    }
}