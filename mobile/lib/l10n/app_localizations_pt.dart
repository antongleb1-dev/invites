// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Portuguese (`pt`).
class AppLocalizationsPt extends AppLocalizations {
  AppLocalizationsPt([String locale = 'pt']) : super(locale);

  @override
  String get appName => 'Invites AI';

  @override
  String get tagline => 'Crie convites lindos com IA';

  @override
  String get login => 'Entrar';

  @override
  String get signup => 'Cadastrar';

  @override
  String get email => 'Email';

  @override
  String get password => 'Senha';

  @override
  String get name => 'Nome';

  @override
  String get forgotPassword => 'Esqueceu a senha?';

  @override
  String get orContinueWith => 'ou continue com';

  @override
  String get continueAsGuest => 'Continuar como convidado';

  @override
  String get home => 'Início';

  @override
  String get preview => 'Prévia';

  @override
  String get tokens => 'Tokens';

  @override
  String get profile => 'Perfil';

  @override
  String get createInvitation => 'Criar convite';

  @override
  String get promptPlaceholder =>
      'Descreva seu evento: casamento, aniversário, corporativo...';

  @override
  String get generate => 'Gerar';

  @override
  String get generating => 'Gerando...';

  @override
  String get tokenBalance => 'Saldo de tokens';

  @override
  String get buyTokens => 'Comprar tokens';

  @override
  String get share => 'Compartilhar';

  @override
  String get save => 'Salvar';

  @override
  String get regenerate => 'Regenerar';

  @override
  String get myInvitations => 'Meus convites';

  @override
  String get settings => 'Configurações';

  @override
  String get language => 'Idioma';

  @override
  String get logout => 'Sair';

  @override
  String get howItWorks => 'Como funciona';

  @override
  String get step1 => 'Descreva seu evento';

  @override
  String get step1Desc =>
      'Conte à IA sobre seu evento — casamento, aniversário, festa';

  @override
  String get step2 => 'Gere o convite';

  @override
  String get step2Desc => 'A IA cria um convite bonito e personalizado';

  @override
  String get step3 => 'Compartilhe com os convidados';

  @override
  String get step3Desc => 'Envie o link para seus convidados';

  @override
  String get welcomeMessage =>
      'Olá! ✨\n\nVou criar um convite online de nível premium para você — como de um estúdio de design top.\n\nMe conte:\n\n1. Qual é o evento?\nCasamento, aniversário, jubileu, evento corporativo...\n\n2. Quando e onde?\nData, horário e local\n\n3. Qual estilo combina mais com você?\n• 🖤 Minimal luxe — limpo, elegante, espaçoso\n• 💫 Editorial — como capa de revista de moda\n• 🌿 Orgânico — tons suaves, texturas naturais\n• ✨ Clássico moderno — tradição + modernidade\n• 🎨 Bold — vibrante, ousado, marcante\n\nVocê pode enviar fotos e adicionar um link de música do YouTube — vou usar como base do design! 📸🎵';

  @override
  String get aiDesigner => 'Designer IA';

  @override
  String get aiDesignerSubtitle => 'Crie convites com IA';

  @override
  String get eventWedding => '💒 Casamento';

  @override
  String get eventBirthday => '🎂 Aniversário';

  @override
  String get eventCorporate => '🏢 Corporativo';

  @override
  String get eventAnniversary => '🎉 Jubileu';

  @override
  String get eventNewYear => '🎄 Ano Novo';

  @override
  String get agentAI => 'IA';

  @override
  String get agentClassic => 'Clássico';

  @override
  String get previewInvitation => 'Ver convite';

  @override
  String get generatingInvitation =>
      'Criando seu convite... Isso pode levar um momento.';

  @override
  String get errorNotEnoughTokens =>
      'Tokens insuficientes. Compre mais para continuar.';

  @override
  String get errorGeneral => 'Algo deu errado. Tente novamente.';

  @override
  String get chatCleared => 'Chat limpo';

  @override
  String get newChat => 'Novo chat';

  @override
  String get saving => 'Salvando...';

  @override
  String get saved => 'Salvo';

  @override
  String get creating => 'Criando...';

  @override
  String get photoFromGallery => 'Foto da galeria';

  @override
  String get takePhoto => 'Tirar foto';

  @override
  String get videoOption => 'Vídeo';

  @override
  String attachedFiles(int count) {
    return '📎 $count arquivo(s) anexado(s)';
  }

  @override
  String get invitation => 'Convite';

  @override
  String loadedForEditing(String title) {
    return '«$title» carregado para edição. Você pode continuar fazendo alterações — basta descrever o que deseja modificar.';
  }

  @override
  String get couldNotLoadInvitation =>
      'Não foi possível carregar o convite. Tente novamente.';

  @override
  String get errorAuth => 'Por favor, faça login para gerar convites.';

  @override
  String get errorEditLimit =>
      'Você atingiu o limite de edições. Compre um pacote para continuar.';

  @override
  String get errorForbidden => 'Acesso negado. Verifique sua conta.';

  @override
  String get errorTimeout =>
      'Tempo esgotado. A geração IA pode levar até 2 minutos — tente novamente.';

  @override
  String get loading => 'Carregando...';

  @override
  String get error => 'Erro';

  @override
  String get invitationNotFound => 'Convite não encontrado';

  @override
  String get goBack => 'Voltar';

  @override
  String get untitled => 'Sem título';

  @override
  String get delete => 'Excluir';

  @override
  String get tabInfo => 'Info';

  @override
  String get tabRsvp => 'RSVP';

  @override
  String get tabWishes => 'Desejos';

  @override
  String get tabWishlist => 'Lista de presentes';

  @override
  String get published => 'Publicado';

  @override
  String get draft => 'Rascunho';

  @override
  String get statusLiveDescription => 'Seu convite está ativo e acessível';

  @override
  String get statusDraftDescription =>
      'Publique para compartilhar com os convidados';

  @override
  String get invitationLink => 'Link do convite';

  @override
  String get myInvitation => 'Meu convite';

  @override
  String get linkCopied => 'Link copiado!';

  @override
  String get publishToActivate => 'Publique seu convite para ativar o link';

  @override
  String aiPackageLabel(String name) {
    return 'Pacote IA: $name';
  }

  @override
  String get noAiPackage => 'Sem pacote IA';

  @override
  String editsRemaining(int count) {
    return '$count edições restantes';
  }

  @override
  String get purchaseForEdits => 'Compre um pacote para edições IA';

  @override
  String get buy => 'Comprar';

  @override
  String get titleLabel => 'Título';

  @override
  String get urlSlug => 'Link URL';

  @override
  String get saveChanges => 'Salvar alterações';

  @override
  String get savedSuccess => 'Salvo!';

  @override
  String errorWithMessage(String message) {
    return 'Erro: $message';
  }

  @override
  String get createdDate => 'Criado';

  @override
  String get lastModified => 'Última modificação';

  @override
  String get notAvailable => 'N/D';

  @override
  String get editInvitation => 'Editar convite';

  @override
  String get viewInvitation => 'Ver convite';

  @override
  String get publishButton => 'Publicar';

  @override
  String get noRsvpYet => 'Ainda sem respostas RSVP';

  @override
  String get rsvpEmptyDescription =>
      'Convidados aparecerão aqui quando confirmarem presença';

  @override
  String get unknownGuest => 'Desconhecido';

  @override
  String guestCount(int count) {
    return '$count convidados';
  }

  @override
  String get attending => 'Confirmado';

  @override
  String get attendingPlusOne => 'Confirmado +1';

  @override
  String get attendingWithSpouse => 'Confirmado com acompanhante';

  @override
  String get notAttending => 'Não vai';

  @override
  String get noWishesYet => 'Ainda sem desejos';

  @override
  String get wishesEmptyDescription => 'Desejos dos convidados aparecerão aqui';

  @override
  String get guestLabel => 'Convidado';

  @override
  String get approvedStatus => 'Aprovado';

  @override
  String get pendingStatus => 'Pendente';

  @override
  String get reject => 'Rejeitar';

  @override
  String get approve => 'Aprovar';

  @override
  String get noGiftsYet => 'Ainda sem presentes';

  @override
  String get giftsEmptyDescription => 'Adicione presentes à sua lista no site';

  @override
  String get giftLabel => 'Presente';

  @override
  String get reserved => 'Reservado';

  @override
  String reservedByLabel(String name) {
    return 'por $name';
  }

  @override
  String get openLink => 'Abrir link';

  @override
  String get invitationPublished => 'Convite publicado!';

  @override
  String get errorCreatingPayment => 'Erro ao criar pagamento';

  @override
  String get deleteInvitation => 'Excluir convite';

  @override
  String get deleteConfirmation =>
      'Tem certeza que deseja excluir este convite? Esta ação não pode ser desfeita.';

  @override
  String get cancel => 'Cancelar';

  @override
  String get invitationDeleted => 'Convite excluído';

  @override
  String get failedToDelete => 'Falha ao excluir';

  @override
  String get guestUser => 'Convidado';

  @override
  String get noInvitationsYet => 'Ainda sem convites';

  @override
  String get createFirstInvitation => 'Crie seu primeiro convite com IA!';

  @override
  String get errorLoadingInvitations => 'Erro ao carregar convites';

  @override
  String get choosePackageSubtitle =>
      'Escolha um pacote para criar convites com IA';

  @override
  String get aiPackagesTitle => 'Pacotes IA';

  @override
  String get needMoreEdits => 'Precisa de mais edições?';

  @override
  String get howPackagesWork => 'Como funcionam os pacotes';

  @override
  String get packagesStep1 => 'Escolha um pacote conforme suas necessidades';

  @override
  String get packagesStep2 => 'Cada edição melhora o design do seu convite';

  @override
  String get packagesStep3 =>
      'Sua primeira mensagem é grátis — experimente agora!';

  @override
  String get createInvitationFirst =>
      'Primeiro crie um convite, depois compre um pacote.';

  @override
  String get popular => 'POPULAR';

  @override
  String get add => 'Adicionar';

  @override
  String get editsUnit => 'edições';

  @override
  String get mobileView => 'Celular';

  @override
  String get tabletView => 'Tablet';

  @override
  String get desktopView => 'Desktop';

  @override
  String get editButton => 'Editar';

  @override
  String get shareSubject => 'Meu convite — Invites AI';

  @override
  String get noInvitationYet => 'Ainda sem convite';

  @override
  String get goBackToChat =>
      'Volte ao chat e descreva seu evento para gerar um convite.';

  @override
  String get purchaseSuccess => 'Compra realizada com sucesso!';

  @override
  String get purchasePending => 'Compra em processamento...';

  @override
  String get purchaseError => 'Compra falhou. Tente novamente.';

  @override
  String get restorePurchases => 'Restaurar compras';

  @override
  String get restoringPurchases => 'Restaurando compras...';

  @override
  String get purchasesRestored => 'Compras restauradas com sucesso!';

  @override
  String get noPurchasesToRestore => 'Nenhuma compra para restaurar.';

  @override
  String get priceNotAvailable => 'Carregando preço...';
}
