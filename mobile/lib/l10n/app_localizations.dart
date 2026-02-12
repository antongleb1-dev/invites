import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_pt.dart';
import 'app_localizations_ru.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
    Locale('es'),
    Locale('hi'),
    Locale('pt'),
    Locale('ru')
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'Invites AI'**
  String get appName;

  /// No description provided for @tagline.
  ///
  /// In en, this message translates to:
  /// **'Create beautiful invitations with AI'**
  String get tagline;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @signup.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signup;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @name.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get name;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @orContinueWith.
  ///
  /// In en, this message translates to:
  /// **'or continue with'**
  String get orContinueWith;

  /// No description provided for @continueAsGuest.
  ///
  /// In en, this message translates to:
  /// **'Continue as Guest'**
  String get continueAsGuest;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @preview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get preview;

  /// No description provided for @tokens.
  ///
  /// In en, this message translates to:
  /// **'Tokens'**
  String get tokens;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @createInvitation.
  ///
  /// In en, this message translates to:
  /// **'Create Invitation'**
  String get createInvitation;

  /// No description provided for @promptPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Describe your event: wedding, birthday, corporate...'**
  String get promptPlaceholder;

  /// No description provided for @generate.
  ///
  /// In en, this message translates to:
  /// **'Generate'**
  String get generate;

  /// No description provided for @generating.
  ///
  /// In en, this message translates to:
  /// **'Generating...'**
  String get generating;

  /// No description provided for @tokenBalance.
  ///
  /// In en, this message translates to:
  /// **'Token Balance'**
  String get tokenBalance;

  /// No description provided for @buyTokens.
  ///
  /// In en, this message translates to:
  /// **'Buy Tokens'**
  String get buyTokens;

  /// No description provided for @share.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get share;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @regenerate.
  ///
  /// In en, this message translates to:
  /// **'Regenerate'**
  String get regenerate;

  /// No description provided for @myInvitations.
  ///
  /// In en, this message translates to:
  /// **'My Invitations'**
  String get myInvitations;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @howItWorks.
  ///
  /// In en, this message translates to:
  /// **'How it works'**
  String get howItWorks;

  /// No description provided for @step1.
  ///
  /// In en, this message translates to:
  /// **'Describe your event'**
  String get step1;

  /// No description provided for @step1Desc.
  ///
  /// In en, this message translates to:
  /// **'Tell AI about your event - wedding, birthday, party'**
  String get step1Desc;

  /// No description provided for @step2.
  ///
  /// In en, this message translates to:
  /// **'Generate invitation'**
  String get step2;

  /// No description provided for @step2Desc.
  ///
  /// In en, this message translates to:
  /// **'AI creates a beautiful personalized invitation'**
  String get step2Desc;

  /// No description provided for @step3.
  ///
  /// In en, this message translates to:
  /// **'Share with guests'**
  String get step3;

  /// No description provided for @step3Desc.
  ///
  /// In en, this message translates to:
  /// **'Send the link to your guests'**
  String get step3Desc;

  /// No description provided for @welcomeMessage.
  ///
  /// In en, this message translates to:
  /// **'Hi! ✨\n\nI\'ll create a premium-level online invitation for you — like from a top design studio.\n\nTell me:\n\n1. What\'s the event?\nWedding, birthday, anniversary, corporate party...\n\n2. When and where?\nDate, time and venue\n\n3. What vibe suits you best?\n• 🖤 Minimal luxe — clean, elegant, whitespace\n• 💫 Editorial — like a fashion magazine cover\n• 🌿 Organic — soft tones, natural textures\n• ✨ Modern classic — tradition + modernity\n• 🎨 Bold — bright, unconventional, memorable\n\nYou can upload photos and add a YouTube music link right away — I\'ll use them as the design foundation! 📸🎵'**
  String get welcomeMessage;

  /// No description provided for @aiDesigner.
  ///
  /// In en, this message translates to:
  /// **'AI Designer'**
  String get aiDesigner;

  /// No description provided for @aiDesignerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Create invitations with AI'**
  String get aiDesignerSubtitle;

  /// No description provided for @eventWedding.
  ///
  /// In en, this message translates to:
  /// **'💒 Wedding'**
  String get eventWedding;

  /// No description provided for @eventBirthday.
  ///
  /// In en, this message translates to:
  /// **'🎂 Birthday'**
  String get eventBirthday;

  /// No description provided for @eventCorporate.
  ///
  /// In en, this message translates to:
  /// **'🏢 Corporate'**
  String get eventCorporate;

  /// No description provided for @eventAnniversary.
  ///
  /// In en, this message translates to:
  /// **'🎉 Anniversary'**
  String get eventAnniversary;

  /// No description provided for @eventNewYear.
  ///
  /// In en, this message translates to:
  /// **'🎄 New Year'**
  String get eventNewYear;

  /// No description provided for @agentAI.
  ///
  /// In en, this message translates to:
  /// **'AI'**
  String get agentAI;

  /// No description provided for @agentClassic.
  ///
  /// In en, this message translates to:
  /// **'Classic'**
  String get agentClassic;

  /// No description provided for @previewInvitation.
  ///
  /// In en, this message translates to:
  /// **'Preview invitation'**
  String get previewInvitation;

  /// No description provided for @generatingInvitation.
  ///
  /// In en, this message translates to:
  /// **'Creating your invitation... This may take a moment.'**
  String get generatingInvitation;

  /// No description provided for @errorNotEnoughTokens.
  ///
  /// In en, this message translates to:
  /// **'Not enough tokens. Please purchase more to continue.'**
  String get errorNotEnoughTokens;

  /// No description provided for @errorGeneral.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get errorGeneral;

  /// No description provided for @chatCleared.
  ///
  /// In en, this message translates to:
  /// **'Chat cleared'**
  String get chatCleared;

  /// No description provided for @newChat.
  ///
  /// In en, this message translates to:
  /// **'New Chat'**
  String get newChat;

  /// No description provided for @saving.
  ///
  /// In en, this message translates to:
  /// **'Saving...'**
  String get saving;

  /// No description provided for @saved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get saved;

  /// No description provided for @creating.
  ///
  /// In en, this message translates to:
  /// **'Creating...'**
  String get creating;

  /// No description provided for @photoFromGallery.
  ///
  /// In en, this message translates to:
  /// **'Photo from Gallery'**
  String get photoFromGallery;

  /// No description provided for @takePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take Photo'**
  String get takePhoto;

  /// No description provided for @videoOption.
  ///
  /// In en, this message translates to:
  /// **'Video'**
  String get videoOption;

  /// No description provided for @attachedFiles.
  ///
  /// In en, this message translates to:
  /// **'📎 Attached {count} file(s)'**
  String attachedFiles(int count);

  /// No description provided for @invitation.
  ///
  /// In en, this message translates to:
  /// **'Invitation'**
  String get invitation;

  /// No description provided for @loadedForEditing.
  ///
  /// In en, this message translates to:
  /// **'Loaded \"{title}\" for editing. You can continue making changes — just describe what you want to update.'**
  String loadedForEditing(String title);

  /// No description provided for @couldNotLoadInvitation.
  ///
  /// In en, this message translates to:
  /// **'Could not load invitation. Please try again.'**
  String get couldNotLoadInvitation;

  /// No description provided for @errorAuth.
  ///
  /// In en, this message translates to:
  /// **'Please login to generate invitations.'**
  String get errorAuth;

  /// No description provided for @errorEditLimit.
  ///
  /// In en, this message translates to:
  /// **'You have reached your edit limit. Please purchase a package to continue.'**
  String get errorEditLimit;

  /// No description provided for @errorForbidden.
  ///
  /// In en, this message translates to:
  /// **'Access denied. Please check your account.'**
  String get errorForbidden;

  /// No description provided for @errorTimeout.
  ///
  /// In en, this message translates to:
  /// **'Request timed out. AI generation can take up to 2 minutes — please try again.'**
  String get errorTimeout;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// No description provided for @error.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get error;

  /// No description provided for @invitationNotFound.
  ///
  /// In en, this message translates to:
  /// **'Invitation not found'**
  String get invitationNotFound;

  /// No description provided for @goBack.
  ///
  /// In en, this message translates to:
  /// **'Go Back'**
  String get goBack;

  /// No description provided for @untitled.
  ///
  /// In en, this message translates to:
  /// **'Untitled'**
  String get untitled;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @tabInfo.
  ///
  /// In en, this message translates to:
  /// **'Info'**
  String get tabInfo;

  /// No description provided for @tabRsvp.
  ///
  /// In en, this message translates to:
  /// **'RSVP'**
  String get tabRsvp;

  /// No description provided for @tabWishes.
  ///
  /// In en, this message translates to:
  /// **'Wishes'**
  String get tabWishes;

  /// No description provided for @tabWishlist.
  ///
  /// In en, this message translates to:
  /// **'Wishlist'**
  String get tabWishlist;

  /// No description provided for @published.
  ///
  /// In en, this message translates to:
  /// **'Published'**
  String get published;

  /// No description provided for @draft.
  ///
  /// In en, this message translates to:
  /// **'Draft'**
  String get draft;

  /// No description provided for @statusLiveDescription.
  ///
  /// In en, this message translates to:
  /// **'Your invitation is live and accessible'**
  String get statusLiveDescription;

  /// No description provided for @statusDraftDescription.
  ///
  /// In en, this message translates to:
  /// **'Publish to share with guests'**
  String get statusDraftDescription;

  /// No description provided for @invitationLink.
  ///
  /// In en, this message translates to:
  /// **'Invitation Link'**
  String get invitationLink;

  /// No description provided for @myInvitation.
  ///
  /// In en, this message translates to:
  /// **'My Invitation'**
  String get myInvitation;

  /// No description provided for @linkCopied.
  ///
  /// In en, this message translates to:
  /// **'Link copied!'**
  String get linkCopied;

  /// No description provided for @publishToActivate.
  ///
  /// In en, this message translates to:
  /// **'Publish your invitation to activate the link'**
  String get publishToActivate;

  /// No description provided for @aiPackageLabel.
  ///
  /// In en, this message translates to:
  /// **'AI Package: {name}'**
  String aiPackageLabel(String name);

  /// No description provided for @noAiPackage.
  ///
  /// In en, this message translates to:
  /// **'No AI Package'**
  String get noAiPackage;

  /// No description provided for @editsRemaining.
  ///
  /// In en, this message translates to:
  /// **'{count} edits remaining'**
  String editsRemaining(int count);

  /// No description provided for @purchaseForEdits.
  ///
  /// In en, this message translates to:
  /// **'Purchase a package for AI edits'**
  String get purchaseForEdits;

  /// No description provided for @buy.
  ///
  /// In en, this message translates to:
  /// **'Buy'**
  String get buy;

  /// No description provided for @titleLabel.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get titleLabel;

  /// No description provided for @urlSlug.
  ///
  /// In en, this message translates to:
  /// **'URL slug'**
  String get urlSlug;

  /// No description provided for @saveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save Changes'**
  String get saveChanges;

  /// No description provided for @savedSuccess.
  ///
  /// In en, this message translates to:
  /// **'Saved!'**
  String get savedSuccess;

  /// No description provided for @errorWithMessage.
  ///
  /// In en, this message translates to:
  /// **'Error: {message}'**
  String errorWithMessage(String message);

  /// No description provided for @createdDate.
  ///
  /// In en, this message translates to:
  /// **'Created'**
  String get createdDate;

  /// No description provided for @lastModified.
  ///
  /// In en, this message translates to:
  /// **'Last modified'**
  String get lastModified;

  /// No description provided for @notAvailable.
  ///
  /// In en, this message translates to:
  /// **'N/A'**
  String get notAvailable;

  /// No description provided for @editInvitation.
  ///
  /// In en, this message translates to:
  /// **'Edit Invitation'**
  String get editInvitation;

  /// No description provided for @viewInvitation.
  ///
  /// In en, this message translates to:
  /// **'View Invitation'**
  String get viewInvitation;

  /// No description provided for @publishButton.
  ///
  /// In en, this message translates to:
  /// **'Publish'**
  String get publishButton;

  /// No description provided for @noRsvpYet.
  ///
  /// In en, this message translates to:
  /// **'No RSVP responses yet'**
  String get noRsvpYet;

  /// No description provided for @rsvpEmptyDescription.
  ///
  /// In en, this message translates to:
  /// **'Guests will appear here when they confirm attendance'**
  String get rsvpEmptyDescription;

  /// No description provided for @unknownGuest.
  ///
  /// In en, this message translates to:
  /// **'Unknown'**
  String get unknownGuest;

  /// No description provided for @guestCount.
  ///
  /// In en, this message translates to:
  /// **'{count} guests'**
  String guestCount(int count);

  /// No description provided for @attending.
  ///
  /// In en, this message translates to:
  /// **'Attending'**
  String get attending;

  /// No description provided for @attendingPlusOne.
  ///
  /// In en, this message translates to:
  /// **'Attending +1'**
  String get attendingPlusOne;

  /// No description provided for @attendingWithSpouse.
  ///
  /// In en, this message translates to:
  /// **'Attending with spouse'**
  String get attendingWithSpouse;

  /// No description provided for @notAttending.
  ///
  /// In en, this message translates to:
  /// **'Not attending'**
  String get notAttending;

  /// No description provided for @noWishesYet.
  ///
  /// In en, this message translates to:
  /// **'No wishes yet'**
  String get noWishesYet;

  /// No description provided for @wishesEmptyDescription.
  ///
  /// In en, this message translates to:
  /// **'Guest wishes will appear here'**
  String get wishesEmptyDescription;

  /// No description provided for @guestLabel.
  ///
  /// In en, this message translates to:
  /// **'Guest'**
  String get guestLabel;

  /// No description provided for @approvedStatus.
  ///
  /// In en, this message translates to:
  /// **'Approved'**
  String get approvedStatus;

  /// No description provided for @pendingStatus.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pendingStatus;

  /// No description provided for @reject.
  ///
  /// In en, this message translates to:
  /// **'Reject'**
  String get reject;

  /// No description provided for @approve.
  ///
  /// In en, this message translates to:
  /// **'Approve'**
  String get approve;

  /// No description provided for @noGiftsYet.
  ///
  /// In en, this message translates to:
  /// **'No gifts yet'**
  String get noGiftsYet;

  /// No description provided for @giftsEmptyDescription.
  ///
  /// In en, this message translates to:
  /// **'Add gifts to your wishlist on the website'**
  String get giftsEmptyDescription;

  /// No description provided for @giftLabel.
  ///
  /// In en, this message translates to:
  /// **'Gift'**
  String get giftLabel;

  /// No description provided for @reserved.
  ///
  /// In en, this message translates to:
  /// **'Reserved'**
  String get reserved;

  /// No description provided for @reservedByLabel.
  ///
  /// In en, this message translates to:
  /// **'by {name}'**
  String reservedByLabel(String name);

  /// No description provided for @openLink.
  ///
  /// In en, this message translates to:
  /// **'Open link'**
  String get openLink;

  /// No description provided for @invitationPublished.
  ///
  /// In en, this message translates to:
  /// **'Invitation published!'**
  String get invitationPublished;

  /// No description provided for @errorCreatingPayment.
  ///
  /// In en, this message translates to:
  /// **'Error creating payment'**
  String get errorCreatingPayment;

  /// No description provided for @deleteInvitation.
  ///
  /// In en, this message translates to:
  /// **'Delete Invitation'**
  String get deleteInvitation;

  /// No description provided for @deleteConfirmation.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete this invitation? This action cannot be undone.'**
  String get deleteConfirmation;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @invitationDeleted.
  ///
  /// In en, this message translates to:
  /// **'Invitation deleted'**
  String get invitationDeleted;

  /// No description provided for @failedToDelete.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete'**
  String get failedToDelete;

  /// No description provided for @guestUser.
  ///
  /// In en, this message translates to:
  /// **'Guest'**
  String get guestUser;

  /// No description provided for @noInvitationsYet.
  ///
  /// In en, this message translates to:
  /// **'No invitations yet'**
  String get noInvitationsYet;

  /// No description provided for @createFirstInvitation.
  ///
  /// In en, this message translates to:
  /// **'Create your first AI invitation!'**
  String get createFirstInvitation;

  /// No description provided for @errorLoadingInvitations.
  ///
  /// In en, this message translates to:
  /// **'Error loading invitations'**
  String get errorLoadingInvitations;

  /// No description provided for @choosePackageSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose a package to create AI invitations'**
  String get choosePackageSubtitle;

  /// No description provided for @aiPackagesTitle.
  ///
  /// In en, this message translates to:
  /// **'AI Packages'**
  String get aiPackagesTitle;

  /// No description provided for @needMoreEdits.
  ///
  /// In en, this message translates to:
  /// **'Need more edits?'**
  String get needMoreEdits;

  /// No description provided for @howPackagesWork.
  ///
  /// In en, this message translates to:
  /// **'How packages work'**
  String get howPackagesWork;

  /// No description provided for @packagesStep1.
  ///
  /// In en, this message translates to:
  /// **'Choose a package based on your needs'**
  String get packagesStep1;

  /// No description provided for @packagesStep2.
  ///
  /// In en, this message translates to:
  /// **'Each AI edit refines your invitation design'**
  String get packagesStep2;

  /// No description provided for @packagesStep3.
  ///
  /// In en, this message translates to:
  /// **'Your first message is free — try it now!'**
  String get packagesStep3;

  /// No description provided for @createInvitationFirst.
  ///
  /// In en, this message translates to:
  /// **'Please create an invitation first, then purchase a package.'**
  String get createInvitationFirst;

  /// No description provided for @popular.
  ///
  /// In en, this message translates to:
  /// **'POPULAR'**
  String get popular;

  /// No description provided for @add.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get add;

  /// No description provided for @editsUnit.
  ///
  /// In en, this message translates to:
  /// **'edits'**
  String get editsUnit;

  /// No description provided for @mobileView.
  ///
  /// In en, this message translates to:
  /// **'Mobile'**
  String get mobileView;

  /// No description provided for @tabletView.
  ///
  /// In en, this message translates to:
  /// **'Tablet'**
  String get tabletView;

  /// No description provided for @desktopView.
  ///
  /// In en, this message translates to:
  /// **'Desktop'**
  String get desktopView;

  /// No description provided for @editButton.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get editButton;

  /// No description provided for @shareSubject.
  ///
  /// In en, this message translates to:
  /// **'My Invitation — Invites AI'**
  String get shareSubject;

  /// No description provided for @noInvitationYet.
  ///
  /// In en, this message translates to:
  /// **'No invitation yet'**
  String get noInvitationYet;

  /// No description provided for @goBackToChat.
  ///
  /// In en, this message translates to:
  /// **'Go back to chat and describe your event to generate an invitation.'**
  String get goBackToChat;

  /// No description provided for @purchaseSuccess.
  ///
  /// In en, this message translates to:
  /// **'Purchase successful!'**
  String get purchaseSuccess;

  /// No description provided for @purchasePending.
  ///
  /// In en, this message translates to:
  /// **'Purchase is being processed...'**
  String get purchasePending;

  /// No description provided for @purchaseError.
  ///
  /// In en, this message translates to:
  /// **'Purchase failed. Please try again.'**
  String get purchaseError;

  /// No description provided for @restorePurchases.
  ///
  /// In en, this message translates to:
  /// **'Restore Purchases'**
  String get restorePurchases;

  /// No description provided for @restoringPurchases.
  ///
  /// In en, this message translates to:
  /// **'Restoring purchases...'**
  String get restoringPurchases;

  /// No description provided for @purchasesRestored.
  ///
  /// In en, this message translates to:
  /// **'Purchases restored successfully!'**
  String get purchasesRestored;

  /// No description provided for @noPurchasesToRestore.
  ///
  /// In en, this message translates to:
  /// **'No purchases to restore.'**
  String get noPurchasesToRestore;

  /// No description provided for @priceNotAvailable.
  ///
  /// In en, this message translates to:
  /// **'Price loading...'**
  String get priceNotAvailable;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
        'ar',
        'en',
        'es',
        'hi',
        'pt',
        'ru'
      ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'hi':
      return AppLocalizationsHi();
    case 'pt':
      return AppLocalizationsPt();
    case 'ru':
      return AppLocalizationsRu();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
