"use client";

import { useState, useEffect } from "react";
import { Language, Product } from "../types";
import { siteText } from "../constants";

interface ItemModalProps {
  product: Product | null;
  lang: Language;
  onClose: () => void;
}

export default function ItemModal({ product, lang, onClose }: ItemModalProps) {
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  useEffect(() => {
    setIsImgLoaded(false);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  const getText = (textObj: any) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  return (
    <div
      id="item-modal"
      className={`modal ${product ? "active" : ""}`}
      aria-hidden={!product}
      onClick={onClose}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-btn"
          type="button"
          aria-label={siteText[lang].closeModal}
          onClick={onClose}
        >
          ×
        </button>

        {product && (
          <>
            <div className={`modal-img-container ${isImgLoaded ? "loaded" : ""}`}>
              {!isImgLoaded && <div className="card-skeleton"></div>}
              <img
                src={product.image}
                alt={getText(product.name)}
                id="modal-img"
                onLoad={() => setIsImgLoaded(true)}
              />
            </div>
            <div className="modal-text">
              <h2 id="modal-title">{getText(product.name)}</h2>
              <p id="modal-price" className="modal-price">
                {product.price && product.price.trim()
                  ? product.price
                  : siteText[lang].offer}
              </p>
              <p id="modal-desc">
                {product.description
                  ? getText(product.description)
                  : siteText[lang].defaultDescription}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
