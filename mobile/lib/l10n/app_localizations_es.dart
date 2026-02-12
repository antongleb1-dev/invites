// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get appName => 'Invites AI';

  @override
  String get tagline => 'Crea hermosas invitaciones con IA';

  @override
  String get login => 'Iniciar sesión';

  @override
  String get signup => 'Registrarse';

  @override
  String get email => 'Correo';

  @override
  String get password => 'Contraseña';

  @override
  String get name => 'Nombre';

  @override
  String get forgotPassword => '¿Olvidaste tu contraseña?';

  @override
  String get orContinueWith => 'o continuar con';

  @override
  String get continueAsGuest => 'Continuar como invitado';

  @override
  String get home => 'Inicio';

  @override
  String get preview => 'Vista previa';

  @override
  String get tokens => 'Tokens';

  @override
  String get profile => 'Perfil';

  @override
  String get createInvitation => 'Crear invitación';

  @override
  String get promptPlaceholder =>
      'Describe tu evento: boda, cumpleaños, corporativo...';

  @override
  String get generate => 'Generar';

  @override
  String get generating => 'Generando...';

  @override
  String get tokenBalance => 'Saldo de tokens';

  @override
  String get buyTokens => 'Comprar tokens';

  @override
  String get share => 'Compartir';

  @override
  String get save => 'Guardar';

  @override
  String get regenerate => 'Regenerar';

  @override
  String get myInvitations => 'Mis invitaciones';

  @override
  String get settings => 'Configuración';

  @override
  String get language => 'Idioma';

  @override
  String get logout => 'Cerrar sesión';

  @override
  String get howItWorks => 'Cómo funciona';

  @override
  String get step1 => 'Describe tu evento';

  @override
  String get step1Desc =>
      'Cuéntale a la IA sobre tu evento — boda, cumpleaños, fiesta';

  @override
  String get step2 => 'Genera la invitación';

  @override
  String get step2Desc => 'La IA crea una invitación hermosa y personalizada';

  @override
  String get step3 => 'Comparte con los invitados';

  @override
  String get step3Desc => 'Envía el enlace a tus invitados';

  @override
  String get welcomeMessage =>
      '¡Hola! ✨\n\nCrearé una invitación online de nivel premium para ti — como de un estudio de diseño top.\n\nCuéntame:\n\n1. ¿Qué evento es?\nBoda, cumpleaños, aniversario, evento corporativo...\n\n2. ¿Cuándo y dónde?\nFecha, hora y lugar\n\n3. ¿Qué estilo te gusta más?\n• 🖤 Minimal luxe — limpio, elegante, espacioso\n• 💫 Editorial — como portada de revista de moda\n• 🌿 Orgánico — tonos suaves, texturas naturales\n• ✨ Clásico moderno — tradición + modernidad\n• 🎨 Bold — brillante, atrevido, memorable\n\n¡Puedes subir fotos y agregar un enlace de música de YouTube — los usaré como base del diseño! 📸🎵';

  @override
  String get aiDesigner => 'Diseñador IA';

  @override
  String get aiDesignerSubtitle => 'Crea invitaciones con IA';

  @override
  String get eventWedding => '💒 Boda';

  @override
  String get eventBirthday => '🎂 Cumpleaños';

  @override
  String get eventCorporate => '🏢 Corporativo';

  @override
  String get eventAnniversary => '🎉 Aniversario';

  @override
  String get eventNewYear => '🎄 Año Nuevo';

  @override
  String get agentAI => 'IA';

  @override
  String get agentClassic => 'Clásico';

  @override
  String get previewInvitation => 'Ver invitación';

  @override
  String get generatingInvitation =>
      'Creando tu invitación... Esto puede tomar un momento.';

  @override
  String get errorNotEnoughTokens =>
      'No hay suficientes tokens. Compra más para continuar.';

  @override
  String get errorGeneral => 'Algo salió mal. Inténtalo de nuevo.';

  @override
  String get chatCleared => 'Chat borrado';

  @override
  String get newChat => 'Nuevo chat';

  @override
  String get saving => 'Guardando...';

  @override
  String get saved => 'Guardado';

  @override
  String get creating => 'Creando...';

  @override
  String get photoFromGallery => 'Foto de la galería';

  @override
  String get takePhoto => 'Tomar foto';

  @override
  String get videoOption => 'Video';

  @override
  String attachedFiles(int count) {
    return '📎 $count archivo(s) adjunto(s)';
  }

  @override
  String get invitation => 'Invitación';

  @override
  String loadedForEditing(String title) {
    return 'Se cargó «$title» para editar. Puedes seguir haciendo cambios — solo describe lo que quieres modificar.';
  }

  @override
  String get couldNotLoadInvitation =>
      'No se pudo cargar la invitación. Inténtalo de nuevo.';

  @override
  String get errorAuth => 'Por favor, inicia sesión para generar invitaciones.';

  @override
  String get errorEditLimit =>
      'Has alcanzado tu límite de ediciones. Compra un paquete para continuar.';

  @override
  String get errorForbidden => 'Acceso denegado. Verifica tu cuenta.';

  @override
  String get errorTimeout =>
      'Tiempo de espera agotado. La generación IA puede tardar hasta 2 minutos — inténtalo de nuevo.';

  @override
  String get loading => 'Cargando...';

  @override
  String get error => 'Error';

  @override
  String get invitationNotFound => 'Invitación no encontrada';

  @override
  String get goBack => 'Volver';

  @override
  String get untitled => 'Sin título';

  @override
  String get delete => 'Eliminar';

  @override
  String get tabInfo => 'Info';

  @override
  String get tabRsvp => 'RSVP';

  @override
  String get tabWishes => 'Deseos';

  @override
  String get tabWishlist => 'Lista de regalos';

  @override
  String get published => 'Publicada';

  @override
  String get draft => 'Borrador';

  @override
  String get statusLiveDescription => 'Tu invitación está activa y accesible';

  @override
  String get statusDraftDescription =>
      'Publica para compartir con los invitados';

  @override
  String get invitationLink => 'Enlace de invitación';

  @override
  String get myInvitation => 'Mi invitación';

  @override
  String get linkCopied => '¡Enlace copiado!';

  @override
  String get publishToActivate =>
      'Publica tu invitación para activar el enlace';

  @override
  String aiPackageLabel(String name) {
    return 'Paquete IA: $name';
  }

  @override
  String get noAiPackage => 'Sin paquete IA';

  @override
  String editsRemaining(int count) {
    return '$count ediciones restantes';
  }

  @override
  String get purchaseForEdits => 'Compra un paquete para ediciones IA';

  @override
  String get buy => 'Comprar';

  @override
  String get titleLabel => 'Título';

  @override
  String get urlSlug => 'Enlace URL';

  @override
  String get saveChanges => 'Guardar cambios';

  @override
  String get savedSuccess => '¡Guardado!';

  @override
  String errorWithMessage(String message) {
    return 'Error: $message';
  }

  @override
  String get createdDate => 'Creado';

  @override
  String get lastModified => 'Última modificación';

  @override
  String get notAvailable => 'N/D';

  @override
  String get editInvitation => 'Editar invitación';

  @override
  String get viewInvitation => 'Ver invitación';

  @override
  String get publishButton => 'Publicar';

  @override
  String get noRsvpYet => 'Aún no hay respuestas RSVP';

  @override
  String get rsvpEmptyDescription =>
      'Los invitados aparecerán aquí cuando confirmen asistencia';

  @override
  String get unknownGuest => 'Desconocido';

  @override
  String guestCount(int count) {
    return '$count invitados';
  }

  @override
  String get attending => 'Asistirá';

  @override
  String get attendingPlusOne => 'Asistirá +1';

  @override
  String get attendingWithSpouse => 'Asistirá con pareja';

  @override
  String get notAttending => 'No asistirá';

  @override
  String get noWishesYet => 'Aún no hay deseos';

  @override
  String get wishesEmptyDescription =>
      'Los deseos de los invitados aparecerán aquí';

  @override
  String get guestLabel => 'Invitado';

  @override
  String get approvedStatus => 'Aprobado';

  @override
  String get pendingStatus => 'Pendiente';

  @override
  String get reject => 'Rechazar';

  @override
  String get approve => 'Aprobar';

  @override
  String get noGiftsYet => 'Aún no hay regalos';

  @override
  String get giftsEmptyDescription =>
      'Agrega regalos a tu lista en el sitio web';

  @override
  String get giftLabel => 'Regalo';

  @override
  String get reserved => 'Reservado';

  @override
  String reservedByLabel(String name) {
    return 'por $name';
  }

  @override
  String get openLink => 'Abrir enlace';

  @override
  String get invitationPublished => '¡Invitación publicada!';

  @override
  String get errorCreatingPayment => 'Error al crear el pago';

  @override
  String get deleteInvitation => 'Eliminar invitación';

  @override
  String get deleteConfirmation =>
      '¿Estás seguro de que quieres eliminar esta invitación? Esta acción no se puede deshacer.';

  @override
  String get cancel => 'Cancelar';

  @override
  String get invitationDeleted => 'Invitación eliminada';

  @override
  String get failedToDelete => 'No se pudo eliminar';

  @override
  String get guestUser => 'Invitado';

  @override
  String get noInvitationsYet => 'Aún no hay invitaciones';

  @override
  String get createFirstInvitation => '¡Crea tu primera invitación con IA!';

  @override
  String get errorLoadingInvitations => 'Error al cargar invitaciones';

  @override
  String get choosePackageSubtitle =>
      'Elige un paquete para crear invitaciones con IA';

  @override
  String get aiPackagesTitle => 'Paquetes IA';

  @override
  String get needMoreEdits => '¿Necesitas más ediciones?';

  @override
  String get howPackagesWork => 'Cómo funcionan los paquetes';

  @override
  String get packagesStep1 => 'Elige un paquete según tus necesidades';

  @override
  String get packagesStep2 => 'Cada edición mejora el diseño de tu invitación';

  @override
  String get packagesStep3 => '¡Tu primer mensaje es gratis — pruébalo ahora!';

  @override
  String get createInvitationFirst =>
      'Primero crea una invitación y luego compra un paquete.';

  @override
  String get popular => 'POPULAR';

  @override
  String get add => 'Agregar';

  @override
  String get editsUnit => 'ediciones';

  @override
  String get mobileView => 'Móvil';

  @override
  String get tabletView => 'Tableta';

  @override
  String get desktopView => 'Escritorio';

  @override
  String get editButton => 'Editar';

  @override
  String get shareSubject => 'Mi invitación — Invites AI';

  @override
  String get noInvitationYet => 'Aún no hay invitación';

  @override
  String get goBackToChat =>
      'Vuelve al chat y describe tu evento para generar una invitación.';

  @override
  String get purchaseSuccess => '¡Compra exitosa!';

  @override
  String get purchasePending => 'Compra en proceso...';

  @override
  String get purchaseError => 'La compra falló. Inténtalo de nuevo.';

  @override
  String get restorePurchases => 'Restaurar compras';

  @override
  String get restoringPurchases => 'Restaurando compras...';

  @override
  String get purchasesRestored => '¡Compras restauradas exitosamente!';

  @override
  String get noPurchasesToRestore => 'No hay compras para restaurar.';

  @override
  String get priceNotAvailable => 'Cargando precio...';
}
