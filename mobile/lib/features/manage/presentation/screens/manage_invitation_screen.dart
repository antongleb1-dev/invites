import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/providers/api_provider.dart';
import '../../../../core/services/iap_service.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../home/providers/chat_provider.dart';

class ManageInvitationScreen extends ConsumerStatefulWidget {
  final int invitationId;

  const ManageInvitationScreen({super.key, required this.invitationId});

  @override
  ConsumerState<ManageInvitationScreen> createState() => _ManageInvitationScreenState();
}

class _ManageInvitationScreenState extends ConsumerState<ManageInvitationScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _titleController = TextEditingController();
  final _slugController = TextEditingController();
  Map<String, dynamic>? _invitation;
  Map<String, dynamic>? _packageStatus;
  List<dynamic> _rsvps = [];
  List<dynamic> _wishes = [];
  List<dynamic> _wishlist = [];
  bool _isLoading = true;
  bool _isDeleting = false;
  bool _isSavingSettings = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _slugController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final api = ref.read(apiServiceProvider);

    try {
      final results = await Future.wait([
        api.getInvitationById(widget.invitationId),
        api.getPackageStatus(widget.invitationId),
        api.getRsvpList(widget.invitationId),
        api.getWishes(widget.invitationId),
        api.getWishlist(widget.invitationId),
      ]);

      setState(() {
        _invitation = results[0] as Map<String, dynamic>?;
        _packageStatus = results[1] as Map<String, dynamic>?;
        _rsvps = results[2] as List<dynamic>;
        _wishes = results[3] as List<dynamic>;
        _wishlist = results[4] as List<dynamic>;
        _isLoading = false;

        if (_invitation != null) {
          _titleController.text = _invitation!['title'] as String? ?? '';
          _slugController.text = _invitation!['slug'] as String? ?? '';
        }
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.loading)),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_invitation == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.error)),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.textMuted),
              const SizedBox(height: 16),
              Text(l10n.invitationNotFound),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/profile'),
                child: Text(l10n.goBack),
              ),
            ],
          ),
        ),
      );
    }

    final title = _invitation!['title'] as String? ?? l10n.untitled;
    final slug = _invitation!['slug'] as String? ?? '';
    final isPaid = _invitation!['isPaid'] as bool? ?? false;
    final isAI = _invitation!['aiGeneratedHtml'] != null;
    final url = 'https://invites.kz/$slug';
    final createdAt = _invitation!['createdAt'];
    final updatedAt = _invitation!['updatedAt'];

    return Scaffold(
      appBar: AppBar(
        title: Text(title, overflow: TextOverflow.ellipsis),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/profile'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => Share.share(url, subject: title),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'delete') _showDeleteDialog();
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                    const SizedBox(width: 8),
                    Text(l10n.delete, style: const TextStyle(color: AppColors.error)),
                  ],
                ),
              ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textMuted,
          indicatorColor: AppColors.primary,
          isScrollable: true,
          tabs: [
            Tab(text: l10n.tabInfo),
            Tab(text: '${l10n.tabRsvp} (${_rsvps.length})'),
            Tab(text: '${l10n.tabWishes} (${_wishes.length})'),
            Tab(text: '${l10n.tabWishlist} (${_wishlist.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildInfoTab(l10n, title, slug, isPaid, isAI, url, createdAt, updatedAt),
          _buildRsvpTab(l10n),
          _buildWishesTab(l10n),
          _buildWishlistTab(l10n),
        ],
      ),
    );
  }

  // ─── Info Tab ───

  Widget _buildInfoTab(AppLocalizations l10n, String title, String slug, bool isPaid,
      bool isAI, String url, dynamic createdAt, dynamic updatedAt) {
    final hasPackage = _packageStatus?['hasPackage'] as bool? ?? false;
    final editsRemaining = _packageStatus?['editsRemaining'] as int? ?? 0;
    final packageName = _packageStatus?['package'] as String? ?? '';

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusCard(l10n, isPaid).animate().fadeIn(duration: 300.ms),
            const SizedBox(height: 16),
            _buildLinkCard(l10n, slug, url, isPaid).animate().fadeIn(delay: 100.ms, duration: 300.ms),
            const SizedBox(height: 16),
            if (isAI) ...[
              _buildPackageCard(l10n, hasPackage, packageName, editsRemaining)
                  .animate().fadeIn(delay: 200.ms, duration: 300.ms),
              const SizedBox(height: 16),
            ],
            _buildEditSettingsCard(l10n).animate().fadeIn(delay: 300.ms, duration: 300.ms),
            const SizedBox(height: 16),
            _buildDatesCard(l10n, createdAt, updatedAt).animate().fadeIn(delay: 400.ms, duration: 300.ms),
            const SizedBox(height: 16),
            _buildActionsCard(l10n, isPaid, isAI).animate().fadeIn(delay: 500.ms, duration: 300.ms),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(AppLocalizations l10n, bool isPaid) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPaid ? Colors.green.withOpacity(0.3) : Colors.orange.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: isPaid ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isPaid ? Icons.check_circle : Icons.pending,
              color: isPaid ? Colors.green : Colors.orange,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isPaid ? l10n.published : l10n.draft,
                  style: AppTypography.titleMedium.copyWith(
                    color: isPaid ? Colors.green : Colors.orange,
                  ),
                ),
                Text(
                  isPaid ? l10n.statusLiveDescription : l10n.statusDraftDescription,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLinkCard(AppLocalizations l10n, String slug, String url, bool isPaid) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.invitationLink, style: AppTypography.titleSmall),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.link, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'invites.kz/$slug',
                    style: AppTypography.bodyMedium.copyWith(
                      color: isPaid ? AppColors.primary : AppColors.textMuted,
                      decoration: isPaid ? TextDecoration.underline : null,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy, size: 20),
                  color: AppColors.primary,
                  onPressed: () {
                    Share.share(url, subject: l10n.myInvitation);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(l10n.linkCopied)),
                    );
                  },
                ),
              ],
            ),
          ),
          if (!isPaid)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                l10n.publishToActivate,
                style: AppTypography.bodySmall.copyWith(color: Colors.orange),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(AppLocalizations l10n, bool hasPackage, String packageName, int editsRemaining) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome, color: AppColors.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hasPackage
                      ? l10n.aiPackageLabel(packageName.toUpperCase())
                      : l10n.noAiPackage,
                  style: AppTypography.titleSmall,
                ),
                Text(
                  hasPackage
                      ? l10n.editsRemaining(editsRemaining)
                      : l10n.purchaseForEdits,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          if (!hasPackage)
            TextButton(
              onPressed: () => context.go('/tokens'),
              child: Text(l10n.buy),
            ),
        ],
      ),
    );
  }

  Widget _buildEditSettingsCard(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(l10n.settings, style: AppTypography.titleSmall),
              const Spacer(),
              if (_isSavingSettings)
                const SizedBox(
                  width: 16, height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: InputDecoration(
              labelText: l10n.titleLabel,
              labelStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _slugController,
            decoration: InputDecoration(
              labelText: l10n.urlSlug,
              prefixText: 'invites.kz/',
              prefixStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isSavingSettings ? null : _saveSettings,
              icon: const Icon(Icons.save, size: 18),
              label: Text(l10n.saveChanges),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _saveSettings() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() => _isSavingSettings = true);
    final api = ref.read(apiServiceProvider);
    try {
      await api.updateWedding(
        id: widget.invitationId,
        title: _titleController.text.trim(),
        slug: _slugController.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.savedSuccess), backgroundColor: Colors.green),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.errorWithMessage(e.toString())), backgroundColor: AppColors.error),
        );
      }
    }
    if (mounted) setState(() => _isSavingSettings = false);
  }

  Widget _buildDatesCard(AppLocalizations l10n, dynamic createdAt, dynamic updatedAt) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          _buildDateRow(Icons.calendar_today, l10n.createdDate, createdAt, l10n),
          const Divider(height: 24),
          _buildDateRow(Icons.update, l10n.lastModified, updatedAt, l10n),
        ],
      ),
    );
  }

  Widget _buildDateRow(IconData icon, String label, dynamic date, AppLocalizations l10n) {
    String dateStr = l10n.notAvailable;
    if (date is String) {
      try {
        final parsed = DateTime.parse(date);
        dateStr = '${parsed.day}.${parsed.month.toString().padLeft(2, '0')}.${parsed.year}';
      } catch (_) {
        dateStr = date;
      }
    }

    return Row(
      children: [
        Icon(icon, color: AppColors.textMuted, size: 20),
        const SizedBox(width: 12),
        Text(label, style: AppTypography.bodyMedium),
        const Spacer(),
        Text(dateStr, style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ],
    );
  }

  Widget _buildActionsCard(AppLocalizations l10n, bool isPaid, bool isAI) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (isAI)
          ElevatedButton.icon(
            onPressed: () async {
              ref.read(chatProvider.notifier).clearChat();
              await ref.read(chatProvider.notifier).loadInvitationForEdit(widget.invitationId);
              if (mounted) context.go('/');
            },
            icon: const Icon(Icons.edit),
            label: Text(l10n.editInvitation),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        if (isAI) const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {
            final slug = _invitation?['slug'] as String?;
            if (slug != null) {
              ref.read(savedSlugProvider.notifier).state = slug;
              final html = _invitation?['aiGeneratedHtml'] as String?;
              if (html != null) {
                ref.read(generatedHtmlProvider.notifier).state = html;
              }
              context.go('/preview');
            }
          },
          icon: const Icon(Icons.visibility),
          label: Text(l10n.viewInvitation),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 14),
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
          ),
        ),
        const SizedBox(height: 12),
        if (!isPaid)
          ElevatedButton.icon(
            onPressed: _handlePublish,
            icon: const Icon(Icons.publish),
            label: Text(l10n.publishButton),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              backgroundColor: Colors.green,
            ),
          ),
      ],
    );
  }

  // ─── RSVP Tab ───

  Widget _buildRsvpTab(AppLocalizations l10n) {
    if (_rsvps.isEmpty) {
      return _buildEmptyTab(Icons.how_to_reg, l10n.noRsvpYet, l10n.rsvpEmptyDescription);
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _rsvps.length,
        itemBuilder: (context, index) {
          final rsvp = _rsvps[index] as Map<String, dynamic>;
          final name = rsvp['name'] as String? ?? l10n.unknownGuest;
          final attending = rsvp['attending'] as String? ?? 'unknown';
          final guestCount = rsvp['guestCount'] as int? ?? 1;
          final phone = rsvp['phone'] as String?;
          final isAttending = attending.startsWith('yes');

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isAttending
                    ? Colors.green.withOpacity(0.2)
                    : Colors.red.withOpacity(0.2),
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: isAttending
                      ? Colors.green.withOpacity(0.1)
                      : Colors.red.withOpacity(0.1),
                  child: Icon(
                    isAttending ? Icons.check : Icons.close,
                    color: isAttending ? Colors.green : Colors.red,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: AppTypography.titleSmall),
                      Text(
                        '${_attendingLabel(attending, l10n)} • ${l10n.guestCount(guestCount)}',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                      ),
                      if (phone != null)
                        Text(phone,
                            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: index * 50), duration: 300.ms);
        },
      ),
    );
  }

  String _attendingLabel(String status, AppLocalizations l10n) {
    switch (status) {
      case 'yes':
        return l10n.attending;
      case 'yes_plus_one':
        return l10n.attendingPlusOne;
      case 'yes_with_spouse':
        return l10n.attendingWithSpouse;
      case 'no':
        return l10n.notAttending;
      default:
        return status;
    }
  }

  // ─── Wishes Tab ───

  Widget _buildWishesTab(AppLocalizations l10n) {
    if (_wishes.isEmpty) {
      return _buildEmptyTab(Icons.favorite, l10n.noWishesYet, l10n.wishesEmptyDescription);
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _wishes.length,
        itemBuilder: (context, index) {
          final wish = _wishes[index] as Map<String, dynamic>;
          final name = wish['guestName'] as String? ?? l10n.guestLabel;
          final message = wish['message'] as String? ?? '';
          final isApproved = wish['isApproved'] as bool? ?? false;
          final wishId = wish['id'] as int? ?? 0;

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(name, style: AppTypography.titleSmall),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isApproved
                            ? Colors.green.withOpacity(0.1)
                            : Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        isApproved ? l10n.approvedStatus : l10n.pendingStatus,
                        style: AppTypography.labelSmall.copyWith(
                          color: isApproved ? Colors.green : Colors.orange,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(message, style: AppTypography.bodyMedium),
                if (!isApproved) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => _handleWishAction(wishId, false),
                        child: Text(l10n.reject, style: const TextStyle(color: AppColors.error)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => _handleWishAction(wishId, true),
                        child: Text(l10n.approve),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: index * 50), duration: 300.ms);
        },
      ),
    );
  }

  // ─── Wishlist Tab ───

  Widget _buildWishlistTab(AppLocalizations l10n) {
    if (_wishlist.isEmpty) {
      return _buildEmptyTab(Icons.card_giftcard, l10n.noGiftsYet, l10n.giftsEmptyDescription);
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _wishlist.length,
        itemBuilder: (context, index) {
          final item = _wishlist[index] as Map<String, dynamic>;
          final name = item['name'] as String? ?? l10n.giftLabel;
          final description = item['description'] as String?;
          final link = item['link'] as String?;
          final reservedBy = item['reservedBy'] as String?;
          final isReserved = reservedBy != null;

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: isReserved
                  ? Border.all(color: Colors.green.withOpacity(0.2))
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.card_giftcard, color: AppColors.primary, size: 20),
                    const SizedBox(width: 8),
                    Expanded(child: Text(name, style: AppTypography.titleSmall)),
                    if (isReserved)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          l10n.reserved,
                          style: AppTypography.labelSmall.copyWith(color: Colors.green),
                        ),
                      ),
                  ],
                ),
                if (description != null) ...[
                  const SizedBox(height: 4),
                  Text(description,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary)),
                ],
                if (isReserved) ...[
                  const SizedBox(height: 4),
                  Text(l10n.reservedByLabel(reservedBy),
                      style: AppTypography.bodySmall.copyWith(color: Colors.green)),
                ],
                if (link != null) ...[
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication),
                    child: Text(
                      l10n.openLink,
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.primary,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: index * 50), duration: 300.ms);
        },
      ),
    );
  }

  // ─── Empty state ───

  Widget _buildEmptyTab(IconData icon, String title, String subtitle) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: AppColors.textMuted),
          const SizedBox(height: 16),
          Text(title, style: AppTypography.titleMedium),
          const SizedBox(height: 4),
          Text(subtitle,
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }

  // ─── Actions ───

  void _handlePublish() async {
    final l10n = AppLocalizations.of(context)!;
    final api = ref.read(apiServiceProvider);

    // Try free activation first (if user has AI package)
    final activated = await api.activateFreeWithAIPackage(widget.invitationId);
    if (activated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.invitationPublished), backgroundColor: Colors.green),
        );
      }
      _loadData();
      return;
    }

    // Use In-App Purchase for publishing
    final iapService = ref.read(iapServiceProvider.notifier);
    iapService.onPurchaseSuccess = () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.invitationPublished), backgroundColor: Colors.green),
        );
        _loadData();
      }
    };

    final success = await iapService.purchasePublish(weddingId: widget.invitationId);
    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.errorCreatingPayment), backgroundColor: AppColors.error),
      );
    }
  }

  void _handleWishAction(int wishId, bool approve) async {
    final api = ref.read(apiServiceProvider);
    bool success;
    if (approve) {
      success = await api.approveWish(wishId, widget.invitationId);
    } else {
      success = await api.rejectWish(wishId, widget.invitationId);
    }
    if (success) {
      _loadData();
    }
  }

  void _showDeleteDialog() {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.deleteInvitation),
        content: Text(l10n.deleteConfirmation),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              setState(() => _isDeleting = true);
              final api = ref.read(apiServiceProvider);
              final deleted = await api.deleteInvitation(widget.invitationId);
              if (deleted && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(l10n.invitationDeleted)),
                );
                context.go('/profile');
              } else if (mounted) {
                setState(() => _isDeleting = false);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(l10n.failedToDelete), backgroundColor: AppColors.error),
                );
              }
            },
            child: Text(l10n.delete, style: const TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}
