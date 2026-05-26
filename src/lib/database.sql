-- ============================================================
-- KopiKasir POS — Database Seed Script
-- Jalankan di Supabase SQL Editor (sekali saja)
-- ============================================================

-- ── 1. CATEGORIES ──────────────────────────────────────────
INSERT INTO categories (id, name, icon, "order") VALUES
  ('espresso',    'Espresso Based', 'Coffee',           1),
  ('manual-brew', 'Manual Brew',    'Filter',           2),
  ('non-coffee',  'Non-Coffee',     'CupSoda',          3),
  ('tea',         'Tea',            'Leaf',             4),
  ('food',        'Food',           'UtensilsCrossed',  5),
  ('pastry',      'Pastry',         'Croissant',        6)
ON CONFLICT (id) DO NOTHING;

-- ── 2. PRODUCTS ────────────────────────────────────────────
INSERT INTO products (id, name, category_id, description, image, variants, has_temperature, has_sugar_level, has_milk_type, available_modifiers, is_available, is_popular, recipe) VALUES

-- Espresso Based
('espresso-single', 'Espresso', 'espresso', 'Single shot espresso, bold and rich', null,
  '[{"size":"small","price":18000}]',
  true, true, false, '["extra-shot"]', true, false,
  '[{"stockItemId":"s1","amount":0.018},{"stockItemId":"s11","amount":1}]'),

('americano', 'Americano', 'espresso', 'Espresso with hot water', null,
  '[{"size":"small","price":22000},{"size":"medium","price":26000},{"size":"large","price":30000}]',
  true, true, false, '["extra-shot","extra-syrup"]', true, true,
  '[{"stockItemId":"s1","amount":0.018},{"stockItemId":"s11","amount":1}]'),

('cafe-latte', 'Café Latte', 'espresso', 'Espresso with steamed milk', null,
  '[{"size":"small","price":25000},{"size":"medium","price":30000},{"size":"large","price":35000}]',
  true, true, true, '["extra-shot","extra-syrup","whipped-cream","caramel-drizzle"]', true, true,
  '[{"stockItemId":"s1","amount":0.018},{"stockItemId":"s3","amount":0.2},{"stockItemId":"s11","amount":1}]'),

('cappuccino', 'Cappuccino', 'espresso', 'Equal parts espresso, steamed milk, foam', null,
  '[{"size":"small","price":25000},{"size":"medium","price":30000},{"size":"large","price":35000}]',
  true, true, true, '["extra-shot","extra-syrup","chocolate-drizzle"]', true, true, null),

('mocha', 'Café Mocha', 'espresso', 'Espresso with chocolate and steamed milk', null,
  '[{"size":"small","price":28000},{"size":"medium","price":33000},{"size":"large","price":38000}]',
  true, true, true, '["extra-shot","whipped-cream","chocolate-drizzle","caramel-drizzle"]', true, false, null),

('caramel-macchiato', 'Caramel Macchiato', 'espresso', 'Vanilla milk marked with espresso and caramel', null,
  '[{"size":"small","price":30000},{"size":"medium","price":35000},{"size":"large","price":40000}]',
  true, true, true, '["extra-shot","whipped-cream","caramel-drizzle"]', true, true, null),

('flat-white', 'Flat White', 'espresso', 'Double shot with velvety microfoam', null,
  '[{"size":"small","price":28000},{"size":"medium","price":33000}]',
  true, true, true, '["extra-shot","oat-milk","almond-milk"]', true, false, null),

('affogato', 'Affogato', 'espresso', 'Espresso poured over vanilla ice cream', null,
  '[{"size":"small","price":32000}]',
  false, false, false, '["extra-shot","chocolate-drizzle","caramel-drizzle"]', true, false, null),

-- Manual Brew
('v60', 'V60 Pour Over', 'manual-brew', 'Clean and bright single origin coffee', null,
  '[{"size":"medium","price":30000},{"size":"large","price":38000}]',
  true, false, false, '[]', true, false, null),

('french-press', 'French Press', 'manual-brew', 'Full-bodied immersion brew', null,
  '[{"size":"medium","price":28000},{"size":"large","price":35000}]',
  true, false, false, '[]', true, false, null),

('cold-brew', 'Cold Brew', 'manual-brew', 'Slow-steeped cold coffee, smooth and bold', null,
  '[{"size":"medium","price":28000},{"size":"large","price":35000}]',
  false, true, false, '["extra-syrup","oat-milk","almond-milk"]', true, true, null),

-- Non-Coffee
('chocolate', 'Hot Chocolate', 'non-coffee', 'Rich Belgian chocolate with steamed milk', null,
  '[{"size":"small","price":25000},{"size":"medium","price":30000},{"size":"large","price":35000}]',
  true, true, true, '["whipped-cream","chocolate-drizzle","boba-pearl"]', true, true, null),

('matcha-latte', 'Matcha Latte', 'non-coffee', 'Premium Japanese matcha with steamed milk', null,
  '[{"size":"small","price":28000},{"size":"medium","price":33000},{"size":"large","price":38000}]',
  true, true, true, '["whipped-cream","boba-pearl","cheese-foam"]', true, true, null),

('taro-latte', 'Taro Latte', 'non-coffee', 'Creamy taro with steamed milk', null,
  '[{"size":"small","price":27000},{"size":"medium","price":32000},{"size":"large","price":37000}]',
  true, true, true, '["whipped-cream","boba-pearl","cheese-foam"]', true, false, null),

('strawberry-smoothie', 'Strawberry Smoothie', 'non-coffee', 'Fresh strawberry blended with yogurt', null,
  '[{"size":"medium","price":30000},{"size":"large","price":36000}]',
  false, true, false, '["whipped-cream","boba-pearl"]', true, false, null),

-- Tea
('earl-grey', 'Earl Grey Tea', 'tea', 'Classic bergamot-infused black tea', null,
  '[{"size":"medium","price":20000},{"size":"large","price":25000}]',
  true, true, false, '["extra-syrup"]', true, false, null),

('chamomile', 'Chamomile Tea', 'tea', 'Soothing herbal chamomile', null,
  '[{"size":"medium","price":22000},{"size":"large","price":27000}]',
  true, true, false, '["extra-syrup"]', true, false, null),

('thai-tea', 'Thai Tea', 'tea', 'Sweet Thai tea with condensed milk', null,
  '[{"size":"small","price":22000},{"size":"medium","price":27000},{"size":"large","price":32000}]',
  true, true, false, '["boba-pearl","cheese-foam"]', true, true, null),

-- Food
('chicken-sandwich', 'Chicken Club Sandwich', 'food', 'Grilled chicken, lettuce, tomato on toast', null,
  '[{"size":"medium","price":35000}]',
  false, false, false, '[]', true, false, null),

('toast-avocado', 'Avocado Toast', 'food', 'Smashed avocado on sourdough', null,
  '[{"size":"medium","price":32000}]',
  false, false, false, '[]', true, true, null),

('fries', 'Truffle Fries', 'food', 'Crispy fries with truffle oil and parmesan', null,
  '[{"size":"small","price":25000},{"size":"large","price":38000}]',
  false, false, false, '[]', true, false, null),

-- Pastry
('croissant', 'Butter Croissant', 'pastry', 'Flaky French-style butter croissant', null,
  '[{"size":"medium","price":20000}]',
  false, false, false, '[]', true, true, null),

('chocolate-muffin', 'Chocolate Muffin', 'pastry', 'Double chocolate chip muffin', null,
  '[{"size":"medium","price":18000}]',
  false, false, false, '[]', true, false, null),

('cheesecake', 'Basque Cheesecake', 'pastry', 'Creamy burnt Basque-style cheesecake', null,
  '[{"size":"medium","price":28000}]',
  false, false, false, '[]', false, true, null),

('banana-bread', 'Banana Bread', 'pastry', 'Moist banana bread with walnuts', null,
  '[{"size":"medium","price":16000}]',
  false, false, false, '[]', true, false, null)

ON CONFLICT (id) DO UPDATE SET
  name             = EXCLUDED.name,
  category_id      = EXCLUDED.category_id,
  description      = EXCLUDED.description,
  variants         = EXCLUDED.variants,
  has_temperature  = EXCLUDED.has_temperature,
  has_sugar_level  = EXCLUDED.has_sugar_level,
  has_milk_type    = EXCLUDED.has_milk_type,
  available_modifiers = EXCLUDED.available_modifiers,
  is_available     = EXCLUDED.is_available,
  is_popular       = EXCLUDED.is_popular,
  recipe           = EXCLUDED.recipe;

-- ── 3. INVENTORY (STOCK) ───────────────────────────────────
INSERT INTO inventory (id, name, unit, current_stock, minimum_stock, last_restocked) VALUES
  ('s1',  'Biji Kopi Arabika',  'kg',    5.2,  3.0,  '2025-05-18'),
  ('s2',  'Biji Kopi Robusta',  'kg',    2.1,  3.0,  '2025-05-17'),
  ('s3',  'Susu Full Cream',    'liter', 12.0, 5.0,  '2025-05-20'),
  ('s4',  'Susu Oat',           'liter', 3.0,  2.0,  '2025-05-19'),
  ('s5',  'Matcha Powder',      'gram',  180,  200,  '2025-05-15'),
  ('s6',  'Coklat Bubuk',       'gram',  450,  200,  '2025-05-16'),
  ('s7',  'Gula Pasir',         'kg',    8.0,  3.0,  '2025-05-18'),
  ('s8',  'Gula Aren Cair',     'liter', 1.2,  2.0,  '2025-05-14'),
  ('s9',  'Whipped Cream',      'kaleng', 4,   3,    '2025-05-19'),
  ('s10', 'Boba Pearl',         'gram',  300,  500,  '2025-05-13'),
  ('s11', 'Cup Plastik M',      'pcs',   180,  100,  '2025-05-17'),
  ('s12', 'Cup Plastik L',      'pcs',   95,   100,  '2025-05-17')
ON CONFLICT (id) DO NOTHING;

-- ── 4. CUSTOMERS ───────────────────────────────────────────
INSERT INTO customers (id, name, phone, email, loyalty_points, total_spent, total_orders, favorite_items, joined_at, last_visit) VALUES
  ('cust-001', 'Rina Amelia',      '081234567890', 'rina@email.com',          1250, 2450000, 42,  '["cafe-latte","croissant","matcha-latte"]',     '2024-08-15T00:00:00Z', '2025-05-20T09:15:00Z'),
  ('cust-002', 'Sarah Putri',      '081298765432', 'sarah.putri@email.com',   890,  1890000, 35,  '["caramel-macchiato","chocolate-muffin"]',      '2024-09-20T00:00:00Z', '2025-05-20T08:30:00Z'),
  ('cust-003', 'Budi Santoso',     '082112345678', 'budi.s@email.com',        2100, 4200000, 78,  '["americano","v60","cold-brew"]',               '2024-03-01T00:00:00Z', '2025-05-20T10:00:00Z'),
  ('cust-004', 'Dewi Lestari',     '085678901234', null,                      450,  950000,  18,  '["matcha-latte","taro-latte","cheesecake"]',    '2025-01-10T00:00:00Z', '2025-05-18T15:00:00Z'),
  ('cust-005', 'Andi Pratama',     '089876543210', 'andi.p@email.com',        3200, 6400000, 120, '["espresso-single","flat-white","americano"]',  '2023-11-05T00:00:00Z', '2025-05-19T07:30:00Z'),
  ('cust-006', 'Fitri Handayani',  '081345678912', null,                      680,  1360000, 25,  '["chocolate","thai-tea","banana-bread"]',       '2024-06-22T00:00:00Z', '2025-05-17T14:20:00Z'),
  ('cust-007', 'Raka Wijaya',      '087654321098', 'raka.w@email.com',        1500, 3100000, 55,  '["cappuccino","mocha","toast-avocado"]',        '2024-04-18T00:00:00Z', '2025-05-20T11:45:00Z'),
  ('cust-008', 'Maya Sari',        '082198765432', null,                      200,  420000,  8,   '["strawberry-smoothie","fries"]',              '2025-04-01T00:00:00Z', '2025-05-15T16:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- ── 5. USERS (public profile — dibuat SETELAH Supabase Auth user dibuat) ──
-- CATATAN: Jalankan bagian ini HANYA setelah kamu membuat user via
-- Supabase Auth Dashboard (Authentication > Users > Add User)
-- Ganti nilai 'id' dengan UUID yang diberikan Supabase Auth.
--
-- Contoh:
-- INSERT INTO users (id, name, username, role, is_active) VALUES
--   ('UUID-dari-supabase-auth', 'Dimas Aditya',     'dimas@kopikasir.com', 'cashier',    true),
--   ('UUID-dari-supabase-auth', 'Sari Wulandari',   'sari@kopikasir.com',  'cashier',    true),
--   ('UUID-dari-supabase-auth', 'Rizky Supervisor', 'rizky@kopikasir.com', 'supervisor', true),
--   ('UUID-dari-supabase-auth', 'Ahmad Owner',      'ahmad@kopikasir.com', 'owner',      true)
-- ON CONFLICT (id) DO NOTHING;
