<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@inventory.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $staff = User::firstOrCreate(
            ['email' => 'staff@inventory.com'],
            [
                'name' => 'Inventory Staff',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'is_active' => true,
            ]
        );

        // 2. Create Categories
        $categoriesData = [
            ['name' => 'Electronics', 'description' => 'Computers, gadgets, and components'],
            ['name' => 'Office Supplies', 'description' => 'Stationery, paper, pens, and desk items'],
            ['name' => 'Furniture', 'description' => 'Ergonomic chairs, desks, and storage cabinets'],
            ['name' => 'Networking', 'description' => 'Routers, switches, cables, and patch panels'],
            ['name' => 'Accessories', 'description' => 'Keyboards, mice, adapters, and peripherals'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[] = Category::firstOrCreate(['name' => $c['name']], $c);
        }

        // 3. Create Suppliers
        $suppliersData = [
            [
                'name' => 'Apex Tech Distributors',
                'contact_person' => 'Robert Johnson',
                'phone' => '+1 (555) 234-5678',
                'email' => 'sales@apextech.com',
                'address' => '100 Silicon Blvd, Suite 400, San Jose, CA',
                'is_active' => true,
            ],
            [
                'name' => 'Global Office Supply Co.',
                'contact_person' => 'Sarah Miller',
                'phone' => '+1 (555) 876-5432',
                'email' => 'orders@globaloffice.com',
                'address' => '452 Commerce Way, Chicago, IL',
                'is_active' => true,
            ],
            [
                'name' => 'Nordic Comfort Furniture',
                'contact_person' => 'Lukas Jensen',
                'phone' => '+1 (555) 345-6789',
                'email' => 'contact@nordicfurniture.com',
                'address' => '789 Scandinavian Rd, Minneapolis, MN',
                'is_active' => true,
            ],
            [
                'name' => 'NetConnect Systems Inc.',
                'contact_person' => 'Elena Rodriguez',
                'phone' => '+1 (555) 901-2345',
                'email' => 'support@netconnect.io',
                'address' => '210 Fiber Optic Way, Austin, TX',
                'is_active' => true,
            ],
            [
                'name' => 'Prime Peripherals Ltd.',
                'contact_person' => 'David Kim',
                'phone' => '+1 (555) 432-1098',
                'email' => 'deals@primeperipherals.com',
                'address' => '55 Tech Park, Boston, MA',
                'is_active' => true,
            ],
        ];

        $suppliers = [];
        foreach ($suppliersData as $s) {
            $suppliers[] = Supplier::firstOrCreate(['name' => $s['name']], $s);
        }

        // 4. Create Products
        $productsData = [
            [
                'name' => 'Dell Latitude 15" Laptop',
                'sku' => 'LAP-DELL-15',
                'category_id' => $categories[0]->id,
                'supplier_id' => $suppliers[0]->id,
                'description' => 'Intel Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro',
                'unit_price' => 899.99,
                'current_stock' => 24,
                'minimum_stock' => 10,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'LG 27" 4K IPS Monitor',
                'sku' => 'MON-LG-27',
                'category_id' => $categories[0]->id,
                'supplier_id' => $suppliers[0]->id,
                'description' => 'UltraFine 4K UHD with USB-C and HDMI inputs',
                'unit_price' => 349.50,
                'current_stock' => 15,
                'minimum_stock' => 5,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Logitech MX Master 3S Mouse',
                'sku' => 'MOU-LOG-3S',
                'category_id' => $categories[4]->id,
                'supplier_id' => $suppliers[4]->id,
                'description' => 'Wireless performance mouse with ultra-fast scrolling',
                'unit_price' => 99.00,
                'current_stock' => 8, // LOW STOCK
                'minimum_stock' => 15,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Logitech MX Mechanical Keyboard',
                'sku' => 'KEY-LOG-MEC',
                'category_id' => $categories[4]->id,
                'supplier_id' => $suppliers[4]->id,
                'description' => 'Wireless mechanical keyboard with tactile quiet switches',
                'unit_price' => 149.99,
                'current_stock' => 12,
                'minimum_stock' => 10,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Cisco Catalyst 24-Port Switch',
                'sku' => 'NET-CS-24P',
                'category_id' => $categories[3]->id,
                'supplier_id' => $suppliers[3]->id,
                'description' => 'Gigabit Ethernet Managed PoE+ Switch',
                'unit_price' => 520.00,
                'current_stock' => 4, // LOW STOCK
                'minimum_stock' => 5,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Cat6 Ethernet Cable (50ft)',
                'sku' => 'CAB-CAT6-50',
                'category_id' => $categories[3]->id,
                'supplier_id' => $suppliers[3]->id,
                'description' => 'Snagless UTP Patch Cable RJ45 550MHz',
                'unit_price' => 12.99,
                'current_stock' => 120,
                'minimum_stock' => 30,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Ergonomic Mesh High-Back Chair',
                'sku' => 'FUR-CHR-ERG',
                'category_id' => $categories[2]->id,
                'supplier_id' => $suppliers[2]->id,
                'description' => 'Adjustable lumbar support, 3D armrests, tilt mechanism',
                'unit_price' => 280.00,
                'current_stock' => 18,
                'minimum_stock' => 8,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Electric Height Adjustable Desk',
                'sku' => 'FUR-DSK-ADJ',
                'category_id' => $categories[2]->id,
                'supplier_id' => $suppliers[2]->id,
                'description' => 'Dual motor 60x30 inch motorized standing desk frame',
                'unit_price' => 449.00,
                'current_stock' => 6,
                'minimum_stock' => 5,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Heavy Duty 2-Drawer Filing Cabinet',
                'sku' => 'FUR-CAB-2DR',
                'category_id' => $categories[2]->id,
                'supplier_id' => $suppliers[2]->id,
                'description' => 'Steel locking storage cabinet with anti-tip system',
                'unit_price' => 165.00,
                'current_stock' => 0, // OUT OF STOCK
                'minimum_stock' => 4,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Multipurpose Copy Paper (5 Reams/Case)',
                'sku' => 'OFC-PAP-8511',
                'category_id' => $categories[1]->id,
                'supplier_id' => $suppliers[1]->id,
                'description' => '20lb Bright White 8.5 x 11 inches 92 bright',
                'unit_price' => 42.50,
                'current_stock' => 35,
                'minimum_stock' => 15,
                'unit' => 'box',
                'status' => 'active',
            ],
            [
                'name' => 'Gel Pen 0.7mm Black (Pack of 12)',
                'sku' => 'OFC-PEN-GEL12',
                'category_id' => $categories[1]->id,
                'supplier_id' => $suppliers[1]->id,
                'description' => 'Smooth writing quick dry retractable gel roller pens',
                'unit_price' => 14.80,
                'current_stock' => 75,
                'minimum_stock' => 20,
                'unit' => 'pack',
                'status' => 'active',
            ],
            [
                'name' => 'Dry Erase Whiteboard 48"x36"',
                'sku' => 'OFC-BRD-4836',
                'category_id' => $categories[1]->id,
                'supplier_id' => $suppliers[1]->id,
                'description' => 'Magnetic aluminum framed dry wipe whiteboard with tray',
                'unit_price' => 68.00,
                'current_stock' => 2, // LOW STOCK
                'minimum_stock' => 6,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'USB-C Multiport Hub Adapter 7-in-1',
                'sku' => 'ACC-HUB-7IN1',
                'category_id' => $categories[4]->id,
                'supplier_id' => $suppliers[4]->id,
                'description' => '4K HDMI, 100W PD charging, USB 3.0, SD card reader',
                'unit_price' => 39.95,
                'current_stock' => 42,
                'minimum_stock' => 15,
                'unit' => 'pcs',
                'status' => 'active',
            ],
            [
                'name' => 'Anker 65W GaN Fast Charger',
                'sku' => 'ACC-CHG-65W',
                'category_id' => $categories[4]->id,
                'supplier_id' => $suppliers[4]->id,
                'description' => 'Foldable 3-port compact wall charger for laptops and phones',
                'unit_price' => 45.00,
                'current_stock' => 0, // OUT OF STOCK
                'minimum_stock' => 10,
                'unit' => 'pcs',
                'status' => 'active',
            ],
        ];

        $createdProducts = [];
        foreach ($productsData as $pData) {
            $createdProducts[] = Product::firstOrCreate(['sku' => $pData['sku']], $pData);
        }

        // 5. Create Realistic Transactions
        $now = Carbon::now();

        $transactionsData = [
            [
                'product' => $createdProducts[0],
                'type' => 'STOCK_IN',
                'qty' => 30,
                'prev' => 0,
                'new' => 30,
                'cost' => 750.00,
                'supplier' => $suppliers[0],
                'ref' => 'PO-2026-001',
                'days_ago' => 20,
            ],
            [
                'product' => $createdProducts[0],
                'type' => 'STOCK_OUT',
                'qty' => 6,
                'prev' => 30,
                'new' => 24,
                'cost' => null,
                'supplier' => null,
                'ref' => 'DISP-2026-081',
                'reason' => 'Distributed to Engineering Department',
                'days_ago' => 5,
            ],
            [
                'product' => $createdProducts[1],
                'type' => 'STOCK_IN',
                'qty' => 20,
                'prev' => 0,
                'new' => 20,
                'cost' => 290.00,
                'supplier' => $suppliers[0],
                'ref' => 'PO-2026-002',
                'days_ago' => 18,
            ],
            [
                'product' => $createdProducts[1],
                'type' => 'STOCK_OUT',
                'qty' => 5,
                'prev' => 20,
                'new' => 15,
                'cost' => null,
                'supplier' => null,
                'ref' => 'DISP-2026-088',
                'reason' => 'Workstation upgrades for design team',
                'days_ago' => 4,
            ],
            [
                'product' => $createdProducts[2],
                'type' => 'STOCK_IN',
                'qty' => 25,
                'prev' => 0,
                'new' => 25,
                'cost' => 80.00,
                'supplier' => $suppliers[4],
                'ref' => 'PO-2026-003',
                'days_ago' => 15,
            ],
            [
                'product' => $createdProducts[2],
                'type' => 'STOCK_OUT',
                'qty' => 17,
                'prev' => 25,
                'new' => 8,
                'cost' => null,
                'supplier' => null,
                'ref' => 'DISP-2026-092',
                'reason' => 'Staff standard setup issuance',
                'days_ago' => 2,
            ],
            [
                'product' => $createdProducts[5],
                'type' => 'STOCK_IN',
                'qty' => 150,
                'prev' => 0,
                'new' => 150,
                'cost' => 9.50,
                'supplier' => $suppliers[3],
                'ref' => 'PO-2026-004',
                'days_ago' => 12,
            ],
            [
                'product' => $createdProducts[5],
                'type' => 'STOCK_OUT',
                'qty' => 30,
                'prev' => 150,
                'new' => 120,
                'cost' => null,
                'supplier' => null,
                'ref' => 'DISP-2026-099',
                'reason' => 'Server room wiring project',
                'days_ago' => 1,
            ],
            [
                'product' => $createdProducts[9],
                'type' => 'STOCK_IN',
                'qty' => 50,
                'prev' => 0,
                'new' => 50,
                'cost' => 35.00,
                'supplier' => $suppliers[1],
                'ref' => 'PO-2026-005',
                'days_ago' => 25,
            ],
            [
                'product' => $createdProducts[9],
                'type' => 'STOCK_OUT',
                'qty' => 15,
                'prev' => 50,
                'new' => 35,
                'cost' => null,
                'supplier' => null,
                'ref' => 'DISP-2026-077',
                'reason' => 'Quarterly copy center replenishment',
                'days_ago' => 6,
            ],
        ];

        foreach ($transactionsData as $t) {
            $createdTime = $now->copy()->subDays($t['days_ago'])->addHours(rand(1, 10));

            InventoryTransaction::create([
                'product_id' => $t['product']->id,
                'user_id' => $admin->id,
                'transaction_type' => $t['type'],
                'quantity' => $t['qty'],
                'previous_stock' => $t['prev'],
                'new_stock' => $t['new'],
                'unit_cost' => $t['cost'],
                'total_cost' => $t['cost'] ? $t['cost'] * $t['qty'] : null,
                'supplier_id' => $t['supplier'] ? $t['supplier']->id : null,
                'reference_number' => $t['ref'],
                'reason' => $t['reason'] ?? null,
                'notes' => 'Seeded transaction record',
                'created_at' => $createdTime,
                'updated_at' => $createdTime,
            ]);
        }
    }
}
