export function createImageGallery(images) {
    if (!images || images.length === 0) {
        console.error("No images provided for the gallery.");
        return "";
    }

    const galleryId = `gallery-${Math.random().toString(36).substr(2, 9)}`;

    const galleryHtml = `
        <div class="image-gallery" id="${galleryId}">
            <div class="gallery-wrapper">
                ${images.map((img, idx) => `
                    <div class="gallery-item">
                        <img src="${img}" alt="Image ${idx + 1}">
                    </div>
                `).join("")}
            </div>
        </div>
        <style>
            .image-gallery {
                position: relative;
                width: 670px;
                height: 235px;
                margin: 20px auto;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px;
            }
            .gallery-wrapper {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-content: flex-start;
            }
            .gallery-item {
                width: 150px;
                height: 100px;
                flex: 0 0 auto;
            }
            .gallery-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .image-gallery::-webkit-scrollbar {
                width: 8px;
            }
            .image-gallery::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
            }
            .image-gallery::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        </style>
    `;

    return galleryHtml;
}