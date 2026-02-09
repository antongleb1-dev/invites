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
      'Расскажите ИИ о событии - свадьба, день рождения, вечеринка';

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
      'Привет! Я ваш AI-дизайнер. Помогу создать красивое онлайн-приглашение за считанные минуты.\n\nПросто опишите ваше мероприятие — свадьба, день рождения, корпоратив — и я сгенерирую уникальный сайт-приглашение с RSVP, пожеланиями и выбором подарков.\n\nВыберите тип мероприятия ниже или опишите ваш праздник:';

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
}
