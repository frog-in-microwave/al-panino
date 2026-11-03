"use client";

import { Language } from "../types";
import { siteText, branches } from "../constants";

interface HeaderProps {
  lang: Language;
  changeLanguage: (newLang: Language) => void;
}

export default function Header({ lang, changeLanguage }: HeaderProps) {
  const t = siteText[lang];
  const ghazieh = branches[0];

  return (
    <header className="brand-hero">
      {/* Top bar with language switcher */}
      <div className="hero-top-bar">
        <div className="language-toggle" role="group" aria-label="Language selector">
          <button
            id="lang-en"
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            type="button"
            onClick={() => changeLanguage("en")}
            aria-pressed={lang === "en"}
          >
            EN
          </button>
          <button
            id="lang-ar"
            className={`lang-btn ${lang === "ar" ? "active" : ""}`}
            type="button"
            onClick={() => changeLanguage("ar")}
            aria-pressed={lang === "ar"}
          >
            عربي
          </button>
        </div>
      </div>

      {/* Brand Logo - 60% of screen width */}
      <div className="brand-content">
        <div className="logo-wrapper">
          <img
            src="/data/layout_images/logo_pic.avif"
            alt="Al Panino Snack"
            className="restaurant-logo"
            fetchPriority="high"
          />
        </div>

        <h1 className="sr-only">Al Panino Snack</h1>

        {/* Action Buttons: WhatsApp & Call side-by-side horizontally, slightly smaller */}
        <div className="hero-action-buttons">
          <a
            href={`tel:${ghazieh.phone}`}
            className="action-btn call-action-btn"
            aria-label={t.callUs}
          >
            <i className="fa-solid fa-phone"></i>
            <span>{t.callUs}</span>
          </a>

          <a
            href={`https://wa.me/${ghazieh.whatsapp}?text=${encodeURIComponent(
              t.whatsappGreeting
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn whatsapp-action-btn"
            aria-label={t.orderViaWhatsapp}
          >
            <i className="fa-brands fa-whatsapp"></i>
            <span>{t.orderViaWhatsapp}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
