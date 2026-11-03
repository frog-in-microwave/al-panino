"use client";

import { useState, useEffect, useMemo, useRef, MouseEvent, useTransition } from "react";
import menuData from "../app/data/products.json";
import FoodCard from "./FoodCard";
import Header from "./Header";
import Footer from "./Footer";
import ItemModal from "./ItemModal";

import { Language, Category, Product } from "../types";
import { siteText, FALLBACK_IMAGE, branches } from "../constants";

export default function MenuClient({ initialLang }: { initialLang: Language }) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [, startTransition] = useTransition();

  const navScrollRef = useRef<HTMLDivElement>(null);
  const isUserClickingNav = useRef<boolean>(false);

  const t = siteText[lang];
  const ghazieh = branches[0];

  // 1. Categories sorted by order
  const categories = useMemo(() => {
    return [...(menuData.categories as Category[])].sort(
      (a, b) => (a.order || 9999) - (b.order || 9999)
    );
  }, []);

  // 2. All available products
  const allProducts = useMemo(() => {
    return (menuData.products as Product[]).filter((p) => p.isAvailable !== false);
  }, []);

  // 3. Grouped products by category
  const productsByCategory = useMemo(() => {
    const map: Record<string, Product[]> = {};
    allProducts.forEach((p) => {
      if (!map[p.categoryId]) map[p.categoryId] = [];
      map[p.categoryId].push(p);
    });

    for (const key in map) {
      map[key].sort((a, b) => {
        const orderDiff = (a.order || 9999) - (b.order || 9999);
        if (orderDiff !== 0) return orderDiff;
        const aName = (a.name as any)[lang] || a.name.en || "";
        const bName = (b.name as any)[lang] || b.name.en || "";
        return aName.localeCompare(bName, lang);
      });
    }
    return map;
  }, [allProducts, lang]);

  // Set initial category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Sync document language & direction
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Language switcher
  const changeLanguage = (newLang: Language) => {
    startTransition(() => {
      setLang(newLang);
    });
    document.cookie = `restaurant-language=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const getText = (textObj: any) => {
    if (!textObj) return "";
    if (typeof textObj === "string") return textObj;
    return textObj[lang] || textObj.en || "";
  };

  // Smooth scroll to category
  const handleScrollToCategory = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveCategory(id);
    isUserClickingNav.current = true;

    const el = document.getElementById(id);
    if (el) {
      const navEl = document.getElementById("category-nav");
      const navOffset = navEl ? navEl.offsetHeight : 70;
      const targetY = el.getBoundingClientRect().top + window.scrollY - navOffset - 10;

      window.scrollTo({ top: targetY, behavior: "smooth" });

      setTimeout(() => {
        const activeLink = document.querySelector(`.nav-pill[data-category-id="${id}"]`);
        activeLink?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        isUserClickingNav.current = false;
      }, 350);
    }
  };

  // Scroll listener for sticky active category
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!isUserClickingNav.current) {
            const navEl = document.getElementById("category-nav");
            const navOffset = (navEl ? navEl.offsetHeight : 70) + 40;

            let currentId = activeCategory;
            for (const cat of categories) {
              const el = document.getElementById(cat.id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= navOffset && rect.bottom >= navOffset) {
                  currentId = cat.id;
                  break;
                }
              }
            }

            if (currentId && currentId !== activeCategory) {
              setActiveCategory(currentId);
              const activeLink = document.querySelector(
                `.nav-pill[data-category-id="${currentId}"]`
              );
              activeLink?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, activeCategory]);

  return (
    <div className="menu-app-wrapper">
      {/* 1. Brand Hero Header */}
      <Header lang={lang} changeLanguage={changeLanguage} />

      {/* 2. Sticky Category Navigation (without count badges) */}
      <nav id="category-nav" aria-label="Menu categories">
        <div className="nav-container">
          <div className="nav-scroll-wrapper" ref={navScrollRef}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <a
                  key={cat.id}
                  className={`nav-pill ${isActive ? "active" : ""}`}
                  href={`#${cat.id}`}
                  data-category-id={cat.id}
                  onClick={(e) => handleScrollToCategory(e, cat.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  {cat.icon && <i className={`${cat.icon} nav-pill-icon`} aria-hidden="true"></i>}
                  <span className="nav-pill-label">{getText(cat.name)}</span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. Main Menu Content (Background matching the hero color) */}
      <main id="menu-container">
        {categories.map((cat) => {
          const items = productsByCategory[cat.id] || [];
          if (items.length === 0) return null;

          return (
            <section
              key={cat.id}
              id={cat.id}
              className="category-section"
              data-category-id={cat.id}
            >
              <div className="category-section-header">
                <div className="category-title-wrapper">
                  {cat.icon && (
                    <span className="category-header-icon" aria-hidden="true">
                      <i className={cat.icon}></i>
                    </span>
                  )}
                  <h2 className="category-heading">{getText(cat.name)}</h2>
                </div>
              </div>

              <div className="cards-grid">
                {items.map((product) => (
                  <FoodCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    offerText={t.offer}
                    fallbackImage={FALLBACK_IMAGE}
                    onSelect={setActiveProduct}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* 4. Footer */}
      <Footer lang={lang} />

      {/* 5. Mobile Floating WhatsApp Button (Arrow up removed) */}
      <div className="floating-action-bar">
        <a
          href={`https://wa.me/${ghazieh.whatsapp}?text=${encodeURIComponent(
            t.whatsappGreeting
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fab-btn fab-whatsapp"
          aria-label={t.orderViaWhatsapp}
        >
          <i className="fa-brands fa-whatsapp"></i>
          <span className="fab-label">{t.orderViaWhatsapp}</span>
        </a>
      </div>

      {/* 6. Item Detail Modal (Restored to previous clean pop-up design) */}
      <ItemModal
        product={activeProduct}
        lang={lang}
        onClose={() => setActiveProduct(null)}
      />
    </div>
  );
}
