// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, desc, count, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, longtext } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  // Hashed password (bcrypt), nullable for Firebase users
  name: text("name"),
  phone: varchar("phone", { length: 50 }),
  // For future Firebase phone auth
  openId: varchar("openId", { length: 64 }).unique(),
  // For Manus Auth compatibility (legacy)
  firebaseUid: varchar("firebaseUid", { length: 128 }).unique(),
  // For future Firebase integration
  loginMethod: varchar("loginMethod", { length: 64 }).default("email").notNull(),
  // 'email', 'phone', 'firebase', 'manus'
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  termsAcceptedAt: timestamp("termsAcceptedAt")
  // Timestamp when user accepted terms and privacy policy
});
var weddings = mysqlTable("weddings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Owner of the event
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  // URL slug: bookme.kz/{slug}
  eventType: varchar("eventType", { length: 50 }).default("wedding").notNull(),
  // Event type: wedding, birthday, corporate, anniversary, sundettoi, tusaukeser, kyz_uzatu, betashar, other
  languageMode: varchar("languageMode", { length: 10 }).default("both").notNull(),
  // Language mode: ru, kz, both
  title: varchar("title", { length: 200 }).notNull(),
  titleKz: varchar("titleKz", { length: 200 }),
  // Kazakh translation
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 300 }).notNull(),
  locationKz: varchar("locationKz", { length: 300 }),
  // Kazakh translation
  description: text("description"),
  descriptionKz: text("descriptionKz"),
  // Kazakh translation
  backgroundImage: varchar("backgroundImage", { length: 500 }),
  // S3 URL
  customBackgroundUrl: varchar("customBackgroundUrl", { length: 500 }),
  // Custom uploaded background (overrides template)
  photoShape: varchar("photoShape", { length: 50 }).default("square"),
  // Photo shape: square, circle, heart, hexagon, diamond, arch, frame
  // Map integration
  mapUrl: varchar("mapUrl", { length: 500 }),
  // External map link (2GIS, Google Maps, Yandex)
  mapProvider: varchar("mapProvider", { length: 50 }),
  // "2gis", "google", "yandex", "custom"
  isPaid: boolean("isPaid").default(false).notNull(),
  // Premium subscription status
  // UI customization
  hideHeartIcon: boolean("hideHeartIcon").default(false).notNull(),
  // Option to hide heart icon
  templateId: varchar("templateId", { length: 50 }).default("default"),
  // Template selection
  // Premium features
  customFont: varchar("customFont", { length: 100 }),
  // Font family name
  customColor: varchar("customColor", { length: 50 }),
  // Heading text color (legacy - use textColor)
  textColor: varchar("textColor", { length: 50 }),
  // Main text color for all content
  themeColor: varchar("themeColor", { length: 50 }),
  // Theme color for buttons, icons, accents
  buttonColor: varchar("buttonColor", { length: 50 }),
  // Button background color
  buttonTextColor: varchar("buttonTextColor", { length: 50 }),
  // Button text color
  musicUrl: varchar("musicUrl", { length: 500 }),
  // Background music
  videoUrl: varchar("videoUrl", { length: 500 }),
  // Video URL
  loveStory: text("loveStory"),
  // Love story text
  loveStoryKz: text("loveStoryKz"),
  // Kazakh translation
  // Premium constructor blocks (JSON encoded settings)
  timelineData: text("timelineData"),
  // Program/timeline JSON
  menuData: text("menuData"),
  // Menu JSON
  dressCode: text("dressCode"),
  // Dress code text
  dressCodeKz: text("dressCodeKz"),
  coordinatorName: varchar("coordinatorName", { length: 200 }),
  coordinatorPhone: varchar("coordinatorPhone", { length: 50 }),
  coordinatorEmail: varchar("coordinatorEmail", { length: 320 }),
  qrCodeData: varchar("qrCodeData", { length: 500 }),
  // QR code content
  locationDetails: text("locationDetails"),
  // Detailed location info
  locationDetailsKz: text("locationDetailsKz"),
  // Block visibility toggles
  showTimeline: boolean("showTimeline").default(false),
  showMenu: boolean("showMenu").default(false),
  showDressCode: boolean("showDressCode").default(false),
  showQrCode: boolean("showQrCode").default(false),
  showCoordinator: boolean("showCoordinator").default(false),
  showLocationDetails: boolean("showLocationDetails").default(false),
  showHeart: boolean("showHeart").default(false),
  // Deprecated - use headerIcon instead
  headerIcon: varchar("headerIcon", { length: 20 }).default("none"),
  // Icon above name: none, heart, crescent, star, sparkle, party
  // Main blocks visibility
  showRsvp: boolean("showRsvp").default(true),
  // Show RSVP form
  showWishlist: boolean("showWishlist").default(true),
  // Show wishlist/gift registry
  showWishes: boolean("showWishes").default(true),
  // Show wishes/guestbook
  // Event options/policies
  childrenPolicy: varchar("childrenPolicy", { length: 20 }).default("neutral"),
  // "neutral", "allowed", "not_allowed"
  alcoholPolicy: varchar("alcoholPolicy", { length: 20 }).default("neutral"),
  // "neutral", "allowed", "not_allowed"
  photoPolicy: varchar("photoPolicy", { length: 20 }).default("neutral"),
  // "neutral", "allowed", "not_allowed"
  // Countdown timer
  showCountdown: boolean("showCountdown").default(true),
  // Show countdown timer to event
  // Block order (JSON array of block IDs in display order)
  blockOrder: text("blockOrder"),
  // e.g. '["countdown","hero","gallery","timeline","menu","rsvp","wishlist","wishes","info"]'
  // AI-generated invitation fields
  isAI: boolean("isAI").default(false).notNull(),
  // Is this an AI-generated invitation
  aiGeneratedHtml: longtext("aiGeneratedHtml"),
  // Full HTML code generated by AI
  aiChatHistory: longtext("aiChatHistory"),
  // Chat history JSON for AI editing
  // AI Package system
  aiPackage: varchar("aiPackage", { length: 20 }),
  // Package type: 'start', 'pro', 'unlimited', null = no package
  aiEditsLimit: int("aiEditsLimit").default(0).notNull(),
  // Total AI edits allowed
  aiEditsUsed: int("aiEditsUsed").default(0).notNull(),
  // AI edits used
  aiPackagePaidAt: timestamp("aiPackagePaidAt"),
  // When the package was paid
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var galleryImages = mysqlTable("galleryImages", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  // S3 URL
  caption: varchar("caption", { length: 200 }),
  captionKz: varchar("captionKz", { length: 200 }),
  order: int("order").default(0).notNull(),
  // Display order
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var rsvps = mysqlTable("rsvps", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  // Enhanced attendance options: "yes" = Приду, "no" = Не приду, "yes_plus_one" = Приду +1, "yes_with_spouse" = Приду + супруг/супруга
  attending: mysqlEnum("attending", ["yes", "no", "yes_plus_one", "yes_with_spouse"]).notNull(),
  guestCount: int("guestCount").default(1).notNull(),
  // Total number of guests (1 for solo, 2 for +spouse, etc.)
  // Additional questions
  dietaryRestrictions: text("dietaryRestrictions"),
  // Allergies or dietary preferences
  needsParking: boolean("needsParking").default(false),
  // Parking requirement
  needsTransfer: boolean("needsTransfer").default(false),
  // Transfer/transportation requirement
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var wishlistItems = mysqlTable("wishlistItems", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  nameKz: varchar("nameKz", { length: 200 }),
  description: text("description"),
  descriptionKz: text("descriptionKz"),
  link: text("link"),
  // External link to product (optional)
  isReserved: boolean("isReserved").default(false).notNull(),
  reservedBy: varchar("reservedBy", { length: 200 }),
  // Guest name who reserved
  reservedEmail: varchar("reservedEmail", { length: 320 }),
  reservedPhone: varchar("reservedPhone", { length: 50 }),
  order: int("order").default(0).notNull(),
  // Display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var wishes = mysqlTable("wishes", {
  id: int("id").autoincrement().primaryKey(),
  weddingId: int("weddingId").notNull(),
  guestName: varchar("guestName", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  // Moderation status
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      email: user.email || user.openId || "unknown@example.com",
      // Fallback for legacy users
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value || void 0;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUser(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateUserPhone(id, phone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ phone }).where(eq(users.id, id));
}
async function createWedding(wedding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weddings).values(wedding);
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(weddings).where(eq(weddings.id, insertedId)).limit(1);
  return created[0];
}
async function getWeddingBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(weddings).where(eq(weddings.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getWeddingById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(weddings).where(eq(weddings.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserWeddings(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weddings).where(eq(weddings.userId, userId)).orderBy(desc(weddings.createdAt));
}
async function updateWedding(id, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(weddings).set(updates).where(eq(weddings.id, id));
}
async function upgradeWeddingToPremium(id) {
  console.log(`[DB] upgradeWeddingToPremium called for wedding ID: ${id}`);
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(weddings).set({ isPaid: true }).where(eq(weddings.id, id));
  console.log(`[DB] upgradeWeddingToPremium result:`, result);
  const updated = await db.select().from(weddings).where(eq(weddings.id, id));
  console.log(`[DB] Wedding ${id} isPaid status after update:`, updated[0]?.isPaid);
}
async function deleteWedding(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(weddings).where(eq(weddings.id, id));
}
async function createRsvp(rsvp) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(rsvps).values(rsvp);
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(rsvps).where(eq(rsvps.id, insertedId)).limit(1);
  return created[0];
}
async function getWeddingRsvps(weddingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rsvps).where(eq(rsvps.weddingId, weddingId)).orderBy(desc(rsvps.createdAt));
}
async function createWishlistItem(item) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(wishlistItems).values(item);
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(wishlistItems).where(eq(wishlistItems.id, insertedId)).limit(1);
  return created[0];
}
async function getWeddingWishlist(weddingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wishlistItems).where(eq(wishlistItems.weddingId, weddingId)).orderBy(wishlistItems.order);
}
async function reserveWishlistItem(id, reservedBy, reservedEmail, reservedPhone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(wishlistItems).set({
    isReserved: true,
    reservedBy,
    reservedEmail,
    reservedPhone
  }).where(eq(wishlistItems.id, id));
}
async function updateWishlistItem(id, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(wishlistItems).set(updates).where(eq(wishlistItems.id, id));
}
async function deleteWishlistItem(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
}
async function createWish(wish) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(wishes).values(wish);
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(wishes).where(eq(wishes.id, insertedId)).limit(1);
  return created[0];
}
async function getWeddingWishes(weddingId, approvedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (approvedOnly) {
    return db.select().from(wishes).where(and(eq(wishes.weddingId, weddingId), eq(wishes.isApproved, true))).orderBy(desc(wishes.createdAt));
  }
  return db.select().from(wishes).where(eq(wishes.weddingId, weddingId)).orderBy(desc(wishes.createdAt));
}
async function approveWish(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(wishes).set({ isApproved: true }).where(eq(wishes.id, id));
}
async function rejectWish(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(wishes).where(eq(wishes.id, id));
}
async function createGalleryImage(image) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(galleryImages).values(image);
  const insertedId = Number(result[0].insertId);
  const created = await db.select().from(galleryImages).where(eq(galleryImages.id, insertedId)).limit(1);
  return created[0];
}
async function getWeddingGallery(weddingId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryImages).where(eq(galleryImages.weddingId, weddingId)).orderBy(galleryImages.order);
}
async function deleteGalleryImage(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryImages).where(eq(galleryImages.id, id));
}
async function getPaidInvitationsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(weddings).where(eq(weddings.isPaid, true));
  return result[0]?.count || 0;
}
async function getCurrentPrice() {
  const paidCount = await getPaidInvitationsCount();
  const promoLimit = 100;
  const isPromo = paidCount < promoLimit;
  const remainingPromoSlots = Math.max(0, promoLimit - paidCount);
  return {
    price: isPromo ? 990 : 4990,
    isPromo,
    paidCount,
    promoLimit,
    remainingPromoSlots
  };
}
async function getAllUsers(filters = {}) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  let query = db.select().from(users);
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      or(
        like(users.email, searchTerm),
        like(users.phone, searchTerm)
      )
    );
  }
  const allUsers = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: count() }).from(users);
  const total = countResult[0]?.count || 0;
  return { users: allUsers, total };
}
async function getAllInvitations(filters = {}) {
  const db = await getDb();
  if (!db) return { invitations: [], total: 0 };
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  const conditions = [];
  if (filters.eventType) {
    conditions.push(eq(weddings.eventType, filters.eventType));
  }
  if (filters.isAI !== void 0) {
    conditions.push(eq(weddings.isAI, filters.isAI));
  }
  if (filters.isPaid !== void 0) {
    conditions.push(eq(weddings.isPaid, filters.isPaid));
  }
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(weddings.title, searchTerm),
        like(weddings.slug, searchTerm)
      )
    );
  }
  const query = db.select({
    id: weddings.id,
    userId: weddings.userId,
    slug: weddings.slug,
    eventType: weddings.eventType,
    languageMode: weddings.languageMode,
    title: weddings.title,
    titleKz: weddings.titleKz,
    date: weddings.date,
    location: weddings.location,
    locationKz: weddings.locationKz,
    description: weddings.description,
    descriptionKz: weddings.descriptionKz,
    backgroundImage: weddings.backgroundImage,
    customBackgroundUrl: weddings.customBackgroundUrl,
    photoShape: weddings.photoShape,
    mapUrl: weddings.mapUrl,
    mapProvider: weddings.mapProvider,
    isPaid: weddings.isPaid,
    hideHeartIcon: weddings.hideHeartIcon,
    templateId: weddings.templateId,
    customFont: weddings.customFont,
    customColor: weddings.customColor,
    themeColor: weddings.themeColor,
    buttonColor: weddings.buttonColor,
    buttonTextColor: weddings.buttonTextColor,
    musicUrl: weddings.musicUrl,
    videoUrl: weddings.videoUrl,
    loveStory: weddings.loveStory,
    loveStoryKz: weddings.loveStoryKz,
    timelineData: weddings.timelineData,
    menuData: weddings.menuData,
    dressCode: weddings.dressCode,
    dressCodeKz: weddings.dressCodeKz,
    coordinatorName: weddings.coordinatorName,
    coordinatorPhone: weddings.coordinatorPhone,
    coordinatorEmail: weddings.coordinatorEmail,
    qrCodeData: weddings.qrCodeData,
    locationDetails: weddings.locationDetails,
    locationDetailsKz: weddings.locationDetailsKz,
    showTimeline: weddings.showTimeline,
    showMenu: weddings.showMenu,
    showDressCode: weddings.showDressCode,
    showQrCode: weddings.showQrCode,
    showCoordinator: weddings.showCoordinator,
    showLocationDetails: weddings.showLocationDetails,
    showHeart: weddings.showHeart,
    isAI: weddings.isAI,
    aiGeneratedHtml: weddings.aiGeneratedHtml,
    aiChatHistory: weddings.aiChatHistory,
    aiPackage: weddings.aiPackage,
    aiEditsLimit: weddings.aiEditsLimit,
    aiEditsUsed: weddings.aiEditsUsed,
    aiPackagePaidAt: weddings.aiPackagePaidAt,
    createdAt: weddings.createdAt,
    updatedAt: weddings.updatedAt,
    ownerEmail: users.email
  }).from(weddings).leftJoin(users, eq(weddings.userId, users.id));
  let finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
  const invitations = await finalQuery.orderBy(desc(weddings.createdAt)).limit(limit).offset(offset);
  let countQuery = db.select({ count: count() }).from(weddings);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions));
  }
  const countResult = await countQuery;
  const total = countResult[0]?.count || 0;
  return {
    invitations,
    total
  };
}
async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalInvitations: 0, paidInvitations: 0, aiInvitations: 0 };
  const [usersCount] = await db.select({ count: count() }).from(users);
  const [invitationsCount] = await db.select({ count: count() }).from(weddings);
  const [paidCount] = await db.select({ count: count() }).from(weddings).where(eq(weddings.isPaid, true));
  const [aiCount] = await db.select({ count: count() }).from(weddings).where(eq(weddings.isAI, true));
  return {
    totalUsers: usersCount?.count || 0,
    totalInvitations: invitationsCount?.count || 0,
    paidInvitations: paidCount?.count || 0,
    aiInvitations: aiCount?.count || 0
  };
}
async function isUserAdmin(userId) {
  const db = await getDb();
  if (!db) return false;
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
  return user?.role === "admin";
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUser(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email || `${userInfo.openId}@manus.local`,
          loginMethod: userInfo.loginMethod || userInfo.platform || void 0,
          lastSignedIn: signedInAt
        });
        user = await getUser(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      email: user.email || `${user.openId}@manus.local`,
      // Fallback email for Manus Auth users
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email || `${userInfo.openId}@manus.local`,
        loginMethod: userInfo.loginMethod || userInfo.platform || void 0,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/sitemapRouter.ts
import { eq as eq2 } from "drizzle-orm";
var EVENT_TYPE_PAGES = [
  { slug: "wedding", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u0441\u0432\u0430\u0434\u044C\u0431\u0443" },
  { slug: "birthday", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u0434\u0435\u043D\u044C \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F" },
  { slug: "corporate", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432" },
  { slug: "anniversary", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u044E\u0431\u0438\u043B\u0435\u0439" },
  { slug: "sundettoi", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u0441\u04AF\u043D\u0434\u0435\u0442 \u0442\u043E\u0439" },
  { slug: "tusaukeser", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u0442\u04B1\u0441\u0430\u0443 \u043A\u0435\u0441\u0435\u0440" },
  { slug: "kyz-uzatu", title: "\u041E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u049B\u044B\u0437 \u04B1\u0437\u0430\u0442\u0443" }
];
var sitemapRouter = router({
  generate: publicProcedure.query(async () => {
    const baseUrl = process.env.BASE_URL || "https://bookme.kz";
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const urls = [];
    urls.push({
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: "weekly",
      priority: 1
    });
    for (const eventType of EVENT_TYPE_PAGES) {
      urls.push({
        loc: `${baseUrl}/online-invitation/${eventType.slug}`,
        lastmod: today,
        changefreq: "weekly",
        priority: 0.9
      });
    }
    urls.push({
      loc: `${baseUrl}/features`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.8
    });
    urls.push({
      loc: `${baseUrl}/blog`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8
    });
    try {
      const db = await getDb();
      if (db) {
        const publicWeddings = await db.select({
          slug: weddings.slug,
          updatedAt: weddings.updatedAt,
          isPaid: weddings.isPaid
        }).from(weddings).where(eq2(weddings.isPaid, true));
        for (const wedding of publicWeddings) {
          urls.push({
            loc: `${baseUrl}/${wedding.slug}`,
            lastmod: wedding.updatedAt.toISOString().split("T")[0],
            changefreq: "monthly",
            priority: 0.6
          });
        }
      }
    } catch (error) {
      console.warn("[Sitemap] Failed to fetch weddings:", error);
    }
    urls.push({
      loc: `${baseUrl}/terms`,
      lastmod: today,
      changefreq: "yearly",
      priority: 0.3
    });
    urls.push({
      loc: `${baseUrl}/privacy`,
      lastmod: today,
      changefreq: "yearly",
      priority: 0.3
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    ).join("\n")}
</urlset>`;
    return { xml };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/freedompay.ts
import crypto from "crypto";

// server/logger.ts
import fs from "fs";
import path from "path";
var logFile = path.join(process.cwd(), "freedompay-debug.log");
function logToFile(message, data) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const logMessage = `[${timestamp2}] ${message}${data ? "\n" + JSON.stringify(data, null, 2) : ""}
`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message, data || "");
}

// server/freedompay.ts
var FREEDOMPAY_API_URL = "https://api.freedompay.kz/init_payment.php";
var MERCHANT_ID = process.env.FREEDOMPAY_MERCHANT_ID;
var SECRET_KEY = process.env.FREEDOMPAY_SECRET_KEY;
function generateSignature(scriptName, params) {
  const sortedKeys = Object.keys(params).sort();
  const values = sortedKeys.map((key) => params[key]);
  const signatureString = [scriptName, ...values, SECRET_KEY].join(";");
  return crypto.createHash("md5").update(signatureString).digest("hex");
}
async function createPayment(params) {
  const salt = crypto.randomBytes(16).toString("hex");
  const requestParams = {
    pg_merchant_id: MERCHANT_ID,
    pg_order_id: params.orderId,
    pg_amount: params.amount,
    pg_description: params.description,
    pg_salt: salt,
    pg_success: params.successUrl,
    pg_failure_url: params.failureUrl,
    pg_result_url: params.resultUrl,
    pg_testing_mode: 0,
    // 0 = production, 1 = test
    pg_language: "ru"
  };
  if (!MERCHANT_ID || !SECRET_KEY) {
    console.error("FreedomPay credentials missing:", {
      hasMerchantId: !!MERCHANT_ID,
      hasSecretKey: !!SECRET_KEY
    });
    throw new Error("FreedomPay credentials not configured");
  }
  console.log("Creating FreedomPay payment:", {
    orderId: params.orderId,
    amount: params.amount,
    merchantId: MERCHANT_ID
  });
  const sortedKeys = Object.keys(requestParams).sort();
  const values = sortedKeys.map((key) => requestParams[key]);
  const signatureString = ["init_payment.php", ...values, SECRET_KEY].join(";");
  logToFile("=== FreedomPay Signature Debug ===");
  logToFile("Request params:", requestParams);
  logToFile("Sorted keys:", sortedKeys);
  logToFile("Values:", values);
  logToFile("Signature string:", signatureString);
  const signature = generateSignature("init_payment.php", requestParams);
  logToFile("Generated signature:", signature);
  const formData = new URLSearchParams();
  Object.entries(requestParams).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  formData.append("pg_sig", signature);
  logToFile("Request body:", formData.toString());
  const response = await fetch(FREEDOMPAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });
  if (!response.ok) {
    throw new Error(`FreedomPay API error: ${response.status} ${response.statusText}`);
  }
  const result = await response.text();
  logToFile("FreedomPay response:", result);
  const redirectUrlMatch = result.match(/<pg_redirect_url>([^<]+)<\/pg_redirect_url>/);
  if (!redirectUrlMatch) {
    console.error("FreedomPay response:", result);
    const errorMatch = result.match(/<pg_error_description>([^<]+)<\/pg_error_description>/);
    if (errorMatch) {
      throw new Error(`FreedomPay error: ${errorMatch[1]}`);
    }
    throw new Error("Failed to get redirect URL from FreedomPay");
  }
  return redirectUrlMatch[1];
}
function verifyCallback(params) {
  const { pg_sig, pg_result, pg_order_id, pg_payment_id } = params;
  console.log("[FreedomPay] Callback received:");
  console.log("[FreedomPay] - pg_order_id:", pg_order_id);
  console.log("[FreedomPay] - pg_payment_id:", pg_payment_id);
  console.log("[FreedomPay] - pg_result:", pg_result);
  console.log("[FreedomPay] - pg_sig:", pg_sig);
  if (!pg_order_id || !pg_result) {
    console.log("[FreedomPay] Missing required fields");
    return false;
  }
  if (!pg_order_id.startsWith("wedding_") && !pg_order_id.startsWith("aipackage_") && !pg_order_id.startsWith("aitopup_")) {
    console.log("[FreedomPay] Invalid order_id format - not our payment");
    return false;
  }
  console.log("[FreedomPay] Callback accepted");
  return true;
}

// server/ai/providers.ts
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// server/ai/prompts.ts
var SYSTEM_PROMPT = `\u0422\u044B \u2014 ART-DIRECTOR \u0443\u0440\u043E\u0432\u043D\u044F Vogue, Awwwards, Behance Featured.

\u0422\u044B \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0448\u044C \u0437\u0430:
\u2014 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u0443\u044E \u043A\u043E\u043D\u0446\u0435\u043F\u0446\u0438\u044E
\u2014 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0438 \u044D\u043C\u043E\u0446\u0438\u044E
\u2014 \u043E\u0449\u0443\u0449\u0435\u043D\u0438\u0435 "\u0434\u043E\u0440\u043E\u0433\u043E" \u0438 "\u043F\u0440\u0435\u043C\u0438\u0443\u043C"

\u041A\u0430\u0436\u0434\u043E\u0435 \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0434\u043E\u043B\u0436\u043D\u043E \u0432\u044B\u0433\u043B\u044F\u0434\u0435\u0442\u044C \u0442\u0430\u043A, \u0431\u0443\u0434\u0442\u043E:
\u2014 \u0435\u0433\u043E \u0434\u0435\u043B\u0430\u043B\u0438 2\u20133 \u0434\u043D\u044F \u0432 \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0442\u0443\u0434\u0438\u0438
\u2014 \u0434\u043B\u044F \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u0430
\u2014 \u0441 \u0440\u0435\u0444\u0435\u0440\u0435\u043D\u0441\u0430\u043C\u0438 \u0438\u0437 fashion / luxury / editorial \u0434\u0438\u0437\u0430\u0439\u043D\u0430

---

## \u041A\u0410\u0422\u0415\u0413\u041E\u0420\u0418\u0427\u0415\u0421\u041A\u0418 \u0417\u0410\u041F\u0420\u0415\u0429\u0415\u041D\u041E:

\u274C \u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0435 \u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u044B "\u0444\u0438\u043E\u043B\u0435\u0442\u043E\u0432\u044B\u0439 \u2192 \u0441\u0438\u043D\u0438\u0439"
\u274C \u0421\u043A\u0443\u0447\u043D\u044B\u0435 hero \u0441 \u043F\u0440\u043E\u0441\u0442\u043E \u0442\u0435\u043A\u0441\u0442\u043E\u043C \u043F\u043E \u0446\u0435\u043D\u0442\u0440\u0443
\u274C \u0428\u0430\u0431\u043B\u043E\u043D\u043D\u044B\u0435 \u0441\u0435\u043A\u0446\u0438\u0438 \u0431\u0435\u0437 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u043D\u0446\u0435\u043F\u0446\u0438\u0438
\u274C \u0414\u0438\u0437\u0430\u0439\u043D "\u043A\u0430\u043A \u0443 \u0432\u0441\u0435\u0445"
\u274C \u0411\u0430\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0446\u0432\u0435\u0442\u043E\u0432\u044B\u0435 \u0441\u0445\u0435\u043C\u044B
\u274C \u041F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0443\u0435\u043C\u044B\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u044F
\u274C \u041F\u0435\u0440\u0435\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u044D\u0444\u0444\u0435\u043A\u0442\u0430\u043C\u0438

---

## \u041F\u0420\u0418\u041D\u0426\u0418\u041F\u042B \u0410\u0420\u0422-\u0414\u0418\u0420\u0415\u041A\u0428\u041D\u0410:

### 1. \u0412\u0418\u0417\u0423\u0410\u041B\u042C\u041D\u0410\u042F \u041A\u041E\u041D\u0426\u0415\u041F\u0426\u0418\u042F \u2014 \u041F\u0415\u0420\u0412\u0418\u0427\u041D\u0410

\u0421\u041D\u0410\u0427\u0410\u041B\u0410 \u043F\u0440\u043E\u0434\u0443\u043C\u0430\u0439:
\u2014 \u0423\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u0443\u044E \u0438\u0434\u0435\u044E
\u2014 \u0427\u0451\u0442\u043A\u0438\u0439 \u0441\u0442\u0438\u043B\u044C (fashion, minimal luxe, editorial, modern classic, brutalist, organic \u0438 \u0442.\u0434.)
\u2014 \u0426\u0432\u0435\u0442\u043E\u0432\u0443\u044E \u043F\u0430\u043B\u0438\u0442\u0440\u0443 \u043A\u0430\u043A \u0443 \u0431\u0440\u0435\u043D\u0434\u0430
\u2014 \u041A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044E \u0438 \u0440\u0438\u0442\u043C
\u2014 \u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0441\u0438\u0441\u0442\u0435\u043C\u0443
\u2014 \u041A\u043B\u044E\u0447\u0435\u0432\u043E\u0439 \u0430\u0440\u0442-\u043F\u0440\u0438\u0451\u043C

\u0422\u041E\u041B\u042C\u041A\u041E \u041F\u041E\u0422\u041E\u041C \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0439:
\u2014 RSVP, wishlist, \u0444\u043E\u0440\u043C\u044B
\u2014 \u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u041D\u0415 \u0434\u043E\u043B\u0436\u043D\u044B \u043B\u043E\u043C\u0430\u0442\u044C \u044D\u0441\u0442\u0435\u0442\u0438\u043A\u0443

### 2. \u041F\u0420\u0410\u0412\u0418\u041B\u041E \u041F\u0420\u0415\u041C\u0418\u0410\u041B\u042C\u041D\u041E\u0413\u041E \u0414\u0418\u0417\u0410\u0419\u041D\u0410

\u2014 1 \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u0438\u0451\u043C
\u2014 1 \u0430\u043A\u0446\u0435\u043D\u0442\u043D\u0430\u044F \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u044F
\u2014 \u041C\u0438\u043D\u0438\u043C\u0443\u043C \u043B\u0438\u0448\u043D\u0438\u0445 \u044D\u0444\u0444\u0435\u043A\u0442\u043E\u0432

\u041B\u0443\u0447\u0448\u0435 \u041C\u0415\u041D\u042C\u0428\u0415, \u043D\u043E \u0414\u041E\u0420\u041E\u0416\u0415.

### 3. HERO = 80% \u0412\u041F\u0415\u0427\u0410\u0422\u041B\u0415\u041D\u0418\u042F

Hero \u0434\u043E\u043B\u0436\u0435\u043D:
\u2014 \u0412\u044B\u0437\u044B\u0432\u0430\u0442\u044C \u044D\u043C\u043E\u0446\u0438\u044E \u0437\u0430 3 \u0441\u0435\u043A\u0443\u043D\u0434\u044B
\u2014 \u0412\u044B\u0433\u043B\u044F\u0434\u0435\u0442\u044C \u043A\u0430\u043A \u043E\u0431\u043B\u043E\u0436\u043A\u0430 \u0436\u0443\u0440\u043D\u0430\u043B\u0430
\u2014 \u0418\u043C\u0435\u0442\u044C \u043D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u0443\u044E \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044E (\u0430\u0441\u0438\u043C\u043C\u0435\u0442\u0440\u0438\u044F, \u043A\u0440\u0443\u043F\u043D\u0430\u044F \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430, layering)
\u2014 \u041D\u0415 \u0432\u044B\u0433\u043B\u044F\u0434\u0435\u0442\u044C \u043A\u0430\u043A \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u043B\u0435\u043D\u0434\u0438\u043D\u0433

\u0412\u0430\u0440\u0438\u0430\u043D\u0442\u044B hero-\u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u0439:
\u2014 \u041A\u0440\u0443\u043F\u043D\u043E\u0435 \u0444\u043E\u0442\u043E \u043D\u0430 \u0432\u0435\u0441\u044C \u044D\u043A\u0440\u0430\u043D + \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043E\u0432\u0435\u0440\u043B\u0435\u0439
\u2014 Split-screen \u0441 \u0442\u0435\u043A\u0441\u0442\u043E\u043C \u0438 \u0432\u0438\u0437\u0443\u0430\u043B\u043E\u043C
\u2014 \u0410\u0441\u0438\u043C\u043C\u0435\u0442\u0440\u0438\u0447\u043D\u0430\u044F \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430 + negative space
\u2014 \u0424\u043E\u0442\u043E \u043A\u0430\u043A \u0442\u0435\u043A\u0441\u0442\u0443\u0440\u0430/\u043C\u0430\u0441\u043A\u0430 \u0434\u043B\u044F \u0442\u0435\u043A\u0441\u0442\u0430
\u2014 Vertical text + horizontal accent
\u2014 Layered elements \u0441 \u0433\u043B\u0443\u0431\u0438\u043D\u043E\u0439

### 4. \u0422\u0418\u041F\u041E\u0413\u0420\u0410\u0424\u0418\u041A\u0410 \u041A\u0410\u041A \u0418\u0421\u041A\u0423\u0421\u0421\u0422\u0412\u041E

\u2014 \u041A\u043E\u043D\u0442\u0440\u0430\u0441\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u0432 (\u043E\u0447\u0435\u043D\u044C \u043A\u0440\u0443\u043F\u043D\u044B\u0439 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A + \u043C\u0435\u043B\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442)
\u2014 \u0418\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u044B\u0435 \u043F\u0430\u0440\u044B \u0448\u0440\u0438\u0444\u0442\u043E\u0432 (\u043D\u0435 \u043F\u0440\u043E\u0441\u0442\u043E Playfair + Montserrat)
\u2014 \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 letter-spacing \u0438 line-height \u043A\u0430\u043A \u0434\u0438\u0437\u0430\u0439\u043D-\u043F\u0440\u0438\u0451\u043C
\u2014 \u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430 \u043A\u0430\u043A \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442

\u041F\u0440\u0438\u043C\u0435\u0440\u044B \u0448\u0440\u0438\u0444\u0442\u043E\u0432\u044B\u0445 \u043F\u0430\u0440:
\u2014 Cormorant Garamond + Work Sans (\u043A\u043B\u0430\u0441\u0441\u0438\u043A\u0430 + \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0441\u0442\u044C)
\u2014 Italiana + Karla (fashion editorial)
\u2014 Bodoni Moda + Inter (luxury minimal)
\u2014 Forum + Nunito Sans (\u044D\u043B\u0435\u0433\u0430\u043D\u0442\u043D\u043E\u0441\u0442\u044C + \u0447\u0438\u0442\u0430\u0435\u043C\u043E\u0441\u0442\u044C)
\u2014 El Messiri + Cairo (\u0432\u043E\u0441\u0442\u043E\u0447\u043D\u0430\u044F \u044D\u0441\u0442\u0435\u0442\u0438\u043A\u0430)
\u2014 Yeseva One + Raleway (\u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043E\u043D\u043D\u044B\u0439 + \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0439)

### 5. \u0426\u0412\u0415\u0422 \u041A\u0410\u041A \u041D\u0410\u0421\u0422\u0420\u041E\u0415\u041D\u0418\u0415

\u0412\u041C\u0415\u0421\u0422\u041E \u0431\u0430\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u043F\u0430\u043B\u0438\u0442\u0440 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439:
\u2014 Monochrome \u0441 \u043E\u0434\u043D\u0438\u043C \u044F\u0440\u043A\u0438\u043C \u0430\u043A\u0446\u0435\u043D\u0442\u043E\u043C
\u2014 \u0422\u0451\u043F\u043B\u044B\u0435 \u043D\u0435\u0439\u0442\u0440\u0430\u043B\u044B: \u0441\u043B\u043E\u043D\u043E\u0432\u0430\u044F \u043A\u043E\u0441\u0442\u044C, \u0442\u0435\u0440\u0440\u0430\u043A\u043E\u0442\u0430, gold
\u2014 \u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0439 \u043C\u0438\u043D\u0438\u043C\u0430\u043B: \u0441\u0435\u0440\u044B\u0439, \u0431\u0435\u043B\u044B\u0439, \u0447\u0451\u0440\u043D\u044B\u0439 + \u0441\u0435\u0440\u0435\u0431\u0440\u043E
\u2014 \u0413\u043B\u0443\u0431\u043E\u043A\u0438\u0435 \u043E\u0442\u0442\u0435\u043D\u043A\u0438: burgundy, forest green, navy
\u2014 Organic tones: sage, cream, taupe, blush
\u2014 Bold contrast: \u0447\u0451\u0440\u043D\u044B\u0439 + gold, \u0442\u0451\u043C\u043D\u043E-\u0441\u0438\u043D\u0438\u0439 + \u043C\u0435\u0434\u044C

---

## CSS \u041A\u0410\u041A DESIGN SYSTEM:

\u041A\u043E\u0434 = \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u0438\u0437\u0430\u0439\u043D\u0430. \u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E:

\`\`\`css
:root {
  /* \u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0448\u043A\u0430\u043B\u0430 */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Work Sans', sans-serif;
  
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
  --text-xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --text-2xl: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  --text-hero: clamp(3rem, 2rem + 5vw, 7rem);
  
  /* Spacing \u0441\u0438\u0441\u0442\u0435\u043C\u0430 */
  --space-xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-sm: clamp(0.75rem, 0.6rem + 0.75vw, 1rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  --space-xl: clamp(3rem, 2rem + 5vw, 6rem);
  --space-2xl: clamp(5rem, 3rem + 10vw, 12rem);
  
  /* \u0426\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u043F\u0430\u043B\u0438\u0442\u0440\u0430 */
  --color-primary: #1a1a1a;
  --color-secondary: #f8f5f0;
  --color-accent: #c9a96e;
  --color-muted: #6b6b6b;
  
  /* Transitions */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --duration-fast: 200ms;
  --duration-normal: 400ms;
  --duration-slow: 800ms;
}
\`\`\`

---

## \u0421\u0422\u0418\u041B\u0418 \u041F\u041E\u0414 \u041C\u0415\u0420\u041E\u041F\u0420\u0418\u042F\u0422\u0418\u0415:

### \u0421\u0432\u0430\u0434\u044C\u0431\u0430 \u2014 EDITORIAL ROMANCE
\u2014 \u041C\u044F\u0433\u043A\u0438\u0435 \u0442\u043E\u043D\u0430: ivory, blush, champagne, sage
\u2014 \u041C\u043D\u043E\u0433\u043E whitespace
\u2014 \u041A\u0440\u0443\u043F\u043D\u0430\u044F \u043A\u0430\u043B\u043B\u0438\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430
\u2014 \u0424\u043E\u0442\u043E \u043A\u0430\u043A \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u0430\u0440\u0442-\u044D\u043B\u0435\u043C\u0435\u043D\u0442
\u2014 \u042D\u0444\u0444\u0435\u043A\u0442: \u043D\u0435\u0436\u043D\u043E\u0441\u0442\u044C, \u0438\u0437\u044B\u0441\u043A\u0430\u043D\u043D\u043E\u0441\u0442\u044C, \u0432\u043D\u0435\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0441\u0442\u044C

### \u0414\u0435\u043D\u044C \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u2014 BOLD CELEBRATION
\u2014 \u041D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u0430\u044F \u0446\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F (\u043D\u0435 \u043A\u043E\u043D\u0444\u0435\u0442\u0442\u0438!)
\u2014 \u0414\u0438\u043D\u0430\u043C\u0438\u0447\u043D\u0430\u044F \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430
\u2014 \u0418\u0433\u0440\u0430 \u0441 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u043E\u043C
\u2014 \u042D\u0444\u0444\u0435\u043A\u0442: \u044D\u043D\u0435\u0440\u0433\u0438\u044F, \u0440\u0430\u0434\u043E\u0441\u0442\u044C, \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C

### \u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432 \u2014 MINIMAL PROFESSIONAL
\u2014 \u0427\u0451\u0442\u043A\u0430\u044F grid-\u0441\u0438\u0441\u0442\u0435\u043C\u0430
\u2014 \u0421\u0434\u0435\u0440\u0436\u0430\u043D\u043D\u0430\u044F \u043F\u0430\u043B\u0438\u0442\u0440\u0430 \u0441 \u043E\u0434\u043D\u0438\u043C \u0430\u043A\u0446\u0435\u043D\u0442\u043E\u043C
\u2014 Swiss-style \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430
\u2014 \u042D\u0444\u0444\u0435\u043A\u0442: \u0434\u043E\u0432\u0435\u0440\u0438\u0435, \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u0438\u0437\u043C, \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0441\u0442\u044C

### \u042E\u0431\u0438\u043B\u0435\u0439 \u2014 CLASSIC LUXURY
\u2014 \u0413\u043B\u0443\u0431\u043E\u043A\u0438\u0435 \u0446\u0432\u0435\u0442\u0430: burgundy, gold, navy
\u2014 \u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0442\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430 \u0441 \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u043C twist
\u2014 \u042D\u0444\u0444\u0435\u043A\u0442: \u0442\u043E\u0440\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u044C, \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435, \u044D\u043B\u0435\u0433\u0430\u043D\u0442\u043D\u043E\u0441\u0442\u044C

### \u041A\u0430\u0437\u0430\u0445\u0441\u043A\u0438\u0435 \u043C\u0435\u0440\u043E\u043F\u0440\u0438\u044F\u0442\u0438\u044F \u2014 MODERN HERITAGE
\u2014 \u0421\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u0438\u043D\u0442\u0435\u0440\u043F\u0440\u0435\u0442\u0430\u0446\u0438\u044F \u043E\u0440\u043D\u0430\u043C\u0435\u043D\u0442\u043E\u0432
\u2014 \u0413\u043B\u0443\u0431\u043E\u043A\u0438\u0439 \u0441\u0438\u043D\u0438\u0439, \u0437\u043E\u043B\u043E\u0442\u043E, \u0442\u0451\u043F\u043B\u044B\u0435 \u043D\u0435\u0439\u0442\u0440\u0430\u043B\u044B
\u2014 \u041E\u0440\u043D\u0430\u043C\u0435\u043D\u0442\u044B \u043A\u0430\u043A \u0430\u043A\u0446\u0435\u043D\u0442, \u043D\u0435 \u043A\u0430\u043A \u0437\u0430\u043B\u0438\u0432\u043A\u0430 \u0432\u0441\u0435\u0433\u043E
\u2014 \u042D\u0444\u0444\u0435\u043A\u0442: \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u044F + \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0441\u0442\u044C

---

## \u041E\u0411\u042F\u0417\u0410\u0422\u0415\u041B\u042C\u041D\u042B\u0415 \u0424\u041E\u0420\u041C\u042B (\u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0434\u043B\u044F \u0441\u0435\u0440\u0432\u0435\u0440\u0430):

### RSVP \u0444\u043E\u0440\u043C\u0430:
\`\`\`html
<form data-form-type="rsvp" onsubmit="submitForm(event, 'rsvp')" class="rsvp-form">
  <input type="text" name="name" placeholder="\u0412\u0430\u0448\u0435 \u0438\u043C\u044F" required>
  <input type="tel" name="phone" placeholder="\u0422\u0435\u043B\u0435\u0444\u043E\u043D">
  <select name="attending" required>
    <option value="">\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043E\u0442\u0432\u0435\u0442</option>
    <option value="yes">\u041F\u0440\u0438\u0434\u0443 \u0441 \u0443\u0434\u043E\u0432\u043E\u043B\u044C\u0441\u0442\u0432\u0438\u0435\u043C!</option>
    <option value="no">\u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u043D\u0435 \u0441\u043C\u043E\u0433\u0443</option>
  </select>
  <input type="number" name="guests" placeholder="\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0433\u043E\u0441\u0442\u0435\u0439" min="1" value="1">
  <textarea name="comment" placeholder="\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0438\u043B\u0438 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F"></textarea>
  <button type="submit">\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043E\u0442\u0432\u0435\u0442</button>
</form>
\`\`\`

### \u0424\u043E\u0440\u043C\u0430 \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0439:
\`\`\`html
<form data-form-type="wish" onsubmit="submitForm(event, 'wish')" class="wish-form">
  <input type="text" name="name" placeholder="\u0412\u0430\u0448\u0435 \u0438\u043C\u044F" required>
  <textarea name="message" placeholder="\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u0442\u0451\u043F\u043B\u044B\u0435 \u0441\u043B\u043E\u0432\u0430..." required></textarea>
  <button type="submit">\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0435</button>
</form>
\`\`\`

### Wishlist (\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435):
\`\`\`html
<div class="gift-card" data-gift-name="\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u0434\u0430\u0440\u043A\u0430">
  <div class="gift-image"><!-- \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u0438\u043A\u043E\u043D\u043A\u0430 --></div>
  <h4>\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u0434\u0430\u0440\u043A\u0430</h4>
  <p>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435</p>
  <form data-form-type="wishlist" onsubmit="submitForm(event, 'wishlist')">
    <input type="hidden" name="giftName" value="\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u0434\u0430\u0440\u043A\u0430">
    <input type="text" name="name" placeholder="\u0412\u0430\u0448\u0435 \u0438\u043C\u044F" required>
    <button type="submit">\u0417\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C</button>
  </form>
</div>
\`\`\`

\u0424\u043E\u0440\u043C\u044B \u041E\u0411\u042F\u0417\u0410\u0422\u0415\u041B\u042C\u041D\u042B, \u043D\u043E \u043E\u043D\u0438 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u0412\u041F\u0418\u0421\u0410\u041D\u042B \u0432 \u043E\u0431\u0449\u0443\u044E \u044D\u0441\u0442\u0435\u0442\u0438\u043A\u0443, \u0430 \u043D\u0435 \u0432\u044B\u0433\u043B\u044F\u0434\u0435\u0442\u044C \u043A\u0430\u043A \u0447\u0443\u0436\u0435\u0440\u043E\u0434\u043D\u044B\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B.

---

## \u041C\u0423\u041B\u042C\u0422\u0418\u042F\u0417\u042B\u0427\u041D\u041E\u0421\u0422\u042C (\u0435\u0441\u043B\u0438 \u043D\u0443\u0436\u043D\u0430):

\`\`\`html
<div class="language-switcher">
  <button onclick="setLang('ru')" class="lang-btn active" data-lang-btn="ru">\u0420\u0443\u0441</button>
  <button onclick="setLang('kk')" class="lang-btn" data-lang-btn="kk">\u049A\u0430\u0437</button>
</div>

<h1>
  <span data-lang="ru">\u0422\u0435\u043A\u0441\u0442 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C</span>
  <span data-lang="kk" style="display:none">\u049A\u0430\u0437\u0430\u049B\u0448\u0430 \u043C\u04D9\u0442\u0456\u043D</span>
</h1>

<script>
function setLang(lang) {
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.style.display = el.dataset.lang === lang ? '' : 'none';
  });
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === lang);
  });
}
</script>
\`\`\`

---

## \u0417\u0410\u0413\u0420\u0423\u0416\u0415\u041D\u041D\u042B\u0415 \u0424\u0410\u0419\u041B\u042B:

\u2014 \u0424\u043E\u0442\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439 \u041A\u0420\u0423\u041F\u041D\u041E, \u043A\u0430\u043A \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u0430\u0440\u0442-\u044D\u043B\u0435\u043C\u0435\u043D\u0442
\u2014 \u041D\u0435 \u043F\u0440\u044F\u0447\u044C \u0432 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0443\u044E \u0433\u0430\u043B\u0435\u0440\u0435\u044E
\u2014 \u0410\u0443\u0434\u0438\u043E \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0439 \u043A\u0430\u043A \u0444\u043E\u043D\u043E\u0432\u0443\u044E \u043C\u0443\u0437\u044B\u043A\u0443 \u0441 autoplay loop
\u2014 \u0424\u0430\u0439\u043B\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F = \u043E\u0441\u043D\u043E\u0432\u0430 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0440\u0435\u0448\u0435\u043D\u0438\u044F

---

## \u0423\u0422\u041E\u0427\u041D\u042F\u042E\u0429\u0418\u0415 \u0412\u041E\u041F\u0420\u041E\u0421\u042B:

\u0415\u0441\u043B\u0438 \u0447\u0435\u0433\u043E-\u0442\u043E \u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u2014 \u041E\u0411\u042F\u0417\u0410\u0422\u0415\u041B\u042C\u041D\u041E \u0443\u0442\u043E\u0447\u043D\u0438. \u041F\u0440\u0438\u043C\u0435\u0440\u044B:

\u2014 \xAB\u0425\u043E\u0442\u0438\u0442\u0435 \u0431\u043E\u043B\u0435\u0435 fashion / \u043C\u0438\u043D\u0438\u043C\u0430\u043B / \u0440\u043E\u043C\u0430\u043D\u0442\u0438\u0447\u043D\u044B\u0439 \u0432\u0430\u0439\u0431?\xBB
\u2014 \xAB\u0414\u043E\u0431\u0430\u0432\u0438\u043C \u0444\u043E\u0442\u043E \u043A\u0430\u043A \u043A\u0440\u0443\u043F\u043D\u044B\u0439 \u0430\u0440\u0442-\u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u0438\u043B\u0438 \u0430\u043A\u043A\u0443\u0440\u0430\u0442\u043D\u043E \u0432 \u0433\u0430\u043B\u0435\u0440\u0435\u044E?\xBB
\u2014 \xAB\u041C\u0443\u0437\u044B\u043A\u0430 \u043D\u0443\u0436\u043D\u0430 \u043A\u0430\u043A \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u043D \u0438\u043B\u0438 \u043A\u0430\u043A \u0430\u043A\u0446\u0435\u043D\u0442?\xBB
\u2014 \xAB\u0425\u043E\u0442\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0441\u0430\u0439\u0442 \u0431\u044B\u043B \u0431\u043E\u043B\u0435\u0435 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u043B\u0438 \u0441\u0442\u0440\u043E\u0433\u0438\u0439?\xBB
\u2014 \xAB\u041F\u0440\u0435\u0434\u043F\u043E\u0447\u0438\u0442\u0430\u0435\u0442\u0435 \u0441\u0432\u0435\u0442\u043B\u0443\u044E \u0438\u043B\u0438 \u0442\u0451\u043C\u043D\u0443\u044E \u043F\u0430\u043B\u0438\u0442\u0440\u0443?\xBB
\u2014 \xAB\u041D\u0443\u0436\u0435\u043D \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u0438\u0437\u043C \u0438\u043B\u0438 \u0431\u043E\u043B\u044C\u0448\u0435 \u0434\u0435\u043A\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0445 \u0434\u0435\u0442\u0430\u043B\u0435\u0439?\xBB

\u041F\u043E\u0441\u043B\u0435 2-3 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432 \u2014 \u0421\u0420\u0410\u0417\u0423 \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435!`;
var GENERATE_HTML_PROMPT = `\u0421\u043E\u0437\u0434\u0430\u0439 \u041F\u0420\u0415\u041C\u0418\u0410\u041B\u042C\u041D\u041E\u0415 \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0443\u0440\u043E\u0432\u043D\u044F Awwwards / Behance Featured.

## \u0427\u0415\u041A\u041B\u0418\u0421\u0422 \u0410\u0420\u0422-\u0414\u0418\u0420\u0415\u041A\u0422\u041E\u0420\u0410:

\u2610 \u0423\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043D\u0446\u0435\u043F\u0446\u0438\u044F (\u043D\u0435 \u0448\u0430\u0431\u043B\u043E\u043D!)
\u2610 Hero \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u044D\u043C\u043E\u0446\u0438\u044E \u0437\u0430 3 \u0441\u0435\u043A\u0443\u043D\u0434\u044B
\u2610 \u041D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F
\u2610 \u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430 \u043A\u0430\u043A \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u043E
\u2610 1 \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u0438\u0451\u043C
\u2610 1 \u0430\u043A\u0446\u0435\u043D\u0442\u043D\u0430\u044F \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u044F
\u2610 CSS variables \u0438 design system
\u2610 Responsive \u0431\u0435\u0437 \u043F\u043E\u0442\u0435\u0440\u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430
\u2610 \u0424\u043E\u0440\u043C\u044B \u0432\u043F\u0438\u0441\u0430\u043D\u044B \u0432 \u044D\u0441\u0442\u0435\u0442\u0438\u043A\u0443

## \u0421\u0422\u0420\u0423\u041A\u0422\u0423\u0420\u0410 HTML:

\`\`\`html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=...&display=swap');
    
    :root {
      /* \u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430 */
      --font-display: '...', serif;
      --font-body: '...', sans-serif;
      --text-hero: clamp(3rem, 2rem + 5vw, 7rem);
      --text-xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
      --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
      
      /* Spacing */
      --space-xs: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
      --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
      --space-xl: clamp(3rem, 2rem + 5vw, 6rem);
      
      /* Colors */
      --color-primary: ...;
      --color-secondary: ...;
      --color-accent: ...;
      
      /* Motion */
      --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
      --duration-slow: 800ms;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: var(--font-body);
      background: var(--color-secondary);
      color: var(--color-primary);
    }
    
    /* Hero \u2014 80% \u0432\u043F\u0435\u0447\u0430\u0442\u043B\u0435\u043D\u0438\u044F */
    .hero {
      min-height: 100vh;
      /* \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044F */
    }
    
    /* \u0421\u0435\u043A\u0446\u0438\u0438 \u0441 \u0440\u0438\u0442\u043C\u043E\u043C */
    section {
      padding: var(--space-xl) var(--space-md);
    }
    
    /* \u0424\u043E\u0440\u043C\u044B \u2014 \u0447\u0430\u0441\u0442\u044C \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0438\u0441\u0442\u0435\u043C\u044B */
    form input, form select, form textarea {
      font-family: var(--font-body);
      padding: var(--space-md);
      border: 1px solid rgba(0,0,0,0.1);
      transition: all var(--duration-slow) var(--ease-out-expo);
    }
    
    form button {
      font-family: var(--font-body);
      padding: var(--space-md) var(--space-xl);
      background: var(--color-accent);
      cursor: pointer;
      transition: all var(--duration-slow) var(--ease-out-expo);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      /* \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u0430\u044F \u0430\u0434\u0430\u043F\u0442\u0430\u0446\u0438\u044F */
    }
  </style>
</head>
<body>
  <!-- Hero \u0441\u0435\u043A\u0446\u0438\u044F \u2014 \u0413\u041B\u0410\u0412\u041D\u042B\u0419 \u0412\u0418\u0417\u0423\u0410\u041B\u042C\u041D\u042B\u0419 \u0410\u041A\u0426\u0415\u041D\u0422 -->
  <!-- \u041E \u0441\u043E\u0431\u044B\u0442\u0438\u0438 / \u0418\u0441\u0442\u043E\u0440\u0438\u044F -->
  <!-- \u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 / Timeline -->
  <!-- \u0413\u0430\u043B\u0435\u0440\u0435\u044F (\u0435\u0441\u043B\u0438 \u0435\u0441\u0442\u044C \u0444\u043E\u0442\u043E) -->
  <!-- RSVP (\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E data-form-type="rsvp") -->
  <!-- Wishlist (\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E data-form-type="wishlist") -->
  <!-- \u041F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u044F (\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E data-form-type="wish") -->
  <!-- \u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B / \u041C\u0435\u0441\u0442\u043E -->
</body>
</html>
\`\`\`

## \u0417\u0410\u0413\u0420\u0423\u0416\u0415\u041D\u041D\u042B\u0415 \u0424\u0410\u0419\u041B\u042B:
\u2014 \u0424\u043E\u0442\u043E \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439 \u041A\u0420\u0423\u041F\u041D\u041E \u043A\u0430\u043A \u0430\u0440\u0442-\u044D\u043B\u0435\u043C\u0435\u043D\u0442
\u2014 \u0410\u0443\u0434\u0438\u043E \u2014 <audio autoplay loop>

\u0412\u0435\u0440\u043D\u0438 \u0422\u041E\u041B\u042C\u041A\u041E \u043F\u043E\u043B\u043D\u044B\u0439 HTML \u043A\u043E\u0434 \u0431\u0435\u0437 markdown \u0440\u0430\u0437\u043C\u0435\u0442\u043A\u0438!

\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0434\u043B\u044F \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F:
`;
var EDIT_HTML_PROMPT = `\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0445\u043E\u0447\u0435\u0442 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435.

\u0422\u0435\u043A\u0443\u0449\u0438\u0439 HTML:
\`\`\`html
{current_html}
\`\`\`

\u0417\u0430\u043F\u0440\u043E\u0441: {user_request}

\u0412\u043D\u0435\u0441\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F:
\u2014 \u0412\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u0443\u044E \u043A\u043E\u043D\u0446\u0435\u043F\u0446\u0438\u044E \u0438 \u0430\u0440\u0442-\u0434\u0438\u0440\u0435\u043A\u0448\u043D
\u2014 CSS design system (variables, spacing)
\u2014 \u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u0444\u043E\u0440\u043C (data-form-type, onsubmit)
\u2014 \u041F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E

\u0412\u0435\u0440\u043D\u0438 \u041F\u041E\u041B\u041D\u042B\u0419 \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D\u043D\u044B\u0439 HTML \u043A\u043E\u0434.`;
var WELCOME_MESSAGE = `\u041F\u0440\u0438\u0432\u0435\u0442! \u2728 

\u042F \u0441\u043E\u0437\u0434\u0430\u043C \u0434\u043B\u044F \u0432\u0430\u0441 \u043E\u043D\u043B\u0430\u0439\u043D-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F \u2014 \u043A\u0430\u043A \u0438\u0437 \u0442\u043E\u043F-\u0441\u0442\u0443\u0434\u0438\u0438 \u0434\u0438\u0437\u0430\u0439\u043D\u0430.

\u0420\u0430\u0441\u0441\u043A\u0430\u0436\u0438\u0442\u0435:

**1. \u0427\u0442\u043E \u0437\u0430 \u0441\u043E\u0431\u044B\u0442\u0438\u0435?**
\u0421\u0432\u0430\u0434\u044C\u0431\u0430, \u0434\u0435\u043D\u044C \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F, \u044E\u0431\u0438\u043B\u0435\u0439, \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432, \u0441\u04AF\u043D\u0434\u0435\u0442 \u0442\u043E\u0439...

**2. \u041A\u043E\u0433\u0434\u0430 \u0438 \u0433\u0434\u0435?**
\u0414\u0430\u0442\u0430, \u0432\u0440\u0435\u043C\u044F \u0438 \u043C\u0435\u0441\u0442\u043E

**3. \u041A\u0430\u043A\u043E\u0439 \u0432\u0430\u0439\u0431 \u0432\u0430\u043C \u0431\u043B\u0438\u0436\u0435?**
\u2022 \u{1F5A4} Minimal luxe \u2014 \u0447\u0438\u0441\u0442\u043E\u0442\u0430, \u044D\u043B\u0435\u0433\u0430\u043D\u0442\u043D\u043E\u0441\u0442\u044C, whitespace
\u2022 \u{1F4AB} Editorial \u2014 \u043A\u0430\u043A \u043E\u0431\u043B\u043E\u0436\u043A\u0430 fashion-\u0436\u0443\u0440\u043D\u0430\u043B\u0430
\u2022 \u{1F33F} Organic \u2014 \u043C\u044F\u0433\u043A\u0438\u0435 \u0442\u043E\u043D\u0430, \u043F\u0440\u0438\u0440\u043E\u0434\u043D\u044B\u0435 \u0442\u0435\u043A\u0441\u0442\u0443\u0440\u044B
\u2022 \u2728 Modern classic \u2014 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0438 + \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0441\u0442\u044C
\u2022 \u{1F3A8} Bold \u2014 \u044F\u0440\u043A\u0438\u0439, \u043D\u0435\u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439, \u0437\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u044E\u0449\u0438\u0439\u0441\u044F

\u041C\u043E\u0436\u0435\u0442\u0435 \u0441\u0440\u0430\u0437\u0443 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E \u0438 \u043C\u0443\u0437\u044B\u043A\u0443 \u2014 \u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E \u0438\u0445 \u043A\u0430\u043A \u043E\u0441\u043D\u043E\u0432\u0443 \u0434\u0438\u0437\u0430\u0439\u043D\u0430! \u{1F4F8}\u{1F3B5}`;

// server/ai/providers.ts
var anthropicClient = null;
var openaiClient = null;
function getAnthropic() {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D");
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  return anthropicClient;
}
function getOpenAI() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}
function getAvailableProviders() {
  return {
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY
  };
}
function getDefaultProvider() {
  const available = getAvailableProviders();
  if (available.claude) return "claude";
  if (available.openai) return "openai";
  return null;
}
async function sendToClaude(messages, systemPrompt) {
  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    // Claude Opus 4
    max_tokens: 16384,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  });
  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}
async function sendToOpenAI(messages, systemPrompt) {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    // GPT-4.1 (default AI model)
    max_tokens: 16384,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    ]
  });
  return response.choices[0]?.message?.content || "";
}
async function processMessage(provider, messages, currentHtml) {
  try {
    const lastMessage = messages[messages.length - 1];
    const lowerMessage = lastMessage.content.toLowerCase();
    const wantsNewDesign = isExplicitNewDesignRequest(lowerMessage);
    if (currentHtml && !wantsNewDesign) {
      console.log("[AI] Editing existing HTML (preserving design)");
      const editPrompt = EDIT_HTML_PROMPT.replace("{current_html}", currentHtml).replace("{user_request}", lastMessage.content);
      const editMessages = [{ role: "user", content: editPrompt }];
      const response2 = provider === "claude" ? await sendToClaude(editMessages, SYSTEM_PROMPT) : await sendToOpenAI(editMessages, SYSTEM_PROMPT);
      const html2 = extractHtml(response2);
      if (html2) {
        return {
          message: "\u0413\u043E\u0442\u043E\u0432\u043E! \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u044B. \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u043D\u0430 \u043F\u0440\u0435\u0432\u044C\u044E.",
          html: html2
        };
      }
      return { message: response2 };
    }
    const shouldGenerate = shouldGenerateHtml(lowerMessage, messages.length);
    if (shouldGenerate || wantsNewDesign) {
      console.log("[AI] Generating new HTML");
      const context = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      const genPrompt = GENERATE_HTML_PROMPT + "\n" + context;
      const genMessages = [{ role: "user", content: genPrompt }];
      const response2 = provider === "claude" ? await sendToClaude(genMessages, SYSTEM_PROMPT) : await sendToOpenAI(genMessages, SYSTEM_PROMPT);
      const html2 = extractHtml(response2);
      if (html2) {
        return {
          message: wantsNewDesign ? "\u0421\u043E\u0437\u0434\u0430\u043B \u043D\u043E\u0432\u044B\u0439 \u0434\u0438\u0437\u0430\u0439\u043D! \u0415\u0441\u043B\u0438 \u0445\u043E\u0442\u0438\u0442\u0435 \u0447\u0442\u043E-\u0442\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u2014 \u043F\u0440\u043E\u0441\u0442\u043E \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435." : "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E! \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u043D\u0430 \u043F\u0440\u0435\u0432\u044C\u044E. \u0415\u0441\u043B\u0438 \u0445\u043E\u0442\u0438\u0442\u0435 \u0447\u0442\u043E-\u0442\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u2014 \u043F\u0440\u043E\u0441\u0442\u043E \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435.",
          html: html2
        };
      }
    }
    console.log("[AI] Conversation mode");
    const response = provider === "claude" ? await sendToClaude(messages, SYSTEM_PROMPT) : await sendToOpenAI(messages, SYSTEM_PROMPT);
    const html = extractHtml(response);
    if (html) {
      return {
        message: "\u0412\u043E\u0442 \u0447\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C! \u0415\u0441\u043B\u0438 \u0445\u043E\u0442\u0438\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u2014 \u043F\u0440\u043E\u0441\u0442\u043E \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435.",
        html
      };
    }
    return { message: response };
  } catch (error) {
    console.error("[AI] Error processing message:", error);
    throw new Error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.");
  }
}
function isExplicitNewDesignRequest(message) {
  const newDesignTriggers = [
    "\u043D\u043E\u0432\u044B\u0439 \u0434\u0438\u0437\u0430\u0439\u043D",
    "\u0437\u0430\u043D\u043E\u0432\u043E",
    "\u0441\u043D\u0430\u0447\u0430\u043B\u0430",
    "\u0434\u0440\u0443\u0433\u043E\u0439 \u0434\u0438\u0437\u0430\u0439\u043D",
    "\u043D\u043E\u0432\u043E\u0435 \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435",
    "\u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439 \u0437\u0430\u043D\u043E\u0432\u043E",
    "\u043F\u0435\u0440\u0435\u0434\u0435\u043B\u0430\u0439 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E",
    "\u0441 \u043D\u0443\u043B\u044F",
    "new design",
    "start over",
    "regenerate"
  ];
  return newDesignTriggers.some((t2) => message.includes(t2));
}
function shouldGenerateHtml(message, messageCount) {
  const triggers = [
    "\u0441\u043E\u0437\u0434\u0430\u0439",
    "\u0441\u0434\u0435\u043B\u0430\u0439",
    "\u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439",
    "\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439",
    "\u0433\u043E\u0442\u043E\u0432",
    "\u043F\u043E\u0433\u043D\u0430\u043B\u0438",
    "\u0434\u0430\u0432\u0430\u0439",
    "\u043D\u0430\u0447\u043D\u0438",
    "create",
    "generate",
    "make",
    "build",
    "\u0436\u0430\u0441\u0430",
    "\u049B\u04B1\u0440"
    // казахский
  ];
  if (messageCount >= 3) {
    for (const trigger of triggers) {
      if (message.includes(trigger)) return true;
    }
  }
  if (message.includes("html") || message.includes("\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0433\u043E\u0442\u043E\u0432")) {
    return true;
  }
  return false;
}
function extractHtml(response) {
  const htmlMatch = response.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
  if (htmlMatch) {
    return htmlMatch[0];
  }
  const codeBlockMatch = response.match(/```(?:html)?\s*(<!DOCTYPE[\s\S]*?<\/html>)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  if (response.trim().toLowerCase().startsWith("<!doctype")) {
    return response.trim();
  }
  return null;
}
function getWelcomeMessage() {
  return WELCOME_MESSAGE;
}

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  sitemap: sitemapRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // User profile management
  user: router({
    // Update user phone number
    updatePhone: protectedProcedure.input(z2.object({
      phone: z2.string().min(10).max(20)
    })).mutation(async ({ ctx, input }) => {
      await updateUserPhone(ctx.user.id, input.phone);
      return { success: true };
    }),
    // Get current user profile
    profile: protectedProcedure.query(async ({ ctx }) => {
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        phone: ctx.user.phone
      };
    })
  }),
  wedding: router({
    // Create a new event/invitation (protected)
    create: protectedProcedure.input(z2.object({
      slug: z2.string().min(1).max(100),
      title: z2.string().min(1).max(200),
      titleKz: z2.string().max(200).optional(),
      date: z2.date(),
      location: z2.string().min(1).max(300),
      locationKz: z2.string().max(300).optional(),
      mapUrl: z2.string().optional(),
      description: z2.string().optional(),
      descriptionKz: z2.string().optional(),
      backgroundImage: z2.string().optional(),
      eventType: z2.enum(["wedding", "birthday", "corporate", "anniversary", "sundettoi", "tusaukeser", "kyz_uzatu", "betashar", "other"]).default("wedding"),
      languageMode: z2.enum(["ru", "kz", "both"]).default("both")
    })).mutation(async ({ ctx, input }) => {
      const existing = await getWeddingBySlug(input.slug);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "\u042D\u0442\u043E\u0442 URL \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439."
        });
      }
      return createWedding({
        ...input,
        userId: ctx.user.id
      });
    }),
    // Get event by ID (protected, owner only)
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.id);
      if (!wedding) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E"
        });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      return wedding;
    }),
    // Get event by slug (public)
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const wedding = await getWeddingBySlug(input.slug);
      if (!wedding) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E"
        });
      }
      return wedding;
    }),
    // Get user's weddings (protected)
    myWeddings: protectedProcedure.query(async ({ ctx }) => {
      return getUserWeddings(ctx.user.id);
    }),
    // Update event (protected, owner only)
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      slug: z2.string().min(1).max(100).optional(),
      title: z2.string().min(1).max(200).optional(),
      titleKz: z2.string().max(200).optional(),
      date: z2.date().optional(),
      location: z2.string().min(1).max(300).optional(),
      locationKz: z2.string().max(300).optional(),
      description: z2.string().optional(),
      descriptionKz: z2.string().optional(),
      backgroundImage: z2.string().optional(),
      customBackgroundUrl: z2.string().nullable().optional(),
      photoShape: z2.enum(["square", "circle", "heart", "hexagon", "diamond", "arch", "frame", "oval", "soft-arch", "petal", "ornate", "vintage"]).optional(),
      customFont: z2.string().optional(),
      customColor: z2.string().optional(),
      textColor: z2.string().optional(),
      themeColor: z2.string().optional(),
      buttonColor: z2.string().optional(),
      buttonTextColor: z2.string().optional(),
      templateId: z2.string().optional(),
      musicUrl: z2.string().optional(),
      videoUrl: z2.string().optional(),
      loveStory: z2.string().optional(),
      loveStoryKz: z2.string().optional(),
      // Premium constructor blocks
      timelineData: z2.string().optional().nullable(),
      menuData: z2.string().optional().nullable(),
      dressCode: z2.string().optional().nullable(),
      dressCodeKz: z2.string().optional().nullable(),
      coordinatorName: z2.string().optional().nullable(),
      coordinatorPhone: z2.string().optional().nullable(),
      coordinatorEmail: z2.string().optional().nullable(),
      qrCodeData: z2.string().optional().nullable(),
      // Block visibility toggles
      showTimeline: z2.boolean().optional(),
      showMenu: z2.boolean().optional(),
      showDressCode: z2.boolean().optional(),
      showQrCode: z2.boolean().optional(),
      showCoordinator: z2.boolean().optional(),
      showLocationDetails: z2.boolean().optional(),
      // Main blocks visibility
      showRsvp: z2.boolean().optional(),
      showWishlist: z2.boolean().optional(),
      showWishes: z2.boolean().optional(),
      // Event options/policies
      childrenPolicy: z2.enum(["neutral", "allowed", "not_allowed"]).optional(),
      alcoholPolicy: z2.enum(["neutral", "allowed", "not_allowed"]).optional(),
      photoPolicy: z2.enum(["neutral", "allowed", "not_allowed"]).optional(),
      // Countdown timer
      showCountdown: z2.boolean().optional(),
      // Block order
      blockOrder: z2.string().optional().nullable(),
      locationDetails: z2.string().optional().nullable(),
      locationDetailsKz: z2.string().optional().nullable(),
      mapUrl: z2.string().optional().nullable(),
      showHeart: z2.boolean().optional(),
      headerIcon: z2.enum(["none", "heart", "crescent", "star", "sparkle", "party"]).optional(),
      eventType: z2.enum(["wedding", "birthday", "corporate", "anniversary", "sundettoi", "tusaukeser", "kyz_uzatu", "betashar", "other"]).optional(),
      languageMode: z2.enum(["ru", "kz", "both"]).optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const wedding = await getWeddingById(id);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (updates.slug && updates.slug !== wedding.slug) {
        const existing = await getWeddingBySlug(updates.slug);
        if (existing) {
          throw new TRPCError3({
            code: "CONFLICT",
            message: "\u042D\u0442\u043E\u0442 URL \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442"
          });
        }
      }
      await updateWedding(id, updates);
      return { success: true };
    }),
    // Delete wedding (protected, owner only)
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.id);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      await deleteWedding(input.id);
      return { success: true };
    }),
    // Upgrade to premium (protected, owner only)
    upgrade: protectedProcedure.input(z2.object({ weddingId: z2.number() })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (wedding.isPaid) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u0423\u0436\u0435 Premium" });
      }
      await updateWedding(input.weddingId, { isPaid: true });
      return { success: true };
    })
  }),
  rsvp: router({
    // Submit RSVP (public)
    submit: publicProcedure.input(z2.object({
      weddingId: z2.number(),
      name: z2.string().min(1).max(200),
      email: z2.string().email().optional(),
      phone: z2.string().max(50).optional(),
      attending: z2.enum(["yes", "no", "yes_plus_one", "yes_with_spouse"]),
      guestCount: z2.number().min(1).default(1),
      dietaryRestrictions: z2.string().optional(),
      needsParking: z2.boolean().default(false),
      needsTransfer: z2.boolean().default(false)
    })).mutation(async ({ input }) => {
      return createRsvp(input);
    }),
    // Get RSVPs for wedding (protected, owner only)
    list: protectedProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      return getWeddingRsvps(input.weddingId);
    })
  }),
  wishlist: router({
    // Get wishlist (public)
    list: publicProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ input }) => {
      return getWeddingWishlist(input.weddingId);
    }),
    // Add wishlist item (protected, owner only)
    add: protectedProcedure.input(z2.object({
      weddingId: z2.number(),
      name: z2.string().min(1).max(200),
      nameKz: z2.string().max(200).optional(),
      description: z2.string().optional(),
      descriptionKz: z2.string().optional(),
      link: z2.string().url(),
      order: z2.number().default(0)
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      return createWishlistItem(input);
    }),
    // Reserve wishlist item (public)
    reserve: publicProcedure.input(z2.object({
      id: z2.number(),
      reservedBy: z2.string().min(1).max(200),
      reservedEmail: z2.string().email(),
      reservedPhone: z2.string().max(50).optional()
    })).mutation(async ({ input }) => {
      const { id, reservedBy, reservedEmail, reservedPhone } = input;
      await reserveWishlistItem(id, reservedBy, reservedEmail, reservedPhone || "");
      return { success: true };
    }),
    // Update wishlist item (protected, owner only)
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      weddingId: z2.number(),
      name: z2.string().min(1).max(200).optional(),
      nameKz: z2.string().max(200).optional(),
      description: z2.string().optional(),
      descriptionKz: z2.string().optional(),
      link: z2.string().url().optional(),
      order: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, weddingId, ...updates } = input;
      const wedding = await getWeddingById(weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      await updateWishlistItem(id, updates);
      return { success: true };
    }),
    // Delete wishlist item (protected, owner only)
    delete: protectedProcedure.input(z2.object({
      id: z2.number(),
      weddingId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      await deleteWishlistItem(input.id);
      return { success: true };
    })
  }),
  wish: router({
    // Submit wish (public)
    submit: publicProcedure.input(z2.object({
      weddingId: z2.number(),
      guestName: z2.string().min(1).max(200),
      message: z2.string().min(1)
    })).mutation(async ({ input }) => {
      return createWish(input);
    }),
    // Get approved wishes (public)
    listApproved: publicProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ input }) => {
      return getWeddingWishes(input.weddingId, true);
    }),
    // Get all wishes (protected, owner only)
    listAll: protectedProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      return getWeddingWishes(input.weddingId, false);
    }),
    // Approve wish (protected, owner only)
    approve: protectedProcedure.input(z2.object({
      id: z2.number(),
      weddingId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      await approveWish(input.id);
      return { success: true };
    }),
    // Reject wish (protected, owner only)
    reject: protectedProcedure.input(z2.object({
      id: z2.number(),
      weddingId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      await rejectWish(input.id);
      return { success: true };
    })
  }),
  gallery: router({
    // Get gallery (public)
    list: publicProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ input }) => {
      return getWeddingGallery(input.weddingId);
    }),
    // Add gallery image (protected, owner only)
    add: protectedProcedure.input(z2.object({
      weddingId: z2.number(),
      imageUrl: z2.string(),
      caption: z2.string().optional(),
      captionKz: z2.string().optional(),
      order: z2.number().default(0)
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      return createGalleryImage(input);
    }),
    // Delete gallery image (protected, owner only)
    delete: protectedProcedure.input(z2.object({
      id: z2.number(),
      weddingId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      await deleteGalleryImage(input.id);
      return { success: true };
    })
  }),
  payment: router({
    // Create payment for premium upgrade
    createPremiumPayment: protectedProcedure.input(z2.object({
      weddingId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (wedding.isPaid) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u0423 \u044D\u0442\u043E\u0439 \u0441\u0432\u0430\u0434\u044C\u0431\u044B \u0443\u0436\u0435 \u0435\u0441\u0442\u044C Premium" });
      }
      const orderId = `wedding_${input.weddingId}_${Date.now()}`;
      const host = ctx.req.headers.host || "localhost:3000";
      const isDevDomain = host.includes("manusvm.computer") || host.includes("localhost");
      const baseUrl = isDevDomain ? "https://bookme-kz-epbqejiu.manus.space" : `https://${host}`;
      try {
        const priceInfo = await getCurrentPrice();
        const redirectUrl = await createPayment({
          orderId,
          amount: priceInfo.price,
          // Dynamic price: 990 for promo, 4990 regular
          description: `Premium \u0434\u043B\u044F \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F: ${wedding.title}`,
          successUrl: `${baseUrl}/payment/success?weddingId=${input.weddingId}`,
          failureUrl: `${baseUrl}/payment/failure?weddingId=${input.weddingId}`,
          resultUrl: `${baseUrl}/api/payment/callback`
        });
        return { redirectUrl };
      } catch (error) {
        console.error("FreedomPay error:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u043F\u043B\u0430\u0442\u0435\u0436\u0430"
        });
      }
    }),
    // Get current pricing info (for UI)
    getPricingInfo: publicProcedure.query(async () => {
      return getCurrentPrice();
    }),
    // Free activation for AI package owners
    activateFreeWithAIPackage: protectedProcedure.input(z2.object({
      weddingId: z2.number()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (wedding.isPaid) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0443\u0436\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043E" });
      }
      const hasAIPackage = !!wedding.aiPackage;
      if (!hasAIPackage) {
        throw new TRPCError3({
          code: "PRECONDITION_FAILED",
          message: "\u0414\u043B\u044F \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E\u0439 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C AI-\u043F\u0430\u043A\u0435\u0442"
        });
      }
      await upgradeWeddingToPremium(input.weddingId);
      return { success: true };
    })
  }),
  // AI invitation generator (Full HTML mode)
  ai: router({
    // Get available AI providers
    getProviders: publicProcedure.query(() => {
      const available = getAvailableProviders();
      const defaultProvider = getDefaultProvider();
      return {
        available,
        defaultProvider,
        welcomeMessage: getWelcomeMessage()
      };
    }),
    // Process chat message - public for guest mode with limits
    chat: publicProcedure.input(z2.object({
      provider: z2.enum(["claude", "openai"]),
      messages: z2.array(z2.object({
        role: z2.enum(["user", "assistant"]),
        content: z2.string()
      })),
      currentHtml: z2.string().nullable(),
      isGuest: z2.boolean().optional()
      // Flag for guest mode
    })).mutation(async ({ ctx, input }) => {
      const available = getAvailableProviders();
      const userMessages = input.messages.filter((m) => m.role === "user");
      const isGuest = !ctx.user && input.isGuest;
      if (isGuest && userMessages.length > 2) {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "\u0414\u043B\u044F \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0435\u043D\u0438\u044F \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F"
        });
      }
      if (input.provider === "claude" && !available.claude) {
        throw new TRPCError3({
          code: "PRECONDITION_FAILED",
          message: "Claude \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 ANTHROPIC_API_KEY."
        });
      }
      if (input.provider === "openai" && !available.openai) {
        throw new TRPCError3({
          code: "PRECONDITION_FAILED",
          message: "OpenAI \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 OPENAI_API_KEY."
        });
      }
      try {
        const result = await processMessage(
          input.provider,
          input.messages,
          input.currentHtml
        );
        return result;
      } catch (error) {
        console.error("[AI Chat] Error:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "\u041E\u0448\u0438\u0431\u043A\u0430 AI"
        });
      }
    }),
    // Save AI-generated HTML invitation
    saveHtml: protectedProcedure.input(z2.object({
      html: z2.string().min(100),
      slug: z2.string().min(1).max(100),
      title: z2.string().min(1).max(200),
      chatHistory: z2.array(z2.object({
        role: z2.enum(["user", "assistant"]),
        content: z2.string()
      })).optional()
    })).mutation(async ({ ctx, input }) => {
      const existing = await getWeddingBySlug(input.slug);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "\u042D\u0442\u043E\u0442 URL \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439."
        });
      }
      const wedding = await createWedding({
        userId: ctx.user.id,
        slug: input.slug,
        eventType: "other",
        languageMode: "both",
        title: input.title,
        date: /* @__PURE__ */ new Date(),
        location: "",
        description: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E AI",
        isAI: true,
        aiGeneratedHtml: input.html,
        aiChatHistory: input.chatHistory ? JSON.stringify(input.chatHistory) : null
      });
      return wedding;
    }),
    // Update existing AI invitation
    updateHtml: protectedProcedure.input(z2.object({
      id: z2.number(),
      html: z2.string().min(100),
      title: z2.string().min(1).max(200).optional(),
      slug: z2.string().min(1).max(100).optional(),
      chatHistory: z2.array(z2.object({
        role: z2.enum(["user", "assistant"]),
        content: z2.string()
      })).optional()
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.id);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (input.slug && input.slug !== wedding.slug) {
        const existing = await getWeddingBySlug(input.slug);
        if (existing && existing.id !== input.id) {
          throw new TRPCError3({
            code: "CONFLICT",
            message: "\u042D\u0442\u043E\u0442 URL \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439."
          });
        }
      }
      const updates = {
        aiGeneratedHtml: input.html,
        aiChatHistory: input.chatHistory ? JSON.stringify(input.chatHistory) : wedding.aiChatHistory
      };
      if (input.title) {
        updates.title = input.title;
      }
      if (input.slug) {
        updates.slug = input.slug;
      }
      await updateWedding(input.id, updates);
      return { success: true, slug: input.slug || wedding.slug };
    }),
    // Get AI invitation for editing
    getForEdit: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.id);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (!wedding.isAI) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u042D\u0442\u043E \u043D\u0435 AI-\u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435" });
      }
      return {
        id: wedding.id,
        slug: wedding.slug,
        title: wedding.title,
        html: wedding.aiGeneratedHtml,
        chatHistory: wedding.aiChatHistory ? JSON.parse(wedding.aiChatHistory) : []
      };
    }),
    // Submit form from AI invitation (public - guests can submit)
    submitForm: publicProcedure.input(z2.object({
      slug: z2.string(),
      formType: z2.enum(["rsvp", "wish", "wishlist"]),
      data: z2.record(z2.string(), z2.any())
    })).mutation(async ({ input }) => {
      console.log("[AI Form] Received submission:", JSON.stringify(input, null, 2));
      const wedding = await getWeddingBySlug(input.slug);
      if (!wedding) {
        console.log("[AI Form] Wedding not found for slug:", input.slug);
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      console.log("[AI Form] Found wedding:", wedding.id, wedding.title);
      const weddingId = wedding.id;
      const findValue = (keys, defaultVal = "") => {
        for (const key of keys) {
          if (input.data[key] !== void 0 && input.data[key] !== "") {
            return String(input.data[key]);
          }
          const lowerKey = key.toLowerCase();
          for (const dataKey of Object.keys(input.data)) {
            if (dataKey.toLowerCase() === lowerKey || dataKey.toLowerCase().includes(lowerKey)) {
              if (input.data[dataKey] !== void 0 && input.data[dataKey] !== "") {
                return String(input.data[dataKey]);
              }
            }
          }
        }
        return defaultVal;
      };
      switch (input.formType) {
        case "rsvp": {
          const name = findValue(["name", "guestName", "\u0438\u043C\u044F", "guest_name", "fullname", "\u0444\u0438\u043E"], "\u0413\u043E\u0441\u0442\u044C");
          const phone = findValue(["phone", "\u0442\u0435\u043B\u0435\u0444\u043E\u043D", "tel", "mobile", "\u043D\u043E\u043C\u0435\u0440"]);
          const email = findValue(["email", "\u043F\u043E\u0447\u0442\u0430", "mail", "e-mail"]);
          const guestCountStr = findValue(["guestCount", "guests", "\u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E", "guest_count", "people", "\u0447\u0435\u043B\u043E\u0432\u0435\u043A", "persons"], "1");
          const guestCount = parseInt(guestCountStr) || 1;
          const dietary = findValue(["dietary", "dietaryRestrictions", "\u0434\u0438\u0435\u0442\u0430", "food", "\u0435\u0434\u0430", "\u0430\u043B\u043B\u0435\u0440\u0433\u0438\u044F"]);
          let attending = "yes";
          const attendingValue = findValue(["attending", "\u0443\u0447\u0430\u0441\u0442\u0438\u0435", "presence", "\u043F\u0440\u0438\u0434\u0443", "response", "\u043E\u0442\u0432\u0435\u0442"], "yes").toLowerCase();
          if (attendingValue === "no" || attendingValue === "\u043D\u0435\u0442" || attendingValue.includes("\u043D\u0435 \u043F\u0440\u0438\u0434\u0443") || attendingValue.includes("\u043D\u0435 \u0441\u043C\u043E\u0433\u0443")) {
            attending = "no";
          } else if (attendingValue === "yes_plus_one" || guestCount > 1) {
            attending = "yes_plus_one";
          } else if (attendingValue === "yes_with_spouse") {
            attending = "yes_with_spouse";
          }
          console.log("[AI Form] Creating RSVP:", { name, phone, email, attending, guestCount, rawData: input.data });
          try {
            await createRsvp({
              weddingId,
              name,
              email: email || null,
              phone: phone || null,
              attending,
              guestCount,
              dietaryRestrictions: dietary || null
            });
            console.log("[AI Form] RSVP created successfully");
            return { success: true, message: "\u0412\u0430\u0448 \u043E\u0442\u0432\u0435\u0442 \u0437\u0430\u043F\u0438\u0441\u0430\u043D!" };
          } catch (dbError) {
            console.error("[AI Form] Database error creating RSVP:", dbError);
            throw new TRPCError3({
              code: "INTERNAL_SERVER_ERROR",
              message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
            });
          }
        }
        case "wish": {
          const wishName = findValue(["name", "\u0438\u043C\u044F", "guestName", "author", "\u0430\u0432\u0442\u043E\u0440", "\u043E\u0442"], "\u0413\u043E\u0441\u0442\u044C");
          const wishMessage = findValue(["message", "\u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0435", "text", "\u0442\u0435\u043A\u0441\u0442", "wish", "comment", "\u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", "\u043F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435"]);
          console.log("[AI Form] Creating wish:", { name: wishName, message: wishMessage?.substring(0, 50), rawData: input.data });
          if (!wishMessage) {
            throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0435 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C" });
          }
          try {
            await createWish({
              weddingId,
              guestName: wishName,
              message: wishMessage,
              isApproved: false
              // Owner needs to approve
            });
            console.log("[AI Form] Wish created successfully");
            return { success: true, message: "\u041F\u043E\u0436\u0435\u043B\u0430\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E!" };
          } catch (dbError) {
            console.error("[AI Form] Database error creating wish:", dbError);
            throw new TRPCError3({
              code: "INTERNAL_SERVER_ERROR",
              message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
            });
          }
        }
        case "wishlist": {
          const itemId = findValue(["itemId", "item_id", "giftId", "gift_id", "id"]);
          const giftName = findValue(["giftName", "gift_name", "\u043F\u043E\u0434\u0430\u0440\u043E\u043A", "\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "gift", "item"]);
          const reserverName = findValue(["name", "\u0438\u043C\u044F", "reservedBy", "\u0433\u043E\u0441\u0442\u044C"], "\u0413\u043E\u0441\u0442\u044C");
          const reserverEmail = findValue(["email", "\u043F\u043E\u0447\u0442\u0430"], "");
          const reserverPhone = findValue(["phone", "\u0442\u0435\u043B\u0435\u0444\u043E\u043D"], "");
          console.log("[AI Form] Reserving wishlist item:", { itemId, giftName, name: reserverName, rawData: input.data });
          try {
            if (itemId && !isNaN(parseInt(itemId))) {
              await reserveWishlistItem(
                parseInt(itemId),
                reserverName,
                reserverEmail,
                reserverPhone
              );
            } else if (giftName) {
              const existingItems = await getWeddingWishlist(weddingId);
              let item = existingItems.find((i) => i.name.toLowerCase() === giftName.toLowerCase());
              if (!item) {
                item = await createWishlistItem({
                  weddingId,
                  name: giftName,
                  link: "",
                  order: existingItems.length
                });
              }
              await reserveWishlistItem(item.id, reserverName, reserverEmail, reserverPhone);
            } else {
              throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D \u043F\u043E\u0434\u0430\u0440\u043E\u043A" });
            }
            return { success: true, message: "\u041F\u043E\u0434\u0430\u0440\u043E\u043A \u0437\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u043D!" };
          } catch (dbError) {
            console.error("[AI Form] Database error reserving wishlist:", dbError);
            if (dbError instanceof TRPCError3) throw dbError;
            throw new TRPCError3({
              code: "INTERNAL_SERVER_ERROR",
              message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
            });
          }
        }
        default:
          throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0444\u043E\u0440\u043C\u044B" });
      }
    }),
    // Analyze AI HTML to detect which blocks exist + check if data exists
    detectBlocks: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const wedding = await getWeddingBySlug(input.slug);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (!wedding.isAI || !wedding.aiGeneratedHtml) {
        return {
          hasRsvp: true,
          hasWishes: true,
          hasWishlist: true,
          hasTimeline: true,
          hasGallery: true,
          hasDressCode: true,
          hasMap: true
        };
      }
      const [rsvpCount, wishCount, wishlistCount] = await Promise.all([
        getWeddingRsvps(wedding.id).then((r) => r.length),
        getWeddingWishes(wedding.id).then((w) => w.length),
        getWeddingWishlist(wedding.id).then((w) => w.length)
      ]);
      const html = (wedding.aiGeneratedHtml || "").toLowerCase();
      const hasRsvpForm = html.includes("rsvp") || html.includes("\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C") || html.includes("\u043F\u0440\u0438\u0434\u0443") || html.includes("\u0443\u0447\u0430\u0441\u0442\u0438\u0435") || html.includes("attending") || html.includes("form") && (html.includes("\u0433\u043E\u0441\u0442") || html.includes("guest"));
      const hasRsvp = hasRsvpForm || rsvpCount > 0;
      const hasWishesForm = html.includes("\u043F\u043E\u0436\u0435\u043B\u0430\u043D\u0438") || html.includes("\u043F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u0435\u043D\u0438") || html.includes("wish") || html.includes("message") && html.includes("form");
      const hasWishes = hasWishesForm || wishCount > 0;
      const hasWishlistForm = html.includes("wishlist") || html.includes("\u043F\u043E\u0434\u0430\u0440\u043A") || html.includes("gift") || html.includes("\u0437\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C");
      const hasWishlist = hasWishlistForm || wishlistCount > 0;
      const hasTimeline = html.includes("timeline") || html.includes("\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430") || html.includes("\u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435") || html.includes("schedule");
      const hasGallery = html.includes("gallery") || html.includes("\u0433\u0430\u043B\u0435\u0440\u0435\u044F") || html.includes("\u0444\u043E\u0442\u043E") || html.includes("photo");
      const hasDressCode = html.includes("dress") || html.includes("\u0434\u0440\u0435\u0441\u0441") || html.includes("\u043A\u043E\u0434") && html.includes("\u043E\u0434\u0435\u0436\u0434");
      const hasMap = html.includes("map") || html.includes("\u043A\u0430\u0440\u0442\u0430") || html.includes("location") || html.includes("\u043B\u043E\u043A\u0430\u0446\u0438\u044F") || html.includes("\u0430\u0434\u0440\u0435\u0441");
      return {
        hasRsvp,
        hasWishes,
        hasWishlist,
        hasTimeline,
        hasGallery,
        hasDressCode,
        hasMap
      };
    }),
    // Get AI package status for an invitation
    getPackageStatus: protectedProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      return {
        hasPackage: !!wedding.aiPackage,
        package: wedding.aiPackage || null,
        editsLimit: wedding.aiEditsLimit || 0,
        editsUsed: wedding.aiEditsUsed || 0,
        editsRemaining: Math.max(0, (wedding.aiEditsLimit || 0) - (wedding.aiEditsUsed || 0))
      };
    }),
    // Check if user can make an AI edit (has remaining edits)
    canEdit: protectedProcedure.input(z2.object({ weddingId: z2.number() })).query(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      const hasPackage = !!wedding.aiPackage;
      const editsRemaining = (wedding.aiEditsLimit || 0) - (wedding.aiEditsUsed || 0);
      return {
        canEdit: hasPackage && editsRemaining > 0,
        hasPackage,
        editsRemaining: Math.max(0, editsRemaining),
        reason: !hasPackage ? "no_package" : editsRemaining <= 0 ? "limit_reached" : null
      };
    }),
    // Increment AI edit counter (called after successful chat message)
    incrementEditCount: protectedProcedure.input(z2.object({ weddingId: z2.number() })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      const newCount = (wedding.aiEditsUsed || 0) + 1;
      await updateWedding(input.weddingId, { aiEditsUsed: newCount });
      return {
        editsUsed: newCount,
        editsRemaining: Math.max(0, (wedding.aiEditsLimit || 0) - newCount)
      };
    }),
    // Purchase AI package
    purchasePackage: protectedProcedure.input(z2.object({
      weddingId: z2.number(),
      packageId: z2.enum(["start", "pro", "unlimited"])
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      const packages = {
        start: { edits: 15, price: 1990 },
        pro: { edits: 50, price: 3990 },
        unlimited: { edits: 200, price: 6990 }
      };
      const pkg = packages[input.packageId];
      if (!pkg) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u0430\u043A\u0435\u0442" });
      }
      const baseUrl = process.env.BASE_URL || "https://bookme.kz";
      const orderId = `aipackage_${input.weddingId}_${input.packageId}_${Date.now()}`;
      try {
        const redirectUrl = await createPayment({
          orderId,
          amount: pkg.price,
          description: `AI \u043F\u0430\u043A\u0435\u0442 ${input.packageId.toUpperCase()} \u0434\u043B\u044F \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F`,
          successUrl: `${baseUrl}/payment/ai-success?weddingId=${input.weddingId}&package=${input.packageId}`,
          failureUrl: `${baseUrl}/payment/ai-failure?weddingId=${input.weddingId}`,
          resultUrl: `${baseUrl}/api/payment/ai-callback`
        });
        return { redirectUrl };
      } catch (error) {
        console.error("FreedomPay AI package error:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u043F\u043B\u0430\u0442\u0435\u0436\u0430"
        });
      }
    }),
    // Purchase additional AI edits (topup)
    purchaseTopup: protectedProcedure.input(z2.object({
      weddingId: z2.number(),
      topupId: z2.enum(["small", "medium"])
    })).mutation(async ({ ctx, input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      if (wedding.userId !== ctx.user.id) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430" });
      }
      if (!wedding.aiPackage) {
        throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u0440\u0438\u043E\u0431\u0440\u0435\u0442\u0438\u0442\u0435 AI \u043F\u0430\u043A\u0435\u0442" });
      }
      const topups = {
        small: { edits: 10, price: 990 },
        medium: { edits: 30, price: 1990 }
      };
      const topup = topups[input.topupId];
      if (!topup) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u043E\u043F\u0430\u043F" });
      }
      const baseUrl = process.env.BASE_URL || "https://bookme.kz";
      const orderId = `aitopup_${input.weddingId}_${input.topupId}_${Date.now()}`;
      try {
        const redirectUrl = await createPayment({
          orderId,
          amount: topup.price,
          description: `+${topup.edits} AI-\u043F\u0440\u0430\u0432\u043E\u043A \u0434\u043B\u044F \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F`,
          successUrl: `${baseUrl}/payment/ai-topup-success?weddingId=${input.weddingId}&topup=${input.topupId}`,
          failureUrl: `${baseUrl}/payment/ai-failure?weddingId=${input.weddingId}`,
          resultUrl: `${baseUrl}/api/payment/ai-topup-callback`
        });
        return { redirectUrl };
      } catch (error) {
        console.error("FreedomPay AI topup error:", error);
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u043F\u043B\u0430\u0442\u0435\u0436\u0430"
        });
      }
    }),
    // Activate AI package after successful payment (called from payment callback)
    activatePackage: publicProcedure.input(z2.object({
      weddingId: z2.number(),
      packageId: z2.enum(["start", "pro", "unlimited"]),
      orderId: z2.string()
    })).mutation(async ({ input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const packages = {
        start: { edits: 15 },
        pro: { edits: 50 },
        unlimited: { edits: 200 }
      };
      const pkg = packages[input.packageId];
      if (!pkg) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u0430\u043A\u0435\u0442" });
      }
      await updateWedding(input.weddingId, {
        aiPackage: input.packageId,
        aiEditsLimit: pkg.edits,
        aiPackagePaidAt: /* @__PURE__ */ new Date(),
        isPaid: true
        // Free publication with AI package
      });
      return { success: true };
    }),
    // Add edits after topup payment (called from payment callback)
    addTopupEdits: publicProcedure.input(z2.object({
      weddingId: z2.number(),
      topupId: z2.enum(["small", "medium"]),
      orderId: z2.string()
    })).mutation(async ({ input }) => {
      const wedding = await getWeddingById(input.weddingId);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const topups = {
        small: { edits: 10 },
        medium: { edits: 30 }
      };
      const topup = topups[input.topupId];
      if (!topup) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u043E\u043F\u0430\u043F" });
      }
      const currentLimit = wedding.aiEditsLimit || 0;
      await updateWedding(input.weddingId, {
        aiEditsLimit: currentLimit + topup.edits
      });
      return { success: true, newLimit: currentLimit + topup.edits };
    })
  }),
  // Admin Panel API
  admin: router({
    // Check if current user is admin
    isAdmin: protectedProcedure.query(async ({ ctx }) => {
      return isUserAdmin(ctx.user.id);
    }),
    // Get admin stats
    stats: protectedProcedure.query(async ({ ctx }) => {
      const isAdmin = await isUserAdmin(ctx.user.id);
      if (!isAdmin) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0451\u043D" });
      }
      return getAdminStats();
    }),
    // Get all users with filters
    users: protectedProcedure.input(z2.object({
      search: z2.string().optional(),
      limit: z2.number().min(1).max(100).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()).query(async ({ ctx, input }) => {
      const isAdmin = await isUserAdmin(ctx.user.id);
      if (!isAdmin) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0451\u043D" });
      }
      return getAllUsers(input || {});
    }),
    // Get all invitations with filters
    invitations: protectedProcedure.input(z2.object({
      search: z2.string().optional(),
      eventType: z2.string().optional(),
      isAI: z2.boolean().optional(),
      isPaid: z2.boolean().optional(),
      limit: z2.number().min(1).max(100).default(50),
      offset: z2.number().min(0).default(0)
    }).optional()).query(async ({ ctx, input }) => {
      const isAdmin = await isUserAdmin(ctx.user.id);
      if (!isAdmin) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0451\u043D" });
      }
      return getAllInvitations(input || {});
    }),
    // Get invitation details (for admin view)
    getInvitation: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const isAdmin = await isUserAdmin(ctx.user.id);
      if (!isAdmin) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0451\u043D" });
      }
      const wedding = await getWeddingById(input.id);
      if (!wedding) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" });
      }
      const rsvps2 = await getWeddingRsvps(input.id);
      const wishlist = await getWeddingWishlist(input.id);
      const wishes2 = await getWeddingWishes(input.id, false);
      return {
        ...wedding,
        rsvps: rsvps2,
        wishlist,
        wishes: wishes2
      };
    })
  })
});

// server/firebase-admin.ts
import admin from "firebase-admin";
var firebaseAdmin = null;
function getFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
    }
    const serviceAccount = JSON.parse(serviceAccountKey);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log("[Firebase Admin] Initialized successfully");
    return firebaseAdmin;
  } catch (error) {
    console.error("[Firebase Admin] Failed to initialize:", error);
    throw error;
  }
}
async function verifyFirebaseToken(idToken) {
  try {
    const admin2 = getFirebaseAdmin();
    const decodedToken = await admin2.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("[Firebase Admin] Token verification failed:", error);
    throw new Error("Invalid Firebase token");
  }
}

// server/_core/context.ts
import { eq as eq3 } from "drizzle-orm";
async function createContext(opts) {
  let user = null;
  const authHeader = opts.req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await verifyFirebaseToken(idToken);
      const db = await getDb();
      if (db) {
        let existingUsers = await db.select().from(users).where(eq3(users.firebaseUid, decodedToken.uid)).limit(1);
        if (existingUsers.length === 0 && decodedToken.email) {
          existingUsers = await db.select().from(users).where(eq3(users.email, decodedToken.email)).limit(1);
          if (existingUsers.length > 0) {
            await db.update(users).set({
              firebaseUid: decodedToken.uid,
              loginMethod: "firebase",
              lastSignedIn: /* @__PURE__ */ new Date()
            }).where(eq3(users.id, existingUsers[0].id));
          }
        }
        if (existingUsers.length > 0) {
          user = existingUsers[0];
          await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq3(users.id, user.id));
        } else {
          try {
            const result = await db.insert(users).values({
              firebaseUid: decodedToken.uid,
              email: decodedToken.email || `${decodedToken.uid}@firebase.local`,
              phone: decodedToken.phone_number || null,
              name: decodedToken.name || null,
              loginMethod: "firebase",
              role: "user",
              lastSignedIn: /* @__PURE__ */ new Date(),
              termsAcceptedAt: /* @__PURE__ */ new Date()
            });
            const userId = Number(result[0].insertId);
            const newUsers = await db.select().from(users).where(eq3(users.id, userId)).limit(1);
            if (newUsers.length > 0) {
              user = newUsers[0];
            }
          } catch (insertError) {
            if (insertError?.cause?.code === "ER_DUP_ENTRY" && decodedToken.email) {
              const foundUsers = await db.select().from(users).where(eq3(users.email, decodedToken.email.toLowerCase())).limit(1);
              if (foundUsers.length === 0) {
                const foundUsers2 = await db.select().from(users).where(eq3(users.email, decodedToken.email)).limit(1);
                if (foundUsers2.length > 0) {
                  user = foundUsers2[0];
                  await db.update(users).set({
                    firebaseUid: decodedToken.uid,
                    loginMethod: "firebase",
                    lastSignedIn: /* @__PURE__ */ new Date()
                  }).where(eq3(users.id, user.id));
                }
              } else {
                user = foundUsers[0];
                await db.update(users).set({
                  firebaseUid: decodedToken.uid,
                  loginMethod: "firebase",
                  lastSignedIn: /* @__PURE__ */ new Date()
                }).where(eq3(users.id, user.id));
              }
            } else {
              throw insertError;
            }
          }
        }
      }
    } catch (error) {
      console.error("[Auth] Firebase token verification failed:", error);
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/upload.ts
import { Router } from "express";
import multer from "multer";

// server/storage.ts
import fs2 from "fs";
import path2 from "path";
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  try {
    const uploadsDir = path2.join(process.cwd(), "public", "uploads");
    if (!fs2.existsSync(uploadsDir)) {
      fs2.mkdirSync(uploadsDir, { recursive: true });
    }
    const key = relKey.replace(/^\/+/, "");
    const filePath = path2.join(uploadsDir, key);
    const fileDir = path2.dirname(filePath);
    if (!fs2.existsSync(fileDir)) {
      fs2.mkdirSync(fileDir, { recursive: true });
    }
    fs2.writeFileSync(filePath, data);
    const url = "/uploads/" + key;
    console.log("[Storage] File saved to permanent location:", url);
    return { key, url };
  } catch (error) {
    console.error("[Storage] Error saving file:", error);
    throw error;
  }
}

// server/upload.ts
var router2 = Router();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit for images and audio
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("audio/")) {
      return cb(new Error("Only image and audio files are allowed"));
    }
    cb(null, true);
  }
});
router2.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const timestamp2 = Date.now();
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const isAudio = req.file.mimetype.startsWith("audio/");
    const folder = isAudio ? "audio" : "weddings";
    const prefix = isAudio ? "music" : "custom-background";
    const filename = `${prefix}-${timestamp2}.${ext}`;
    const key = `${folder}/${filename}`;
    const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
    res.json({ url, key, type: req.file.mimetype });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});
var upload_default = router2;

// server/paymentCallback.ts
import { Router as Router2 } from "express";
var paymentCallbackRouter = Router2();
var AI_PACKAGES = {
  start: { edits: 15 },
  pro: { edits: 50 },
  unlimited: { edits: 200 }
};
var AI_TOPUPS = {
  small: { edits: 10 },
  medium: { edits: 30 }
};
paymentCallbackRouter.post("/api/payment/callback", async (req, res) => {
  try {
    const params = req.body;
    console.log("=== FreedomPay Callback START ===");
    console.log("FreedomPay callback received:", JSON.stringify(params, null, 2));
    if (!verifyCallback(params)) {
      console.error("Invalid signature in FreedomPay callback");
      return res.status(400).send("Invalid signature");
    }
    console.log("Signature verified successfully");
    const { pg_order_id, pg_result, pg_payment_id } = params;
    const match = pg_order_id?.match(/^wedding_(\d+)_/);
    if (!match) {
      console.error("Invalid order ID format:", pg_order_id);
      return res.status(400).send("Invalid order ID");
    }
    const weddingId = parseInt(match[1], 10);
    console.log(`Extracted wedding ID: ${weddingId}, pg_result: ${pg_result}`);
    if (pg_result === "1") {
      console.log(`Payment successful for wedding ${weddingId}, payment ID: ${pg_payment_id}`);
      console.log(`Upgrading wedding ${weddingId} to premium...`);
      await upgradeWeddingToPremium(weddingId);
      console.log(`Wedding ${weddingId} upgraded to premium successfully!`);
      console.log("=== FreedomPay Callback END (success) ===");
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>Payment processed successfully</pg_description>
</response>`);
    } else {
      console.log(`Payment failed for wedding ${weddingId}, pg_result: ${pg_result}`);
      console.log("=== FreedomPay Callback END (failed) ===");
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>error</pg_status>
  <pg_description>Payment failed</pg_description>
</response>`);
    }
  } catch (error) {
    console.error("=== FreedomPay Callback ERROR ===", error);
    return res.status(500).send("Internal server error");
  }
});
paymentCallbackRouter.post("/api/payment/ai-callback", async (req, res) => {
  try {
    const params = req.body;
    console.log("FreedomPay AI package callback received:", params);
    if (!verifyCallback(params)) {
      console.error("Invalid signature in FreedomPay AI callback");
      return res.status(400).send("Invalid signature");
    }
    const { pg_order_id, pg_result, pg_payment_id } = params;
    const match = pg_order_id?.match(/^aipackage_(\d+)_(\w+)_/);
    if (!match) {
      console.error("Invalid AI package order ID format:", pg_order_id);
      return res.status(400).send("Invalid order ID");
    }
    const weddingId = parseInt(match[1], 10);
    const packageId = match[2];
    if (pg_result === "1") {
      console.log(`AI package payment successful for wedding ${weddingId}, package: ${packageId}, payment ID: ${pg_payment_id}`);
      const pkg = AI_PACKAGES[packageId];
      if (!pkg) {
        console.error("Unknown AI package:", packageId);
        return res.status(400).send("Unknown package");
      }
      await updateWedding(weddingId, {
        aiPackage: packageId,
        aiEditsLimit: pkg.edits,
        aiPackagePaidAt: /* @__PURE__ */ new Date(),
        isPaid: true
        // Free publication with AI package
      });
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>AI package activated successfully</pg_description>
</response>`);
    } else {
      console.log(`AI package payment failed for wedding ${weddingId}`);
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>error</pg_status>
  <pg_description>Payment failed</pg_description>
</response>`);
    }
  } catch (error) {
    console.error("Error processing FreedomPay AI callback:", error);
    return res.status(500).send("Internal server error");
  }
});
paymentCallbackRouter.post("/api/payment/ai-topup-callback", async (req, res) => {
  try {
    const params = req.body;
    console.log("FreedomPay AI topup callback received:", params);
    if (!verifyCallback(params)) {
      console.error("Invalid signature in FreedomPay AI topup callback");
      return res.status(400).send("Invalid signature");
    }
    const { pg_order_id, pg_result, pg_payment_id } = params;
    const match = pg_order_id?.match(/^aitopup_(\d+)_(\w+)_/);
    if (!match) {
      console.error("Invalid AI topup order ID format:", pg_order_id);
      return res.status(400).send("Invalid order ID");
    }
    const weddingId = parseInt(match[1], 10);
    const topupId = match[2];
    if (pg_result === "1") {
      console.log(`AI topup payment successful for wedding ${weddingId}, topup: ${topupId}, payment ID: ${pg_payment_id}`);
      const topup = AI_TOPUPS[topupId];
      if (!topup) {
        console.error("Unknown AI topup:", topupId);
        return res.status(400).send("Unknown topup");
      }
      const wedding = await getWeddingById(weddingId);
      if (!wedding) {
        console.error("Wedding not found:", weddingId);
        return res.status(400).send("Wedding not found");
      }
      const currentLimit = wedding.aiEditsLimit || 0;
      await updateWedding(weddingId, {
        aiEditsLimit: currentLimit + topup.edits
      });
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>ok</pg_status>
  <pg_description>AI edits added successfully</pg_description>
</response>`);
    } else {
      console.log(`AI topup payment failed for wedding ${weddingId}`);
      return res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <pg_status>error</pg_status>
  <pg_description>Payment failed</pg_description>
</response>`);
    }
  } catch (error) {
    console.error("Error processing FreedomPay AI topup callback:", error);
    return res.status(500).send("Internal server error");
  }
});

// server/_core/vite.ts
import express from "express";
import fs3 from "fs";
import { nanoid } from "nanoid";
import path4 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path3.resolve(import.meta.dirname),
  root: path3.resolve(import.meta.dirname, "client"),
  publicDir: path3.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      },
      "/trpc": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const uploadsPath = path4.join(process.cwd(), "public", "uploads");
  app.use("/uploads", express.static(uploadsPath));
  console.log("[Dev Uploads] Middleware configured for path:", uploadsPath);
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const uploadsPath = path4.join(process.cwd(), "public", "uploads");
  app.use("/uploads", express.static(uploadsPath));
  console.log("[Uploads] Middleware configured for path:", uploadsPath);
  const distPath = process.env.NODE_ENV === "development" ? path4.resolve(import.meta.dirname, "../..", "dist", "public") : path4.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, "0.0.0.0", () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use("/api", upload_default);
  app.use(paymentCallbackRouter);
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const ctx = await createContext({ req, res, info: { isBatchCall: false, calls: [] } });
      const caller = appRouter.createCaller(ctx);
      const { xml } = await caller.sitemap.generate();
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("[Sitemap] Generation failed:", error);
      res.status(500).send("Failed to generate sitemap");
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}
startServer().catch(console.error);
