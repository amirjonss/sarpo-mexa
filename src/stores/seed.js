// Seed (demo) data for the Sarpo Mexa prototype.
// Localized names are stored as { ru, uz } objects; user-created records use plain strings.
// A `localized()` helper resolves either form for display.
// Each category is a design "set" (набор); product photos live in /public/products/<set>/.

// Bump whenever seed data changes so existing localStorage is refreshed.
export const SEED_VERSION = 8

// `returned` = boxes came back from the client; closing an order restores stock (rental).
export const ORDER_STATUSES = ['new', 'packing', 'ready', 'delivering', 'delivered', 'returned', 'cancelled']

// Statuses at which the rented boxes are considered back in inventory.
export const CLOSED_STATUSES = ['returned', 'cancelled']

export const USER_ROLES = ['admin', 'manager', 'packer', 'courier']

export function buildSeed() {
  const categories = [
    { id: 1, name: { ru: 'Пудровая коллекция', uz: 'Pudra to‘plami' } },
    { id: 2, name: { ru: 'Белая коллекция', uz: 'Oq to‘plam' } },
    { id: 3, name: { ru: 'Кремовая коллекция', uz: 'Krem to‘plam' } },
  ]

  const products = [
    // ---- Пудровая коллекция (set 01) ----
    { id: 1, name: { ru: 'Декоративный поднос', uz: 'Bezakli laganda' }, price: 150000, categoryId: 1, image: '/products/01/01.png' },
    { id: 2, name: { ru: 'Круглая свадебная коробка', uz: 'Yumaloq to‘y qutisi' }, price: 220000, categoryId: 1, image: '/products/01/02.png' },
    { id: 3, name: { ru: 'Коробка для даров', uz: 'Sovg‘alar qutisi' }, price: 130000, categoryId: 1, image: '/products/01/03.png' },
    { id: 4, name: { ru: 'Двухъярусная подставка', uz: 'Ikki qavatli taglik' }, price: 240000, categoryId: 1, image: '/products/01/04.png' },

    // ---- Белая коллекция (set 02) ----
    { id: 5, name: { ru: 'Декоративный поднос с аркой', uz: 'Arkali bezakli laganda' }, price: 180000, categoryId: 2, image: '/products/02/01.png' },
    { id: 6, name: { ru: 'Витрина (малая)', uz: 'Vitrina (kichik)' }, price: 120000, categoryId: 2, image: '/products/02/02.png' },
    { id: 7, name: { ru: 'Журнальный столик (прямоугольный)', uz: 'Jurnal stoli (to‘rtburchak)' }, price: 230000, categoryId: 2, image: '/products/02/03.png' },
    { id: 8, name: { ru: 'Журнальный столик (квадратный)', uz: 'Jurnal stoli (kvadrat)' }, price: 210000, categoryId: 2, image: '/products/02/04.png' },
    { id: 9, name: { ru: 'Коробка для даров (прямоугольная)', uz: 'Sovg‘alar qutisi (to‘rtburchak)' }, price: 160000, categoryId: 2, image: '/products/02/05.png' },

    // ---- Кремовая коллекция (set 03) ----
    { id: 10, name: { ru: 'Прямоугольная витрина', uz: 'To‘rtburchak vitrina' }, price: 250000, categoryId: 3, image: '/products/03/01.png' },
    { id: 11, name: { ru: 'Круглая витрина (большая)', uz: 'Yumaloq vitrina (katta)' }, price: 250000, categoryId: 3, image: '/products/03/02.png' },
    { id: 12, name: { ru: 'Круглая коробка', uz: 'Yumaloq quti' }, price: 190000, categoryId: 3, image: '/products/03/03.png' },
    { id: 13, name: { ru: 'Прямоугольный поднос', uz: 'To‘rtburchak laganda' }, price: 170000, categoryId: 3, image: '/products/03/04.png' },
  ]

  const inventory = [
    { id: 1, productId: 1, quantity: 12 },
    { id: 2, productId: 2, quantity: 7 },
    { id: 3, productId: 3, quantity: 20 },
    { id: 4, productId: 4, quantity: 4 },
    { id: 5, productId: 5, quantity: 9 },
    { id: 6, productId: 6, quantity: 15 },
    { id: 7, productId: 7, quantity: 3 },
    { id: 8, productId: 8, quantity: 6 },
    { id: 9, productId: 9, quantity: 5 },
    { id: 10, productId: 10, quantity: 5 },
    { id: 11, productId: 11, quantity: 2 },
    { id: 12, productId: 12, quantity: 11 },
    { id: 13, productId: 13, quantity: 8 },
  ]

  // Ready-made sets (комплекты) — a curated bundle of products with quantities.
  // Sarpo is rented as a finished set, so staff add a whole set to an order in
  // one click instead of picking items one by one. `items` reference products.
  const sets = [
    {
      id: 1,
      name: { ru: 'Пудровый комплект', uz: 'Pudra to‘plami' },
      categoryId: 1,
      image: '/products/01/01.png',
      items: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 2 },
        { productId: 4, quantity: 1 },
      ],
    },
    {
      id: 2,
      name: { ru: 'Белый комплект', uz: 'Oq to‘plam' },
      categoryId: 2,
      image: '/products/02/01.png',
      items: [
        { productId: 5, quantity: 1 },
        { productId: 6, quantity: 2 },
        { productId: 7, quantity: 1 },
        { productId: 9, quantity: 1 },
      ],
    },
    {
      id: 3,
      name: { ru: 'Кремовый комплект', uz: 'Krem to‘plam' },
      categoryId: 3,
      image: '/products/03/01.png',
      items: [
        { productId: 10, quantity: 1 },
        { productId: 11, quantity: 1 },
        { productId: 12, quantity: 1 },
        { productId: 13, quantity: 2 },
      ],
    },
  ]

  const clients = [
    { id: 1, name: 'Дилноза Каримова', phone: '+998 90 123 45 67' },
    { id: 2, name: 'Бекзод Рахимов', phone: '+998 91 234 56 78' },
    { id: 3, name: 'Мадина Юсупова', phone: '+998 93 345 67 89' },
    { id: 4, name: 'Жасур Алиев', phone: '+998 94 456 78 90' },
  ]

  // Each item carries its own `price` (unit price at order time) so per-order
  // discounts don't affect the product's base price. `returned` marks whether
  // the rented boxes are back in inventory.
  const orders = [
    {
      id: 1001,
      clientId: 1,
      targetDate: addDaysAt(2, 14, 0),
      returnDate: addDaysAt(4, 12, 0),
      deposit: 500000,
      depositRefunded: false,
      conditionNote: '',
      status: 'packing',
      returned: false,
      note: 'Свадебный комплект на торжество',
      createdAt: addDays(-1),
      address: 'г. Самарканд, ул. Регистан, 12, кв. 5',
      payments: [{ id: 1, amount: 300000, createdAt: addDays(-1) }],
      items: [
        { id: 1, productId: 2, quantity: 1, price: 220000 },
        { id: 2, productId: 1, quantity: 2, price: 130000 }, // скидка для клиента
        { id: 3, productId: 4, quantity: 1, price: 240000 },
      ],
    },
    {
      id: 1002,
      clientId: 2,
      targetDate: addDaysAt(5, 11, 30),
      returnDate: addDaysAt(7, 12, 0),
      deposit: 400000,
      depositRefunded: false,
      conditionNote: '',
      status: 'new',
      returned: false,
      note: '',
      createdAt: addDays(0),
      address: 'г. Самарканд, ул. Амира Темура, 45',
      payments: [],
      items: [
        { id: 1, productId: 7, quantity: 1, price: 230000 },
        { id: 2, productId: 6, quantity: 2, price: 120000 },
      ],
    },
    {
      id: 1003,
      clientId: 3,
      targetDate: addDaysAt(-3, 16, 0),
      returnDate: addDaysAt(-1, 12, 0),
      deposit: 450000,
      depositRefunded: false,
      conditionNote: '',
      status: 'delivered',
      returned: false,
      note: 'Доставлено, ожидаем возврат коробок',
      createdAt: addDays(-6),
      address: 'г. Самарканд, ул. Гагарина, 78, кв. 21',
      payments: [{ id: 1, amount: 440000, createdAt: addDays(-6) }],
      items: [
        { id: 1, productId: 12, quantity: 1, price: 190000 },
        { id: 2, productId: 10, quantity: 1, price: 250000 },
      ],
    },
    {
      id: 1004,
      clientId: 1,
      targetDate: addDaysAt(1, 10, 0),
      returnDate: addDaysAt(3, 12, 0),
      deposit: 500000,
      depositRefunded: false,
      conditionNote: '',
      status: 'ready',
      returned: false,
      note: '',
      createdAt: addDays(-2),
      address: 'г. Самарканд, ул. Дагбитская, 5',
      payments: [{ id: 1, amount: 300000, createdAt: addDays(-2) }],
      items: [
        { id: 1, productId: 11, quantity: 1, price: 250000 },
        { id: 2, productId: 13, quantity: 2, price: 170000 },
      ],
    },
    // ---- Historical (closed/returned) orders — feed the dashboard trends ----
    {
      id: 958, clientId: 2, targetDate: addDaysAt(-32, 15, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-34), address: 'г. Самарканд, ул. Мирзо Улугбека, 33',
      payments: [{ id: 1, amount: 420000, createdAt: addDays(-34) }],
      items: [{ id: 1, productId: 5, quantity: 1, price: 180000 }, { id: 2, productId: 6, quantity: 2, price: 120000 }],
    },
    {
      id: 957, clientId: 3, targetDate: addDaysAt(-46, 12, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-48), address: 'г. Самарканд, ул. Рудаки, 9, кв. 14',
      payments: [{ id: 1, amount: 250000, createdAt: addDays(-48) }],
      items: [{ id: 1, productId: 10, quantity: 1, price: 250000 }],
    },
    {
      id: 956, clientId: 1, targetDate: addDaysAt(-60, 11, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-62), address: 'г. Самарканд, пр. Ислама Каримова, 102',
      payments: [{ id: 1, amount: 520000, createdAt: addDays(-62) }],
      items: [{ id: 1, productId: 2, quantity: 1, price: 220000 }, { id: 2, productId: 1, quantity: 2, price: 150000 }],
    },
    {
      id: 955, clientId: 4, targetDate: addDaysAt(-73, 16, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-75), address: 'г. Самарканд, ул. Спитамена, 27',
      payments: [{ id: 1, amount: 440000, createdAt: addDays(-75) }],
      items: [{ id: 1, productId: 7, quantity: 1, price: 230000 }, { id: 2, productId: 8, quantity: 1, price: 210000 }],
    },
    {
      id: 954, clientId: 2, targetDate: addDaysAt(-93, 12, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-95), address: 'г. Самарканд, ул. Бустонсарой, 6',
      payments: [{ id: 1, amount: 320000, createdAt: addDays(-95) }],
      items: [{ id: 1, productId: 12, quantity: 1, price: 190000 }, { id: 2, productId: 3, quantity: 1, price: 130000 }],
    },
    {
      id: 953, clientId: 3, targetDate: addDaysAt(-108, 14, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-110), address: 'г. Самарканд, ул. Фирдавси, 88, кв. 3',
      payments: [{ id: 1, amount: 420000, createdAt: addDays(-110) }],
      items: [{ id: 1, productId: 11, quantity: 1, price: 250000 }, { id: 2, productId: 13, quantity: 1, price: 170000 }],
    },
    {
      id: 952, clientId: 1, targetDate: addDaysAt(-128, 10, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-130), address: 'г. Самарканд, ул. Шохрух, 14',
      payments: [{ id: 1, amount: 560000, createdAt: addDays(-130) }],
      items: [{ id: 1, productId: 4, quantity: 1, price: 240000 }, { id: 2, productId: 9, quantity: 2, price: 160000 }],
    },
    {
      id: 951, clientId: 4, targetDate: addDaysAt(-158, 13, 0), status: 'returned', returned: true,
      note: '', createdAt: addDays(-160), address: 'г. Самарканд, ул. Ташкентская, 51',
      payments: [{ id: 1, amount: 270000, createdAt: addDays(-160) }],
      items: [{ id: 1, productId: 1, quantity: 1, price: 150000 }, { id: 2, productId: 6, quantity: 1, price: 120000 }],
    },
  ]

  const users = [
    { id: 1, username: 'admin', roles: ['admin'] },
    { id: 2, username: 'malika', roles: ['manager'] },
    { id: 3, username: 'sardor', roles: ['packer', 'courier'] },
  ]

  return { categories, products, sets, inventory, clients, orders, users }
}

function addDays(n) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// Returns a local datetime string "YYYY-MM-DDTHH:MM" (matches datetime-local input).
function addDaysAt(n, hh = 12, mm = 0) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hh, mm, 0, 0)
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
