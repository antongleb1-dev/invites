import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { sitemapRouter } from "./sitemapRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { createPayment } from "./freedompay";
  import { processMessage, getAvailableProviders, getDefaultProvider, getWelcomeMessage, type AIProvider } from "./ai/providers";

// Helper to get client IP from request
function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || '';
}

// Check if IP is from Russia using server-side geolocation
async function checkIfRussianIP(ip: string): Promise<{ isRussia: boolean; country: string | null }> {
  // Skip for local IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { isRussia: false, country: 'Local' };
  }

  // Try multiple geolocation APIs
  const apis = [
    {
      url: `http://ip-api.com/json/${ip}?fields=status,country,countryCode`,
      parse: (data: any) => data.status === 'success' ? { country: data.country, code: data.countryCode } : null
    },
    {
      url: `https://ipwho.is/${ip}`,
      parse: (data: any) => data.success ? { country: data.country, code: data.country_code } : null
    },
  ];

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        const result = api.parse(data);
        if (result) {
          console.log(`[GeoIP] ${ip} -> ${result.code} (${result.country})`);
          return { isRussia: result.code === 'RU', country: result.country };
        }
      }
    } catch (e) {
      // Try next API
    }
  }

  console.log(`[GeoIP] Failed to detect location for ${ip}`);
  return { isRussia: false, country: null };
}

export const appRouter = router({
  system: systemRouter,
  sitemap: sitemapRouter,

  // Geo location check
  geo: router({
    check: publicProcedure.query(async ({ ctx }) => {
      const ip = getClientIP(ctx.req);
      const result = await checkIfRussianIP(ip);
      return {
        ip: ip.substring(0, 10) + '***', // Partially mask IP for privacy
        isRussia: result.isRussia,
        country: result.country,
      };
    }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User profile management
  user: router({
    // Update user phone number
    updatePhone: protectedProcedure
      .input(z.object({
        phone: z.string().min(10).max(20),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPhone(ctx.user.id, input.phone);
        return { success: true };
      }),
    
    // Get current user profile
    profile: protectedProcedure
      .query(async ({ ctx }) => {
        return {
          id: ctx.user.id,
          email: ctx.user.email,
          name: ctx.user.name,
          phone: ctx.user.phone,
        };
      }),
  }),

  wedding: router({
    // Create a new event/invitation (protected)
    create: protectedProcedure
      .input(z.object({
        slug: z.string().min(1).max(100).regex(/^[a-z0-9\-]+$/, 'Ссылка может содержать только английские буквы (a-z), цифры (0-9) и дефисы (-). Пример: moya-svadba-2025'),
        title: z.string().min(1).max(200),
        titleKz: z.string().max(200).optional(),
        date: z.date(),
        location: z.string().min(1).max(300),
        locationKz: z.string().max(300).optional(),
        mapUrl: z.string().optional(),
        description: z.string().optional(),
        descriptionKz: z.string().optional(),
        backgroundImage: z.string().optional(),
        eventType: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'sundettoi', 'tusaukeser', 'kyz_uzatu', 'betashar', 'other']).default('wedding'),
        languageMode: z.enum(['ru', 'kz', 'both']).default('both'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if slug is already taken
        const existing = await db.getWeddingBySlug(input.slug);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Этот URL уже занят. Пожалуйста, выберите другой.',
          });
        }

        return db.createWedding({
          ...input,
          userId: ctx.user.id,
        });
      }),

    // Get event by ID (protected, owner only)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.id);
        if (!wedding) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Приглашение не найдено',
          });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }
        return wedding;
      }),

    // Get event by slug (public)
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const wedding = await db.getWeddingBySlug(input.slug);
        if (!wedding) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Приглашение не найдено',
          });
        }
        return wedding;
      }),

    // Get user's weddings (protected)
    myWeddings: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserWeddings(ctx.user.id);
      }),

    // Update event (protected, owner only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9\-]+$/, 'Slug должен содержать только латинские буквы, цифры и дефисы').optional(),
        title: z.string().min(1).max(200).optional(),
        titleKz: z.string().max(200).optional(),
        date: z.date().optional(),
        location: z.string().min(1).max(300).optional(),
        locationKz: z.string().max(300).optional(),
        description: z.string().optional(),
        descriptionKz: z.string().optional(),
        backgroundImage: z.string().optional(),
        customBackgroundUrl: z.string().nullable().optional(),
        photoShape: z.enum(["square", "circle", "heart", "hexagon", "diamond", "arch", "frame", "oval", "soft-arch", "petal", "ornate", "vintage"]).optional(),
        customFont: z.string().optional(),
        customColor: z.string().optional(),
        textColor: z.string().optional(),
        themeColor: z.string().optional(),
        buttonColor: z.string().optional(),
        buttonTextColor: z.string().optional(),
        templateId: z.string().optional(),
        musicUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        loveStory: z.string().optional(),
        loveStoryKz: z.string().optional(),
        // Premium constructor blocks
        timelineData: z.string().optional().nullable(),
        menuData: z.string().optional().nullable(),
        dressCode: z.string().optional().nullable(),
        dressCodeKz: z.string().optional().nullable(),
        coordinatorName: z.string().optional().nullable(),
        coordinatorPhone: z.string().optional().nullable(),
        coordinatorEmail: z.string().optional().nullable(),
        qrCodeData: z.string().optional().nullable(),
        // Block visibility toggles
        showTimeline: z.boolean().optional(),
        showMenu: z.boolean().optional(),
        showDressCode: z.boolean().optional(),
        showQrCode: z.boolean().optional(),
        showCoordinator: z.boolean().optional(),
        showLocationDetails: z.boolean().optional(),
        // Main blocks visibility
        showRsvp: z.boolean().optional(),
        showWishlist: z.boolean().optional(),
        showWishes: z.boolean().optional(),
        // Event options/policies
        childrenPolicy: z.enum(['neutral', 'allowed', 'not_allowed']).optional(),
        alcoholPolicy: z.enum(['neutral', 'allowed', 'not_allowed']).optional(),
        photoPolicy: z.enum(['neutral', 'allowed', 'not_allowed']).optional(),
        // Countdown timer
        showCountdown: z.boolean().optional(),
        // Block order
        blockOrder: z.string().optional().nullable(),
        locationDetails: z.string().optional().nullable(),
        locationDetailsKz: z.string().optional().nullable(),
        mapUrl: z.string().optional().nullable(),
        showHeart: z.boolean().optional(),
        headerIcon: z.enum(['none', 'heart', 'crescent', 'star', 'sparkle', 'party']).optional(),
        eventType: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'sundettoi', 'tusaukeser', 'kyz_uzatu', 'betashar', 'other']).optional(),
        languageMode: z.enum(['ru', 'kz', 'both']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const wedding = await db.getWeddingById(id);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        // Check slug uniqueness if changing
        if (updates.slug && updates.slug !== wedding.slug) {
          const existing = await db.getWeddingBySlug(updates.slug);
          if (existing) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Этот URL уже занят',
            });
          }
        }

        await db.updateWedding(id, updates);
        return { success: true };
      }),

    // Delete wedding (protected, owner only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.id);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        await db.deleteWedding(input.id);
        return { success: true };
      }),

    // Upgrade to premium (protected, owner only)
    upgrade: protectedProcedure
      .input(z.object({ weddingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        if (wedding.isPaid) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Уже Premium' });
        }

        await db.updateWedding(input.weddingId, { isPaid: true });
        return { success: true };
      }),
  }),

  rsvp: router({
    // Submit RSVP (public)
    submit: publicProcedure
      .input(z.object({
        weddingId: z.number(),
        name: z.string().min(1).max(200),
        email: z.string().email().optional(),
        phone: z.string().max(50).optional(),
        attending: z.enum(['yes', 'no', 'yes_plus_one', 'yes_with_spouse']),
        guestCount: z.number().min(1).default(1),
        dietaryRestrictions: z.string().optional(),
        needsParking: z.boolean().default(false),
        needsTransfer: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return db.createRsvp(input);
      }),

    // Get RSVPs for wedding (protected, owner only)
    list: protectedProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        return db.getWeddingRsvps(input.weddingId);
      }),
  }),

  wishlist: router({
    // Get wishlist (public)
    list: publicProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ input }) => {
        return db.getWeddingWishlist(input.weddingId);
      }),

    // Add wishlist item (protected, owner only)
    add: protectedProcedure
      .input(z.object({
        weddingId: z.number(),
        name: z.string().min(1).max(200),
        nameKz: z.string().max(200).optional(),
        description: z.string().optional(),
        descriptionKz: z.string().optional(),
        link: z.string().url(),
        order: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        return db.createWishlistItem(input);
      }),

    // Reserve wishlist item (public)
    reserve: publicProcedure
      .input(z.object({
        id: z.number(),
        reservedBy: z.string().min(1).max(200),
        reservedEmail: z.string().email(),
        reservedPhone: z.string().max(50).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, reservedBy, reservedEmail, reservedPhone } = input;
        await db.reserveWishlistItem(id, reservedBy, reservedEmail, reservedPhone || '');
        return { success: true };
      }),

    // Update wishlist item (protected, owner only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        weddingId: z.number(),
        name: z.string().min(1).max(200).optional(),
        nameKz: z.string().max(200).optional(),
        description: z.string().optional(),
        descriptionKz: z.string().optional(),
        link: z.string().url().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, weddingId, ...updates } = input;
        const wedding = await db.getWeddingById(weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        await db.updateWishlistItem(id, updates);
        return { success: true };
      }),

    // Delete wishlist item (protected, owner only)
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        weddingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        await db.deleteWishlistItem(input.id);
        return { success: true };
      }),
  }),

  wish: router({
    // Submit wish (public)
    submit: publicProcedure
      .input(z.object({
        weddingId: z.number(),
        guestName: z.string().min(1).max(200),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return db.createWish(input);
      }),

    // Get approved wishes (public)
    listApproved: publicProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ input }) => {
        return db.getWeddingWishes(input.weddingId, true);
      }),

    // Get all wishes (protected, owner only)
    listAll: protectedProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        return db.getWeddingWishes(input.weddingId, false);
      }),

    // Approve wish (protected, owner only)
    approve: protectedProcedure
      .input(z.object({
        id: z.number(),
        weddingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        await db.approveWish(input.id);
        return { success: true };
      }),

    // Reject wish (protected, owner only)
    reject: protectedProcedure
      .input(z.object({
        id: z.number(),
        weddingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        await db.rejectWish(input.id);
        return { success: true };
      }),
  }),

  gallery: router({
    // Get gallery (public)
    list: publicProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ input }) => {
        return db.getWeddingGallery(input.weddingId);
      }),

    // Add gallery image (protected, owner only)
    add: protectedProcedure
      .input(z.object({
        weddingId: z.number(),
        imageUrl: z.string(),
        caption: z.string().optional(),
        captionKz: z.string().optional(),
        order: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        // Gallery is available for all users (payment only required for publication)
        return db.createGalleryImage(input);
      }),

    // Delete gallery image (protected, owner only)
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        weddingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        await db.deleteGalleryImage(input.id);
        return { success: true };
      }),
  }),

  payment: router({
    // Create payment for premium upgrade
    createPremiumPayment: protectedProcedure
      .input(z.object({
        weddingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        if (wedding.isPaid) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'У этой свадьбы уже есть Premium' });
        }

        // Create unique order ID
        const orderId = `wedding_${input.weddingId}_${Date.now()}`;
        
        // Get base URL - use production domain for FreedomPay
        // FreedomPay doesn't accept dev domains like 3000-xxx.manusvm.computer
        const host = ctx.req.headers.host || 'localhost:3000';
        const isDevDomain = host.includes('manusvm.computer') || host.includes('localhost');
        const baseUrl = isDevDomain 
          ? 'https://bookme-kz-epbqejiu.manus.space' 
          : `https://${host}`;

        try {
          // Get current price (promo or regular)
          const priceInfo = await db.getCurrentPrice();
          
          const redirectUrl = await createPayment({
            orderId,
            amount: priceInfo.price, // Dynamic price: 990 for promo, 4990 regular
            description: `Premium для приглашения: ${wedding.title}`,
            successUrl: `${baseUrl}/payment/success?weddingId=${input.weddingId}`,
            failureUrl: `${baseUrl}/payment/failure?weddingId=${input.weddingId}`,
            resultUrl: `${baseUrl}/api/payment/callback`,
          });

          return { redirectUrl };
        } catch (error) {
          console.error('FreedomPay error:', error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Ошибка при создании платежа' 
          });
        }
      }),

    // Get current pricing info (for UI)
    getPricingInfo: publicProcedure
      .query(async () => {
        return db.getCurrentPrice();
      }),

    // Free activation for AI package owners
    activateFreeWithAIPackage: protectedProcedure
      .input(z.object({
        weddingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        if (wedding.isPaid) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Приглашение уже опубликовано' });
        }

        // Check if user has AI package for this invitation
        const hasAIPackage = !!(wedding as any).aiPackage;
        
        if (!hasAIPackage) {
          throw new TRPCError({ 
            code: 'PRECONDITION_FAILED', 
            message: 'Для бесплатной публикации необходим AI-пакет' 
          });
        }

        // Activate publication for free
        await db.upgradeWeddingToPremium(input.weddingId);
        
        return { success: true };
      }),
  }),

  // AI invitation generator (Full HTML mode)
  ai: router({
    // Get available AI providers
    getProviders: publicProcedure
      .query(() => {
        const available = getAvailableProviders();
        const defaultProvider = getDefaultProvider();
        return {
          available,
          defaultProvider,
          welcomeMessage: getWelcomeMessage(),
        };
      }),

    // Process chat message - requires authorization (tokens cost money)
    chat: protectedProcedure
      .input(z.object({
        provider: z.enum(['claude', 'openai']),
        messages: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })),
        currentHtml: z.string().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const available = getAvailableProviders();
        
        if (input.provider === 'claude' && !available.claude) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Claude не настроен. Добавьте ANTHROPIC_API_KEY.',
          });
        }
        
        if (input.provider === 'openai' && !available.openai) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'OpenAI не настроен. Добавьте OPENAI_API_KEY.',
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
          console.error('[AI Chat] Error:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Ошибка AI',
          });
        }
      }),

    // Save AI-generated HTML invitation
    saveHtml: protectedProcedure
      .input(z.object({
        html: z.string().min(100),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9\-]+$/, 'Ссылка может содержать только английские буквы (a-z), цифры (0-9) и дефисы (-). Пример: moya-svadba-2025'),
        title: z.string().min(1).max(200),
        chatHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if slug is already taken
        const existing = await db.getWeddingBySlug(input.slug);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Этот URL уже занят. Пожалуйста, выберите другой.',
          });
        }

        // Create AI invitation record with proper fields
        const wedding = await db.createWedding({
          userId: ctx.user.id,
          slug: input.slug,
          eventType: 'other',
          languageMode: 'both',
          title: input.title,
          date: new Date(),
          location: '',
          description: 'Приглашение создано с помощью AI',
          isAI: true,
          aiGeneratedHtml: input.html,
          aiChatHistory: input.chatHistory ? JSON.stringify(input.chatHistory) : null,
        });

        return wedding;
      }),

    // Update existing AI invitation
    updateHtml: protectedProcedure
      .input(z.object({
        id: z.number(),
        html: z.string().min(100),
        title: z.string().min(1).max(200).optional(),
        slug: z.string().min(1).max(100).optional(),
        chatHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.id);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        // Check if new slug is taken by another wedding
        if (input.slug && input.slug !== wedding.slug) {
          const existing = await db.getWeddingBySlug(input.slug);
          if (existing && existing.id !== input.id) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Этот URL уже занят. Пожалуйста, выберите другой.',
            });
          }
        }

        const updates: any = {
          aiGeneratedHtml: input.html,
          aiChatHistory: input.chatHistory ? JSON.stringify(input.chatHistory) : wedding.aiChatHistory,
        };
        
        if (input.title) {
          updates.title = input.title;
        }
        if (input.slug) {
          updates.slug = input.slug;
        }

        await db.updateWedding(input.id, updates);

        return { success: true, slug: input.slug || wedding.slug };
      }),

    // Get AI invitation for editing
    getForEdit: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.id);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }
        if (!wedding.isAI) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Это не AI-приглашение' });
        }

        return {
          id: wedding.id,
          slug: wedding.slug,
          title: wedding.title,
          html: wedding.aiGeneratedHtml,
          chatHistory: wedding.aiChatHistory ? JSON.parse(wedding.aiChatHistory) : [],
        };
      }),

    // Submit form from AI invitation (public - guests can submit)
    submitForm: publicProcedure
      .input(z.object({
        slug: z.string(),
        formType: z.enum(['rsvp', 'wish', 'wishlist']),
        data: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input }) => {
        console.log('[AI Form] Received submission:', JSON.stringify(input, null, 2));
        
        // Find wedding by slug
        const wedding = await db.getWeddingBySlug(input.slug);
        if (!wedding) {
          console.log('[AI Form] Wedding not found for slug:', input.slug);
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }

        console.log('[AI Form] Found wedding:', wedding.id, wedding.title);
        const weddingId = wedding.id;

        // Helper to find value from multiple possible keys
        const findValue = (keys: string[], defaultVal = '') => {
          for (const key of keys) {
            // Check exact key
            if (input.data[key] !== undefined && input.data[key] !== '') {
              return String(input.data[key]);
            }
            // Check lowercase
            const lowerKey = key.toLowerCase();
            for (const dataKey of Object.keys(input.data)) {
              if (dataKey.toLowerCase() === lowerKey || dataKey.toLowerCase().includes(lowerKey)) {
                if (input.data[dataKey] !== undefined && input.data[dataKey] !== '') {
                  return String(input.data[dataKey]);
                }
              }
            }
          }
          return defaultVal;
        };

        switch (input.formType) {
          case 'rsvp': {
            // Extract data with various possible field names
            const name = findValue(['name', 'guestName', 'имя', 'guest_name', 'fullname', 'фио'], 'Гость');
            const phone = findValue(['phone', 'телефон', 'tel', 'mobile', 'номер']);
            const email = findValue(['email', 'почта', 'mail', 'e-mail']);
            const guestCountStr = findValue(['guestCount', 'guests', 'количество', 'guest_count', 'people', 'человек', 'persons'], '1');
            const guestCount = parseInt(guestCountStr) || 1;
            const dietary = findValue(['dietary', 'dietaryRestrictions', 'диета', 'food', 'еда', 'аллергия']);
            
            // Map attending values - only valid enum values
            let attending: 'yes' | 'no' | 'yes_plus_one' | 'yes_with_spouse' = 'yes';
            const attendingValue = findValue(['attending', 'участие', 'presence', 'приду', 'response', 'ответ'], 'yes').toLowerCase();
            if (attendingValue === 'no' || attendingValue === 'нет' || attendingValue.includes('не приду') || attendingValue.includes('не смогу')) {
              attending = 'no';
            } else if (attendingValue === 'yes_plus_one' || guestCount > 1) {
              attending = 'yes_plus_one';
            } else if (attendingValue === 'yes_with_spouse') {
              attending = 'yes_with_spouse';
            }
            
            console.log('[AI Form] Creating RSVP:', { name, phone, email, attending, guestCount, rawData: input.data });
            try {
              await db.createRsvp({
                weddingId,
                name,
                email: email || null,
                phone: phone || null,
                attending,
                guestCount,
                dietaryRestrictions: dietary || null,
              });
              console.log('[AI Form] RSVP created successfully');
              return { success: true, message: 'Ваш ответ записан!' };
            } catch (dbError: any) {
              console.error('[AI Form] Database error creating RSVP:', dbError);
              throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Ошибка сохранения. Попробуйте ещё раз.' 
              });
            }
          }

          case 'wish': {
            const wishName = findValue(['name', 'имя', 'guestName', 'author', 'автор', 'от'], 'Гость');
            const wishMessage = findValue(['message', 'пожелание', 'text', 'текст', 'wish', 'comment', 'комментарий', 'поздравление']);
            console.log('[AI Form] Creating wish:', { name: wishName, message: wishMessage?.substring(0, 50), rawData: input.data });
            if (!wishMessage) {
              throw new TRPCError({ code: 'BAD_REQUEST', message: 'Пожелание не может быть пустым' });
            }
            try {
              await db.createWish({
                weddingId,
                guestName: wishName,
                message: wishMessage,
                isApproved: false, // Owner needs to approve
              });
              console.log('[AI Form] Wish created successfully');
              return { success: true, message: 'Пожелание отправлено!' };
            } catch (dbError: any) {
              console.error('[AI Form] Database error creating wish:', dbError);
              throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Ошибка сохранения. Попробуйте ещё раз.' 
              });
            }
          }

          case 'wishlist': {
            const itemId = findValue(['itemId', 'item_id', 'giftId', 'gift_id', 'id']);
            const giftName = findValue(['giftName', 'gift_name', 'подарок', 'название', 'gift', 'item']);
            const reserverName = findValue(['name', 'имя', 'reservedBy', 'гость'], 'Гость');
            const reserverEmail = findValue(['email', 'почта'], '');
            const reserverPhone = findValue(['phone', 'телефон'], '');
            
            console.log('[AI Form] Reserving wishlist item:', { itemId, giftName, name: reserverName, rawData: input.data });
            
            try {
              if (itemId && !isNaN(parseInt(itemId))) {
                // If we have a valid numeric ID, use existing logic
                await db.reserveWishlistItem(
                  parseInt(itemId),
                  reserverName,
                  reserverEmail,
                  reserverPhone
                );
              } else if (giftName) {
                // For AI forms without real IDs, create or find item by name
                const existingItems = await db.getWeddingWishlist(weddingId);
                let item = existingItems.find(i => i.name.toLowerCase() === giftName.toLowerCase());
                
                if (!item) {
                  // Create new wishlist item
                  item = await db.createWishlistItem({
                    weddingId,
                    name: giftName,
                    link: '',
                    order: existingItems.length,
                  });
                }
                
                // Reserve it
                await db.reserveWishlistItem(item.id, reserverName, reserverEmail, reserverPhone);
              } else {
                // No valid identifier
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Не указан подарок' });
              }
              
              return { success: true, message: 'Подарок зарезервирован!' };
            } catch (dbError: any) {
              console.error('[AI Form] Database error reserving wishlist:', dbError);
              if (dbError instanceof TRPCError) throw dbError;
              throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Ошибка сохранения. Попробуйте ещё раз.' 
              });
            }
          }

          default:
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Неизвестный тип формы' });
        }
      }),

    // Analyze AI HTML to detect which blocks exist + check if data exists
    detectBlocks: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const wedding = await db.getWeddingBySlug(input.slug);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }

        // Default blocks for non-AI invitations
        if (!(wedding as any).isAI || !(wedding as any).aiGeneratedHtml) {
          return {
            hasRsvp: true,
            hasWishes: true,
            hasWishlist: true,
            hasTimeline: true,
            hasGallery: true,
            hasDressCode: true,
            hasMap: true,
          };
        }

        // Also check if there's any data in database for this wedding
        const [rsvpCount, wishCount, wishlistCount] = await Promise.all([
          db.getWeddingRsvps(wedding.id).then(r => r.length),
          db.getWeddingWishes(wedding.id).then(w => w.length),
          db.getWeddingWishlist(wedding.id).then(w => w.length),
        ]);

        const html = ((wedding as any).aiGeneratedHtml || '').toLowerCase();
        
        // Detect RSVP block - show if form exists OR data exists
        const hasRsvpForm = html.includes('rsvp') || 
                       html.includes('подтвердить') || 
                       html.includes('приду') ||
                       html.includes('участие') ||
                       html.includes('attending') ||
                       (html.includes('form') && (html.includes('гост') || html.includes('guest')));
        const hasRsvp = hasRsvpForm || rsvpCount > 0;

        // Detect Wishes block - show if form exists OR data exists
        const hasWishesForm = html.includes('пожелани') || 
                         html.includes('поздравлени') ||
                         html.includes('wish') ||
                         (html.includes('message') && html.includes('form'));
        const hasWishes = hasWishesForm || wishCount > 0;

        // Detect Wishlist block - show if form exists OR data exists
        const hasWishlistForm = html.includes('wishlist') || 
                           html.includes('подарк') ||
                           html.includes('gift') ||
                           html.includes('зарезервировать');
        const hasWishlist = hasWishlistForm || wishlistCount > 0;

        // Detect Timeline
        const hasTimeline = html.includes('timeline') || 
                           html.includes('программа') ||
                           html.includes('расписание') ||
                           html.includes('schedule');

        // Detect Gallery
        const hasGallery = html.includes('gallery') || 
                          html.includes('галерея') ||
                          html.includes('фото') ||
                          html.includes('photo');

        // Detect Dress Code
        const hasDressCode = html.includes('dress') || 
                            html.includes('дресс') ||
                            html.includes('код') && html.includes('одежд');

        // Detect Map
        const hasMap = html.includes('map') || 
                      html.includes('карта') ||
                      html.includes('location') ||
                      html.includes('локация') ||
                      html.includes('адрес');

        return {
          hasRsvp,
          hasWishes,
          hasWishlist,
          hasTimeline,
          hasGallery,
          hasDressCode,
          hasMap,
        };
      }),

    // Get AI package status for an invitation
    getPackageStatus: protectedProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        return {
          hasPackage: !!(wedding as any).aiPackage,
          package: (wedding as any).aiPackage || null,
          editsLimit: (wedding as any).aiEditsLimit || 0,
          editsUsed: (wedding as any).aiEditsUsed || 0,
          editsRemaining: Math.max(0, ((wedding as any).aiEditsLimit || 0) - ((wedding as any).aiEditsUsed || 0)),
        };
      }),

    // Check if user can make an AI edit (has remaining edits)
    canEdit: protectedProcedure
      .input(z.object({ weddingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        const hasPackage = !!(wedding as any).aiPackage;
        const editsRemaining = ((wedding as any).aiEditsLimit || 0) - ((wedding as any).aiEditsUsed || 0);
        
        return {
          canEdit: hasPackage && editsRemaining > 0,
          hasPackage,
          editsRemaining: Math.max(0, editsRemaining),
          reason: !hasPackage ? 'no_package' : editsRemaining <= 0 ? 'limit_reached' : null,
        };
      }),

    // Increment AI edit counter (called after successful chat message)
    incrementEditCount: protectedProcedure
      .input(z.object({ weddingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        const newCount = ((wedding as any).aiEditsUsed || 0) + 1;
        await db.updateWedding(input.weddingId, { aiEditsUsed: newCount } as any);
        
        return {
          editsUsed: newCount,
          editsRemaining: Math.max(0, ((wedding as any).aiEditsLimit || 0) - newCount),
        };
      }),

    // Purchase AI package
    purchasePackage: protectedProcedure
      .input(z.object({
        weddingId: z.number(),
        packageId: z.enum(['start', 'pro', 'unlimited']),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        const packages: Record<string, { edits: number; price: number }> = {
          start: { edits: 15, price: 1990 },
          pro: { edits: 50, price: 3990 },
          unlimited: { edits: 200, price: 6990 },
        };

        const pkg = packages[input.packageId];
        if (!pkg) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Неизвестный пакет' });
        }

        // Create payment via FreedomPay
        const baseUrl = process.env.BASE_URL || 'https://bookme.kz';
        const orderId = `aipackage_${input.weddingId}_${input.packageId}_${Date.now()}`;

        try {
          const redirectUrl = await createPayment({
            orderId,
            amount: pkg.price,
            description: `AI пакет ${input.packageId.toUpperCase()} для приглашения`,
            successUrl: `${baseUrl}/payment/ai-success?weddingId=${input.weddingId}&package=${input.packageId}`,
            failureUrl: `${baseUrl}/payment/ai-failure?weddingId=${input.weddingId}`,
            resultUrl: `${baseUrl}/api/payment/ai-callback`,
          });

          return { redirectUrl };
        } catch (error) {
          console.error('FreedomPay AI package error:', error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Ошибка при создании платежа' 
          });
        }
      }),

    // Purchase additional AI edits (topup)
    purchaseTopup: protectedProcedure
      .input(z.object({
        weddingId: z.number(),
        topupId: z.enum(['small', 'medium']),
      }))
      .mutation(async ({ ctx, input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }
        if (wedding.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Нет доступа' });
        }

        // Must have an existing package to topup
        if (!(wedding as any).aiPackage) {
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Сначала приобретите AI пакет' });
        }

        const topups: Record<string, { edits: number; price: number }> = {
          small: { edits: 10, price: 990 },
          medium: { edits: 30, price: 1990 },
        };

        const topup = topups[input.topupId];
        if (!topup) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Неизвестный топап' });
        }

        // Create payment via FreedomPay
        const baseUrl = process.env.BASE_URL || 'https://bookme.kz';
        const orderId = `aitopup_${input.weddingId}_${input.topupId}_${Date.now()}`;

        try {
          const redirectUrl = await createPayment({
            orderId,
            amount: topup.price,
            description: `+${topup.edits} AI-правок для приглашения`,
            successUrl: `${baseUrl}/payment/ai-topup-success?weddingId=${input.weddingId}&topup=${input.topupId}`,
            failureUrl: `${baseUrl}/payment/ai-failure?weddingId=${input.weddingId}`,
            resultUrl: `${baseUrl}/api/payment/ai-topup-callback`,
          });

          return { redirectUrl };
        } catch (error) {
          console.error('FreedomPay AI topup error:', error);
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Ошибка при создании платежа' 
          });
        }
      }),

    // Activate AI package after successful payment (called from payment callback)
    activatePackage: publicProcedure
      .input(z.object({
        weddingId: z.number(),
        packageId: z.enum(['start', 'pro', 'unlimited']),
        orderId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }

        const packages: Record<string, { edits: number }> = {
          start: { edits: 15 },
          pro: { edits: 50 },
          unlimited: { edits: 200 },
        };

        const pkg = packages[input.packageId];
        if (!pkg) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Неизвестный пакет' });
        }

        await db.updateWedding(input.weddingId, {
          aiPackage: input.packageId,
          aiEditsLimit: pkg.edits,
          aiPackagePaidAt: new Date(),
          isPaid: true, // Free publication with AI package
        } as any);

        return { success: true };
      }),

    // Add edits after topup payment (called from payment callback)
    addTopupEdits: publicProcedure
      .input(z.object({
        weddingId: z.number(),
        topupId: z.enum(['small', 'medium']),
        orderId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const wedding = await db.getWeddingById(input.weddingId);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }

        const topups: Record<string, { edits: number }> = {
          small: { edits: 10 },
          medium: { edits: 30 },
        };

        const topup = topups[input.topupId];
        if (!topup) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Неизвестный топап' });
        }

        const currentLimit = (wedding as any).aiEditsLimit || 0;
        await db.updateWedding(input.weddingId, {
          aiEditsLimit: currentLimit + topup.edits,
        } as any);

        return { success: true, newLimit: currentLimit + topup.edits };
      }),
  }),

  // Admin Panel API
  admin: router({
    // Check if current user is admin
    isAdmin: protectedProcedure
      .query(async ({ ctx }) => {
        return db.isUserAdmin(ctx.user.id);
      }),

    // Get admin stats
    stats: protectedProcedure
      .query(async ({ ctx }) => {
        const isAdmin = await db.isUserAdmin(ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещён' });
        }
        return db.getAdminStats();
      }),

    // Get all users with filters
    users: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const isAdmin = await db.isUserAdmin(ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещён' });
        }
        return db.getAllUsers(input || {});
      }),

    // Get all invitations with filters
    invitations: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        eventType: z.string().optional(),
        isAI: z.boolean().optional(),
        isPaid: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const isAdmin = await db.isUserAdmin(ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещён' });
        }
        return db.getAllInvitations(input || {});
      }),

    // Get invitation details (for admin view)
    getInvitation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const isAdmin = await db.isUserAdmin(ctx.user.id);
        if (!isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Доступ запрещён' });
        }
        
        const wedding = await db.getWeddingById(input.id);
        if (!wedding) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Приглашение не найдено' });
        }

        // Get additional data
        const rsvps = await db.getWeddingRsvps(input.id);
        const wishlist = await db.getWeddingWishlist(input.id);
        const wishes = await db.getWeddingWishes(input.id, false);

        return {
          ...wedding,
          rsvps,
          wishlist,
          wishes,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

