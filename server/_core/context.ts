import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyFirebaseToken } from "../firebase-admin";
import { getDb } from "../db";
import { eq, or } from "drizzle-orm";
import { users } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try Firebase ID token first
  const authHeader = opts.req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await verifyFirebaseToken(idToken);
      const db = await getDb();
      
      if (db) {
        // Find or create user in database
        // Check by firebaseUid first, then by email
        let existingUsers = await db.select().from(users).where(eq(users.firebaseUid, decodedToken.uid)).limit(1);
        
        // If not found by firebaseUid, try to find by email and update with firebaseUid
        if (existingUsers.length === 0 && decodedToken.email) {
          existingUsers = await db.select().from(users).where(eq(users.email, decodedToken.email)).limit(1);
          
          if (existingUsers.length > 0) {
            // Update existing user with firebaseUid
            await db.update(users).set({ 
              firebaseUid: decodedToken.uid,
              loginMethod: 'firebase',
              lastSignedIn: new Date()
            }).where(eq(users.id, existingUsers[0].id));
          }
        }
        
        if (existingUsers.length > 0) {
          user = existingUsers[0];
          // Update last signed in
          await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
        } else {
          // Create new user with duplicate protection
          try {
            const result = await db.insert(users).values({
              firebaseUid: decodedToken.uid,
              email: decodedToken.email || `${decodedToken.uid}@firebase.local`,
              phone: decodedToken.phone_number || null,
              name: decodedToken.name || null,
              loginMethod: 'firebase',
              role: 'user',
              lastSignedIn: new Date(),
              termsAcceptedAt: new Date(),
            });
            
            const userId = Number(result[0].insertId);
            const newUsers = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (newUsers.length > 0) {
              user = newUsers[0];
            }
          } catch (insertError: any) {
            // Handle duplicate email - user exists but wasn't found (case sensitivity issue)
            if (insertError?.cause?.code === 'ER_DUP_ENTRY' && decodedToken.email) {
              // Search with case-insensitive email match
              const foundUsers = await db.select().from(users).where(eq(users.email, decodedToken.email.toLowerCase())).limit(1);
              if (foundUsers.length === 0) {
                // Try original case
                const foundUsers2 = await db.select().from(users).where(eq(users.email, decodedToken.email)).limit(1);
                if (foundUsers2.length > 0) {
                  user = foundUsers2[0];
                  await db.update(users).set({ 
                    firebaseUid: decodedToken.uid,
                    loginMethod: 'firebase',
                    lastSignedIn: new Date()
                  }).where(eq(users.id, user.id));
                }
              } else {
                user = foundUsers[0];
                await db.update(users).set({ 
                  firebaseUid: decodedToken.uid,
                  loginMethod: 'firebase',
                  lastSignedIn: new Date()
                }).where(eq(users.id, user.id));
              }
            } else {
              throw insertError;
            }
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Firebase token verification failed:', error);
      // Firebase auth failed, try Manus Auth fallback
    }
  }

  // No fallback to Manus Auth - Firebase is the only auth method
  // user remains null if Firebase auth didn't work (optional for public procedures)

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
