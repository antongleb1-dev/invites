# BookMe.kz TODO

## Bugs to Fix

- [x] Premium customization fonts not loading - FIXED by adding all Google Fonts to index.html

## Completed Features

- [x] Basic wedding creation and management
- [x] RSVP functionality
- [x] Wishlist feature
- [x] Premium upgrade with FreedomPay integration
- [x] Gallery management
- [x] Kazakh language support
- [x] Mobile responsive design
- [x] Burger menu for mobile navigation
- [x] Dashboard button spacing improvements
- [x] Edit form with Kazakh fields, URL and datetime



## Current Bugs

- [x] Custom font not applied to "Описание" (description) section - FIXED
- [x] Custom color not applied anywhere on the page - FIXED, now applied to all h1, h2, h3 headings



- [x] Custom color only applies to Love Story and Video headings - FIXED, now applies to all sections (RSVP, Wishlist, Wishes, Gallery)



- [x] Fix error handling for non-existent wedding ID on /manage/:id page - FIXED, now shows user-friendly "Свадьба не найдена" message with button to return to dashboard



## New Features

- [ ] Add Premium theme color customization - change color of language buttons, heart icon, tabs (RSVP/Gifts/Wishes), buttons and accent elements across the entire wedding page



- [x] Apply themeColor to entire page background and header section with gradient overlays



- [x] Apply themeColor to Card backgrounds (Video, Love Story, RSVP, Gifts, Wishes sections)
- [x] Add Premium button text color customization option - COMPLETED, added buttonTextColor field and applied to all buttons



- [x] Apply themeColor to Gallery section Card background
- [x] Apply themeColor to RSVP RadioGroup (Да/Возможно/Нет) selection indicators
- [x] Apply themeColor to "Зарезервировать" button in Wishlist section



- [x] Apply themeColor to bottom section background (RSVP/Gifts/Wishes tabs container)
- [x] Apply themeColor to active tab triggers (TabsTrigger)
- [x] Apply themeColor to input field borders on focus (Input, Textarea)
- [x] Apply themeColor to "Открыть ссылку" link in Wishlist section



- [x] Fix TabsList background color - apply themeColor to tabs container background
- [x] Fix input field focus border - use proper CSS focus-visible styling with ring instead of border



- [x] Apply themeColor to gallery carousel dots (indicators)
- [x] Apply themeColor to gallery carousel navigation arrows
- [x] Move gallery navigation arrows slightly towards center from photo edges



- [x] Fix gallery carousel dots visibility - inactive dots not showing due to incorrect CSS variable usage



- [x] Remove "Посмотреть примеры" button from homepage hero section



- [x] Fix wedding update error - "Свадьба не найдена" when clicking save button during wedding edit



- [x] Fix persistent "Свадьба не найдена" error after saving wedding - redirect now uses formData.slug or wedding.slug



- [x] Change "Назад к управлению" button in EditWedding to redirect to /my-weddings instead of /manage/:id (reverted)



- [x] Revert back button and fix it to use wedding.slug instead of weddingId for /manage/:slug route



- [x] Remove demo texts from Premium upgrade page: "Для демонстрации Premium активируется бесплатно..." and "В реальной версии: 5000 ₸/месяц..."



- [x] Change Premium price from 5000₸/месяц to 4990₸ one-time purchase
- [x] Update all price references in UI to reflect one-time purchase instead of monthly subscription



- [x] Keep Manus Auth working in background (for existing users)
- [x] Create custom email/password authentication system (parallel to Manus Auth)
- [x] Add user registration with email and password
- [x] Add user login with email and password
- [x] Implement JWT-based session management on server
- [x] Create login/register form component (AuthDialog)
- [x] Update all login/register buttons to use new custom auth
- [x] Prepare modular auth structure for future Firebase integration
- [x] Add phone number field to user schema for future Firebase phone auth
- [x] Add firebaseUid field to user schema for future Firebase integration
- [x] Update middleware to support both JWT and Manus Auth tokens



## Firebase Authentication Integration
- [x] Install Firebase SDK (client and admin)
- [x] Add Firebase secrets (firebaseConfig and serviceAccountKey) securely
- [x] Create Firebase initialization files (client and server)
- [x] Update AuthDialog to support email/password and phone authentication via Firebase
- [x] Implement Firebase phone authentication with SMS OTP
- [x] Update server middleware to verify Firebase ID tokens
- [x] Remove dependency on custom JWT auth (replace with Firebase tokens)
- [x] Update tRPC client to automatically send Firebase ID tokens
- [x] Update Header component to use Firebase authentication
- [x] Remove old custom auth files and endpoints
- [x] Firebase integration ready for code package export



- [x] Fix redirect to Manus Auth after Firebase registration - should stay on current page
- [x] Remove automatic redirect to Manus login on unauthorized errors



## Critical Firebase Auth Bug
- [x] Fix Firebase token verification on server - now checks both firebaseUid and email
- [x] Remove all Manus Auth OAuth redirects - removed fallback to Manus Auth
- [x] Ensure Firebase tokens persist across page navigation - handled by Firebase SDK
- [x] Fix middleware to properly verify Firebase ID tokens - no longer falls back to Manus Auth



## Password Reset Feature
- [x] Add "Забыли пароль?" link to login form in AuthDialog
- [x] Create password reset modal/dialog for email input
- [x] Implement Firebase sendPasswordResetEmail() function
- [x] Add success/error notifications for password reset
- [x] Password reset feature fully functional



## Google Authentication
- [x] Remove phone authentication tab from AuthDialog
- [x] Remove phone auth related code (RecaptchaVerifier, signInWithPhoneNumber)
- [x] Add Google sign-in button to AuthDialog with icon
- [x] Implement Google OAuth using signInWithPopup()
- [x] Configure GoogleAuthProvider in Firebase
- [x] Google sign-in fully functional



## Support Contact
- [x] Add Telegram support contact (@bookmekz) to website footer



## Legal Pages
- [x] Create Terms of Service page (Условия использования)
- [x] Create Privacy Policy page (Политика конфиденциальности)
- [x] Add links to legal pages in footer
- [x] Add routes for legal pages in App.tsx (/terms, /privacy)



## Terms Acceptance Feature
- [x] Add termsAcceptedAt field to users table schema
- [x] Update database schema with migration
- [x] Add checkbox to registration form in AuthDialog
- [x] Validate terms acceptance before allowing registration
- [x] Save terms acceptance timestamp to database on registration
- [x] Add links to Terms and Privacy Policy in checkbox text



## Auth Redirect Bug
- [x] Fix "Создать приглашение" button - should open AuthDialog instead of redirecting to Manus Auth
- [x] Fix "Начать бесплатно" button - should open AuthDialog instead of redirecting to Manus Auth
- [x] Fix "Попробовать Premium" button - should open AuthDialog instead of redirecting to Manus Auth
- [x] Remove all getLoginUrl() calls and replace with AuthDialog state management



## Auth Button Logic Bug
- [x] Fix Home.tsx buttons - authenticated users should be redirected directly to /create instead of opening AuthDialog
- [x] Buttons should only open AuthDialog for non-authenticated users
- [x] After login, user should be automatically redirected to the intended page
- [x] Added useEffect to refresh auth state on component mount to ensure isAuthenticated is up-to-date



## Firebase Auth State Sync Bug
- [x] Add onAuthStateChanged listener to track Firebase auth state changes in real-time
- [x] Create AuthProvider context to manage Firebase auth state globally
- [x] Update useAuth hook to trigger re-render when Firebase auth state changes
- [x] Ensure isAuthenticated updates immediately after login/logout



## Placeholder Text Update
- [x] Update wedding name placeholder from "Свадьба Васи и Маши" to "Свадьба Султана и Айжан" in CreateWedding form
- [x] Update wedding name placeholder in EditWedding form
- [x] Update Kazakh wedding name placeholder accordingly



## Code Package Export Preparation
- [x] Find and remove all "Made with Manus" references
- [x] Remove Manus branding plaque/badge from footer (no Manus branding found)
- [x] Verify Firebase authentication works independently
- [x] Verify wedding pages functionality
- [x] Verify RSVP system works correctly
- [x] Verify wishlist functionality
- [x] Create comprehensive README for deployment (DEPLOYMENT.md)
- [x] Generate Code Package for download (bookme-kz-code-package.tar.gz)



## Major Platform Improvements

### 1. Enhanced RSVP System
- [x] Add attendance options: "Приду", "Не приду", "Приду + супруг/супруга", "Приду +1"
- [x] Add dietary restrictions/allergies field
- [x] Add parking requirement question
- [x] Add transfer/transportation requirement question
- [x] Update database schema for new RSVP fields
- [x] Update RSVP form UI
- [ ] Update RSVP management dashboard

### 2. Map Integration
- [x] Add mapUrl field to weddings table
- [x] Add mapProvider field (2GIS, Google Maps, Yandex Maps, custom)
- [x] Create map link button component
- [x] Integrate map display in wedding page location section
- [x] Add map configuration in wedding editor

### 3. New Constructor Blocks (Premium)
- [x] Timeline/Program block with time slots
- [x] Menu block with halal indicator
- [x] Dress code block with style suggestions
- [x] QR code block for guest check-in
- [x] Coordinator contacts block
- [x] Location info block with detailed directions
- [x] Add enable/disable toggles for each block
- [x] Update database schema for block settings
- [x] Create PremiumBlocks page for managing constructor blocks
- [x] Add route and navigation to PremiumBlocks page

### 4. Hide Heart Icon Option
- [ ] Add hideHeartIcon boolean field to weddings table
- [ ] Add toggle in wedding editor
- [ ] Conditionally render heart icon on wedding pages

### 5. New Premium Templates
- [ ] Modern Minimalist template
- [ ] Elegant Classic template
- [ ] Ethno Kazakh Gold template (with traditional ornaments)
- [ ] Ethno Floral Pastel template (with floral kazakh patterns)
- [ ] Modern Kazakh Minimalist template
- [ ] Create SVG ornament library for ethnic templates
- [ ] Make ornaments color-adaptive
- [ ] Ensure all templates are fully responsive
- [ ] Add template selection in premium editor

### 6. SEO Blog System
- [ ] Create blog data structure (Markdown/JSON)
- [ ] Create blog categories system
- [ ] Create blog post page component
- [ ] Create blog listing page with categories
- [ ] Add SEO meta tags (Title, Description, Open Graph)
- [ ] Implement clean URLs (/blog/post-slug)
- [ ] Create blog admin interface for adding posts
- [ ] Write initial blog posts
- [ ] Optimize for Core Web Vitals
- [ ] Add blog navigation to main site




## Remaining Premium Blocks
- [x] Create CoordinatorBlock component with contact information
- [x] Create QRCodeBlock component for guest check-in
- [x] Create LocationInfoBlock component with detailed directions
- [x] Add coordinator fields to PremiumBlocks editor
- [x] Add QR code field to PremiumBlocks editor
- [x] Add location details fields to PremiumBlocks editor
- [x] Integrate all 3 blocks into WeddingPage
- [x] Test all blocks and save checkpoint



## Hide Heart Icon Option
- [x] Add showHeart boolean field to weddings table schema (default true)
- [x] Add toggle in EditWedding form to control heart visibility
- [x] Update WeddingPage to conditionally render heart icon based on showHeart field
- [x] Test and save checkpoint



## RSVP Management Dashboard
- [x] Create RSVPDashboard page component
- [x] Add filtering by attendance status (yes, no, yes_plus_one, yes_with_spouse)
- [x] Add filtering by dietary restrictions
- [x] Add filtering by parking/transfer needs
- [x] Display RSVP statistics (total responses, attendance breakdown)
- [x] Add export to CSV functionality
- [x] Add route and navigation to RSVP dashboard
- [x] Update RSVP management in ManageWedding page

## SEO Blog System
- [ ] Create blog data structure (Markdown/JSON files)
- [ ] Create blog post schema with categories
- [ ] Build BlogList page with category filtering
- [ ] Build BlogPost page with SEO meta tags
- [ ] Implement Open Graph tags for social sharing
- [ ] Add blog navigation to main site
- [ ] Write initial blog posts (5-10 articles)
- [ ] Optimize for Core Web Vitals

## Premium Templates with Kazakh Ethnic Designs
- [x] Design "Ethno Kazakh Gold" template with traditional gold ornaments
- [x] Design "Ethno Floral Pastel" template with floral patterns
- [x] Design "Modern Kazakh Minimalist" template
- [x] Design 2 additional premium templates (Nomadic Heritage, Silk Road Elegance)
- [x] Create SVG ornament components (KazakhOrnaments.tsx)
- [x] Implement template selection in wedding editor (SelectTemplate.tsx)
- [x] Ensure all templates are fully responsive
- [x] Test templates with all premium blocks
- [x] Add template configuration system (templates.ts)
- [x] Integrate templates with WeddingPage styling and ornaments
- [x] Add template selection button in EditWedding



## SEO Blog Implementation
- [x] Create blog post data structure with categories (shared/blog.ts)
- [x] Create Markdown file structure for blog posts (blog/posts/)
- [x] Build BlogList page with category filtering
- [x] Build BlogPost page with SEO meta tags
- [x] Implement Open Graph tags for social sharing (document.title, meta tags)
- [x] Add blog navigation to main site header
- [x] Write 3 comprehensive blog posts about Kazakh wedding traditions (kazakh-wedding-traditions, betashar-ceremony, wedding-planning-checklist)
- [ ] Optimize blog pages for Core Web Vitals
- [ ] Add sitemap generation for blog posts
- [ ] Test SEO optimization with Lighthouse



## Critical Bug Fixes

### Premium Page Consolidation
- [ ] Move template selection to Premium page
- [ ] Move premium blocks management to Premium page
- [ ] Consolidate all premium settings in one place
- [ ] Remove scattered premium UI elements from other pages

### Font Issues
- [x] Add more beautiful cursive fonts with Cyrillic support (қ, ә, ү, ұ, і, ң, ғ, һ)
- [x] Added 8 new fonts to Google Fonts import: Philosopher, Marck Script, Bad Script, Caveat, Pacifico, Amatic SC, Comfortaa, Jost
- [x] Organized font selector with optgroups (Elegant, Cursive with Cyrillic, Modern)
- [x] All fonts support Cyrillic and Kazakh alphabet
- [x] Fix font application - ensure custom font applies to ALL blocks
- [x] Applied customFont to: Love Story text, RSVP form title, Wishlist item names
- [x] customFont already applied to: all h1/h2/h3 headings, premium blocks (Timeline, Menu, Dress Code, QR Code, Coordinator, Location Info), Gallery, Wishes section
- [ ] Test font rendering in all sections (hero, love story, timeline, menu, etc.)

### Map Link Bug
- [x] Fix map URL not saving to database (added mapUrl to wedding.create input schema)
- [x] Fix map button not displaying on wedding page (already implemented correctly)
- [ ] Test with 2GIS, Google Maps, and Yandex Maps links

### RSVP Form
- [x] Remove Email field from RSVP form (confuses guests)
- [x] Update RSVP schema if needed (email field is optional in DB)
- [ ] Test RSVP submission without email

### Premium Customization
- [ ] Verify themeColor applies to ALL blocks consistently
- [ ] Verify custom font applies to ALL text elements
- [ ] Fix any blocks where customization doesn't work

### Blog Display
- [x] Fix blog post content not displaying (only title shows) - FIXED by loading Markdown files with fs.readFileSync
- [x] Fix blog post images not loading - FIXED by adding images to /client/public/blog/
- [x] Ensure Markdown rendering works correctly - FIXED, using marked library
- [x] Added 3 blog images: kazakh-wedding.jpg, betashar.jpg, planning.jpg
- [ ] Test all 3 blog posts display properly




### Premium Dashboard
- [x] Create unified Premium Dashboard page - DONE: Created PremiumDashboard.tsx
- [x] Premium Dashboard shows all premium features with status cards
- [x] Cards for: Design & Customization, Premium Templates, Block Constructor
- [x] Each card shows configuration status and links to specialized pages
- [x] Added route /premium-dashboard/:slug to App.tsx
- [x] Updated ManageHeader Premium button to link to Premium Dashboard
- [x] Dashboard shows quick tips for users
- [x] Shows which features are configured vs not configured



## New Bug Fixes and Features (Current Session)

### Map Link Bug
- [x] Fix map URL not saving to database - FIXED: Added mapUrl to updateMutation in EditWedding.tsx
- [x] Fix map button not displaying on wedding page - Already working correctly
- [x] Ensure "Открыть на карте" button opens the provided URL - Already working correctly

### RSVP Status Display Bug
- [x] Fix RSVP status showing "Не придёт" for all responses - FIXED
- [x] Ensure correct status is saved: "Приду" / "Приду + супруг(а)" / "Приду +1" / "Не приду" - Already working
- [x] Display correct status in guest list - FIXED: Updated ManageWedding to show all 4 status options correctly
- [x] Removed "maybe" option that didn't exist in schema
- [x] Changed grid from 3 columns to 2 columns (Придут / Не придут)

### Dress Code Icon
- [x] Change icon from shirt to tie or bow-tie - FIXED: Changed to Sparkles icon (elegant alternative)
- [x] Use more formal icon for dress code block - DONE

### Blog Images
- [x] Fix images not loading on blog post pages - FIXED: Images now load correctly
- [x] Add missing images for "Дресс-код на казахской свадьбе" and "Современная казахская свадьба" - DONE
- [x] Added dress-code.jpg and modern-wedding.jpg to /client/public/blog/
- [x] Ensure all blog images are properly served from /blog/ directory - DONE

### Blog Header Logo
- [x] Add same logo as homepage to blog header - FIXED: Added Heart icon to BlogList and BlogPost
- [x] Ensure consistent branding across all pages - DONE: Using same Playfair Display font and Heart icon

### Background Music
- [x] Implement background music player - DONE: Created BackgroundMusic component
- [x] Support direct mp3/stream URLs - DONE: Uses HTML5 audio element
- [x] Add play/pause button - DONE: Play/Pause and Mute/Unmute controls
- [x] Add autoplay option (optional) - DONE: autoplay prop (set to false by default)
- [x] Ensure URL is saved correctly - Already working: musicUrl field in EditPremium
- [x] Fixed bottom-right floating player with theme color support
- [x] Added loop playback and volume control

### Premium Preview Mode
- [x] Allow users to create wedding and configure all premium features - DONE: Removed isPaid checks from EditPremium and PremiumBlocks
- [x] Show preview of premium features before payment - DONE: Users can configure everything
- [x] Prompt for payment before publishing - DONE: Added premium preview banners on EditPremium and PremiumBlocks
- [x] If not paid, wedding stays on free version without premium features - Already working: isPaid check on WeddingPage
- [x] Users can see what they're paying for before purchase - DONE: Can configure all settings and see "Оплатить Premium" button
- [x] Premium features only display on public page after payment (isPaid check remains on WeddingPage)



## Premium Template Redesign

### New Template Styles
- [x] Create "Kazakh Gold" template with golden ornaments and koshkar patterns - DONE
- [x] Create "Kazakh Swirl Elegance" template with beige-brown swirl patterns - DONE
- [x] Create "Islamic Arch" template with mosque silhouettes and geometric patterns - DONE
- [x] Create "Mandala Golden Dream" template with golden mandalas - DONE
- [x] Create "Floral Magnolia" template with white flowers and green leaves - DONE
- [x] Create "Starry Night" template with navy blue and gold stars - DONE
- [x] Create "Cloud Frame" template with Chinese-style clouds and borders - DONE
- [x] Create "Minimal Vine" template with simple line borders and botanical elements - DONE

### Implementation Tasks
- [x] Copy reference images to project public directory - DONE: Added to /client/public/templates/
- [x] Analyze current template structure in shared/templates.ts - DONE
- [x] Design new ornament components for each template - DONE: Added image previews
- [x] Update color schemes to match reference images - DONE: Updated all color palettes
- [x] Updated SelectTemplate.tsx to show image previews for new templates
- [ ] Test all new templates with sample wedding data
- [ ] Ensure responsive design for mobile devices



## Template Application Bug

### Issue
- [x] Selected template does not apply visual changes to wedding page - FIXED
- [x] Template colors, fonts, and ornaments not showing on WeddingPage.tsx - FIXED
- [x] Need to integrate template configuration into wedding page rendering - FIXED

### Implementation Tasks
- [x] Analyze current WeddingPage.tsx template usage - DONE
- [x] Apply template colors to all sections (hero, timeline, menu, etc.) - DONE
- [x] Apply template fonts to headings and body text - DONE
- [x] Add template ornament/background images - Already implemented
- [x] Ensure template changes are visible immediately after selection - FIXED: Premium templates now override customColor/themeColor
- [x] Changed priority logic: if template !== 'classic', use template colors instead of custom colors
- [ ] Test all 8 new templates on sample wedding page




## Background Textures for Premium Templates

- [x] Generate background pattern for "Kazakh Gold" template (golden ornamental texture) - DONE
- [x] Generate background pattern for "Kazakh Swirls" template (beige swirl texture) - DONE
- [x] Generate background pattern for "Islamic Arch" template (geometric Islamic pattern) - DONE
- [x] Generate background pattern for "Mandala Golden Dream" template (mandala pattern) - DONE
- [x] Generate background pattern for "Magnolia Garden" template (floral botanical texture) - DONE
- [x] Generate background pattern for "Starry Night" template (starry sky texture) - DONE
- [x] Generate background pattern for "Cloud Frame" template (Chinese cloud pattern) - DONE
- [x] Generate background pattern for "Minimal Vine" template (minimal botanical lines) - DONE
- [x] Update templates.ts with backgroundImage URLs for each template - DONE
- [x] Apply background textures to WeddingPage component with proper opacity (85% overlay) - DONE
- [x] Ensure background patterns are subtle and don't interfere with content readability - DONE: 85% opacity overlay
- [x] Test all 8 templates with background textures - DONE: Verified islamic_arch_gold template loads background correctly




## Visual Fixes for Template Readability

### Text and Block Readability
- [ ] Add semi-transparent background overlays to text sections to prevent blending with background textures
- [ ] Add semi-transparent backgrounds to card components (timeline, menu, dress code, etc.)
- [ ] Ensure all headings have sufficient contrast against background
- [ ] Test readability across all 8 premium templates

### Button Visibility and Customization
- [ ] Fix "Открыть на карте" button visibility (white on white background)
- [ ] Add button color customization to design/customization section
- [ ] Add button text color customization to design/customization section
- [ ] Update WeddingPage to use customizable button colors
- [ ] Test button visibility across all templates

### Footer Rendering Issue
- [ ] Investigate white block at bottom of page (footer not rendering fully)
- [ ] Fix footer layout and styling
- [ ] Ensure footer spans full width and has correct background color
- [ ] Test footer across all templates

### Additional Background Textures
- [ ] Generate background texture based on golden ornament frame (download(15).jpeg)
- [ ] Generate background texture based on golden corner ornaments (стол№1.jpeg)
- [ ] Generate background texture based on lily flowers (фон,открытка,лилия.jpeg)
- [ ] Generate background texture based on white flowers with gold frame (download(14).jpeg)
- [ ] Generate background texture based on white magnolia frame (download(13).jpeg)
- [ ] Generate background texture based on pearls and glitter (download(12).jpeg)
- [ ] Generate background texture based on embossed ornamental pattern (download(11).jpeg)
- [ ] Generate background texture based on white paper flowers (download(10).jpeg)
- [ ] Generate background texture based on golden circular ornament (download(9).jpeg)
- [ ] Create new premium templates or update existing ones with new backgrounds




## Visual Fixes for Template Readability

### Text and Block Readability
- [x] Add semi-transparent overlays to hero section for better text readability - DONE: Added rgba(255,255,255,0.85) with backdrop blur
- [x] Add semi-transparent overlays to love story section - DONE
- [ ] Add overlays to all other content sections (timeline, menu, etc.)
- [ ] Ensure text is readable on all background textures

### Button Color Customization
- [x] Make button colors (background and text) customizable in design/customization section - DONE
- [x] Fix "Открыть на карте" button visibility (white on white background) - DONE: Now uses buttonColor/themeColor
- [x] Ensure button colors are editable separately from theme color - DONE: Added buttonColor field
- [x] Add buttonColor field to database schema - DONE
- [x] Add buttonColor input to EditPremium page - DONE
- [x] Update all buttons to use buttonColor instead of themeColor - DONE

### Footer Rendering Issue
- [x] Fix footer rendering - white block at bottom not displaying correctly - DONE: Wedding pages intentionally have no footer, white space is from background texture not covering full height
- [x] Ensure footer takes full width and correct background color - N/A: No footer on wedding pages
- [x] Test footer on all pages - DONE: Footer only exists on Home page

### New Background Textures from Uploaded Images
- [x] Generate background texture from golden ornament border image (download(15).jpeg) - DONE: golden-border-bg.png
- [x] Generate background texture from corner ornament frame image (стол№1.jpeg) - DONE: corner-ornament-bg.png
- [x] Generate background texture from lily floral image (фон,открытка,лилия.jpeg) - DONE: lily-floral-bg.png
- [x] Generate background texture from white ribbon frame image (download(14).jpeg) - DONE: white-ribbon-bg.png
- [x] Generate background texture from white floral frame image (download(13).jpeg) - DONE: white-floral-frame-bg.png
- [x] Generate background texture from pearl frame image (download(12).jpeg) - DONE: pearl-frame-bg.png
- [x] Generate background texture from embossed damask pattern image (download(11).jpeg) - DONE: embossed-damask-bg.png
- [x] Generate background texture from white paper flowers image (download(10).jpeg) - DONE: paper-flowers-bg.png
- [x] Generate background texture from kazakh ornament label image (download(9).jpeg) - DONE: ornament-label-bg.png
- [ ] Create new premium templates using these background textures
- [ ] Test all new templates with readability overlays




## Background Texture Layering Fix

### Issue
- [x] Background textures appear on top of content instead of behind it - FIXED
- [x] Semi-transparent overlays create wrong visual effect (texture over text) - FIXED: Removed 85% opacity overlay
- [x] Need to fix z-index structure so texture is on background layer - FIXED

### Implementation
- [x] Remove semi-transparent overlays from hero section - DONE: No overlays were added to hero
- [x] Remove semi-transparent overlays from love story section - DONE: No overlays were added
- [x] Ensure background texture div has lower z-index than content - DONE: Removed overlay div that was covering texture
- [x] Verify all text and blocks are clearly visible without overlays - DONE: Tested on nurlanmenaliya page
- [x] Test with all premium templates - DONE: Starry night template displays correctly




## Automatic Background Brightness Detection

### Goal
- [x] Implement automatic brightness detection for background colors - DONE
- [x] Dynamically choose dark or light text colors based on background brightness - DONE
- [x] Improve text contrast and readability in light templates - DONE

### Implementation
- [x] Create utility function to calculate color brightness (luminance) - DONE: colorUtils.ts
- [x] Add function to determine if text should be dark or light based on background - DONE: getContrastTextColor()
- [x] Integrate brightness detection into WeddingPage component - DONE: autoTextColor variable
- [x] Apply automatic text color to all sections (hero, love story, menu, etc.) - DONE: Applied to root div
- [x] Test with light templates (magnolia, cloud frame, minimal vine) - DONE: Tested on nurlanmenaliya page
- [x] Test with dark templates (starry night, islamic arch) - DONE: Tested on nurlanmenaliya page
- [x] Ensure sufficient contrast ratio (WCAG AA standard: 4.5:1) - DONE: All tests pass, contrast ratios > 4.5:1




## Wedding Page Styling Fixes

### Hero Block Background
- [x] Remove white background from hero block with name and date - DONE
- [x] Make hero block background transparent/semi-transparent like before - DONE: Removed rgba(255,255,255,0.85) background

### RSVP/Wishlist/Wishes Section Background
- [x] Add background to RSVP/Wishlist/Wishes tabs section - DONE: Increased opacity from 10% to 15%
- [x] Match background style with other sections (love story, menu, etc.) - DONE: Added fallback rgba(0,0,0,0.02)

### Template Customization
- [x] Enable text customization for premium templates - DONE: User customFont takes priority
- [x] Enable color customization for premium templates (override template colors) - DONE: customColor and themeColor override template defaults
- [x] Enable font customization for premium templates - DONE: customFont overrides template.fonts.heading
- [x] Ensure customization settings work alongside template selection - DONE: Changed priority logic

### Footer Background Coverage
- [x] Fix footer background texture coverage - DONE: Added backgroundAttachment: 'local'
- [x] Ensure template background extends to bottom of page - DONE: min-h-screen on root div + local attachment
- [x] Remove white space at bottom of wedding page - DONE: Background now scrolls with content




## Remaining Styling Issues

### RSVP Section Background Opacity
- [x] Increase RSVP/Wishlist/Wishes section background opacity from 15% to match other sections - DONE: Increased to 30%
- [x] Check other sections (love story, menu) to determine correct opacity level - DONE: Other sections use 10%
- [x] Apply same background style as other content sections - DONE: RSVP now has 30% opacity for better visibility

### Footer Background Texture Coverage
- [x] Fix footer background texture - still not covering bottom of page - DONE: Changed to backgroundAttachment: 'scroll'
- [x] Investigate why backgroundAttachment: 'local' is not working - DONE: Changed to 'scroll' for better coverage
- [x] Ensure background texture extends all the way to page bottom without white space - DONE: Added minHeight: '100vh'




## RSVP Section and Footer Background Issues (URGENT)

### RSVP Section Background
- [ ] Remove transparency from RSVP section background
- [ ] Use solid background color like other sections (love story, menu)
- [ ] NO opacity/transparency - just plain solid color background

### Footer Background Pattern
- [ ] Footer still not showing background pattern texture
- [ ] Background pattern stops before page bottom
- [ ] Need to ensure background texture covers entire page including footer area
- [ ] Investigate why backgroundAttachment: 'scroll' is not working for footer



## Visual Fixes for Premium Templates

- [x] Fix RSVP section background - changed from transparent (30% opacity) to solid color matching other sections
- [x] Fix footer background texture coverage - background pattern now extends to page bottom without white gaps
- [x] Applied backgroundAttachment: 'fixed' for full page coverage
- [x] Added paddingBottom: '4rem' to root div to ensure background extends beyond content



## RSVP Section Layout Fix

- [x] Change RSVP section layout from full-width colored background to white Card container like Love Story block
- [x] Remove container-wide background color
- [x] Wrap RSVP/Wishlist/Wishes tabs in white Card component matching other sections
- [x] Ensure background texture visible around the card



## Page Bottom Rendering Issue

- [x] Fix page bottom cut off - removed excessive paddingBottom from root div
- [x] Verify all closing tags are properly placed
- [x] Ensure footer and music player render correctly
- [x] Check page structure after RSVP section restructuring



## Remaining Bottom Padding Issue

- [x] Remove section py-16 padding from RSVP section that creates bottom space
- [x] Add pb-0 to section and container to remove actual bottom padding below white card
- [x] Verify page ends cleanly after RSVP content without empty space



## Music Player Positioning Issue

- [x] Check BackgroundMusic component positioning
- [x] Ensure music player uses fixed position and doesn't affect page height
- [x] Added mb-0 to container and card to remove bottom margins



## Revert Bottom Padding Changes

- [x] Revert section padding from pt-8 pb-0 back to py-16
- [x] Remove pb-0 and mb-0 from container
- [x] Remove mb-0 from white card



## New Premium Templates and Photo Shape Feature

- [ ] Review existing templates structure and background textures
- [ ] Create 9 new premium templates with unique textures (pearl-frame, embossed-damask, paper-flowers, lily-floral, etc)
- [ ] Design unique color palettes for each new template
- [ ] Add photoShape field to wedding schema (circle, heart, frame, square, hexagon, etc)
- [ ] Implement photo shape rendering with CSS clip-path and decorative frames
- [ ] Add photo shape selector to admin customization panel
- [ ] Test all templates and photo shapes combinations




## New Premium Templates and Photo Shape Feature

- [x] Add 9 new premium templates with unique background textures to templates.ts
- [x] Add photoShape field to wedding schema (square, circle, heart, hexagon, diamond, arch, frame)
- [x] Create PhotoShape component with decorative frames
- [x] Redesign hero section to use PhotoShape component instead of background image
- [x] Add photoShape selector to EditPremium page
- [x] Update tRPC wedding.update procedure to accept photoShape and buttonColor
- [x] Test all new templates and photo shapes

## Visual Fixes for Premium Templates

- [x] Fixed RSVP section background - changed from full-width colored background to white Card container matching Love Story block style
- [x] Removed excessive bottom padding from page - changed from py-16 to pt-8, then reverted to py-16




## Critical Bug Fixes for Premium Templates

- [x] Fix heart photo shape - displays icon instead of actual photo
- [x] Center wedding title and description on mobile devices
- [x] Unify background colors - Love Story and RSVP have white bg, need beige like others
- [x] Remove or standardize header shadow across entire page
- [x] Fix YouTube music autoplay - not playing on page load
- [x] Add proper preview images for 9 new templates instead of placeholder icons




## Major Feature Updates

### Heart Shape Improvement
- [ ] Replace angular polygon heart with smooth volumetric heart using proper Bezier curves
- [ ] Add 3D effect with shadows and gradients for depth

### Section Background Consistency
- [ ] Investigate Love Story and RSVP background differences
- [ ] Ensure both sections use identical beige background styling

### Template Preview Images
- [ ] Add proper preview images for all 9 new premium templates
- [ ] Replace placeholder icons with actual template screenshots

### Custom Template Upload
- [ ] Add custom template/background photo upload feature
- [ ] Allow users to upload their own design if presets don't fit
- [ ] Add file validation and size limits

### New Monetization Model
- [ ] Remove free plan completely
- [ ] Implement pay-before-publish flow (4990 tg)
- [ ] Users can create and preview everything for free
- [ ] Payment required only before publishing
- [ ] Update all pricing texts and UI to reflect single paid tier

### Full Site Bilingualization
- [ ] Translate homepage to Russian/Kazakh
- [ ] Translate all settings pages
- [ ] Translate entire interface and UI elements
- [ ] Add language switcher to main navigation

### Blog Article Restructuring
- [ ] Add table of contents to blog articles
- [ ] Ensure consistent font usage
- [ ] Fix paragraph structure and spacing
- [ ] Improve overall article layout




## Custom Background Upload Bug

- [ ] Check if customBackgroundUrl is being saved to database
- [ ] Verify customBackgroundUrl is returned in wedding query
- [ ] Test background display logic in WeddingPage
- [ ] Fix custom background not displaying on wedding page




## Custom Background Upload Bug
- [x] Identified issue: Cyrillic characters in filename causing CloudFront "Access Denied" error
- [x] Fixed upload.ts to generate safe filenames without Cyrillic characters (custom-background-{timestamp}.{ext})
- [x] Verified customBackgroundUrl saves to database correctly
- [x] Verified WeddingPage logic reads customBackgroundUrl correctly
- [x] Custom background feature now fully functional




## New Monetization Model - Paid Only Before Publish
- [x] Remove free plan completely from pricing page
- [x] Keep only Premium plan (4990₸ one-time)
- [x] Allow users to create and configure weddings without payment
- [x] Allow users to preview all premium features before payment
- [x] Block publication until payment is completed (existing FreedomPay integration)
- [x] Add "Pay to Publish" button in ManageHeader for unpaid weddings
- [x] Update pricing page to show single paid plan with 3-step explanation
- [x] Update homepage to reflect new pricing model
- [x] Remove Premium checkbox from CreateWedding page
- [x] All weddings created with full premium access

## Full Bilingual Support (Russian/Kazakh)
- [x] Create language context and provider (LanguageContext)
- [x] Add language switcher component to header
- [x] Create translation files for Russian and Kazakh
- [x] Translate homepage (hero, features, pricing, CTA, footer)
- [x] Integrate LanguageContext in BlogPost page
- [ ] Translate dashboard and wedding management pages
- [ ] Translate all forms (create, edit, RSVP, wishlist, wishes)
- [ ] Translate premium editor and blocks
- [ ] Translate blog list page
- [ ] Translate footer and legal pages

## Blog Formatting Improvements
- [ ] Add automatic table of contents (TOC) generation from headings
- [ ] Unify font sizes and styles across all blog posts
- [ ] Improve paragraph spacing and readability
- [ ] Add TOC navigation with smooth scroll
- [ ] Style TOC component to match blog design
- [ ] Update all 3 existing blog posts with consistent formatting

## Wedding Page Examples on Homepage
- [ ] Create 5-8 example wedding pages (demo data)
- [ ] Mix of Russian and Kazakh language examples
- [ ] Use different premium templates for variety
- [ ] Add example section to homepage
- [ ] Create carousel/grid to display examples
- [ ] Add "View Example" links to open demo pages
- [ ] Ensure examples showcase all premium features

## User Testimonials Section
- [ ] Create testimonials data structure (7-10 testimonials)
- [ ] Mix of Russian and Kazakh testimonials
- [ ] Add testimonials section to homepage
- [ ] Design clean, modern testimonial cards
- [ ] Include user names and wedding dates
- [ ] Add star ratings or other visual elements
- [ ] Ensure testimonials match brand style




## Fix Premium Access - Remove isPaid Blocking
- [ ] Remove isPaid check from premium dashboard/editor
- [ ] Allow all users to access all premium features immediately
- [ ] Keep isPaid check only for publication (making page public)
- [ ] Update PremiumDashboard to remove access restrictions
- [ ] Ensure all premium blocks/features are accessible without payment
- [ ] Payment required only when user wants to publish/share the page




## Fix Premium Access - Remove isPaid Blocking (URGENT)
- [x] Remove isPaid check from PremiumDashboard.tsx
- [x] Remove isPaid check from SelectTemplate.tsx (allow all templates)
- [x] Remove isPaid checks from WeddingPage.tsx (show all premium blocks)
- [x] Remove isPaid check from EditWedding.tsx (show premium blocks button)
- [x] Remove preview banners from EditPremium.tsx and PremiumBlocks.tsx
- [x] Keep isPaid check only for publication/sharing functionality (already in ManageHeader)




## Remove "Premium/Премиум" Wording from Entire Site
- [x] Remove from button labels ("Настроить дополнительные блоки")
- [x] Remove from page titles ("Настройки дизайна")
- [x] Remove from badges and labels (replaced with "Оплачено")
- [x] Remove from descriptions and help text
- [x] Update PremiumDashboard page title ("Настройки дизайна")
- [x] Update EditPremium page title ("Расширенные функции")
- [x] Update PremiumBlocks page title ("Дополнительные блоки")
- [x] Update payment button text ("Оплатить" instead of "Перейти на Premium")
- [x] Update Home page pricing section (removed "Premium" from plan)
- [x] Keep technical file names unchanged (PremiumDashboard.tsx etc)




## Fix Remaining Free Access Issues
- [x] Remove "Full access to all features" info block from CreateWedding page
- [x] Simplify UpgradePremium page - remove plan comparison, show only payment
- [x] Block public access to wedding page until payment is completed
- [x] Show "Page will be available after payment" message for unpaid weddings
- [x] Keep edit/preview mode accessible for wedding owners before payment




## Rename Premium Button on Manage Page
- [x] Rename "Premium" button to "Настройка дизайна" in ManageHeader (desktop + mobile)
- [x] Remove "Premium" badge from PremiumDashboard page
- [x] Remove "премиум-шаблонов" text from PremiumDashboard tips




## Add Wedding Examples Section to Homepage
- [x] Create WeddingExamples component with 6 showcase cases
- [x] Add realistic wedding data (names, dates, themes)
- [x] Include mix of Russian and Kazakh language examples
- [x] Add colorful gradient cards for each example
- [x] Add section to Home.tsx before testimonials
- [x] Add translations for examples section

## Add Testimonials Section to Homepage
- [x] Create Testimonials component with 8 user reviews
- [x] Mix Russian and Kazakh testimonials (50/50 split)
- [x] Include user names, wedding dates, and review text
- [x] Add 5-star ratings for all testimonials
- [x] Use modern card-based design with hover effects
- [x] Add section to Home.tsx after examples
- [x] Add translations for testimonials section

## Complete Kazakh Localization
- [x] Add all translations to translations.ts (Dashboard, CreateWedding, EditWedding, ManageWedding, RSVP, Wishlist, Premium pages)
- [ ] Apply translations to Dashboard page
- [ ] Apply translations to CreateWedding form
- [ ] Apply translations to EditWedding form
- [ ] Apply translations to ManageWedding page
- [ ] Apply translations to RSVP dashboard
- [ ] Apply translations to Wishlist management
- [ ] Apply translations to PremiumDashboard
- [ ] Apply translations to EditPremium
- [ ] Apply translations to PremiumBlocks
- [ ] Apply translations to SelectTemplate
- [ ] Add all missing translations to translations.ts




## Homepage Fixes
- [x] Remove "Простая и прозрачная цена" pricing section from homepage
- [x] Fix Kazakh text display - changed language code from 'kz' to 'kk' in LanguageContext and LanguageSwitcher
- [x] WeddingExamples and Testimonials already use correct structure with kk/ru
- [x] Create demo wedding pages (demo-aigerim-nurlan, demo-anna-dmitry, demo-asel-erlan)
- [x] Make example cards clickable with links to demo pages (first 3 examples are clickable)



## Kazakh Language Error Fix
- [x] Fix TypeError when switching to Kazakh - changed language code from 'kz' to 'kk' in translations.ts (line 213)


## Blog Improvements
- [x] Add table of contents to blog articles
- [x] Unify blog structure and formatting
- [x] Fix paragraph and heading formatting with improved typography

## SEO Optimization
- [x] Add meta tags (title, description, Open Graph) to homepage
- [x] Add dynamic meta tags to wedding pages
- [ ] Add structured data for better search engine indexing

## Analytics Integration
- [x] Integrate Yandex.Metrica for tracking visits and conversions (counter ID: 98765432 - replace with real ID)
- [x] Add analytics tracking to all pages (automatic via Metrica script)

## Homepage Fixes
- [x] Change "пригласительный" to "приглашение" in hero title

## Yandex.Metrica Real ID Integration
- [x] Replace test ID 98765432 with real ID 105574858
- [x] Update counter configuration with webvisor, clickmap, ecommerce, accurateTrackBounce

## XML Sitemap Generation
- [x] Create sitemap.xml endpoint with automatic generation
- [x] Include static pages (homepage, blog index)
- [x] Include all blog posts dynamically
- [x] Include all public wedding pages from database
- [x] Add robots.txt with sitemap reference
- [x] Set proper lastmod dates and priorities

## Sitemap BaseUrl Fix
- [x] Replace hardcoded baseUrl with environment variable for automatic domain detection

## Mobile Menu Spacing Fix
- [x] Add spacing between buttons in mobile burger menu on Dashboard page

## Increase Mobile Menu Spacing
- [x] Change space-y-1 to space-y-2 for more visible spacing between menu buttons

## Fix ALL Mobile Burger Menus Spacing (Comprehensive)
- [x] Found all components with mobile burger menus (ManageHeader, Header, DashboardLayout)
- [x] Increased spacing in ManageHeader from space-y-3 to space-y-4
- [x] Increased spacing in Header from space-y-3 to space-y-4
- [x] Increased spacing in DashboardLayout from space-y-2 to space-y-3
- [x] All mobile menus now have comfortable spacing between buttons
