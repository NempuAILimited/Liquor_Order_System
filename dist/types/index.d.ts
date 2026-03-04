/** Category of liquor */
export type LiquorCategory = 'IMFL_WHISKY' | 'IMFL_RUM' | 'IMFL_VODKA' | 'IMFL_GIN' | 'IMFL_BRANDY' | 'BEER' | 'WINE' | 'COUNTRY_LIQUOR';
/** Size of the bottle */
export type BottleSize = '180ml' | '375ml' | '750ml' | '1L';
/** A single liquor item in the catalog */
export interface LiquorItem {
    id: string;
    name: string;
    brand: string;
    category: LiquorCategory;
    size: BottleSize;
    pricePerUnit: number;
    exciseDuty: number;
    hsnCode: string;
    availableSizes: BottleSize[];
}
/** An item added to the current order cart */
export interface CartItem {
    liquorItem: LiquorItem;
    quantity: number;
    unitsPerCase: number;
    totalBottles: number;
    totalAmount: number;
    exciseAmount: number;
}
/** Status of an order */
export type OrderStatus = 'DRAFT' | 'SUBMITTED' | 'PDF_GENERATED' | 'UPLOADED';
/** A complete purchase order */
export interface Order {
    id: string;
    orderNumber: string;
    barLicenseNumber: string;
    barName: string;
    barAddress: string;
    ownerName: string;
    contactNumber: string;
    orderDate: string;
    items: CartItem[];
    subtotal: number;
    totalExcise: number;
    grandTotal: number;
    status: OrderStatus;
    pdfPath?: string;
    createdAt: string;
}
/** Configuration for generating PDF */
export interface PdfConfig {
    order: Order;
    outputPath: string;
}
/** Bar/business profile info */
export interface BarProfile {
    barName: string;
    barLicenseNumber: string;
    barAddress: string;
    ownerName: string;
    contactNumber: string;
    gstin: string;
    district: string;
    state: string;
}
/** API response wrapper */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
//# sourceMappingURL=index.d.ts.map