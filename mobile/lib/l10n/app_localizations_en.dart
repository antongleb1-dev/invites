// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Invites AI';

  @override
  String get tagline => 'Create beautiful invitations with AI';

  @override
  String get login => 'Login';

  @override
  String get signup => 'Sign Up';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get name => 'Name';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get orContinueWith => 'or continue with';

  @override
  String get continueAsGuest => 'Continue as Guest';

  @override
  String get home => 'Home';

  @override
  String get preview => 'Preview';

  @override
  String get tokens => 'Tokens';

  @override
  String get profile => 'Profile';

  @override
  String get createInvitation => 'Create Invitation';

  @override
  String get promptPlaceholder =>
      'Describe your event: wedding, birthday, corporate...';

  @override
  String get generate => 'Generate';

  @override
  String get generating => 'Generating...';

  @override
  String get tokenBalance => 'Token Balance';

  @override
  String get buyTokens => 'Buy Tokens';

  @override
  String get share => 'Share';

  @override
  String get save => 'Save';

  @override
  String get regenerate => 'Regenerate';

  @override
  String get myInvitations => 'My Invitations';

  @override
  String get settings => 'Settings';

  @override
  String get language => 'Language';

  @override
  String get logout => 'Logout';

  @override
  String get howItWorks => 'How it works';

  @override
  String get step1 => 'Describe your event';

  @override
  String get step1Desc => 'Tell AI about your event - wedding, birthday, party';

  @override
  String get step2 => 'Generate invitation';

  @override
  String get step2Desc => 'AI creates a beautiful personalized invitation';

  @override
  String get step3 => 'Share with guests';

  @override
  String get step3Desc => 'Send the link to your guests';

  @override
  String get welcomeMessage =>
      'Hi! ✨\n\nI\'ll create a premium-level online invitation for you — like from a top design studio.\n\nTell me:\n\n1. What\'s the event?\nWedding, birthday, anniversary, corporate party...\n\n2. When and where?\nDate, time and venue\n\n3. What vibe suits you best?\n• 🖤 Minimal luxe — clean, elegant, whitespace\n• 💫 Editorial — like a fashion magazine cover\n• 🌿 Organic — soft tones, natural textures\n• ✨ Modern classic — tradition + modernity\n• 🎨 Bold — bright, unconventional, memorable\n\nYou can upload photos and add a YouTube music link right away — I\'ll use them as the design foundation! 📸🎵';

  @override
  String get aiDesigner => 'AI Designer';

  @override
  String get aiDesignerSubtitle => 'Create invitations with AI';

  @override
  String get eventWedding => '💒 Wedding';

  @override
  String get eventBirthday => '🎂 Birthday';

  @override
  String get eventCorporate => '🏢 Corporate';

  @override
  String get eventAnniversary => '🎉 Anniversary';

  @override
  String get eventNewYear => '🎄 New Year';

  @override
  String get agentAI => 'AI';

  @override
  String get agentClassic => 'Classic';

  @override
  String get previewInvitation => 'Preview invitation';

  @override
  String get generatingInvitation =>
      'Creating your invitation... This may take a moment.';

  @override
  String get errorNotEnoughTokens =>
      'Not enough tokens. Please purchase more to continue.';

  @override
  String get errorGeneral => 'Something went wrong. Please try again.';

  @override
  String get chatCleared => 'Chat cleared';

  @override
  String get newChat => 'New Chat';

  @override
  String get saving => 'Saving...';

  @override
  String get saved => 'Saved';

  @override
  String get creating => 'Creating...';

  @override
  String get photoFromGallery => 'Photo from Gallery';

  @override
  String get takePhoto => 'Take Photo';

  @override
  String get videoOption => 'Video';

  @override
  String attachedFiles(int count) {
    return '📎 Attached $count file(s)';
  }

  @override
  String get invitation => 'Invitation';

  @override
  String loadedForEditing(String title) {
    return 'Loaded \"$title\" for editing. You can continue making changes — just describe what you want to update.';
  }

  @override
  String get couldNotLoadInvitation =>
      'Could not load invitation. Please try again.';

  @override
  String get errorAuth => 'Please login to generate invitations.';

  @override
  String get errorEditLimit =>
      'You have reached your edit limit. Please purchase a package to continue.';

  @override
  String get errorForbidden => 'Access denied. Please check your account.';

  @override
  String get errorTimeout =>
      'Request timed out. AI generation can take up to 2 minutes — please try again.';

  @override
  String get loading => 'Loading...';

  @override
  String get error => 'Error';

  @override
  String get invitationNotFound => 'Invitation not found';

  @override
  String get goBack => 'Go Back';

  @override
  String get untitled => 'Untitled';

  @override
  String get delete => 'Delete';

  @override
  String get tabInfo => 'Info';

  @override
  String get tabRsvp => 'RSVP';

  @override
  String get tabWishes => 'Wishes';

  @override
  String get tabWishlist => 'Wishlist';

  @override
  String get published => 'Published';

  @override
  String get draft => 'Draft';

  @override
  String get statusLiveDescription => 'Your invitation is live and accessible';

  @override
  String get statusDraftDescription => 'Publish to share with guests';

  @override
  String get invitationLink => 'Invitation Link';

  @override
  String get myInvitation => 'My Invitation';

  @override
  String get linkCopied => 'Link copied!';

  @override
  String get publishToActivate =>
      'Publish your invitation to activate the link';

  @override
  String aiPackageLabel(String name) {
    return 'AI Package: $name';
  }

  @override
  String get noAiPackage => 'No AI Package';

  @override
  String editsRemaining(int count) {
    return '$count edits remaining';
  }

  @override
  String get purchaseForEdits => 'Purchase a package for AI edits';

  @override
  String get buy => 'Buy';

  @override
  String get titleLabel => 'Title';

  @override
  String get urlSlug => 'URL slug';

  @override
  String get saveChanges => 'Save Changes';

  @override
  String get savedSuccess => 'Saved!';

  @override
  String errorWithMessage(String message) {
    return 'Error: $message';
  }

  @override
  String get createdDate => 'Created';

  @override
  String get lastModified => 'Last modified';

  @override
  String get notAvailable => 'N/A';

  @override
  String get editInvitation => 'Edit Invitation';

  @override
  String get viewInvitation => 'View Invitation';

  @override
  String get publishButton => 'Publish';

  @override
  String get noRsvpYet => 'No RSVP responses yet';

  @override
  String get rsvpEmptyDescription =>
      'Guests will appear here when they confirm attendance';

  @override
  String get unknownGuest => 'Unknown';

  @override
  String guestCount(int count) {
    return '$count guests';
  }

  @override
  String get attending => 'Attending';

  @override
  String get attendingPlusOne => 'Attending +1';

  @override
  String get attendingWithSpouse => 'Attending with spouse';

  @override
  String get notAttending => 'Not attending';

  @override
  String get noWishesYet => 'No wishes yet';

  @override
  String get wishesEmptyDescription => 'Guest wishes will appear here';

  @override
  String get guestLabel => 'Guest';

  @override
  String get approvedStatus => 'Approved';

  @override
  String get pendingStatus => 'Pending';

  @override
  String get reject => 'Reject';

  @override
  String get approve => 'Approve';

  @override
  String get noGiftsYet => 'No gifts yet';

  @override
  String get giftsEmptyDescription =>
      'Add gifts to your wishlist on the website';

  @override
  String get giftLabel => 'Gift';

  @override
  String get reserved => 'Reserved';

  @override
  String reservedByLabel(String name) {
    return 'by $name';
  }

  @override
  String get openLink => 'Open link';

  @override
  String get invitationPublished => 'Invitation published!';

  @override
  String get errorCreatingPayment => 'Error creating payment';

  @override
  String get deleteInvitation => 'Delete Invitation';

  @override
  String get deleteConfirmation =>
      'Are you sure you want to delete this invitation? This action cannot be undone.';

  @override
  String get cancel => 'Cancel';

  @override
  String get invitationDeleted => 'Invitation deleted';

  @override
  String get failedToDelete => 'Failed to delete';

  @override
  String get guestUser => 'Guest';

  @override
  String get noInvitationsYet => 'No invitations yet';

  @override
  String get createFirstInvitation => 'Create your first AI invitation!';

  @override
  String get errorLoadingInvitations => 'Error loading invitations';

  @override
  String get choosePackageSubtitle =>
      'Choose a package to create AI invitations';

  @override
  String get aiPackagesTitle => 'AI Packages';

  @override
  String get needMoreEdits => 'Need more edits?';

  @override
  String get howPackagesWork => 'How packages work';

  @override
  String get packagesStep1 => 'Choose a package based on your needs';

  @override
  String get packagesStep2 => 'Each AI edit refines your invitation design';

  @override
  String get packagesStep3 => 'Your first message is free — try it now!';

  @override
  String get createInvitationFirst =>
      'Please create an invitation first, then purchase a package.';

  @override
  String get popular => 'POPULAR';

  @override
  String get add => 'Add';

  @override
  String get editsUnit => 'edits';

  @override
  String get mobileView => 'Mobile';

  @override
  String get tabletView => 'Tablet';

  @override
  String get desktopView => 'Desktop';

  @override
  String get editButton => 'Edit';

  @override
  String get shareSubject => 'My Invitation — Invites AI';

  @override
  String get noInvitationYet => 'No invitation yet';

  @override
  String get goBackToChat =>
      'Go back to chat and describe your event to generate an invitation.';

  @override
  String get purchaseSuccess => 'Purchase successful!';

  @override
  String get purchasePending => 'Purchase is being processed...';

  @override
  String get purchaseError => 'Purchase failed. Please try again.';

  @override
  String get restorePurchases => 'Restore Purchases';

  @override
  String get restoringPurchases => 'Restoring purchases...';

  @override
  String get purchasesRestored => 'Purchases restored successfully!';

  @override
  String get noPurchasesToRestore => 'No purchases to restore.';

  @override
  String get priceNotAvailable => 'Price loading...';
}
