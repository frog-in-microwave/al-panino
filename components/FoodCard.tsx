"use client";

import { KeyboardEvent, useState } from "react";
import { Product, Language } from "../types";

interface FoodCardProps {
  product: Product;
  lang: Language;
  offerText: string;
  fallbackImage: string;
  onSelect: (product: Product) => void;
}

export default function FoodCard({
  product,
  lang,
  offerText,
  fallbackImage,
  onSelect,
}: FoodCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getText = (textObj: any) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(product);
    }
  };

  const title = getText(product.name);
  const description = getText(product.description);
  const priceDisplay =
    product.price && product.price.trim() ? product.price : offerText;

  return (
    <article
      className="food-card"
      tabIndex={0}
      role="button"
      aria-label={`${title} - ${priceDisplay}`}
      onClick={() => onSelect(product)}
      onKeyDown={handleKeyDown}
    >
      {/* 1:1 Aspect Ratio Thumbnail Container */}
      <div className={`card-img-wrapper ${isLoaded ? "is-loaded" : ""}`}>
        {!isLoaded && <div className="card-skeleton" aria-hidden="true"></div>}

        <img
          src={hasError ? fallbackImage : product.image}
          alt={title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className="food-img"
        />
      </div>

      {/* Info & Content */}
      <div className="card-content">
        <h3 className="card-name">{title}</h3>

        {description && <p className="card-description">{description}</p>}

        <div className="card-footer-row">
          <div className="price-tag" dir="ltr">
            {priceDisplay}
          </div>
        </div>
      </div>
    </article>
  );
}
