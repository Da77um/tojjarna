// ==================== AUTH ====================
export type UserRole = 'admin' | 'vendor' | 'customer'

export interface User {
    id: string
    email: string
    name: string
    phone?: string
    role: UserRole
    avatar_url?: string
    created_at: string
}

// ==================== STORE ====================
export interface Plan {
    id: string
    name_ar: string
    name_en: string
    price_jod: number
    commission_rate: number // percentage e.g. 2.5
    features: string[]
}

export interface StoreTheme {
    primary_color: string
    secondary_color: string
    font: string
    layout: 'grid' | 'list'
    hero_image?: string
    logo_position: 'left' | 'center'
}

export interface Store {
    id: string
    user_id: string
    name_ar: string
    name_en: string
    slug: string
    description_ar?: string
    description_en?: string
    logo_url?: string
    banner_url?: string
    theme: StoreTheme
    plan_id: string
    is_active: boolean
    whatsapp?: string
    instagram?: string
    created_at: string
}

// ==================== PRODUCTS ====================
export interface Category {
    id: string
    store_id: string
    name_ar: string
    name_en: string
    parent_id?: string
    image_url?: string
    sort_order: number
}

export interface ProductVariant {
    id: string
    product_id: string
    name_ar: string
    name_en: string
    price_modifier: number
    stock: number
    sku?: string
}

export interface Product {
    id: string
    store_id: string
    category_id?: string
    name_ar: string
    name_en: string
    description_ar?: string
    description_en?: string
    price: number // JOD
    compare_price?: number // JOD (crossed-out original price)
    sku?: string
    stock: number
    is_digital: boolean
    is_active: boolean
    images: string[]
    variants?: ProductVariant[]
    created_at: string
}

// ==================== ORDERS ====================
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentMethod = 'cod' | 'card' | 'apple_pay' | 'google_pay'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface ShippingAddress {
    full_name: string
    phone: string
    city: string
    area: string
    street: string
    building?: string
    notes?: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    variant_id?: string
    product_name_ar: string
    product_name_en: string
    product_image?: string
    quantity: number
    price: number // JOD at time of purchase
}

export interface Order {
    id: string
    store_id: string
    customer_name: string
    customer_email?: string
    customer_phone: string
    status: OrderStatus
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    subtotal: number
    shipping_cost: number
    discount: number
    total: number // JOD
    shipping_address: ShippingAddress
    coupon_code?: string
    notes?: string
    items: OrderItem[]
    created_at: string
    updated_at: string
}

// ==================== COUPONS ====================
export type CouponType = 'percent' | 'fixed'

export interface Coupon {
    id: string
    store_id: string
    code: string
    type: CouponType
    value: number
    min_order?: number
    usage_limit?: number
    usage_count: number
    expires_at?: string
    is_active: boolean
}

// ==================== REVIEWS ====================
export interface Review {
    id: string
    product_id: string
    customer_name: string
    rating: number // 1-5
    comment?: string
    is_approved: boolean
    created_at: string
}

// ==================== ANALYTICS ====================
export interface DashboardStats {
    total_revenue: number
    total_orders: number
    total_products: number
    total_customers: number
    orders_today: number
    revenue_today: number
    pending_orders: number
    low_stock_products: number
}
