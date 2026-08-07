export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shipping_addresses: {
        Row: {
          id: string;
          user_id: string;
          recipient_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          province: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipient_name: string;
          phone: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          province: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipient_name?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          province?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category_slug: string;
          collection: string;
          brand: string;
          price: number;
          compare_at_price: number | null;
          rating: number;
          review_count: number;
          image_url: string;
          badge: "New" | "Best Seller" | "Premium" | null;
          featured: boolean;
          stock: number;
          on_sale: boolean;
          unit: string | null;
          arrival: boolean;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category_slug: string;
          collection: string;
          brand: string;
          price: number;
          compare_at_price?: number | null;
          rating?: number;
          review_count?: number;
          image_url: string;
          badge?: "New" | "Best Seller" | "Premium" | null;
          featured?: boolean;
          stock?: number;
          on_sale?: boolean;
          unit?: string | null;
          arrival?: boolean;
          tags?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
