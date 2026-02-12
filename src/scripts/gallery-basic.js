import * as basicLightbox from "basiclightbox";
import "basiclightbox/dist/basicLightbox.min.css";

import { galleryItems } from "./data";

const list = document.querySelector(".gallery");

const createGallery = () =>
  galleryItems
    .map(
      ({ preview, description, original }) => `<li>
    <img src='${preview}' alt='${description}' data-source='${original}'>
    </li>`,
    )
    .join("");

list.innerHTML = createGallery();

list.addEventListener("click", onGalleryClick);

let instance;

function onGalleryClick(e) {
  if (e.target.tagName === "IMG") {
    const imgSource = e.target.dataset.source;

    instance = basicLightbox.create(
      `
      <img src='${imgSource}' width="800" height="600">
  `,
      {
        onClose: () => {
          document.removeEventListener("keydown", closeModal);
        },
      },
    );

    instance.show();

    document.addEventListener("keydown", closeModal);
  }
}

function closeModal(e) {
  console.log(123);
  if (e.code === "Escape") {
    instance.close();
  }
}
