"use client";

import { useState, useEffect, useMemo, useRef, MouseEvent, useTransition } from "react";
import categoriesData from "../app/data/categories.json";
import itemsData from "../app/data/items.json";
import FoodCard from "./FoodCard";
import Header from "./Header";
import Footer from "./Footer";
import ItemModal from "./ItemModal";
import CategoryIcon from "./CategoryIcon";

import { Language, Category, Product } from "../types";
import { siteText, FALLBACK_IMAGE, branches } from "../constants";

export default function MenuClient({ initialLang }: { initialLang: Language }) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [spacerHeight, setSpacerHeight] = useState<number>(0);
  const [, startTransition] = useTransition();

  const navScrollRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navSentinelRef = useRef<HTMLDivElement>(null);
  const isStickyRef = useRef<boolean>(false);
  const uncollapsedHeightRef = useRef<number>(140);
  const isUserClickingNav = useRef<boolean>(false);

  const t = siteText[lang];
  const ghazieh = branches[0];

  // 1. Categories sorted by order
  const categories = useMemo(() => {
    return [...(categoriesData as Category[])].sort(
      (a, b) => (a.order || 9999) - (b.order || 9999)
    );
  }, []);

  // 2. All available products
  const allProducts = useMemo(() => {
    return (itemsData as Product[]).filter((p) => p.isAvailable !== false);
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

  // Helper to shift mobile collapsed slider to show the active row (first 4 vs bottom 4)
  const shiftSliderToActiveRow = (catId: string, smooth: boolean = true) => {
    const container = navScrollRef.current;
    if (!container) return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const activeIdx = categories.findIndex((c) => c.id === catId);
    if (activeIdx < 0) return;

    const isBottomRow = activeIdx >= 4;
    const isRTL = document.documentElement.dir === "rtl";

    if (!isBottomRow) {
      container.scrollTo({
        left: 0,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      if (container.scrollWidth <= container.clientWidth) {
        requestAnimationFrame(() => {
          shiftSliderToActiveRow(catId, smooth);
        });
        return;
      }

      const child4 = container.children[4] as HTMLElement | undefined;
      const childOffset = child4 ? child4.offsetLeft : 0;
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);

      let targetLeft = childOffset > 0 ? childOffset : maxScroll;
      if (isRTL) {
        targetLeft = -maxScroll;
      }

      container.scrollTo({
        left: targetLeft,
        behavior: smooth ? "smooth" : "auto",
      });

      if (isRTL && container.scrollLeft === 0 && maxScroll > 0) {
        container.scrollTo({
          left: maxScroll,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    }
  };

  // Auto-scroll the slider to the active category row (first 4 vs bottom 4) when collapsed on mobile
  useEffect(() => {
    if (!isSticky || !navScrollRef.current) return;

    const rafId = requestAnimationFrame(() => {
      shiftSliderToActiveRow(activeCategory, true);
    });

    return () => cancelAnimationFrame(rafId);
  }, [activeCategory, isSticky, categories]);

  // Measure uncollapsed height on mount and resize
  useEffect(() => {
    const updateUncollapsedHeight = () => {
      if (!isStickyRef.current && navRef.current) {
        uncollapsedHeightRef.current = navRef.current.offsetHeight;
      }
    };
    updateUncollapsedHeight();

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const collapsedH = 48;
      if (!isStickyRef.current && navRef.current) {
        uncollapsedHeightRef.current = navRef.current.offsetHeight;
      } else if (isStickyRef.current) {
        const uncollapsedH = uncollapsedHeightRef.current || (isMobile ? 140 : 86);
        setSpacerHeight(Math.max(0, uncollapsedH - collapsedH));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update sticky state helper
  const updateStickyState = (stuck: boolean) => {
    if (stuck !== isStickyRef.current) {
      const isMobile = window.innerWidth < 768;
      const collapsedH = 48;
      if (stuck) {
        if (navRef.current) {
          uncollapsedHeightRef.current = navRef.current.offsetHeight;
        }
        const uncollapsedH = uncollapsedHeightRef.current || (isMobile ? 140 : 86);
        setSpacerHeight(Math.max(0, uncollapsedH - collapsedH));
        requestAnimationFrame(() => {
          shiftSliderToActiveRow(activeCategory, true);
        });
      } else {
        setSpacerHeight(0);
        if (navScrollRef.current) {
          navScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }
        requestAnimationFrame(() => {
          if (navRef.current && !isStickyRef.current) {
            uncollapsedHeightRef.current = navRef.current.offsetHeight;
          }
        });
      }
      isStickyRef.current = stuck;
      setIsSticky(stuck);
    }
  };

  // Check initial scroll on mount
  useEffect(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const isMobile = window.innerWidth < 768;
    if (scrollY > (isMobile ? 50 : 80)) {
      updateStickyState(true);
    }
  }, []);

  // Smooth scroll to category
  const handleScrollToCategory = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveCategory(id);
    isUserClickingNav.current = true;
    shiftSliderToActiveRow(id, true);

    const el = document.getElementById(id);
    if (el) {
      const collapsedNavHeight = 48;
      const navOffset = collapsedNavHeight + 12;
      const targetY = el.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });

      setTimeout(() => {
        isUserClickingNav.current = false;
      }, 450);
    }
  };

  // Scroll listener for sticky collapse and active category
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          const isMobile = window.innerWidth < 768;
          // Responsive upwards collapse trigger as soon as user slides/drags down past top bar
          const collapseThreshold = isMobile ? 50 : 80;
          const expandThreshold = 15;

          if (!isStickyRef.current && scrollY > collapseThreshold) {
            updateStickyState(true);
          } else if (isStickyRef.current && scrollY <= expandThreshold) {
            updateStickyState(false);
          }

          if (!isUserClickingNav.current) {
            const currentNavHeight = isStickyRef.current
              ? 48
              : (navRef.current?.offsetHeight || (isMobile ? 140 : 86));
            const navOffset = currentNavHeight + 20;

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

      {/* Sticky detection sentinel */}
      <div ref={navSentinelRef} className="nav-sticky-sentinel" aria-hidden="true" />

      {/* 2. Category Block Navigation (turns into horizontal slider when collapsed on mobile) */}
      <nav
        id="category-nav"
        ref={navRef}
        className={isSticky ? "is-sticky" : ""}
        aria-label="Menu categories"
      >
        <div className="nav-container">
          <div className="nav-blocks-grid" ref={navScrollRef}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <a
                  key={cat.id}
                  className={`nav-block ${isActive ? "active" : ""}`}
                  href={`#${cat.id}`}
                  data-category-id={cat.id}
                  onClick={(e) => handleScrollToCategory(e, cat.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  {cat.icon && <CategoryIcon icon={cat.icon} className="nav-block-icon" />}
                  <span className="nav-block-label">{getText(cat.name)}</span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer placed AFTER nav to prevent layout shift without displacing sticky nav */}
      <div
        className="nav-sticky-spacer"
        style={{ height: isSticky ? `${spacerHeight}px` : "0px" }}
        aria-hidden="true"
      />

      {/* 3. Main Menu Content */}
      <main id="menu-container">
        {categories.map((cat) => {
          const items = productsByCategory[cat.id] || [];

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
                      <CategoryIcon icon={cat.icon} />
                    </span>
                  )}
                  <h2 className="category-heading">{getText(cat.name)}</h2>
                </div>
              </div>

              {items.length > 0 ? (
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
              ) : (
                <div className="empty-category-card">
                  <div className="empty-category-icon" aria-hidden="true">
                    <CategoryIcon icon={cat.icon || "fa-solid fa-utensils"} />
                  </div>
                  <h3 className="empty-category-title">
                    {lang === "ar" ? "قريباً" : "Coming Soon"}
                  </h3>
                  <p className="empty-category-desc">
                    {lang === "ar"
                      ? `أصناف ${getText(cat.name)} قيد الإعداد وستتوفر قريباً!`
                      : `Items for ${getText(cat.name)} are being prepared and will be added soon!`}
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* 4. Footer */}
      <Footer lang={lang} />

      {/* 5. Mobile Floating WhatsApp Button (Arrow up removed) */}
      <div className="floating-action-bar">
        <a
          href={`https://wa.me/${ghazieh.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
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
