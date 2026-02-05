import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Supports email/password auth with preparation for Firebase integration.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }), // Hashed password (bcrypt), nullable for Firebase users
  name: text("name"),
  phone: varchar("phone", { length: 50 }), // For future Firebase phone auth
  openId: varchar("openId", { length: 64 }).unique(), // For Manus Auth compatibility (legacy)
  firebaseUid: varchar("firebaseUid", { length: 128 }).unique(), // For future Firebase integration
  loginMethod: varchar("loginMethod", { length: 64 }).default("email").notNull(), // 'email', 'phone', 'firebase', 'manus'
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  termsAcceptedAt: timestamp("termsAcceptedAt"), // Timestamp when user accepted terms and privacy policy
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Events/Invitations table - stores event information for all event types
 * Supports: weddings, birthdays, corporate events, anniversaries, sundettoi, tusaukeser, kyz_uzatu, betashar, etc.
 */
export const weddings = mysqlTable("weddings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of the event
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL slug: bookme.kz/{slug}
  eventType: varchar("eventType", { length: 50 }).default("wedding").notNull(), // Event type: wedding, birthday, corporate, anniversary, sundettoi, tusaukeser, kyz_uzatu, betashar, other
  languageMode: varchar("languageMode", { length: 10 }).default("both").notNull(), // Language mode: ru, kz, both
  title: varchar("title", { length: 200 }).notNull(),
  titleKz: varchar("titleKz", { length: 200 }), // Kazakh translation
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 300 }).notNull(),
  locationKz: varchar("locationKz", { length: 300 }), // Kazakh translation
  description: text("description"),
  descriptionKz: text("descriptionKz"), // Kazakh translation
  backgroundImage: varchar("backgroundImage", { length: 500 }), // S3 URL
  customBackgroundUrl: varchar("customBackgroundUrl", { length: 500 }), // Custom uploaded background (overrides template)
  photoShape: varchar("photoShape", { length: 50 }).default("square"), // Photo shape: square, circle, heart, hexagon, diamond, arch, frame
  // Map integration
  mapUrl: varchar("mapUrl", { length: 500 }), // External map link (2GIS, Google Maps, Yandex)
  mapProvider: varchar("mapProvider", { length: 50 }), // "2gis", "google", "yandex", "custom"
  isPaid: boolean("isPaid").default(false).notNull(), // Premium subscription status
  // UI customization
  hideHeartIcon: boolean("hideHeartIcon").default(false).notNull(), // Option to hide heart icon
  templateId: varchar("templateId", { length: 50 }).default("default"), // Template selection
  // Premium features
  customFont: varchar("customFont", { length: 100 }), // Font family name
  customColor: varchar("customColor", { length: 50 }), // Heading text color (legacy - use textColor)
  textColor: varchar("textColor", { length: 50 }), // Main text color for all content
  themeColor: varchar("themeColor", { length: 50 }), // Theme color for buttons, icons, accents
  buttonColor: varchar("buttonColor", { length: 50 }), // Button background color
  buttonTextColor: varchar("buttonTextColor", { length: 50 }), // Button text color
  musicUrl: varchar("musicUrl", { length: 500 }), // Background music
  videoUrl: varchar("videoUrl", { length: 500 }), // Video URL
  loveStory: text("loveStory"), // Love story text
  loveStoryKz: text("loveStoryKz"), // Kazakh translation
  // Premium constructor blocks (JSON encoded settings)
  timelineData: text("timelineData"), // Program/timeline JSON
  menuData: text("menuData"), // Menu JSON
  dressCode: text("dressCode"), // Dress code text
  dressCodeKz: text("dressCodeKz"),
  coordinatorName: varchar("coordinatorName", { length: 200 }),
  coordinatorPhone: varchar("coordinatorPhone", { length: 50 }),
  coordinatorEmail: varchar("coordinatorEmail", { length: 320 }),
  qrCodeData: varchar("qrCodeData", { length: 500 }), // QR code content
  locationDetails: text("locationDetails"), // Detailed location info
  locationDetailsKz: text("locationDetailsKz"),
  // Block visibility toggles
  showTimeline: boolean("showTimeline").default(false),
  showMenu: boolean("showMenu").default(false),
  showDressCode: boolean("showDressCode").default(false),
  showQrCode: boolean("showQrCode").default(false),
  showCoordinator: boolean("showCoordinator").default(false),
  showLocationDetails: boolean("showLocationDetails").default(false),
  showHeart: boolean("showHeart").default(false), // Deprecated - use headerIcon instead
  headerIcon: varchar("headerIcon", { length: 20 }).default("none"), // Icon above name: none, heart, crescent, star, sparkle, party
  // Main blocks visibility
  showRsvp: boolean("showRsvp").default(true), // Show RSVP form
  showWishlist: boolean("showWishlist").default(true), // Show wishlist/gift registry
  showWishes: boolean("showWishes").default(true), // Show wishes/guestbook
  // Event options/policies
  childrenPolicy: varchar("childrenPolicy", { length: 20 }).default("neutral"), // "neutral", "allowed", "not_allowed"
  alcoholPolicy: varchar("alcoholPolicy", { length: 20 }).default("neutral"), // "neutral", "allowed", "not_allowed"
  photoPolicy: varchar("photoPolicy", { length: 20 }).default("neutral"), // "neutral", "allowed", "not_allowed"
  // Countdown timer
  showCountdown: boolean("showCountdown").default(true), // Show countdown timer to event
  // Block order (JSON array of block IDs in display order)
  blockOrder: text("blockOrder"), // e.g. '["countdown","hero","gallery","timeline","menu","rsvp","wishlist","wishes","info"]'
  // AI-generated invitation fields
  isAI: boolean("isAI").default(false).notNull(), // Is this an AI-generated invitation
  aiGeneratedHtml: longtext("aiGeneratedHtml"), // Full HTML code generated by AI
  aiChatHistory: longtext("aiChatHistory"), // Chat history JSON for AI editing
  // AI Package system
  aiPackage: varchar("aiPackage", { length: 20 }), // Package type: 'start', 'pro', 'unlimited', null = no package
  aiEditsLimit: int("aiEditsLimit").default(0).notNull(), // Total AI edits allowed
  aiEditsUsed: int("aiEditsUsed").default(0).notNull(), // AI edits used
  aiPackagePaidAt: timestamp("aiPackagePaidAt"), // When the package was paid
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wedding = typeof weddings.$inferSelect;
export type InsertWedding = typeof weddings.$inferInsert;

/**
 * Gallery images for weddings (premium feature)
 */
export const galleryImages = mysqlTable("galleryImages", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(), // S3 URL
  caption: varchar("caption", { length: 200 }),
  captionKz: varchar("captionKz", { length: 200 }),
  order: int("order").default(0).notNull(), // Display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

/**
 * RSVP responses from guests
 */
export const rsvps = mysqlTable("rsvps", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  // Enhanced attendance options: "yes" = Приду, "no" = Не приду, "yes_plus_one" = Приду +1, "yes_with_spouse" = Приду + супруг/супруга
  attending: mysqlEnum("attending", ["yes", "no", "yes_plus_one", "yes_with_spouse"]).notNull(),
  guestCount: int("guestCount").default(1).notNull(), // Total number of guests (1 for solo, 2 for +spouse, etc.)
  // Additional questions
  dietaryRestrictions: text("dietaryRestrictions"), // Allergies or dietary preferences
  needsParking: boolean("needsParking").default(false), // Parking requirement
  needsTransfer: boolean("needsTransfer").default(false), // Transfer/transportation requirement
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rsvp = typeof rsvps.$inferSelect;
export type InsertRsvp = typeof rsvps.$inferInsert;

/**
 * Wishlist items (gifts)
 */
export const wishlistItems = mysqlTable("wishlistItems", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  nameKz: varchar("nameKz", { length: 200 }),
  description: text("description"),
  descriptionKz: text("descriptionKz"),
  link: text("link"), // External link to product (optional)
  isReserved: boolean("isReserved").default(false).notNull(),
  reservedBy: varchar("reservedBy", { length: 200 }), // Guest name who reserved
  reservedEmail: varchar("reservedEmail", { length: 320 }),
  reservedPhone: varchar("reservedPhone", { length: 50 }),
  order: int("order").default(0).notNull(), // Display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = typeof wishlistItems.$inferInsert;

/**
 * Guest wishes/messages
 */
export const wishes = mysqlTable("wishes", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  guestName: varchar("guestName", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(), // Moderation status
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wish = typeof wishes.$inferSelect;
export type InsertWish = typeof wishes.$inferInsert;

