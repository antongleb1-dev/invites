// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appName => 'Invites AI';

  @override
  String get tagline => 'Создавайте красивые приглашения с помощью ИИ';

  @override
  String get login => 'Вход';

  @override
  String get signup => 'Регистрация';

  @override
  String get email => 'Email';

  @override
  String get password => 'Пароль';

  @override
  String get name => 'Имя';

  @override
  String get forgotPassword => 'Забыли пароль?';

  @override
  String get orContinueWith => 'или войти через';

  @override
  String get continueAsGuest => 'Продолжить как гость';

  @override
  String get home => 'Главная';

  @override
  String get preview => 'Просмотр';

  @override
  String get tokens => 'Токены';

  @override
  String get profile => 'Профиль';

  @override
  String get createInvitation => 'Создать приглашение';

  @override
  String get promptPlaceholder =>
      'Опишите мероприятие: свадьба, день рождения, корпоратив...';

  @override
  String get generate => 'Создать';

  @override
  String get generating => 'Создание...';

  @override
  String get tokenBalance => 'Баланс токенов';

  @override
  String get buyTokens => 'Купить токены';

  @override
  String get share => 'Поделиться';

  @override
  String get save => 'Сохранить';

  @override
  String get regenerate => 'Пересоздать';

  @override
  String get myInvitations => 'Мои приглашения';

  @override
  String get settings => 'Настройки';

  @override
  String get language => 'Язык';

  @override
  String get logout => 'Выйти';

  @override
  String get howItWorks => 'Как это работает';

  @override
  String get step1 => 'Опишите мероприятие';

  @override
  String get step1Desc =>
      'Расскажите ИИ о событии — свадьба, день рождения, вечеринка';

  @override
  String get step2 => 'Сгенерируйте приглашение';

  @override
  String get step2Desc => 'ИИ создаст красивое персонализированное приглашение';

  @override
  String get step3 => 'Поделитесь с гостями';

  @override
  String get step3Desc => 'Отправьте ссылку вашим гостям';

  @override
  String get welcomeMessage =>
      'Привет! ✨\n\nЯ создам для вас онлайн-приглашение премиального уровня — как из топ-студии дизайна.\n\nРасскажите:\n\n1. Что за событие?\nСвадьба, день рождения, юбилей, корпоратив...\n\n2. Когда и где?\nДата, время и место\n\n3. Какой вайб вам ближе?\n• 🖤 Minimal luxe — чистота, элегантность, whitespace\n• 💫 Editorial — как обложка fashion-журнала\n• 🌿 Organic — мягкие тона, природные текстуры\n• ✨ Modern classic — традиции + современность\n• 🎨 Bold — яркий, нестандартный, запоминающийся\n\nМожете сразу загрузить фото и добавить ссылку на музыку с YouTube — я использую их как основу дизайна! 📸🎵';

  @override
  String get aiDesigner => 'AI Дизайнер';

  @override
  String get aiDesignerSubtitle => 'Создание приглашений с ИИ';

  @override
  String get eventWedding => '💒 Свадьба';

  @override
  String get eventBirthday => '🎂 День рождения';

  @override
  String get eventCorporate => '🏢 Корпоратив';

  @override
  String get eventAnniversary => '🎉 Юбилей';

  @override
  String get eventNewYear => '🎄 Новый год';

  @override
  String get agentAI => 'ИИ';

  @override
  String get agentClassic => 'Классический';

  @override
  String get previewInvitation => 'Посмотреть приглашение';

  @override
  String get generatingInvitation =>
      'Создаю ваше приглашение... Это может занять немного времени.';

  @override
  String get errorNotEnoughTokens =>
      'Недостаточно токенов. Пожалуйста, купите ещё для продолжения.';

  @override
  String get errorGeneral => 'Что-то пошло не так. Попробуйте ещё раз.';

  @override
  String get chatCleared => 'Чат очищен';

  @override
  String get newChat => 'Новый чат';

  @override
  String get saving => 'Сохранение...';

  @override
  String get saved => 'Сохранено';

  @override
  String get creating => 'Создаю...';

  @override
  String get photoFromGallery => 'Фото из галереи';

  @override
  String get takePhoto => 'Сделать фото';

  @override
  String get videoOption => 'Видео';

  @override
  String attachedFiles(int count) {
    return '📎 Прикреплено файлов: $count';
  }

  @override
  String get invitation => 'Приглашение';

  @override
  String loadedForEditing(String title) {
    return 'Загружено «$title» для редактирования. Можете продолжить — просто опишите, что хотите изменить.';
  }

  @override
  String get couldNotLoadInvitation =>
      'Не удалось загрузить приглашение. Попробуйте ещё раз.';

  @override
  String get errorAuth => 'Пожалуйста, войдите для создания приглашений.';

  @override
  String get errorEditLimit =>
      'Вы исчерпали лимит правок. Пожалуйста, купите пакет для продолжения.';

  @override
  String get errorForbidden => 'Доступ запрещён. Проверьте ваш аккаунт.';

  @override
  String get errorTimeout =>
      'Время ожидания истекло. Генерация может занять до 2 минут — попробуйте снова.';

  @override
  String get loading => 'Загрузка...';

  @override
  String get error => 'Ошибка';

  @override
  String get invitationNotFound => 'Приглашение не найдено';

  @override
  String get goBack => 'Назад';

  @override
  String get untitled => 'Без названия';

  @override
  String get delete => 'Удалить';

  @override
  String get tabInfo => 'Инфо';

  @override
  String get tabRsvp => 'RSVP';

  @override
  String get tabWishes => 'Пожелания';

  @override
  String get tabWishlist => 'Подарки';

  @override
  String get published => 'Опубликовано';

  @override
  String get draft => 'Черновик';

  @override
  String get statusLiveDescription => 'Ваше приглашение активно и доступно';

  @override
  String get statusDraftDescription =>
      'Опубликуйте, чтобы поделиться с гостями';

  @override
  String get invitationLink => 'Ссылка на приглашение';

  @override
  String get myInvitation => 'Моё приглашение';

  @override
  String get linkCopied => 'Ссылка скопирована!';

  @override
  String get publishToActivate =>
      'Опубликуйте приглашение, чтобы активировать ссылку';

  @override
  String aiPackageLabel(String name) {
    return 'AI Пакет: $name';
  }

  @override
  String get noAiPackage => 'Нет AI пакета';

  @override
  String editsRemaining(int count) {
    return 'Осталось правок: $count';
  }

  @override
  String get purchaseForEdits => 'Купите пакет для AI-правок';

  @override
  String get buy => 'Купить';

  @override
  String get titleLabel => 'Название';

  @override
  String get urlSlug => 'URL ссылка';

  @override
  String get saveChanges => 'Сохранить изменения';

  @override
  String get savedSuccess => 'Сохранено!';

  @override
  String errorWithMessage(String message) {
    return 'Ошибка: $message';
  }

  @override
  String get createdDate => 'Создано';

  @override
  String get lastModified => 'Последнее изменение';

  @override
  String get notAvailable => 'Н/Д';

  @override
  String get editInvitation => 'Редактировать приглашение';

  @override
  String get viewInvitation => 'Посмотреть приглашение';

  @override
  String get publishButton => 'Опубликовать';

  @override
  String get noRsvpYet => 'Пока нет ответов RSVP';

  @override
  String get rsvpEmptyDescription =>
      'Гости появятся здесь, когда подтвердят участие';

  @override
  String get unknownGuest => 'Неизвестный';

  @override
  String guestCount(int count) {
    return 'Гостей: $count';
  }

  @override
  String get attending => 'Придёт';

  @override
  String get attendingPlusOne => 'Придёт +1';

  @override
  String get attendingWithSpouse => 'Придёт с партнёром';

  @override
  String get notAttending => 'Не придёт';

  @override
  String get noWishesYet => 'Пока нет пожеланий';

  @override
  String get wishesEmptyDescription => 'Пожелания гостей появятся здесь';

  @override
  String get guestLabel => 'Гость';

  @override
  String get approvedStatus => 'Одобрено';

  @override
  String get pendingStatus => 'На модерации';

  @override
  String get reject => 'Отклонить';

  @override
  String get approve => 'Одобрить';

  @override
  String get noGiftsYet => 'Пока нет подарков';

  @override
  String get giftsEmptyDescription => 'Добавьте подарки в вишлист на сайте';

  @override
  String get giftLabel => 'Подарок';

  @override
  String get reserved => 'Забронировано';

  @override
  String reservedByLabel(String name) {
    return 'от $name';
  }

  @override
  String get openLink => 'Открыть ссылку';

  @override
  String get invitationPublished => 'Приглашение опубликовано!';

  @override
  String get errorCreatingPayment => 'Ошибка при оплате';

  @override
  String get deleteInvitation => 'Удалить приглашение';

  @override
  String get deleteConfirmation =>
      'Вы уверены, что хотите удалить это приглашение? Это действие нельзя отменить.';

  @override
  String get cancel => 'Отмена';

  @override
  String get invitationDeleted => 'Приглашение удалено';

  @override
  String get failedToDelete => 'Не удалось удалить';

  @override
  String get guestUser => 'Гость';

  @override
  String get noInvitationsYet => 'Пока нет приглашений';

  @override
  String get createFirstInvitation => 'Создайте ваше первое AI-приглашение!';

  @override
  String get errorLoadingInvitations => 'Ошибка загрузки приглашений';

  @override
  String get choosePackageSubtitle =>
      'Выберите пакет для создания AI-приглашений';

  @override
  String get aiPackagesTitle => 'AI Пакеты';

  @override
  String get needMoreEdits => 'Нужно больше правок?';

  @override
  String get howPackagesWork => 'Как работают пакеты';

  @override
  String get packagesStep1 => 'Выберите пакет по вашим потребностям';

  @override
  String get packagesStep2 => 'Каждая правка улучшает дизайн приглашения';

  @override
  String get packagesStep3 => 'Первое сообщение бесплатно — попробуйте сейчас!';

  @override
  String get createInvitationFirst =>
      'Сначала создайте приглашение, затем купите пакет.';

  @override
  String get popular => 'ПОПУЛЯРНОЕ';

  @override
  String get add => 'Добавить';

  @override
  String get editsUnit => 'правок';

  @override
  String get mobileView => 'Мобильный';

  @override
  String get tabletView => 'Планшет';

  @override
  String get desktopView => 'Десктоп';

  @override
  String get editButton => 'Редактировать';

  @override
  String get shareSubject => 'Моё приглашение — Invites AI';

  @override
  String get noInvitationYet => 'Пока нет приглашения';

  @override
  String get goBackToChat =>
      'Вернитесь в чат и опишите мероприятие для создания приглашения.';

  @override
  String get purchaseSuccess => 'Покупка успешна!';

  @override
  String get purchasePending => 'Покупка обрабатывается...';

  @override
  String get purchaseError => 'Покупка не удалась. Попробуйте ещё раз.';

  @override
  String get restorePurchases => 'Восстановить покупки';

  @override
  String get restoringPurchases => 'Восстановление покупок...';

  @override
  String get purchasesRestored => 'Покупки успешно восстановлены!';

  @override
  String get noPurchasesToRestore => 'Нет покупок для восстановления.';

  @override
  String get priceNotAvailable => 'Загрузка цены...';
}
