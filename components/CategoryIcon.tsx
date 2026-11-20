import React from "react";

interface CategoryIconProps {
  icon?: string;
  className?: string;
}

export default function CategoryIcon({ icon, className = "" }: CategoryIconProps) {
  if (!icon) return null;

  switch (icon) {
    case "appetizers":
    case "fa-solid fa-cheese":
    case "french-fries":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="57" rx="19" ry="3" fill="#000000" fillOpacity="0.10" />

          {/* Red Scoop Fry Box (Back) */}
          <path
            d="M15 31 C21 35 43 35 49 31 L45.5 54 C45.5 55.5 44 56.5 42 56.5 L22 56.5 C20 56.5 18.5 55.5 18.5 54 Z"
            fill="#991B1B"
          />

          {/* Back Shadow Depth */}
          <rect x="18" y="27" width="28" height="6" rx="2" fill="#7F1D1D" fillOpacity="0.5" />

          {/* Golden French Fries - Back Layer */}
          <rect x="29" y="8" width="5.5" height="28" rx="2" fill="#D97706" />
          <rect x="22" y="11" width="5" height="26" rx="2" fill="#D97706" transform="rotate(-8 22 11)" />
          <rect x="37" y="11" width="5" height="26" rx="2" fill="#D97706" transform="rotate(8 37 11)" />
          <rect x="16" y="17" width="5" height="22" rx="2" fill="#B45309" transform="rotate(-18 16 17)" />
          <rect x="43" y="16" width="5" height="22" rx="2" fill="#B45309" transform="rotate(18 43 16)" />

          {/* Mid Layer Golden Crispy Fries */}
          <rect x="27.5" y="10" width="5" height="26" rx="1.8" fill="#F59E0B" />
          <rect x="21" y="13" width="4.8" height="24" rx="1.8" fill="#FBBF24" transform="rotate(-6 21 13)" />
          <rect x="38" y="13" width="4.8" height="24" rx="1.8" fill="#FBBF24" transform="rotate(7 38 13)" />
          <rect x="33" y="14" width="4.8" height="23" rx="1.8" fill="#FCD34D" transform="rotate(2 33 14)" />

          {/* Front Layer Highlight Fries */}
          <rect x="25" y="16" width="4.5" height="20" rx="1.5" fill="#FDE68A" transform="rotate(-3 25 16)" />
          <rect x="34.5" y="17" width="4.5" height="19" rx="1.5" fill="#FEF08A" transform="rotate(4 34.5 17)" />

          {/* Red Scoop Fry Box (Front) */}
          <path
            d="M14 30 L18 54 C18.5 55.5 20 56.5 22 56.5 L42 56.5 C44 56.5 45.5 55.5 46 54 L50 30 C41 35 23 35 14 30 Z"
            fill="#DC2626"
          />

          {/* Box Highlight on Left */}
          <path
            d="M17 32 L20.5 53"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeLinecap="round"
          />

          {/* Golden Snack Arch */}
          <path
            d="M26 44 C29.5 48 34.5 48 38 44"
            stroke="#FDE047"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "salads":
    case "fa-solid fa-leaf":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="57" rx="20" ry="3.2" fill="#000000" fillOpacity="0.10" />

          {/* Ceramic Salad Bowl Body with clear contrast */}
          <path
            d="M11 32 C11 46 20.5 54.5 32 54.5 C43.5 54.5 53 46 53 32 Z"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* Bowl Base Shading */}
          <path
            d="M17 44 C21 51 26.5 54.5 32 54.5 C37.5 54.5 43 51 47 44 C38 48 26 48 17 44 Z"
            fill="#E2E8F0"
          />

          {/* Bowl Rim */}
          <ellipse cx="32" cy="32" rx="21" ry="4.5" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.2" />
          <ellipse cx="32" cy="32" rx="19.5" ry="3.5" fill="#14532D" />

          {/* Lush Green Salad Leaves (Back) */}
          <path
            d="M16 28 C11 20 18 11 27 16 C32 10 42 12 43 20 C49 14 56 21 50 28 Z"
            fill="#15803D"
          />
          <path
            d="M19 26 C23 16 33 16 35 24 C39 17 48 18 47 27 Z"
            fill="#16A34A"
          />

          {/* Crisp Romaine Leaves (Front) */}
          <path
            d="M14 31 C12 24 21 21 24 27 C29 19 39 21 38 29 C45 23 51 27 49 33 Z"
            fill="#22C55E"
          />

          {/* Ripe Cherry Tomatoes */}
          <path d="M22 21 C22 16 27 14 31 18 C27 22 23 23 22 21 Z" fill="#EF4444" />
          <circle cx="26.5" cy="18" r="0.9" fill="#FEF08A" />

          <path d="M38 19 C42 15 47 17 46 22 C41 23 38 22 38 19 Z" fill="#DC2626" />
          <circle cx="42.5" cy="19" r="0.9" fill="#FEF08A" />

          {/* Cucumber Slices with Rind */}
          <circle cx="20" cy="28" r="4.2" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
          <circle cx="20" cy="28" r="3" fill="#BBF7D0" />
          <circle cx="20" cy="28" r="0.9" fill="#15803D" />

          <circle cx="44" cy="27" r="4.2" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
          <circle cx="44" cy="27" r="3" fill="#BBF7D0" />
          <circle cx="44" cy="27" r="0.9" fill="#15803D" />

          {/* Red Onion Ring Slice */}
          <path
            d="M28 23 C32 19 37 20 38 25"
            stroke="#C084FC"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M29.5 24 C32.5 21 35.5 21.5 36.5 25"
            stroke="#F3E8FF"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Golden Sweet Corn */}
          <circle cx="31" cy="28" r="1.5" fill="#FACC15" />
          <circle cx="35" cy="27" r="1.4" fill="#FACC15" />
          <circle cx="28" cy="30" r="1.3" fill="#EAB308" />
        </svg>
      );

    case "wraps":
    case "custom-wrap":
    case "wrap":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="56" rx="21" ry="3.2" fill="#000000" fillOpacity="0.10" />

          {/* Tortilla Wrap Body */}
          <path
            d="M15 44 C13 38 16 30 23 25 L41 13 C45 10 49 11 51 14 C53 17 52 22 47 26 L29 48 C24 53 17 50 15 44 Z"
            fill="#FDE68A"
            stroke="#F59E0B"
            strokeWidth="1"
          />

          {/* Toasted Grill Marks */}
          <line x1="22" y1="30" x2="28" y2="37" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.75" />
          <line x1="30" y1="25" x2="36" y2="32" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.75" />
          <line x1="38" y1="20" x2="44" y2="27" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.75" />

          {/* Tortilla Fold Seam */}
          <path d="M17 45 C24 41 34 30 45 20" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />

          {/* Sliced Face showing delicious fillings (Not white!) */}
          <ellipse cx="44.5" cy="18.5" rx="7.5" ry="9.5" transform="rotate(35 44.5 18.5)" fill="#FCD34D" stroke="#D97706" strokeWidth="1.2" />
          <ellipse cx="44.5" cy="18.5" rx="6" ry="8" transform="rotate(35 44.5 18.5)" fill="#FEF3C7" />

          {/* Crispy Chicken Tender Pieces */}
          <circle cx="43" cy="17" r="3.2" fill="#EA580C" />
          <circle cx="43" cy="17" r="2.2" fill="#F97316" />

          {/* Fresh Lettuce & Herbs */}
          <path d="M40 14 C42 12 45 13 44 16 C42 17 39 16 40 14 Z" fill="#16A34A" />
          <path d="M42 21 C40 23 43 25 46 23 C47 21 44 19 42 21 Z" fill="#22C55E" />

          {/* Diced Ripe Tomato */}
          <rect x="45" y="19" width="3.2" height="3.2" rx="0.8" fill="#EF4444" />

          {/* Creamy Garlic Sauce Drip */}
          <path d="M41 18 C40 21 42 23 42 26" stroke="#FEF9C3" strokeWidth="2.2" strokeLinecap="round" />

          {/* Front Wrap Layer */}
          <path
            d="M15 44 C17 50 25 51 30 47 L46 27 C48 24 47 21 45 19 L42 18 C39 21 24 39 15 44 Z"
            fill="#FBBF24"
            fillOpacity="0.4"
          />
        </svg>
      );

    case "sandwiches":
    case "fa-solid fa-bread-slice":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="56" rx="22" ry="3.2" fill="#000000" fillOpacity="0.10" />

          {/* Bottom Baguette Bun */}
          <path d="M10 43 C10 49 16 53 25 53 L39 53 C48 53 54 49 54 43 L10 43 Z" fill="#B45309" />
          <path d="M12 43 C12 48 18 51 26 51 L38 51 C46 51 52 48 52 43 L12 43 Z" fill="#D97706" />

          {/* Seasoned Roast Meat Layer */}
          <rect x="11" y="39" width="42" height="4.5" rx="2" fill="#7F1D1D" />
          <rect x="15" y="38" width="16" height="3.5" rx="1.5" fill="#991B1B" />
          <rect x="33" y="38" width="16" height="3.5" rx="1.5" fill="#991B1B" />

          {/* Melted Cheddar Cheese Drips */}
          <path d="M12 36 L16 43 L22 36 L28 44 L36 36 L44 43 L52 36 Z" fill="#F59E0B" />

          {/* Ripe Tomato Slices */}
          <rect x="14" y="32" width="10" height="5" rx="2.5" fill="#EF4444" />
          <rect x="27" y="32" width="10" height="5" rx="2.5" fill="#DC2626" />
          <rect x="40" y="32" width="10" height="5" rx="2.5" fill="#EF4444" />

          {/* Wavy Ruffled Green Lettuce Leaf */}
          <path
            d="M8 33 C11 29 15 35 19 31 C23 35 27 30 31 34 C35 29 39 35 43 31 C47 35 51 30 54 33 C56 35 55 37 52 37 L12 37 C9 37 7 35 8 33 Z"
            fill="#22C55E"
          />

          {/* Top Baguette Roll */}
          <path
            d="M9 30 C9 17 19 13 32 13 C45 13 55 17 55 30 C55 32 53 33 49 33 L15 33 C11 33 9 32 9 30 Z"
            fill="#D97706"
          />
          <path
            d="M13 28 C13 19 20 15 32 15 C44 15 51 19 51 28 C47 29 17 29 13 28 Z"
            fill="#F59E0B"
          />

          {/* Baker's Score Cuts on Crust */}
          <path d="M20 18 C22 22 24 25 25 27" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M30 18 C32 22 34 25 35 27" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M40 18 C42 22 44 25 45 27" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />

          {/* Sesame Seeds */}
          <circle cx="27" cy="21" r="0.9" fill="#FEF3C7" />
          <circle cx="37" cy="22" r="0.9" fill="#FEF3C7" />
          <circle cx="47" cy="24" r="0.9" fill="#FEF3C7" />
          <circle cx="17" cy="24" r="0.9" fill="#FEF3C7" />
        </svg>
      );

    case "ciabata":
    case "custom-ciabata":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="56" rx="22" ry="3.2" fill="#000000" fillOpacity="0.10" />

          {/* Bottom Ciabatta Crust */}
          <path d="M10 44 C10 49 16 53 25 53 L39 53 C48 53 54 49 54 44 L10 44 Z" fill="#9A3412" />
          <path d="M12 44 C12 48 18 51 26 51 L38 51 C46 51 52 48 52 44 L12 44 Z" fill="#C2410C" />

          {/* Cured Meat Layers */}
          <rect x="12" y="40" width="40" height="4.5" rx="2" fill="#831843" />

          {/* Melted Mozzarella & Cheddar with Drips */}
          <path
            d="M12 37 C16 37 17 43 21 43 C25 43 26 37 31 37 C35 37 36 44 41 44 C46 44 47 37 52 37 L52 35 L12 35 Z"
            fill="#F59E0B"
          />
          <path d="M21 43 C22 46.5 24.5 46.5 25.5 43" fill="#FBBF24" />
          <path d="M37 42 C38 45.5 41 45.5 42 42" fill="#FBBF24" />

          {/* Fresh Basil Leaves */}
          <path d="M15 36 C18 33 22 36 24 35 L22 38 Z" fill="#15803D" />
          <path d="M42 36 C45 33 49 36 51 35 L49 38 Z" fill="#15803D" />

          {/* Sliced Tomato Layer */}
          <rect x="25" y="36" width="14" height="4" rx="2" fill="#DC2626" />

          {/* Top Rustic Pressed Ciabatta Loaf (Properly Centered) */}
          <path
            d="M10 34 C8 21 16 13 32 13 C48 13 56 21 54 34 L10 34 Z"
            fill="#D97706"
          />
          <path
            d="M13 32 C12 23 18 15 32 15 C46 15 52 23 51 32 L13 32 Z"
            fill="#F59E0B"
          />

          {/* Rich Dark Brown Panini Grill Press Marks */}
          <line x1="17" y1="19" x2="25" y2="33" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="26" y1="17" x2="34" y2="33" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="35" y1="17" x2="43" y2="33" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="44" y1="19" x2="50" y2="32" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" />

          {/* Rustic Flour Dust Specks */}
          <circle cx="21" cy="24" r="1.1" fill="#FFFFFF" fillOpacity="0.45" />
          <circle cx="39" cy="23" r="1.1" fill="#FFFFFF" fillOpacity="0.45" />
        </svg>
      );

    case "beef-burger":
    case "fa-solid fa-burger":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="57" rx="21" ry="3.2" fill="#000000" fillOpacity="0.10" />

          {/* Bottom Bun */}
          <path d="M13 46 C13 51 18 54 32 54 C46 54 51 51 51 46 L13 46 Z" fill="#B45309" />
          <path d="M15 46 C15 50 20 52 32 52 C44 52 49 50 49 46 L15 46 Z" fill="#D97706" />

          {/* Flame-Grilled Beef Patty */}
          <rect x="10" y="39" width="44" height="8" rx="4" fill="#3E1C0A" />
          <line x1="16" y1="43" x2="24" y2="43" stroke="#1F0D05" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="28" y1="43" x2="38" y2="43" stroke="#1F0D05" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="42" y1="43" x2="48" y2="43" stroke="#1F0D05" strokeWidth="1.6" strokeLinecap="round" />

          {/* Melted Cheddar Cheese with Drooping Corners */}
          <path d="M12 37 L20 44 L28 37 L38 45 L48 37 L52 40 L52 37 Z" fill="#F59E0B" />

          {/* Juicy Red Tomato Slices */}
          <rect x="13" y="32" width="38" height="6" rx="3" fill="#EF4444" />
          <rect x="16" y="33" width="14" height="4" rx="2" fill="#DC2626" />
          <rect x="34" y="33" width="14" height="4" rx="2" fill="#DC2626" />

          {/* Crisp Wavy Lettuce */}
          <path
            d="M9 32 C12 28 16 34 20 30 C24 34 28 29 32 33 C36 29 40 34 44 30 C48 34 52 29 55 32 C57 33 56 35 53 35 L11 35 C8 35 7 33 9 32 Z"
            fill="#22C55E"
          />

          {/* Plump Golden Top Bun */}
          <path d="M11 28 C11 14 20 10 32 10 C44 10 53 14 53 28 L11 28 Z" fill="#D97706" />
          <path d="M14 26 C14 16 22 12 32 12 C42 12 50 16 50 26 L14 26 Z" fill="#F59E0B" />

          {/* Radiating Sesame Seeds */}
          <ellipse cx="24" cy="18" rx="1.1" ry="1.9" transform="rotate(-25 24 18)" fill="#FEF3C7" />
          <ellipse cx="32" cy="15" rx="1.1" ry="1.9" fill="#FEF3C7" />
          <ellipse cx="40" cy="18" rx="1.1" ry="1.9" transform="rotate(25 40 18)" fill="#FEF3C7" />
          <ellipse cx="20" cy="23" rx="1.1" ry="1.9" transform="rotate(-40 20 23)" fill="#FEF3C7" />
          <ellipse cx="28" cy="22" rx="1.1" ry="1.9" transform="rotate(10 28 22)" fill="#FEF3C7" />
          <ellipse cx="36" cy="22" rx="1.1" ry="1.9" transform="rotate(-15 36 22)" fill="#FEF3C7" />
          <ellipse cx="44" cy="23" rx="1.1" ry="1.9" transform="rotate(35 44 23)" fill="#FEF3C7" />
        </svg>
      );

    case "chicken-burger":
    case "fa-solid fa-drumstick-bite":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="57" rx="21" ry="3.2" fill="#000000" fillOpacity="0.10" />

          {/* Bottom Bun */}
          <path d="M13 46 C13 51 18 54 32 54 C46 54 51 51 51 46 L13 46 Z" fill="#B45309" />
          <path d="M15 46 C15 50 20 52 32 52 C44 52 49 50 49 46 L15 46 Z" fill="#D97706" />

          {/* Ultra-Crispy Golden Fried Chicken Fillet */}
          <path
            d="M9 43 C8 40 10 38 13 39 C15 37 18 38 21 37 C24 36 27 38 31 37 C35 36 38 38 42 37 C45 36 48 39 51 38 C54 38 56 41 55 43 C54 46 52 48 49 48 C46 49 42 48 39 49 C35 49 31 48 27 49 C23 48 19 49 16 48 C12 48 9 46 9 43 Z"
            fill="#C2410C"
          />
          <path
            d="M11 42 C13 40 16 41 19 40 C22 39 26 40 30 39 C34 39 38 40 42 39 C46 39 49 41 52 41 C51 44 48 46 45 46 C40 47 34 46 29 47 C24 46 18 47 14 45 C12 44 11 43 11 42 Z"
            fill="#EA580C"
          />
          {/* Crunchy Crumbs */}
          <circle cx="16" cy="42" r="1.3" fill="#FBBF24" />
          <circle cx="26" cy="43" r="1.6" fill="#FBBF24" />
          <circle cx="36" cy="42" r="1.5" fill="#FBBF24" />
          <circle cx="46" cy="43" r="1.4" fill="#FBBF24" />

          {/* Crunchy Pickle Slices */}
          <circle cx="20" cy="36" r="4.2" fill="#15803D" stroke="#166534" strokeWidth="0.8" />
          <circle cx="20" cy="36" r="2.8" fill="#4ADE80" />
          <circle cx="34" cy="36" r="4.2" fill="#15803D" stroke="#166534" strokeWidth="0.8" />
          <circle cx="34" cy="36" r="2.8" fill="#4ADE80" />
          <circle cx="47" cy="36" r="3.8" fill="#15803D" stroke="#166534" strokeWidth="0.8" />

          {/* Creamy Garlic Mayo / Sauce Drip */}
          <path
            d="M12 34 C16 33 22 36 26 34 C30 36 36 33 40 36 C44 33 48 35 52 34 C50 37 46 38 42 37 C38 38 34 37 30 38 C26 37 20 38 15 37 Z"
            fill="#FEF9C3"
          />
          <path d="M22 36 C22 39.5 24 40.5 25 37" fill="#FEF9C3" />
          <path d="M38 36 C38 40.5 40 40.5 41 37" fill="#FEF9C3" />

          {/* Shredded Lettuce */}
          <path
            d="M10 32 C14 30 18 33 22 31 C26 33 30 30 34 33 C38 30 42 33 46 31 C50 33 54 30 55 32"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Top Seeded Bun */}
          <path d="M11 28 C11 14 20 10 32 10 C44 10 53 14 53 28 L11 28 Z" fill="#D97706" />
          <path d="M14 26 C14 16 22 12 32 12 C42 12 50 16 50 26 L14 26 Z" fill="#F59E0B" />

          {/* Sesame Seeds */}
          <ellipse cx="26" cy="17" rx="1.1" ry="1.9" transform="rotate(-20 26 17)" fill="#FEF3C7" />
          <ellipse cx="33" cy="15" rx="1.1" ry="1.9" fill="#FEF3C7" />
          <ellipse cx="40" cy="18" rx="1.1" ry="1.9" transform="rotate(25 40 18)" fill="#FEF3C7" />
          <ellipse cx="22" cy="22" rx="1.1" ry="1.9" transform="rotate(-30 22 22)" fill="#FEF3C7" />
          <ellipse cx="36" cy="22" rx="1.1" ry="1.9" transform="rotate(15 36 22)" fill="#FEF3C7" />
        </svg>
      );

    case "plates":
    case "fa-solid fa-utensils":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Ground Shadow */}
          <ellipse cx="32" cy="56" rx="23" ry="3.5" fill="#000000" fillOpacity="0.10" />

          {/* Ceramic Dinner Platter (Clearly visible on white backgrounds) */}
          <ellipse cx="32" cy="35" rx="25" ry="17" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <ellipse cx="32" cy="34" rx="23.5" ry="15.5" fill="#FFFFFF" />
          <ellipse cx="32" cy="34" rx="19" ry="12" fill="#F8FAFC" />

          {/* 1. Crispy Fried Chicken Tenders (Left) */}
          <path
            d="M16 32 C14 26 19 22 24 24 C28 26 28 32 24 35 C20 37 17 36 16 32 Z"
            fill="#C2410C"
          />
          <path
            d="M17 31 C16 27 19 24 23 26 C26 27 26 31 23 33 C20 35 18 34 17 31 Z"
            fill="#EA580C"
          />
          <path
            d="M21 37 C18 34 21 28 26 29 C30 30 31 35 27 38 C24 40 22 39 21 37 Z"
            fill="#C2410C"
          />
          <path
            d="M22 36 C20 34 22 30 25 31 C28 32 28 35 25 37 C23 38 22 37 22 36 Z"
            fill="#EA580C"
          />

          {/* 2. Golden French Fries (Right) */}
          <rect x="34" y="24" width="3.2" height="15" rx="1.5" fill="#F59E0B" transform="rotate(35 34 24)" />
          <rect x="37" y="22" width="3.2" height="16" rx="1.5" fill="#FBBF24" transform="rotate(45 37 22)" />
          <rect x="32" y="27" width="3.2" height="15" rx="1.5" fill="#F59E0B" transform="rotate(25 32 27)" />
          <rect x="36" y="26" width="3.2" height="14" rx="1.5" fill="#FDE047" transform="rotate(50 36 26)" />

          {/* 3. Fresh Salad Garnish (Center-Top) */}
          <circle cx="28" cy="22" r="3.5" fill="#22C55E" />
          <circle cx="33" cy="20" r="3" fill="#16A34A" />
          <circle cx="31" cy="22" r="1.8" fill="#EF4444" />

          {/* 4. Sauce Ramekin Cup (Center-Bottom) */}
          <ellipse cx="38" cy="39" rx="5" ry="3.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <ellipse cx="38" cy="38.5" rx="4" ry="2.5" fill="#DC2626" />
          <circle cx="39" cy="38" r="0.8" fill="#FFFFFF" fillOpacity="0.7" />
        </svg>
      );

    default:
      if (icon.startsWith("fa-")) {
        return <i className={`${icon} ${className}`} aria-hidden="true"></i>;
      }
      return null;
  }
}
