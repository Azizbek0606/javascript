export function createModal({
    title = "Modal Title",
    message = "",
    inputs = [],
    buttons = [],
    customHTML = "",
    onClose = () => { }
}) {
    document.querySelector(".custom-modal")?.remove();

    const modal = document.createElement("div");
    modal.className = "custom-modal";
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="modal-body">${customHTML}</div>
            <div class="modal-inputs"></div>
            <div class="modal-buttons"></div>
        </div>
    `;

    modal.querySelector(".modal-overlay").onclick = closeModal;
    modal.querySelector(".modal-close").onclick = closeModal;
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

    function closeModal() {
        modal.remove();
        onClose();
    }

    const inputContainer = modal.querySelector(".modal-inputs");
    const groupedInputs = {};

    inputs.forEach((input) => {
        const key = input.complex || "simple";
        if (!groupedInputs[key]) {
            groupedInputs[key] = [];
        }
        groupedInputs[key].push(input);
    });

    Object.entries(groupedInputs).forEach(([groupName, group]) => {
        const row = document.createElement("div");
        row.className = groupName === "simple" ? "modal-input-row" : "modal-input-row complex";

        group.forEach((input) => {
            const wrapper = document.createElement("div");
            wrapper.className = "modal-input-wrapper";

            if (input.label) {
                const label = document.createElement("label");
                label.textContent = input.label;
                wrapper.appendChild(label);
            }

            let inputField;
            if (input.type === "textarea") {
                inputField = document.createElement("textarea");
            } else if (input.type === "select") {
                inputField = document.createElement("select");
                input.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt.value;
                    option.textContent = opt.text;
                    if (opt.value === input.value) {
                        option.selected = true;
                    }
                    inputField.appendChild(option);
                });
            } else if (input.type === "checkbox") {
                inputField = document.createElement("input");
                inputField.type = "checkbox";
                inputField.checked = input.checked || false;
            } else {
                inputField = document.createElement("input");
                inputField.type = input.type || "text";

                if (input.type === "file" && input.accept) {
                    inputField.accept = input.accept;
                }

                if (input.type === "time") {
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, "0");
                    const minutes = String(now.getMinutes()).padStart(2, "0");
                    inputField.value = input.value || `${hours}:${minutes}`;
                }

            }

            inputField.placeholder = input.placeholder || "";
            inputField.value = input.value || "";
            inputField.dataset.label = input.label || "";

            wrapper.appendChild(inputField);
            row.appendChild(wrapper);
        });

        inputContainer.appendChild(row);
    });

    const buttonContainer = modal.querySelector(".modal-buttons");
    buttons.forEach((btn) => {
        const button = document.createElement("button");
        button.textContent = btn.text;
        button.className = btn.class || "default-btn";
        button.onclick = () => {
            const values = [...inputContainer.querySelectorAll("input, textarea, select")].map(input =>
                input.type === "file" ? input.files[0] : input.type === "checkbox" ? input.checked : input.value
            );
            btn.action(values);
            if (!btn.preventClose) closeModal();
        };
        buttonContainer.appendChild(button);
    });

    document.body.appendChild(modal);
}
