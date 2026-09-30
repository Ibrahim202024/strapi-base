/** Shapes returned by Neop's Strapi API, as this client consumes them. */

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  name?: string;
  width?: number;
  height?: number;
  /** Present because Neop's media fields accept videos as well as images. */
  mime?: string | null;
}

export interface Localization {
  locale: string;
  slug: string;
}

export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  metaImage?: StrapiMedia | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
}

export interface Category {
  name: string;
}

/** A node in a Strapi `blocks` (rich text) field. */
export interface BlockNode {
  type: string;
  children?: BlockNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  level?: number;
  format?: 'ordered' | 'unordered';
  image?: StrapiMedia;
  language?: string;
}

/** One entry in a dynamic zone. `__component` selects the renderer. */
export interface DynamicZoneEntry {
  __component: string;
  id: number;
  [key: string]: unknown;
}

export interface Page {
  documentId: string;
  slug: string;
  locale: string;
  seo?: Seo | null;
  dynamic_zone?: DynamicZoneEntry[];
  localizations?: Localization[];
}

export interface Article {
  documentId: string;
  title: string;
  description?: string | null;
  slug: string;
  locale: string;
  content: BlockNode[];
  image?: StrapiMedia | null;
  categories?: Category[];
  publishedAt: string;
  seo?: Seo | null;
  dynamic_zone?: DynamicZoneEntry[];
  localizations?: Localization[];
}




export interface NavbarLink {
  text: string;
  URL: string;
  target?: string | null;
  children?: NavbarLink[];
}

export interface Global {
  navbar?: {
    logo?: StrapiMedia | null;
    left_navbar_items?: NavbarLink[];
    right_navbar_items?: NavbarLink[];
  } | null;
  footer?: {
    logo?: StrapiMedia | null;
    description?: string | null;
    copyright?: string | null;
    designed_developed_by?: string | null;
    built_with?: string | null;
    internal_links?: NavbarLink[];
    policy_links?: NavbarLink[];
    social_media_links?: NavbarLink[];
  } | null;
  seo?: Seo | null;
}

/** A landing/index single type — `blog-page` and `product-page` share a shape. */
export interface IndexPage {
  heading?: string | null;
  sub_heading?: string | null;
  seo?: Seo | null;
}

/** The signed-in user, as `/api/auth/me` returns it. */
export interface SessionUser {
  id: number;
  username: string;
  email: string;
}

// ??? Phase 2 � Core CMS Types ????????????????????????????????????????????????

export interface AnnouncementBar {
  enabled: boolean;
  message?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  dismissible: boolean;
}

export interface Popup {
  enabled: boolean;
  title?: string | null;
  content?: string | null;
  image?: StrapiMedia | null;
  cta_text?: string | null;
  cta_url?: string | null;
  trigger: 'on_load' | 'on_exit_intent' | 'on_scroll' | 'on_delay';
  delay_seconds: number;
  display_frequency: 'every_visit' | 'once_per_session' | 'once_ever';
  start_date?: string | null;
  end_date?: string | null;
}

export interface TrackingSettings {
  gtm_id?: string | null;
  ga4_id?: string | null;
  meta_pixel_id?: string | null;
  snapchat_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  linkedin_insight_id?: string | null;
  google_ads_id?: string | null;
  google_search_console_verification?: string | null;
  bing_verification?: string | null;
}

export interface SchemaSettings {
  schema_type: 'Organization' | 'LocalBusiness' | 'Corporation' | 'HealthAndBeautyBusiness' | 'FoodEstablishment' | 'RealEstateAgent' | 'EducationalOrganization' | 'LegalService' | 'FinancialService';
  business_name?: string | null;
  description?: string | null;
  logo?: StrapiMedia | null;
  phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  opening_hours?: string | null;
  price_range?: string | null;
  social_profiles?: string[] | null;
  founded_year?: number | null;
  number_of_employees?: 'n_1_10' | 'n_11_50' | 'n_51_200' | 'n_201_1000' | 'n_1001_plus' | null;
}

export interface FormField {
  field_type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file';
  label: string;
  name: string;
  placeholder?: string | null;
  required: boolean;
  options?: string | null;
  validation_pattern?: string | null;
  half_width: boolean;
}

export interface Form {
  documentId: string;
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  submit_label?: string | null;
  success_message?: string | null;
  failure_message?: string | null;
  fields?: FormField[];
  notification_email?: string | null;
  store_submissions: boolean;
}

export interface Redirection {
  documentId: string;
  source?: string | null;
  from?: string | null;
  destination?: string | null;
  to?: string | null;
  status_code: 'code_301' | 'code_302';
}

export interface SiteSettings {
  site_name: string;
  tagline?: string | null;
  logo?: StrapiMedia | null;
  logo_dark?: StrapiMedia | null;
  favicon?: StrapiMedia | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  google_maps_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
}
