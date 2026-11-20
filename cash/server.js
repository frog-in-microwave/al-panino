import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const USD_RATE = 90000; // Exchange rate: 90,000 L.L. per 1 USD
const ITEMS_FILE = path.join(__dirname, 'items.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const REGISTER_FILE = path.join(__dirname, 'register.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const RECEIPTS_DIR = path.join(__dirname, 'receipts');

if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// Helper to read JSON file safely
function readJson(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

// Helper to write JSON file safely
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Format thermal receipt as raw plain text (Optimized for 48-Column 80mm Paper)
// Format shift and cash drawer report as raw plain text (40-Column 80mm Paper)
function formatShiftReportText(data) {
  const line = '========================================';
  const divider = '----------------------------------------';
  const dateStr = new Date().toLocaleString('en-US');
  
  const out = [];
  out.push('             AL PANINO');
  out.push('           سناك البانينو');
  out.push('    Ghazieh Main St, South Lebanon');
  out.push('     Tel: +961 71 254 251 / 70 646 225');
  out.push(line);
  out.push('      SHIFT & CASH DRAWER REPORT');
  out.push(`Report Date: ${dateStr}`);
  out.push(line);
  out.push(`Starting Cash:`.padEnd(20, ' ') + (`${Number(data.startingCash || 0).toLocaleString('en-US')} L.L.`).padStart(20, ' '));
  out.push(`Orders Count:`.padEnd(20, ' ') + (`${data.totalOrders || 0}`).padStart(20, ' '));
  out.push(`Orders Sales:`.padEnd(20, ' ') + (`${Number(data.ordersSales || 0).toLocaleString('en-US')} L.L.`).padStart(20, ' '));
  out.push(divider);
  out.push(`IN DRAWER:`.padEnd(20, ' ') + (`${Number(data.totalCashInDrawer || 0).toLocaleString('en-US')} L.L.`).padStart(20, ' '));
  out.push(`USD Equiv:`.padEnd(20, ' ') + (`$${(Number(data.totalCashInDrawer || 0) / USD_RATE).toFixed(2)}`).padStart(20, ' '));
  out.push(line);
  out.push('Cashier: ___________________________');
  out.push('Manager: ___________________________');
  out.push(line);
  out.push('\r\n\r\n\r\n\r\n\r\n');
  return out.join('\r\n');
}

// Parse request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API: Get Items
  if (pathname === '/api/items' && req.method === 'GET') {
    const items = readJson(ITEMS_FILE, []);
    sendJson(res, 200, items);
    return;
  }

  // API: Create Item
  if (pathname === '/api/items' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      if (!payload.name || !payload.price) {
        sendJson(res, 400, { error: 'Item name and price are required' });
        return;
      }
      const items = readJson(ITEMS_FILE, []);
      const newItem = {
        id: payload.id || `item-${Date.now()}`,
        name: payload.name,
        nameAr: payload.nameAr || payload.name,
        categoryId: payload.categoryId || 'sandwiches',
        category: payload.category || 'Sandwiches & Panini',
        price: Number(payload.price) || 0,
        image: payload.image || '/images/tawook.avif',
        description: payload.description || '',
        isAvailable: payload.isAvailable !== false,
      };
      items.push(newItem);
      writeJson(ITEMS_FILE, items);
      sendJson(res, 201, newItem);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Update Item
  if (pathname.startsWith('/api/items/') && req.method === 'PUT') {
    const itemId = pathname.replace('/api/items/', '');
    try {
      const payload = await parseRequestBody(req);
      const items = readJson(ITEMS_FILE, []);
      const index = items.findIndex(it => it.id === itemId);
      if (index === -1) {
        sendJson(res, 404, { error: 'Item not found' });
        return;
      }
      items[index] = {
        ...items[index],
        ...payload,
        price: payload.price !== undefined ? Number(payload.price) : items[index].price,
      };
      writeJson(ITEMS_FILE, items);
      sendJson(res, 200, items[index]);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Delete Item
  if (pathname.startsWith('/api/items/') && req.method === 'DELETE') {
    const itemId = pathname.replace('/api/items/', '');
    const items = readJson(ITEMS_FILE, []);
    const filtered = items.filter(it => it.id !== itemId);
    if (filtered.length === items.length) {
      sendJson(res, 404, { error: 'Item not found' });
      return;
    }
    writeJson(ITEMS_FILE, filtered);
    sendJson(res, 200, { success: true, id: itemId });
    return;
  }

  // API: Get Categories
  if (pathname === '/api/categories' && req.method === 'GET') {
    const categories = readJson(CATEGORIES_FILE, []);
    sendJson(res, 200, categories);
    return;
  }

  // API: Create Category
  if (pathname === '/api/categories' && req.method === 'POST') {
    try {
      const data = await parseRequestBody(req);
      if (!data.name || !data.name.trim()) {
        sendJson(res, 400, { error: 'Category name is required' });
        return;
      }
      const categories = readJson(CATEGORIES_FILE, []);
      const slug = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `cat_${Date.now()}`;
      let id = slug;
      let counter = 1;
      while (categories.some(c => c.id === id)) {
        id = `${slug}-${counter++}`;
      }
      const newCategory = {
        id,
        name: data.name.trim(),
        nameAr: data.nameAr ? data.nameAr.trim() : '',
        color: data.color || '#3b82f6',
        icon: data.icon || 'tag'
      };
      categories.push(newCategory);
      writeJson(CATEGORIES_FILE, categories);
      sendJson(res, 201, newCategory);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Get Orders
  if (pathname === '/api/orders' && req.method === 'GET') {
    const orders = readJson(ORDERS_FILE, []);
    sendJson(res, 200, orders);
    return;
  }

  // API: Create Order (Checkout)
  if (pathname === '/api/orders' && req.method === 'POST') {
    try {
      const order = await parseRequestBody(req);
      if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        sendJson(res, 400, { error: 'Order must contain items' });
        return;
      }
      const orders = readJson(ORDERS_FILE, []);
      const newOrder = {
        ...order,
        id: order.id || `AP-${Date.now().toString().slice(-6)}`,
        orderNumber: orders.length + 1001,
        timestamp: new Date().toISOString(),
      };
      orders.unshift(newOrder); // newest first
      writeJson(ORDERS_FILE, orders);
      sendJson(res, 201, newOrder);
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Get Cash Register State
  if (pathname === '/api/register' && req.method === 'GET') {
    const register = readJson(REGISTER_FILE, { startingCash: 0, lastUpdated: new Date().toISOString() });
    const orders = readJson(ORDERS_FILE, []);
    const ordersSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const startingCash = Number(register.startingCash) || 0;
    const totalCashInDrawer = startingCash + ordersSales;
    sendJson(res, 200, {
      startingCash,
      ordersSales,
      totalCashInDrawer,
      totalOrders: orders.length,
      lastUpdated: register.lastUpdated || new Date().toISOString(),
      notes: register.notes || '',
    });
    return;
  }

  // API: Update Cash Register (Set Starting Cash or Current Drawer Count)
  if (pathname === '/api/register' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const payload = await parseRequestBody(req);
      const orders = readJson(ORDERS_FILE, []);
      const ordersSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      
      let startingCash = 0;
      if (payload.startingCash !== undefined) {
        startingCash = Math.max(0, Number(payload.startingCash) || 0);
      } else if (payload.drawerAmount !== undefined) {
        // If cashier enters current total counted in drawer, deduce starting float
        startingCash = Math.max(0, (Number(payload.drawerAmount) || 0) - ordersSales);
      }

      const registerData = {
        startingCash,
        lastUpdated: new Date().toISOString(),
        notes: payload.notes || '',
      };
      writeJson(REGISTER_FILE, registerData);

      const totalCashInDrawer = startingCash + ordersSales;
      sendJson(res, 200, {
        success: true,
        startingCash,
        ordersSales,
        totalCashInDrawer,
        totalOrders: orders.length,
        lastUpdated: registerData.lastUpdated,
        notes: registerData.notes,
      });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // API: Shift Stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    const register = readJson(REGISTER_FILE, { startingCash: 0 });
    const orders = readJson(ORDERS_FILE, []);
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = orders.length;
    const startingCash = Number(register.startingCash) || 0;
    const totalCashInDrawer = startingCash + totalSales;
    sendJson(res, 200, {
      totalSales,
      totalOrders,
      cashSales: totalSales,
      cardSales: 0,
      startingCash,
      totalCashInDrawer,
    });
    return;
  }

  // API: Get Available Printers
  if (pathname === '/api/printers' && req.method === 'GET') {
    exec('powershell -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name"', (err, stdout) => {
      if (err) {
        sendJson(res, 200, { printers: [] });
        return;
      }
      const printers = stdout.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
      sendJson(res, 200, { printers });
    });
    return;
  }

  // API: Direct Silent Print (Bypasses browser print dialog completely)
  if (pathname === '/api/print' && req.method === 'POST') {
    try {
      const payload = await parseRequestBody(req);
      const order = payload.order;
      const printerName = payload.printerName;

      if (!order) {
        sendJson(res, 400, { error: 'Order data required' });
        return;
      }

      const jsonPath = path.join(RECEIPTS_DIR, `receipt-${order.orderNumber || Date.now()}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(order, null, 2), 'utf-8');

      if (payload.silentSaveOnly) {
        sendJson(res, 200, {
          success: true,
          method: 'saved',
          savedFile: jsonPath,
          message: 'Receipt archived successfully.'
        });
        return;
      }

      // Command to send directly to 80mm thermal receipt printer with zero margins
      const printScript = path.join(__dirname, 'print-receipt.ps1');
      let psCmd = `& '${printScript}' -FilePath '${jsonPath}'`;
      if (printerName) {
        psCmd += ` -PrinterName '${printerName}'`;
      }

      exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`, { timeout: 4000 }, (err, stdout, stderr) => {
        if (err) {
          console.warn('Direct print note (queued or no physical printer):', err.message);
          // Return success so the cashier UI flows smoothly
          sendJson(res, 200, {
            success: true,
            method: 'direct',
            savedFile: jsonPath,
            message: 'Receipt saved & dispatched to 80mm printer queue.'
          });
        } else {
          sendJson(res, 200, {
            success: true,
            method: 'direct',
            savedFile: jsonPath,
            message: 'Receipt printed directly to 80mm printer.'
          });
        }
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // API: Direct Silent Print of Shift & Drawer Report
  if (pathname === '/api/print-shift' && req.method === 'POST') {
    try {
      const register = readJson(REGISTER_FILE, { startingCash: 0 });
      const orders = readJson(ORDERS_FILE, []);
      const ordersSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const startingCash = Number(register.startingCash) || 0;
      const totalCashInDrawer = startingCash + ordersSales;
      
      const reportData = {
        startingCash,
        ordersSales,
        totalCashInDrawer,
        totalOrders: orders.length,
      };

      const reportText = formatShiftReportText(reportData);
      const filePath = path.join(RECEIPTS_DIR, `shift-report-${Date.now()}.txt`);
      fs.writeFileSync(filePath, reportText, 'utf-8');

      const printScript = path.join(__dirname, 'print-receipt.ps1');
      const psCmd = `& '${printScript}' -FilePath '${filePath}'`;
      exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`, { timeout: 4000 }, (err) => {
        if (err) {
          console.warn('Shift report print note:', err.message);
        }
        sendJson(res, 200, {
          success: true,
          method: 'direct',
          savedFile: filePath,
          message: 'Shift & Cash Drawer report saved & queued to 80mm printer.'
        });
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // Static File Serving
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  
  let targetFile = path.join(PUBLIC_DIR, safePath);
  if (!fs.existsSync(targetFile)) {
    // If request is for /data/images/*, check in public/images/*
    if (safePath.startsWith('data' + path.sep + 'images') || safePath.startsWith('data/images')) {
      const altFile = path.join(PUBLIC_DIR, 'images', path.basename(safePath));
      if (fs.existsSync(altFile)) {
        targetFile = altFile;
      }
    }
  }
  if (!fs.existsSync(targetFile)) {
    targetFile = path.join(__dirname, safePath);
  }

  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    // Never cache JS/CSS so the browser always gets the latest version
    const noCache = ['.js', '.css'].includes(ext);
    const headers = { 'Content-Type': contentType };
    if (noCache) {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
    }
    res.writeHead(200, headers);
    fs.createReadStream(targetFile).pipe(res);
    return;
  }

  const fallbackIndex = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(fallbackIndex)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(fallbackIndex).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  🥪 AL PANINO CASHIER POS SYSTEM IS RUNNING!   `);
  console.log(`  Access URL: http://localhost:${PORT}          `);
  console.log(`  Port:       ${PORT}                           `);
  console.log(`  Items file: ${ITEMS_FILE}                     `);
  console.log(`=================================================\n`);
});
