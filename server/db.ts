import { eq, and, desc, count, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  User,
  weddings, 
  Wedding,
  InsertWedding,
  rsvps,
  Rsvp,
  InsertRsvp,
  wishlistItems,
  WishlistItem,
  InsertWishlistItem,
  wishes,
  Wish,
  InsertWish,
  galleryImages,
  GalleryImage,
  InsertGalleryImage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

// ============= User Functions =============

export async function upsertUser(user: InsertUser): Promise<void> {
  // For Manus Auth users, openId is required
  // For email/password users, email is required
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email || user.openId || 'unknown@example.com', // Fallback for legacy users
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value || undefined;
      values[field] = normalized as any;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPhone(id: number, phone: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ phone }).where(eq(users.id, id));
}

// ============= Wedding Functions =============

export async function createWedding(wedding: InsertWedding): Promise<Wedding> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(weddings).values(wedding);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(weddings).where(eq(weddings.id, insertedId)).limit(1);
  return created[0];
}

export async function getWeddingBySlug(slug: string): Promise<Wedding | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(weddings).where(eq(weddings.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWeddingById(id: number): Promise<Wedding | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(weddings).where(eq(weddings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserWeddings(userId: number): Promise<Wedding[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(weddings).where(eq(weddings.userId, userId)).orderBy(desc(weddings.createdAt));
}

export async function updateWedding(id: number, updates: Partial<InsertWedding>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(weddings).set(updates).where(eq(weddings.id, id));
}

export async function upgradeWeddingToPremium(id: number): Promise<void> {
  console.log(`[DB] upgradeWeddingToPremium called for wedding ID: ${id}`);
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(weddings).set({ isPaid: true }).where(eq(weddings.id, id));
  console.log(`[DB] upgradeWeddingToPremium result:`, result);
  
  // Verify the update
  const updated = await db.select().from(weddings).where(eq(weddings.id, id));
  console.log(`[DB] Wedding ${id} isPaid status after update:`, updated[0]?.isPaid);
}

export async function deleteWedding(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(weddings).where(eq(weddings.id, id));
}

// ============= RSVP Functions =============

export async function createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(rsvps).values(rsvp);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(rsvps).where(eq(rsvps.id, insertedId)).limit(1);
  return created[0];
}

export async function getWeddingRsvps(weddingId: number): Promise<Rsvp[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(rsvps).where(eq(rsvps.weddingId, weddingId)).orderBy(desc(rsvps.createdAt));
}

// ============= Wishlist Functions =============

export async function createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wishlistItems).values(item);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(wishlistItems).where(eq(wishlistItems.id, insertedId)).limit(1);
  return created[0];
}

export async function getWeddingWishlist(weddingId: number): Promise<WishlistItem[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wishlistItems).where(eq(wishlistItems.weddingId, weddingId)).orderBy(wishlistItems.order);
}

export async function reserveWishlistItem(
  id: number, 
  reservedBy: string, 
  reservedEmail: string, 
  reservedPhone: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(wishlistItems).set({
    isReserved: true,
    reservedBy,
    reservedEmail,
    reservedPhone,
  }).where(eq(wishlistItems.id, id));
}

export async function updateWishlistItem(id: number, updates: Partial<InsertWishlistItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(wishlistItems).set(updates).where(eq(wishlistItems.id, id));
}

export async function deleteWishlistItem(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
}

// ============= Wishes Functions =============

export async function createWish(wish: InsertWish): Promise<Wish> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(wishes).values(wish);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(wishes).where(eq(wishes.id, insertedId)).limit(1);
  return created[0];
}

export async function getWeddingWishes(weddingId: number, approvedOnly: boolean = false): Promise<Wish[]> {
  const db = await getDb();
  if (!db) return [];

  if (approvedOnly) {
    return db.select().from(wishes)
      .where(and(eq(wishes.weddingId, weddingId), eq(wishes.isApproved, true)))
      .orderBy(desc(wishes.createdAt));
  }

  return db.select().from(wishes).where(eq(wishes.weddingId, weddingId)).orderBy(desc(wishes.createdAt));
}

export async function approveWish(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(wishes).set({ isApproved: true }).where(eq(wishes.id, id));
}

export async function rejectWish(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(wishes).where(eq(wishes.id, id));
}

// ============= Gallery Functions =============

export async function createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(galleryImages).values(image);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(galleryImages).where(eq(galleryImages.id, insertedId)).limit(1);
  return created[0];
}

export async function getWeddingGallery(weddingId: number): Promise<GalleryImage[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(galleryImages).where(eq(galleryImages.weddingId, weddingId)).orderBy(galleryImages.order);
}

export async function deleteGalleryImage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(galleryImages).where(eq(galleryImages.id, id));
}

// ============= Promo Functions =============

/**
 * Get count of paid invitations for launch promo
 * Promo price applies to first 100 paid invitations
 */
export async function getPaidInvitationsCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: count() })
    .from(weddings)
    .where(eq(weddings.isPaid, true));
  
  return result[0]?.count || 0;
}

/**
 * Check if launch promo is still available
 * Returns true if less than 100 invitations have been paid
 */
export async function isLaunchPromoAvailable(): Promise<boolean> {
  const paidCount = await getPaidInvitationsCount();
  return paidCount < 100;
}

/**
 * Get current price based on promo availability
 * Returns 990 if promo is active, 4990 otherwise
 */
export async function getCurrentPrice(): Promise<{ price: number; isPromo: boolean; paidCount: number; promoLimit: number; remainingPromoSlots: number }> {
  const paidCount = await getPaidInvitationsCount();
  const promoLimit = 100;
  const isPromo = paidCount < promoLimit;
  const remainingPromoSlots = Math.max(0, promoLimit - paidCount);
  return {
    price: isPromo ? 990 : 4990,
    isPromo,
    paidCount,
    promoLimit,
    remainingPromoSlots,
  };
}

// ============= Admin Functions =============

export interface AdminUsersFilter {
  search?: string; // email or phone
  limit?: number;
  offset?: number;
}

export interface AdminInvitationsFilter {
  search?: string; // email or title
  eventType?: string;
  isAI?: boolean;
  isPaid?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Get all users for admin panel
 */
export async function getAllUsers(filters: AdminUsersFilter = {}): Promise<{ users: User[]; total: number }> {
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
    ) as typeof query;
  }

  const allUsers = await query
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: count() })
    .from(users);
  
  const total = countResult[0]?.count || 0;

  return { users: allUsers, total };
}

/**
 * Get all invitations for admin panel with owner info
 */
export async function getAllInvitations(filters: AdminInvitationsFilter = {}): Promise<{ 
  invitations: (Wedding & { ownerEmail: string | null })[]; 
  total: number 
}> {
  const db = await getDb();
  if (!db) return { invitations: [], total: 0 };

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  // Build conditions array
  const conditions = [];
  
  if (filters.eventType) {
    conditions.push(eq(weddings.eventType, filters.eventType));
  }
  if (filters.isAI !== undefined) {
    conditions.push(eq(weddings.isAI, filters.isAI));
  }
  if (filters.isPaid !== undefined) {
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

  // Get invitations with join to users
  const query = db
    .select({
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
      ownerEmail: users.email,
    })
    .from(weddings)
    .leftJoin(users, eq(weddings.userId, users.id));

  let finalQuery = conditions.length > 0 
    ? query.where(and(...conditions))
    : query;

  const invitations = await finalQuery
    .orderBy(desc(weddings.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  let countQuery = db.select({ count: count() }).from(weddings);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
  }
  const countResult = await countQuery;
  const total = countResult[0]?.count || 0;

  return { 
    invitations: invitations as (Wedding & { ownerEmail: string | null })[],
    total 
  };
}

/**
 * Get admin stats
 */
export async function getAdminStats(): Promise<{
  totalUsers: number;
  totalInvitations: number;
  paidInvitations: number;
  aiInvitations: number;
}> {
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
    aiInvitations: aiCount?.count || 0,
  };
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  return user?.role === 'admin';
}

