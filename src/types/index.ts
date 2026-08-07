/**
 * Types definition for Fabric Mart
 */

export type UserRole = 'BUYER' | 'SUPPLIER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatar?: string;
  phone?: string;
  isOnboarded?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED' | 'SUSPENDED';
  createdAt?: string;
  lastLoginAt?: string;
  buyerProfile?: BuyerProfile;
}

export interface BuyerProfile {
  userId: string;
  businessType: string;
  industry: string;
  preferredCategories: string[];
  preferredFabrics: string[];
  typicalOrderQuantity: string;
  budgetRange: string;
  sustainabilityFocus: boolean;
  notes?: string;
}

export interface SupplierRatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface SupplierReliabilityMetrics {
  onTimeShipmentRate: number; // e.g. 98.8%
  qualityPassRate: number; // e.g. 99.4%
  orderFulfillmentRate: number; // e.g. 99.9%
  avgResponseTimeHours: number; // e.g. 1.5
}

export interface SupplierReview {
  id: string;
  buyerName: string;
  buyerCompany: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  productName?: string;
}

export interface SupplierProfile {
  userId: string;
  businessName: string;
  slug: string;
  logo: string;
  bannerImage?: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  gstTaxId?: string;
  operatingHours?: string;
  moqDefault?: number;
  certifications: string[];
  fabricSpecialties: string[];
  isVerified: boolean | number; // 0=Pending, 1=Verified, 2=Rejected/Suspended
  status?: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  rating: number;
  totalProductsCount: number;
  reviewsCount?: number;
  ratingBreakdown?: SupplierRatingBreakdown;
  reliabilityMetrics?: SupplierReliabilityMetrics;
  recentReviews?: SupplierReview[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  mainFamily?: string;
  description: string;
  image: string;
  fabricCount: number;
  status?: 'ENABLED' | 'DISABLED';
  sortOrder?: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName?: string;
  mainFamily?: string;
  name: string;
  slug: string;
  description: string;
  characteristics: string[];
  commonApplications: string[];
}

export interface FabricImage {
  id: string;
  fabricId: string;
  cloudinaryPublicId?: string;
  secureUrl: string;
  thumbnailUrl: string;
  galleryUrl: string;
  zoomUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean | number;
  width?: number;
  height?: number;
  format?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  mainFamily?: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  supplierId: string;
  supplierName: string;
  supplierSlug: string;
  supplierLogo?: string;
  sku: string;
  shortDescription?: string;
  description: string;
  composition: string;
  fiberOrigin?: 'Plant' | 'Animal' | 'Synthetic' | 'Semi-Synthetic' | 'Blended' | string;
  fabricType?: string;
  weaveType?: string;
  texture?: string;
  gsm: number; // weight in g/m2
  widthCm: number; // e.g. 150cm (59 inches)
  colors: { name: string; hex: string }[];
  moq: number; // Minimum order quantity in meters
  pricePerMeter: number;
  stockQuantity: number; // in meters
  availabilityStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  breathable?: boolean;
  moistureWicking?: boolean;
  stretchable?: boolean;
  wrinkleResistant?: boolean;
  ecoFriendly?: boolean;
  hypoallergenic?: boolean;
  durabilityRating?: number; // 1 to 5
  softnessRating?: number; // 1 to 5
  applicationTags?: string[]; // e.g. ['Shirts', 'Dresses', 'Upholstery', 'Activewear']
  tags: string[]; // e.g. ['Organic', 'GOTS', 'Low Carbon', 'Recycled']
  images: string[];
  galleryImages?: FabricImage[];
  certifications: string[];
  careInstructions?: string;
  sustainabilityNotes?: string;
  rating: number;
  reviewsCount: number;
  ecoScore?: 'A+' | 'A' | 'B' | 'C';
  isApproved?: boolean | number; // 0=Pending, 1=Approved, 2=Rejected
  isFeatured?: boolean | number;
  isTrending?: boolean | number;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantityMeters: number;
  selectedColor: string;
  unitPrice: number;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Dispatch'
  | 'Shipped'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface ShippingAddress {
  companyName: string;
  contactPerson: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  supplierName: string;
  supplierId: string;
  selectedColor: string;
  quantityMeters: number;
  pricePerMeter: number;
  totalPrice: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingEstimate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  statusHistory: OrderStatusHistoryItem[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  shortAudioAnswer?: string;
  timestamp: string;
  suggestedProducts?: Product[];
  comparisonData?: {
    fabric1: string;
    fabric2: string;
    metrics: { feature: string; val1: string; val2: string }[];
    verdict: string;
  };
}

// ADMIN PANEL SPECIFIC TYPES
export interface AdminDashboardStats {
  totalBuyers: number;
  totalSuppliers: number;
  pendingSuppliersCount: number;
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  lowStockProductsCount: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentActivity: AdminActivityLog[];
  monthlyRevenueData: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { name: string; count: number; value: number }[];
  supplierGrowthData: { month: string; suppliers: number; buyers: number }[];
}

export interface AdminActivityLog {
  id: string;
  type: 'ORDER' | 'SUPPLIER' | 'PRODUCT' | 'BUYER' | 'AI' | 'SYSTEM';
  title: string;
  description: string;
  timestamp: string;
  userEmail?: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

export interface AISettings {
  enabled: boolean;
  huggingFaceApiKey: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  voiceEnabled: boolean;
  groundingWithCatalog: boolean;
  lastUpdated?: string;
}

export interface AILogItem {
  id: string;
  userQuery: string;
  userRole: string;
  aiResponse: string;
  suggestedProductsCount: number;
  timestamp: string;
  executionTimeMs: number;
  conversionRate: string;
}

export interface AnnouncementNotification {
  id: string;
  title: string;
  message: string;
  targetAudience: 'ALL' | 'BUYER' | 'SUPPLIER';
  sentBy: string;
  sentAt: string;
  readCount: number;
  priority: 'normal' | 'urgent' | 'info';
}

export interface HomepageBanner {
  id: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  imageUrl: string;
  active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContentManagementData {
  banners: HomepageBanner[];
  featuredProductIds: string[];
  faqs: FAQItem[];
  aboutContent: string;
  contactEmail: string;
  contactPhone: string;
  supportHours: string;
}

export interface SystemSettingsData {
  marketplaceName: string;
  tagline: string;
  logoUrl: string;
  currencySymbol: string;
  taxRatePercent: number;
  defaultShippingRate: number;
  maintenanceMode: boolean;
  requireSupplierApproval: boolean;
  requireProductApproval: boolean;
  jwtExpiryHours: number;
  maxLoginAttempts: number;
  smtpConfigured: boolean;
}
