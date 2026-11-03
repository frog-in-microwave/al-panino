"use client";

import { Language } from "../types";
import { siteText, branches } from "../constants";

interface FooterProps {
  lang: Language;
}

export default function Footer({ lang }: FooterProps) {
  const t = siteText[lang];

  return (
    <footer id="footer-section" className="site-footer">
      <div className="footer-container">
        {/* Brand identity summary in footer */}
        <div className="footer-brand-header">
          <img
            src="/data/layout_images/logo_transparent.png"
            alt="Al Panino Logo"
            className="footer-logo"
            width={160}
            height={160}
            loading="lazy"
            decoding="async"
          />
          <h3 className="footer-brand-title">{t.restaurantName} - {t.restaurantType}</h3>
          <p className="footer-brand-tagline">{t.tagline}</p>
        </div>

        {/* Branches Grid */}
        <div className="footer-branches-grid">
          {branches.map((b) => (
            <div key={b.id} className="footer-branch-card">
              <div className="branch-card-header">
                <i className="fa-solid fa-store branch-icon"></i>
                <h4 className="branch-title">{b.name[lang]}</h4>
              </div>

              <p className="branch-address">
                <i className="fa-solid fa-location-dot"></i>
                <span>{b.address[lang]}</span>
              </p>

              <div className="branch-actions-row">
                <a href={`tel:${b.phone}`} className="branch-action-pill">
                  <i className="fa-solid fa-phone"></i>
                  <span dir="ltr">{b.phoneDisplay}</span>
                </a>
                <a
                  href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(t.whatsappGreeting)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="branch-action-pill branch-whatsapp-pill"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Map embed */}
              <div className="branch-map-wrapper">
                <iframe
                  title={`${b.name[lang]} Google Map`}
                  src={b.mapEmbedUrl}
                  width="100%"
                  height="160"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen={false}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ))}
        </div>

        {/* Social Media & Contact */}
        <div className="footer-social-section">
          <p className="social-heading">{t.visitUs}</p>
          <div className="social-links-list">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="social-btn"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="social-btn"
            >
              <i className="fa-brands fa-tiktok"></i>
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="social-btn"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href={`https://wa.me/${branches[0].whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(t.whatsappGreeting)}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="social-btn"
            >
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="footer-bottom-bar">
          <p>{t.footerBottom}</p>
        </div>
      </div>
    </footer>
  );
}
