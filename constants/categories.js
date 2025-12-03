const CATEGORIES = {
  // ============================================
  // MAIN CATEGORIES (Level 0 - Root)
  // ============================================
  MOBILE: {
    titleFa: 'موبایل',
    titleEn: 'Mobile',
    slug: 'mobile',
    image: '/images/categories/mobile.png',
  },
  LAPTOP: {
    titleFa: 'لپ تاپ',
    titleEn: 'Laptop',
    slug: 'laptop',
    image: '/images/categories/laptop.png',
  },
  DIGITAL: {
    titleFa: 'کالای دیجیتال',
    titleEn: 'Digital Products',
    slug: 'digital',
    image: '/images/categories/digital.png',
  },
  HOME_APPLIANCES: {
    titleFa: 'لوازم خانگی',
    titleEn: 'Home Appliances',
    slug: 'home-appliances',
    image: '/images/categories/home-appliances.png',
  },
  FASHION: {
    titleFa: 'مد و پوشاک',
    titleEn: 'Fashion & Clothing',
    slug: 'fashion',
    image: '/images/categories/fashion.png',
  },
  BEAUTY: {
    titleFa: 'زیبایی و سلامت',
    titleEn: 'Beauty & Health',
    slug: 'beauty-health',
    image: '/images/categories/beauty.png',
  },
  SUPERMARKET: {
    titleFa: 'سوپرمارکت',
    titleEn: 'Supermarket',
    slug: 'supermarket',
    image: '/images/categories/supermarket.png',
  },
  HOME_KITCHEN: {
    titleFa: 'خانه و آشپزخانه',
    titleEn: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: '/images/categories/home-kitchen.png',
  },
  BOOKS: {
    titleFa: 'کتاب، لوازم تحریر و هنر',
    titleEn: 'Books, Stationery & Art',
    slug: 'books-stationery',
    image: '/images/categories/books.png',
  },
  SPORTS: {
    titleFa: 'ورزش و سفر',
    titleEn: 'Sports & Travel',
    slug: 'sports-travel',
    image: '/images/categories/sports.png',
  },
  TOYS: {
    titleFa: 'اسباب بازی، کودک و نوزاد',
    titleEn: 'Toys, Kids & Baby',
    slug: 'toys-kids',
    image: '/images/categories/toys.png',
  },
  TOOLS: {
    titleFa: 'ابزارآلات و تجهیزات',
    titleEn: 'Tools & Equipment',
    slug: 'tools',
    image: '/images/categories/tools.png',
  },
  CAR: {
    titleFa: 'خودرو و موتورسیکلت',
    titleEn: 'Automotive & Motorcycle',
    slug: 'automotive',
    image: '/images/categories/automotive.png',
  },
};

// ============================================
// FULL CATEGORY TREE (Nested Structure)
// ============================================
const CATEGORY_TREE = [
  {
    titleFa: 'موبایل',
    titleEn: 'Mobile',
    slug: 'mobile',
    children: [
      {
        titleFa: 'گوشی موبایل',
        titleEn: 'Mobile Phone',
        slug: 'mobile-phone',
        returnReasonAlert: 'کالا باید در شرایط اولیه و بدون خراشیدگی باشد',
        children: [
          { titleFa: 'گوشی اپل', titleEn: 'Apple Phone', slug: 'mobile-phone-apple' },
          { titleFa: 'گوشی سامسونگ', titleEn: 'Samsung Phone', slug: 'mobile-phone-samsung' },
          { titleFa: 'گوشی شیائومی', titleEn: 'Xiaomi Phone', slug: 'mobile-phone-xiaomi' },
          { titleFa: 'گوشی هواوی', titleEn: 'Huawei Phone', slug: 'mobile-phone-huawei' },
          { titleFa: 'گوشی نوکیا', titleEn: 'Nokia Phone', slug: 'mobile-phone-nokia' },
          { titleFa: 'گوشی ریلمی', titleEn: 'Realme Phone', slug: 'mobile-phone-realme' },
          { titleFa: 'گوشی آنر', titleEn: 'Honor Phone', slug: 'mobile-phone-honor' },
          { titleFa: 'گوشی موتورولا', titleEn: 'Motorola Phone', slug: 'mobile-phone-motorola' },
          { titleFa: 'گوشی وان پلاس', titleEn: 'OnePlus Phone', slug: 'mobile-phone-oneplus' },
          { titleFa: 'گوشی گوگل پیکسل', titleEn: 'Google Pixel', slug: 'mobile-phone-google' },
        ],
      },
      {
        titleFa: 'لوازم جانبی موبایل',
        titleEn: 'Mobile Accessories',
        slug: 'mobile-accessories',
        children: [
          { titleFa: 'شارژر گوشی', titleEn: 'Phone Charger', slug: 'phone-charger' },
          { titleFa: 'شارژر وایرلس', titleEn: 'Wireless Charger', slug: 'wireless-charger' },
          { titleFa: 'قاب گوشی', titleEn: 'Phone Case', slug: 'phone-case' },
          { titleFa: 'گلس گوشی', titleEn: 'Screen Protector', slug: 'screen-protector' },
          { titleFa: 'کابل شارژ', titleEn: 'Charging Cable', slug: 'charging-cable' },
          { titleFa: 'پاوربانک', titleEn: 'Power Bank', slug: 'power-bank' },
          { titleFa: 'هولدر گوشی', titleEn: 'Phone Holder', slug: 'phone-holder' },
          { titleFa: 'مونوپاد', titleEn: 'Monopod', slug: 'monopod' },
        ],
      },
      {
        titleFa: 'هدفون',
        titleEn: 'Headphones',
        slug: 'headphones',
        children: [
          { titleFa: 'هدفون بی‌سیم', titleEn: 'Wireless Headphones', slug: 'wireless-headphones' },
          { titleFa: 'هدفون گیمینگ', titleEn: 'Gaming Headphones', slug: 'gaming-headphones' },
          { titleFa: 'ایرپاد اپل', titleEn: 'Apple AirPods', slug: 'apple-airpods' },
          { titleFa: 'ایربادز سامسونگ', titleEn: 'Samsung Galaxy Buds', slug: 'samsung-buds' },
          { titleFa: 'هدفون سونی', titleEn: 'Sony Headphones', slug: 'sony-headphones' },
          { titleFa: 'هدفون جی بی ال', titleEn: 'JBL Headphones', slug: 'jbl-headphones' },
        ],
      },
      {
        titleFa: 'ساعت هوشمند',
        titleEn: 'Smart Watch',
        slug: 'smart-watch',
        children: [
          { titleFa: 'اپل واچ', titleEn: 'Apple Watch', slug: 'apple-watch' },
          { titleFa: 'ساعت سامسونگ', titleEn: 'Samsung Watch', slug: 'samsung-watch' },
          { titleFa: 'ساعت شیائومی', titleEn: 'Xiaomi Watch', slug: 'xiaomi-watch' },
          { titleFa: 'مچ‌بند هوشمند', titleEn: 'Smart Band', slug: 'smart-band' },
        ],
      },
    ],
  },
  {
    titleFa: 'لپ تاپ',
    titleEn: 'Laptop',
    slug: 'laptop',
    children: [
      {
        titleFa: 'لپ تاپ ایسوس',
        titleEn: 'ASUS Laptop',
        slug: 'laptop-asus',
        children: [
          { titleFa: 'لپ تاپ VivoBook', titleEn: 'VivoBook', slug: 'asus-vivobook' },
          { titleFa: 'لپ تاپ ZenBook', titleEn: 'ZenBook', slug: 'asus-zenbook' },
          { titleFa: 'لپ تاپ TUF Gaming', titleEn: 'TUF Gaming', slug: 'asus-tuf' },
          { titleFa: 'لپ تاپ ROG', titleEn: 'ROG', slug: 'asus-rog' },
        ],
      },
      {
        titleFa: 'لپ تاپ لنوو',
        titleEn: 'Lenovo Laptop',
        slug: 'laptop-lenovo',
        children: [
          { titleFa: 'لپ تاپ IdeaPad', titleEn: 'IdeaPad', slug: 'lenovo-ideapad' },
          { titleFa: 'لپ تاپ ThinkPad', titleEn: 'ThinkPad', slug: 'lenovo-thinkpad' },
          { titleFa: 'لپ تاپ LOQ', titleEn: 'LOQ Gaming', slug: 'lenovo-loq' },
          { titleFa: 'لپ تاپ Legion', titleEn: 'Legion Gaming', slug: 'lenovo-legion' },
        ],
      },
      {
        titleFa: 'مک بوک',
        titleEn: 'MacBook',
        slug: 'macbook',
        children: [
          { titleFa: 'مک بوک ایر', titleEn: 'MacBook Air', slug: 'macbook-air' },
          { titleFa: 'مک بوک پرو', titleEn: 'MacBook Pro', slug: 'macbook-pro' },
        ],
      },
      {
        titleFa: 'لپ تاپ سرفیس',
        titleEn: 'Surface Laptop',
        slug: 'surface-laptop',
      },
      {
        titleFa: 'لپ تاپ اچ پی',
        titleEn: 'HP Laptop',
        slug: 'laptop-hp',
      },
      {
        titleFa: 'لپ تاپ دل',
        titleEn: 'Dell Laptop',
        slug: 'laptop-dell',
      },
      {
        titleFa: 'لپ تاپ ایسر',
        titleEn: 'Acer Laptop',
        slug: 'laptop-acer',
      },
      {
        titleFa: 'لپ تاپ MSI',
        titleEn: 'MSI Laptop',
        slug: 'laptop-msi',
      },
      {
        titleFa: 'لپ تاپ گیمینگ',
        titleEn: 'Gaming Laptop',
        slug: 'laptop-gaming',
      },
      {
        titleFa: 'لوازم جانبی لپ تاپ',
        titleEn: 'Laptop Accessories',
        slug: 'laptop-accessories',
        children: [
          { titleFa: 'کیف لپ تاپ', titleEn: 'Laptop Bag', slug: 'laptop-bag' },
          { titleFa: 'شارژر لپ تاپ', titleEn: 'Laptop Charger', slug: 'laptop-charger' },
          { titleFa: 'کول پد', titleEn: 'Cooling Pad', slug: 'cooling-pad' },
          { titleFa: 'ماوس', titleEn: 'Mouse', slug: 'mouse' },
          { titleFa: 'ماوس پد', titleEn: 'Mouse Pad', slug: 'mouse-pad' },
          { titleFa: 'استیکر لپ تاپ', titleEn: 'Laptop Sticker', slug: 'laptop-sticker' },
        ],
      },
    ],
  },
  {
    titleFa: 'کالای دیجیتال',
    titleEn: 'Digital Products',
    slug: 'digital',
    children: [
      {
        titleFa: 'کنسول بازی',
        titleEn: 'Gaming Console',
        slug: 'gaming-console',
        children: [
          { titleFa: 'پلی استیشن ۵', titleEn: 'PlayStation 5', slug: 'ps5' },
          { titleFa: 'پلی استیشن ۴', titleEn: 'PlayStation 4', slug: 'ps4' },
          { titleFa: 'ایکس باکس', titleEn: 'Xbox', slug: 'xbox' },
          { titleFa: 'نینتندو', titleEn: 'Nintendo', slug: 'nintendo' },
        ],
      },
      {
        titleFa: 'لوازم گیمینگ',
        titleEn: 'Gaming Accessories',
        slug: 'gaming-accessories',
        children: [
          { titleFa: 'دسته بازی', titleEn: 'Game Controller', slug: 'game-controller' },
          { titleFa: 'صندلی گیمینگ', titleEn: 'Gaming Chair', slug: 'gaming-chair' },
          { titleFa: 'فرمان بازی', titleEn: 'Racing Wheel', slug: 'racing-wheel' },
          { titleFa: 'دیسک بازی', titleEn: 'Game Disc', slug: 'game-disc' },
        ],
      },
      {
        titleFa: 'تبلت',
        titleEn: 'Tablet',
        slug: 'tablet',
        children: [
          { titleFa: 'آیپد', titleEn: 'iPad', slug: 'ipad' },
          { titleFa: 'تبلت سامسونگ', titleEn: 'Samsung Tablet', slug: 'tablet-samsung' },
          { titleFa: 'تبلت شیائومی', titleEn: 'Xiaomi Tablet', slug: 'tablet-xiaomi' },
          { titleFa: 'سرفیس', titleEn: 'Surface', slug: 'surface' },
        ],
      },
      {
        titleFa: 'کامپیوتر',
        titleEn: 'Computer',
        slug: 'computer',
        children: [
          { titleFa: 'کامپیوتر کامل', titleEn: 'Complete PC', slug: 'complete-pc' },
          { titleFa: 'کامپیوتر گیمینگ', titleEn: 'Gaming PC', slug: 'gaming-pc' },
          { titleFa: 'All in One', titleEn: 'All in One', slug: 'all-in-one' },
          { titleFa: 'Mini PC', titleEn: 'Mini PC', slug: 'mini-pc' },
        ],
      },
      {
        titleFa: 'قطعات کامپیوتر',
        titleEn: 'Computer Parts',
        slug: 'computer-parts',
        children: [
          { titleFa: 'کارت گرافیک', titleEn: 'Graphics Card', slug: 'graphics-card' },
          { titleFa: 'پردازنده', titleEn: 'Processor (CPU)', slug: 'cpu' },
          { titleFa: 'مادربرد', titleEn: 'Motherboard', slug: 'motherboard' },
          { titleFa: 'رم', titleEn: 'RAM', slug: 'ram' },
          { titleFa: 'هارد و SSD', titleEn: 'Storage (HDD/SSD)', slug: 'storage' },
          { titleFa: 'پاور', titleEn: 'Power Supply', slug: 'power-supply' },
          { titleFa: 'کیس', titleEn: 'PC Case', slug: 'pc-case' },
          { titleFa: 'خنک کننده', titleEn: 'Cooling', slug: 'cooling' },
        ],
      },
      {
        titleFa: 'مانیتور',
        titleEn: 'Monitor',
        slug: 'monitor',
        children: [
          { titleFa: 'مانیتور گیمینگ', titleEn: 'Gaming Monitor', slug: 'gaming-monitor' },
          { titleFa: 'مانیتور OLED', titleEn: 'OLED Monitor', slug: 'oled-monitor' },
          { titleFa: 'مانیتور 4K', titleEn: '4K Monitor', slug: '4k-monitor' },
        ],
      },
      {
        titleFa: 'اسپیکر',
        titleEn: 'Speaker',
        slug: 'speaker',
        children: [
          { titleFa: 'اسپیکر بلوتوثی', titleEn: 'Bluetooth Speaker', slug: 'bluetooth-speaker' },
          { titleFa: 'اسپیکر JBL', titleEn: 'JBL Speaker', slug: 'jbl-speaker' },
          { titleFa: 'ساندبار', titleEn: 'Soundbar', slug: 'soundbar' },
        ],
      },
      {
        titleFa: 'دوربین',
        titleEn: 'Camera',
        slug: 'camera',
        children: [
          { titleFa: 'دوربین عکاسی', titleEn: 'Digital Camera', slug: 'digital-camera' },
          { titleFa: 'دوربین فیلمبرداری', titleEn: 'Video Camera', slug: 'video-camera' },
          { titleFa: 'دوربین فوری', titleEn: 'Instant Camera', slug: 'instant-camera' },
          { titleFa: 'لنز دوربین', titleEn: 'Camera Lens', slug: 'camera-lens' },
        ],
      },
      {
        titleFa: 'تجهیزات ذخیره‌سازی',
        titleEn: 'Storage Devices',
        slug: 'storage-devices',
        children: [
          { titleFa: 'فلش مموری', titleEn: 'Flash Drive', slug: 'flash-drive' },
          { titleFa: 'هارد اکسترنال', titleEn: 'External HDD', slug: 'external-hdd' },
          { titleFa: 'کارت حافظه', titleEn: 'Memory Card', slug: 'memory-card' },
        ],
      },
      {
        titleFa: 'تجهیزات شبکه',
        titleEn: 'Network Equipment',
        slug: 'network',
        children: [
          { titleFa: 'مودم و روتر', titleEn: 'Modem & Router', slug: 'modem-router' },
          { titleFa: 'اکسس پوینت', titleEn: 'Access Point', slug: 'access-point' },
          { titleFa: 'سوییچ شبکه', titleEn: 'Network Switch', slug: 'network-switch' },
        ],
      },
    ],
  },
  {
    titleFa: 'لوازم خانگی',
    titleEn: 'Home Appliances',
    slug: 'home-appliances',
    children: [
      {
        titleFa: 'تلویزیون',
        titleEn: 'Television',
        slug: 'television',
        children: [
          { titleFa: 'تلویزیون سامسونگ', titleEn: 'Samsung TV', slug: 'samsung-tv' },
          { titleFa: 'تلویزیون ال جی', titleEn: 'LG TV', slug: 'lg-tv' },
          { titleFa: 'تلویزیون سونی', titleEn: 'Sony TV', slug: 'sony-tv' },
          { titleFa: 'تلویزیون شیائومی', titleEn: 'Xiaomi TV', slug: 'xiaomi-tv' },
          { titleFa: 'تلویزیون OLED', titleEn: 'OLED TV', slug: 'oled-tv' },
          { titleFa: 'تلویزیون 4K', titleEn: '4K TV', slug: '4k-tv' },
        ],
      },
      {
        titleFa: 'یخچال و فریزر',
        titleEn: 'Refrigerator & Freezer',
        slug: 'refrigerator',
      },
      {
        titleFa: 'ماشین لباسشویی',
        titleEn: 'Washing Machine',
        slug: 'washing-machine',
      },
      {
        titleFa: 'ماشین ظرفشویی',
        titleEn: 'Dishwasher',
        slug: 'dishwasher',
      },
      {
        titleFa: 'کولر و تهویه',
        titleEn: 'Cooling & Ventilation',
        slug: 'cooling-ventilation',
        children: [
          { titleFa: 'کولر گازی', titleEn: 'Air Conditioner', slug: 'air-conditioner' },
          { titleFa: 'کولر آبی', titleEn: 'Evaporative Cooler', slug: 'evaporative-cooler' },
          { titleFa: 'پنکه', titleEn: 'Fan', slug: 'fan' },
        ],
      },
      {
        titleFa: 'لوازم آشپزخانه',
        titleEn: 'Kitchen Appliances',
        slug: 'kitchen-appliances',
        children: [
          { titleFa: 'اجاق گاز', titleEn: 'Gas Stove', slug: 'gas-stove' },
          { titleFa: 'هود آشپزخانه', titleEn: 'Range Hood', slug: 'range-hood' },
          { titleFa: 'مایکروویو', titleEn: 'Microwave', slug: 'microwave' },
          { titleFa: 'قهوه‌ساز', titleEn: 'Coffee Maker', slug: 'coffee-maker' },
          { titleFa: 'آبمیوه‌گیری', titleEn: 'Juicer', slug: 'juicer' },
          { titleFa: 'مخلوط‌کن', titleEn: 'Blender', slug: 'blender' },
          { titleFa: 'سرخ‌کن', titleEn: 'Air Fryer', slug: 'air-fryer' },
          { titleFa: 'توستر', titleEn: 'Toaster', slug: 'toaster' },
        ],
      },
      {
        titleFa: 'جاروبرقی',
        titleEn: 'Vacuum Cleaner',
        slug: 'vacuum-cleaner',
        children: [
          { titleFa: 'جاروبرقی رباتی', titleEn: 'Robot Vacuum', slug: 'robot-vacuum' },
          { titleFa: 'جاروبرقی شارژی', titleEn: 'Cordless Vacuum', slug: 'cordless-vacuum' },
        ],
      },
    ],
  },
  {
    titleFa: 'مد و پوشاک',
    titleEn: 'Fashion & Clothing',
    slug: 'fashion',
    children: [
      {
        titleFa: 'پوشاک مردانه',
        titleEn: "Men's Clothing",
        slug: 'mens-clothing',
        children: [
          { titleFa: 'تی‌شرت مردانه', titleEn: "Men's T-Shirt", slug: 'mens-tshirt' },
          { titleFa: 'پیراهن مردانه', titleEn: "Men's Shirt", slug: 'mens-shirt' },
          { titleFa: 'شلوار مردانه', titleEn: "Men's Pants", slug: 'mens-pants' },
          { titleFa: 'کت و شلوار', titleEn: 'Suit', slug: 'suit' },
        ],
      },
      {
        titleFa: 'پوشاک زنانه',
        titleEn: "Women's Clothing",
        slug: 'womens-clothing',
        children: [
          { titleFa: 'مانتو', titleEn: 'Manteau', slug: 'manteau' },
          { titleFa: 'روسری و شال', titleEn: 'Scarf', slug: 'scarf' },
          { titleFa: 'تی‌شرت زنانه', titleEn: "Women's T-Shirt", slug: 'womens-tshirt' },
        ],
      },
      {
        titleFa: 'کفش',
        titleEn: 'Shoes',
        slug: 'shoes',
        children: [
          { titleFa: 'کفش مردانه', titleEn: "Men's Shoes", slug: 'mens-shoes' },
          { titleFa: 'کفش زنانه', titleEn: "Women's Shoes", slug: 'womens-shoes' },
          { titleFa: 'کفش ورزشی', titleEn: 'Sports Shoes', slug: 'sports-shoes' },
        ],
      },
      {
        titleFa: 'ساعت',
        titleEn: 'Watch',
        slug: 'watch',
      },
      {
        titleFa: 'کیف',
        titleEn: 'Bag',
        slug: 'bag',
      },
      {
        titleFa: 'عینک',
        titleEn: 'Glasses',
        slug: 'glasses',
      },
      {
        titleFa: 'جواهرات',
        titleEn: 'Jewelry',
        slug: 'jewelry',
      },
    ],
  },
  {
    titleFa: 'زیبایی و سلامت',
    titleEn: 'Beauty & Health',
    slug: 'beauty-health',
    children: [
      {
        titleFa: 'آرایشی',
        titleEn: 'Makeup',
        slug: 'makeup',
        children: [
          { titleFa: 'رژ لب', titleEn: 'Lipstick', slug: 'lipstick' },
          { titleFa: 'کرم پودر', titleEn: 'Foundation', slug: 'foundation' },
          { titleFa: 'ریمل', titleEn: 'Mascara', slug: 'mascara' },
          { titleFa: 'سایه چشم', titleEn: 'Eyeshadow', slug: 'eyeshadow' },
        ],
      },
      {
        titleFa: 'مراقبت پوست',
        titleEn: 'Skin Care',
        slug: 'skin-care',
        children: [
          { titleFa: 'کرم مرطوب‌کننده', titleEn: 'Moisturizer', slug: 'moisturizer' },
          { titleFa: 'ضد آفتاب', titleEn: 'Sunscreen', slug: 'sunscreen' },
          { titleFa: 'ماسک صورت', titleEn: 'Face Mask', slug: 'face-mask' },
        ],
      },
      {
        titleFa: 'مراقبت مو',
        titleEn: 'Hair Care',
        slug: 'hair-care',
        children: [
          { titleFa: 'شامپو', titleEn: 'Shampoo', slug: 'shampoo' },
          { titleFa: 'نرم‌کننده', titleEn: 'Conditioner', slug: 'conditioner' },
          { titleFa: 'رنگ مو', titleEn: 'Hair Color', slug: 'hair-color' },
        ],
      },
      {
        titleFa: 'عطر و ادکلن',
        titleEn: 'Perfume',
        slug: 'perfume',
      },
      {
        titleFa: 'بهداشت شخصی',
        titleEn: 'Personal Hygiene',
        slug: 'personal-hygiene',
      },
      {
        titleFa: 'ابزار آرایش',
        titleEn: 'Beauty Tools',
        slug: 'beauty-tools',
        children: [
          { titleFa: 'سشوار', titleEn: 'Hair Dryer', slug: 'hair-dryer' },
          { titleFa: 'اتو مو', titleEn: 'Hair Straightener', slug: 'hair-straightener' },
          { titleFa: 'ماشین اصلاح', titleEn: 'Trimmer', slug: 'trimmer' },
        ],
      },
    ],
  },
  {
    titleFa: 'سوپرمارکت',
    titleEn: 'Supermarket',
    slug: 'supermarket',
    children: [
      { titleFa: 'لبنیات', titleEn: 'Dairy', slug: 'dairy' },
      { titleFa: 'نوشیدنی', titleEn: 'Beverages', slug: 'beverages' },
      { titleFa: 'تنقلات', titleEn: 'Snacks', slug: 'snacks' },
      { titleFa: 'نان و غلات', titleEn: 'Bread & Cereals', slug: 'bread-cereals' },
      { titleFa: 'کنسرو و غذای آماده', titleEn: 'Canned & Ready Food', slug: 'canned-food' },
      { titleFa: 'ادویه و چاشنی', titleEn: 'Spices & Condiments', slug: 'spices' },
      { titleFa: 'شوینده و بهداشتی', titleEn: 'Cleaning & Hygiene', slug: 'cleaning' },
    ],
  },
  {
    titleFa: 'خانه و آشپزخانه',
    titleEn: 'Home & Kitchen',
    slug: 'home-kitchen',
    children: [
      { titleFa: 'ظروف آشپزخانه', titleEn: 'Cookware', slug: 'cookware' },
      { titleFa: 'دکوراسیون', titleEn: 'Decoration', slug: 'decoration' },
      { titleFa: 'روشنایی', titleEn: 'Lighting', slug: 'lighting' },
      { titleFa: 'مبلمان', titleEn: 'Furniture', slug: 'furniture' },
      { titleFa: 'فرش و کفپوش', titleEn: 'Carpets & Flooring', slug: 'carpets' },
      { titleFa: 'سرویس خواب', titleEn: 'Bedding', slug: 'bedding' },
    ],
  },
  {
    titleFa: 'کتاب، لوازم تحریر و هنر',
    titleEn: 'Books, Stationery & Art',
    slug: 'books-stationery',
    children: [
      { titleFa: 'کتاب', titleEn: 'Books', slug: 'books' },
      { titleFa: 'لوازم تحریر', titleEn: 'Stationery', slug: 'stationery' },
      { titleFa: 'لوازم نقاشی', titleEn: 'Art Supplies', slug: 'art-supplies' },
      { titleFa: 'آلات موسیقی', titleEn: 'Musical Instruments', slug: 'musical-instruments' },
    ],
  },
  {
    titleFa: 'ورزش و سفر',
    titleEn: 'Sports & Travel',
    slug: 'sports-travel',
    children: [
      { titleFa: 'پوشاک ورزشی', titleEn: 'Sports Clothing', slug: 'sports-clothing' },
      { titleFa: 'تجهیزات بدنسازی', titleEn: 'Fitness Equipment', slug: 'fitness-equipment' },
      { titleFa: 'دوچرخه', titleEn: 'Bicycle', slug: 'bicycle' },
      { titleFa: 'کمپینگ', titleEn: 'Camping', slug: 'camping' },
      { titleFa: 'چمدان و کیف سفر', titleEn: 'Luggage', slug: 'luggage' },
    ],
  },
  {
    titleFa: 'اسباب بازی، کودک و نوزاد',
    titleEn: 'Toys, Kids & Baby',
    slug: 'toys-kids',
    children: [
      { titleFa: 'اسباب‌بازی', titleEn: 'Toys', slug: 'toys' },
      { titleFa: 'لوازم نوزاد', titleEn: 'Baby Products', slug: 'baby-products' },
      { titleFa: 'پوشاک بچگانه', titleEn: 'Kids Clothing', slug: 'kids-clothing' },
      { titleFa: 'کالسکه و صندلی ماشین', titleEn: 'Stroller & Car Seat', slug: 'stroller' },
    ],
  },
  {
    titleFa: 'ابزارآلات و تجهیزات',
    titleEn: 'Tools & Equipment',
    slug: 'tools',
    children: [
      { titleFa: 'ابزار برقی', titleEn: 'Power Tools', slug: 'power-tools' },
      { titleFa: 'ابزار دستی', titleEn: 'Hand Tools', slug: 'hand-tools' },
      { titleFa: 'تجهیزات ساختمانی', titleEn: 'Construction Equipment', slug: 'construction' },
      { titleFa: 'لوازم باغبانی', titleEn: 'Gardening Tools', slug: 'gardening' },
    ],
  },
  {
    titleFa: 'خودرو و موتورسیکلت',
    titleEn: 'Automotive & Motorcycle',
    slug: 'automotive',
    children: [
      { titleFa: 'لوازم یدکی خودرو', titleEn: 'Car Parts', slug: 'car-parts' },
      { titleFa: 'لوازم جانبی خودرو', titleEn: 'Car Accessories', slug: 'car-accessories' },
      { titleFa: 'روغن و مایعات', titleEn: 'Oils & Fluids', slug: 'oils-fluids' },
      { titleFa: 'لاستیک', titleEn: 'Tires', slug: 'tires' },
      { titleFa: 'موتورسیکلت', titleEn: 'Motorcycle', slug: 'motorcycle' },
    ],
  },
];

/**
 * Flatten tree into array format for database seeding
 * @param {Array} tree - Nested category tree
 * @param {String|null} parentSlug - Parent category slug
 * @returns {Array} Flat array of categories with parent references
 */
function flattenCategoryTree(tree, parentSlug = null) {
  let result = [];

  for (const category of tree) {
    const flatCategory = {
      titleFa: category.titleFa,
      titleEn: category.titleEn || '',
      slug: category.slug,
      parentSlug: parentSlug,
      image: category.image || '',
      returnReasonAlert: category.returnReasonAlert || '',
      isActive: true,
    };

    result.push(flatCategory);

    if (category.children && category.children.length > 0) {
      result = result.concat(flattenCategoryTree(category.children, category.slug));
    }
  }

  return result;
}

// Flattened categories for easy database seeding
const FLAT_CATEGORIES = flattenCategoryTree(CATEGORY_TREE);

module.exports = {
  CATEGORIES,
  CATEGORY_TREE,
  FLAT_CATEGORIES,
  flattenCategoryTree,
};
