# 🥪 Al Panino - Cashier POS System

A high-performance, fast-paced Cashier Point of Sale (POS) system designed specifically for the counter staff at **Al Panino Snack** (Ghazieh Branch, Lebanon).

---

## 🚀 Quick Start

Start the application with a single command (requires Node.js, zero extra npm installs needed):

```bash
# In the cash/ directory:
npm start
# or
node server.js
```

Then open your browser to:
👉 **[http://localhost:4000](http://localhost:4000)**

---

## 📋 Features

### 1. Item Catalog & Fast Selection
- **Menu Items (`items.json`)**: 65 authentic Al Panino items across 9 active menu categories sourced directly from the official restaurant menu data:
  - **Appetizers (8 items)**: Mozzarella Sticks, Onion Rings, French Fries (Medium & Large), Potato Wedges, Curly Fries.
  - **Salads (4 items)**: Classic Caesar Salad, Chicken Caesar Salad, Italian Pasta Salad, Tuna Pasta Salad.
  - **Wraps (4 items)**: Arizona Wrap, Twister Wrap, Boneless Wrap, Cheese Filet Steak Wrap.
  - **Sandwiches (15 items)**: Chicken Sub, Francisco, Fajita, Burrito, Mexican Chicken, Chinese Chicken, Shish Tawook, Escalope, Crispy Sub, Steak Sub, Philadelphia, Rosto Beef, Grilled Shrimp, Hot Grilled Shrimp, Shrimp Pané.
  - **Ciabata (4 items)**: Panino Chicken Ciabatta, Panino Steak Ciabatta, Chicken Breast Ciabatta, Zinger Supreme Ciabatta.
  - **Beef Burger (6 items)**: Lebanese Beef Burger, Classic Cheeseburger, Mushroom Beef, Mexican Beef, Mozzarella Beef, American Beef.
  - **Chicken Burger (6 items)**: Classic Chicken Burger, Crunchy Chicken, Zinger Chicken, Mexican Chicken, Mushroom Chicken, Mozzarella Chicken.
  - **Plates (15 items)**: Grilled Chicken Plate, Chicken Sub Plate, Fajita Plate, Tawook Plate, Escalope Plate, Grilled Shrimp Plate, Fried Shrimp Plate, Crispy Chicken Meals (3, 5, 8, 10, 15, and 25-piece mega feast), Half Grilled Chicken, Whole Grilled Chicken.
  - **Drinks & Beverages (3 items)**: Pepsi Can, Fresh Ayran Yogurt, Mineral Water.
- **Dual Language Display**: Item names in both English and Arabic.
- **Dual Currency Reference**: Primary Lebanese Lira (`L.L.`) with live USD equivalent (`$`).
- **Instant Search**: Type `/` to search by English name, Arabic name, category, or price.
- **Category Filter Tabs**: Quick filtering with live item count badges.
- **Cart Indicators**: Badges on menu cards indicate current quantity in the active ticket.
- **Acoustic Feedback**: Subtle Web Audio synthesizer clicks on item tap for tactile speed.

### 2. Register & Active Ticket
- **Order Numbering**: Auto-incrementing order tickets (e.g. `#AP-1001`).
- **Order Types**: Quick toggles for **Takeaway 🛍️**, **Dine-In 🍽️**, and **Delivery 🛵**.
- **Line Item Controls**: Rapid quantity adjustment (`+` / `−`), single-click removal, and item-specific notes (e.g., *"No pickles"*, *"Extra garlic"*).
- **Customer Note**: Optional customer name, phone number, or table number.

### 3. Price Calculation & Tender Management (Cash Only)
- **Live Subtotal & Total**: Real-time sum of line items in Lebanese Lira (`L.L.`) and USD.
- **Quick Tender Buttons**: One-tap buttons for `Exact`, `200k`, `500k`, `1M`, and `2M` L.L.
- **Change Due Calculator**: Live high-contrast emerald green change calculator to prevent cashier mistakes.

### 4. Direct 1-Click Thermal Receipt Printing
- **Direct 1-Click Action**: Clicking **"CHECKOUT & PRINT RECEIPT"** (or pressing `Enter`) prints the ticket immediately without intermediate preview popups, resets the cart, and prepares for the next customer.
- **Accurate 80mm Receipt**: Formatted specifically for standard thermal receipt printers (Epson, Star Micronics, Xprinter, etc.).
- **Receipt Details**:
  - Al Panino logo, Ghazieh branch address, and contact numbers (+961 71 254 251).
  - Ticket number, timestamp, order type.
  - Itemized table with quantities, descriptions, notes, and line totals.
  - Total due in L.L. and USD, cash tendered, and change given.
  - Arabic and English friendly greetings (*"Sahtein! صحتين وهنا"*).
- **Print Stylesheet (`@media print`)**: Automatically isolates the receipt on print dialog, suppressing UI elements for a clean physical printout.
- **Reprint Anytime**: Instant 1-click reprint from the **Orders Log**.

### 5. Menu Management (`items.json`)
- Click **"Manage Items"** in the top bar to view, add, or delete items.
- All modifications are directly written to and read from `items.json`.

### 6. Cash Register & Orders Log Drawer Reconciliation
- **Live Cash Drawer in Header**: Real-time total cash in register displayed in top bar (`Drawer: X L.L.`).
- **Starting Cash Input (`register.json`)**: Click the Drawer button (or inside Orders Log / Shift Stats) to input the starting cash float (e.g. 2,000,000 L.L.) with quick preset buttons (`0`, `500k`, `1M`, `2M`, `3M`, `5M`, `10M`).
- **Integrated Orders Log Banner**: At the top of the **Orders Log**, cashiers see:
  - `Opening Float (Base)` + `[✏️ Set Cash]` quick edit button.
  - `Orders Revenue` collected during the shift.
  - `Total Cash in Register` (`Base + Orders Revenue`) in both L.L. and USD.
- **Running Drawer Balance Column**: Each order in the Orders Log table shows the running cash balance in the register after that ticket was settled.
- **Print Shift & Drawer Summary**: 1-click physical receipt printout for end-of-shift reconciliation and manager sign-off.

---

## ⌨️ Cashier Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` or `F2` | Focus search bar immediately |
| `Esc` | Clear search / close active modal |
| `Enter` | Complete checkout & print receipt (or trigger print in modal) |
| `F9` | Discard / clear current ticket |

---

## 📂 Project Structure

```
cash/
├── items.json          # Persistent menu database (read & written via API)
├── categories.json     # Categories metadata
├── orders.json         # Shift transaction records
├── register.json       # Cash register starting float & drawer balance
├── server.js           # Lightweight native Node.js HTTP & REST API server
├── package.json        # Project metadata and run scripts
├── public/
│   ├── index.html      # Cashier POS interface & receipt modal
│   ├── style.css       # Ergonomic, light-mode styling & @media print rules
│   ├── app.js          # POS state engine, cart, calculations, and hotkeys
│   └── images/         # High-resolution Al Panino food photos & logos
└── README.md           # Documentation
```
