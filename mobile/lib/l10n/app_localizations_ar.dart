// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'Invites AI';

  @override
  String get tagline => 'أنشئ دعوات جميلة بالذكاء الاصطناعي';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get signup => 'إنشاء حساب';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get name => 'الاسم';

  @override
  String get forgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get orContinueWith => 'أو تابع عبر';

  @override
  String get continueAsGuest => 'المتابعة كضيف';

  @override
  String get home => 'الرئيسية';

  @override
  String get preview => 'معاينة';

  @override
  String get tokens => 'توكنات';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get createInvitation => 'إنشاء دعوة';

  @override
  String get promptPlaceholder => 'صِف مناسبتك: زفاف، عيد ميلاد، مؤتمر...';

  @override
  String get generate => 'إنشاء';

  @override
  String get generating => 'جارٍ الإنشاء...';

  @override
  String get tokenBalance => 'رصيد التوكنات';

  @override
  String get buyTokens => 'شراء توكنات';

  @override
  String get share => 'مشاركة';

  @override
  String get save => 'حفظ';

  @override
  String get regenerate => 'إعادة الإنشاء';

  @override
  String get myInvitations => 'دعواتي';

  @override
  String get settings => 'الإعدادات';

  @override
  String get language => 'اللغة';

  @override
  String get logout => 'تسجيل الخروج';

  @override
  String get howItWorks => 'كيف يعمل';

  @override
  String get step1 => 'صِف مناسبتك';

  @override
  String get step1Desc =>
      'أخبر الذكاء الاصطناعي عن مناسبتك — زفاف، عيد ميلاد، حفلة';

  @override
  String get step2 => 'أنشئ الدعوة';

  @override
  String get step2Desc => 'الذكاء الاصطناعي يصمم دعوة جميلة ومخصصة';

  @override
  String get step3 => 'شاركها مع الضيوف';

  @override
  String get step3Desc => 'أرسل الرابط لضيوفك';

  @override
  String get welcomeMessage =>
      'مرحبًا! ✨\n\nسأصمم لك دعوة إلكترونية بمستوى احترافي — كأنها من أفضل استوديو تصميم.\n\nأخبرني:\n\n1. ما هي المناسبة؟\nزفاف، عيد ميلاد، ذكرى سنوية، حفل شركة...\n\n2. متى وأين؟\nالتاريخ والوقت والمكان\n\n3. أي أسلوب يناسبك أكثر؟\n• 🖤 Minimal luxe — نظيف، أنيق، مساحات واسعة\n• 💫 Editorial — كغلاف مجلة أزياء\n• 🌿 Organic — ألوان ناعمة، ملمس طبيعي\n• ✨ Modern classic — تقاليد + حداثة\n• 🎨 Bold — جريء، مميز، لا يُنسى\n\nيمكنك تحميل صور وإضافة رابط موسيقى من YouTube — سأستخدمها كأساس للتصميم! 📸🎵';

  @override
  String get aiDesigner => 'مصمم AI';

  @override
  String get aiDesignerSubtitle => 'أنشئ دعوات بالذكاء الاصطناعي';

  @override
  String get eventWedding => '💒 زفاف';

  @override
  String get eventBirthday => '🎂 عيد ميلاد';

  @override
  String get eventCorporate => '🏢 مؤتمر';

  @override
  String get eventAnniversary => '🎉 ذكرى سنوية';

  @override
  String get eventNewYear => '🎄 رأس السنة';

  @override
  String get agentAI => 'AI';

  @override
  String get agentClassic => 'كلاسيكي';

  @override
  String get previewInvitation => 'معاينة الدعوة';

  @override
  String get generatingInvitation => 'جارٍ إنشاء دعوتك... قد يستغرق هذا لحظات.';

  @override
  String get errorNotEnoughTokens =>
      'التوكنات غير كافية. يرجى شراء المزيد للمتابعة.';

  @override
  String get errorGeneral => 'حدث خطأ ما. حاول مرة أخرى.';

  @override
  String get chatCleared => 'تم مسح المحادثة';

  @override
  String get newChat => 'محادثة جديدة';

  @override
  String get saving => 'جارٍ الحفظ...';

  @override
  String get saved => 'تم الحفظ';

  @override
  String get creating => 'جارٍ الإنشاء...';

  @override
  String get photoFromGallery => 'صورة من المعرض';

  @override
  String get takePhoto => 'التقاط صورة';

  @override
  String get videoOption => 'فيديو';

  @override
  String attachedFiles(int count) {
    return '📎 تم إرفاق $count ملف(ات)';
  }

  @override
  String get invitation => 'دعوة';

  @override
  String loadedForEditing(String title) {
    return 'تم تحميل «$title» للتعديل. يمكنك متابعة التغييرات — فقط صِف ما تريد تعديله.';
  }

  @override
  String get couldNotLoadInvitation => 'لم يتم تحميل الدعوة. حاول مرة أخرى.';

  @override
  String get errorAuth => 'يرجى تسجيل الدخول لإنشاء الدعوات.';

  @override
  String get errorEditLimit =>
      'لقد وصلت إلى حد التعديلات. اشترِ حزمة للمتابعة.';

  @override
  String get errorForbidden => 'تم رفض الوصول. يرجى التحقق من حسابك.';

  @override
  String get errorTimeout =>
      'انتهت مهلة الطلب. قد يستغرق الإنشاء حتى دقيقتين — حاول مرة أخرى.';

  @override
  String get loading => 'جارٍ التحميل...';

  @override
  String get error => 'خطأ';

  @override
  String get invitationNotFound => 'الدعوة غير موجودة';

  @override
  String get goBack => 'العودة';

  @override
  String get untitled => 'بدون عنوان';

  @override
  String get delete => 'حذف';

  @override
  String get tabInfo => 'معلومات';

  @override
  String get tabRsvp => 'RSVP';

  @override
  String get tabWishes => 'أمنيات';

  @override
  String get tabWishlist => 'قائمة الهدايا';

  @override
  String get published => 'منشورة';

  @override
  String get draft => 'مسودة';

  @override
  String get statusLiveDescription => 'دعوتك نشطة ومتاحة';

  @override
  String get statusDraftDescription => 'انشرها لمشاركتها مع الضيوف';

  @override
  String get invitationLink => 'رابط الدعوة';

  @override
  String get myInvitation => 'دعوتي';

  @override
  String get linkCopied => 'تم نسخ الرابط!';

  @override
  String get publishToActivate => 'انشر دعوتك لتفعيل الرابط';

  @override
  String aiPackageLabel(String name) {
    return 'حزمة AI: $name';
  }

  @override
  String get noAiPackage => 'لا توجد حزمة AI';

  @override
  String editsRemaining(int count) {
    return '$count تعديل(ات) متبقية';
  }

  @override
  String get purchaseForEdits => 'اشترِ حزمة لتعديلات AI';

  @override
  String get buy => 'شراء';

  @override
  String get titleLabel => 'العنوان';

  @override
  String get urlSlug => 'رابط URL';

  @override
  String get saveChanges => 'حفظ التغييرات';

  @override
  String get savedSuccess => 'تم الحفظ!';

  @override
  String errorWithMessage(String message) {
    return 'خطأ: $message';
  }

  @override
  String get createdDate => 'تاريخ الإنشاء';

  @override
  String get lastModified => 'آخر تعديل';

  @override
  String get notAvailable => 'غير متاح';

  @override
  String get editInvitation => 'تعديل الدعوة';

  @override
  String get viewInvitation => 'عرض الدعوة';

  @override
  String get publishButton => 'نشر';

  @override
  String get noRsvpYet => 'لا توجد ردود RSVP حتى الآن';

  @override
  String get rsvpEmptyDescription => 'سيظهر الضيوف هنا عند تأكيد الحضور';

  @override
  String get unknownGuest => 'مجهول';

  @override
  String guestCount(int count) {
    return '$count ضيوف';
  }

  @override
  String get attending => 'سيحضر';

  @override
  String get attendingPlusOne => 'سيحضر +1';

  @override
  String get attendingWithSpouse => 'سيحضر مع شريك';

  @override
  String get notAttending => 'لن يحضر';

  @override
  String get noWishesYet => 'لا توجد أمنيات حتى الآن';

  @override
  String get wishesEmptyDescription => 'ستظهر أمنيات الضيوف هنا';

  @override
  String get guestLabel => 'ضيف';

  @override
  String get approvedStatus => 'معتمد';

  @override
  String get pendingStatus => 'قيد الانتظار';

  @override
  String get reject => 'رفض';

  @override
  String get approve => 'قبول';

  @override
  String get noGiftsYet => 'لا توجد هدايا حتى الآن';

  @override
  String get giftsEmptyDescription => 'أضف هدايا إلى قائمتك على الموقع';

  @override
  String get giftLabel => 'هدية';

  @override
  String get reserved => 'محجوز';

  @override
  String reservedByLabel(String name) {
    return 'من $name';
  }

  @override
  String get openLink => 'فتح الرابط';

  @override
  String get invitationPublished => 'تم نشر الدعوة!';

  @override
  String get errorCreatingPayment => 'خطأ في إنشاء الدفع';

  @override
  String get deleteInvitation => 'حذف الدعوة';

  @override
  String get deleteConfirmation =>
      'هل أنت متأكد من حذف هذه الدعوة؟ لا يمكن التراجع عن هذا الإجراء.';

  @override
  String get cancel => 'إلغاء';

  @override
  String get invitationDeleted => 'تم حذف الدعوة';

  @override
  String get failedToDelete => 'فشل الحذف';

  @override
  String get guestUser => 'ضيف';

  @override
  String get noInvitationsYet => 'لا توجد دعوات حتى الآن';

  @override
  String get createFirstInvitation => 'أنشئ أول دعوة AI خاصة بك!';

  @override
  String get errorLoadingInvitations => 'خطأ في تحميل الدعوات';

  @override
  String get choosePackageSubtitle =>
      'اختر حزمة لإنشاء دعوات بالذكاء الاصطناعي';

  @override
  String get aiPackagesTitle => 'حزم AI';

  @override
  String get needMoreEdits => 'تحتاج تعديلات أكثر؟';

  @override
  String get howPackagesWork => 'كيف تعمل الحزم';

  @override
  String get packagesStep1 => 'اختر حزمة حسب احتياجاتك';

  @override
  String get packagesStep2 => 'كل تعديل يحسّن تصميم دعوتك';

  @override
  String get packagesStep3 => 'رسالتك الأولى مجانية — جرّب الآن!';

  @override
  String get createInvitationFirst => 'أنشئ دعوة أولاً، ثم اشترِ حزمة.';

  @override
  String get popular => 'شائع';

  @override
  String get add => 'إضافة';

  @override
  String get editsUnit => 'تعديلات';

  @override
  String get mobileView => 'هاتف';

  @override
  String get tabletView => 'جهاز لوحي';

  @override
  String get desktopView => 'كمبيوتر';

  @override
  String get editButton => 'تعديل';

  @override
  String get shareSubject => 'دعوتي — Invites AI';

  @override
  String get noInvitationYet => 'لا توجد دعوة حتى الآن';

  @override
  String get goBackToChat => 'ارجع إلى المحادثة وصِف مناسبتك لإنشاء دعوة.';

  @override
  String get purchaseSuccess => 'تمت عملية الشراء بنجاح!';

  @override
  String get purchasePending => 'جارٍ معالجة الشراء...';

  @override
  String get purchaseError => 'فشلت عملية الشراء. حاول مرة أخرى.';

  @override
  String get restorePurchases => 'استعادة المشتريات';

  @override
  String get restoringPurchases => 'جارٍ استعادة المشتريات...';

  @override
  String get purchasesRestored => 'تم استعادة المشتريات بنجاح!';

  @override
  String get noPurchasesToRestore => 'لا توجد مشتريات للاستعادة.';

  @override
  String get priceNotAvailable => 'جارٍ تحميل السعر...';
}
