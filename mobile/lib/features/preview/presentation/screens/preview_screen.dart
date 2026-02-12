import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/providers/api_provider.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../home/providers/chat_provider.dart';

class PreviewScreen extends ConsumerStatefulWidget {
  final String? invitationId;

  const PreviewScreen({super.key, this.invitationId});

  @override
  ConsumerState<PreviewScreen> createState() => _PreviewScreenState();
}

class _PreviewScreenState extends ConsumerState<PreviewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String _viewMode = 'mobile';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      );

    _loadContent();
  }

  Future<void> _loadContent() async {
    // Priority 1: Generated HTML in memory
    final generatedHtml = ref.read(generatedHtmlProvider);
    if (generatedHtml != null && generatedHtml.isNotEmpty) {
      _controller.loadHtmlString(generatedHtml);
      return;
    }

    // Priority 2: Slug from state
    final slug = ref.read(savedSlugProvider);
    if (slug != null && slug.isNotEmpty) {
      _controller.loadRequest(Uri.parse('https://invites.kz/$slug'));
      return;
    }

    // Priority 3: Invitation ID passed as parameter — fetch slug from API
    if (widget.invitationId != null) {
      final id = int.tryParse(widget.invitationId!);
      if (id != null) {
        try {
          final api = ref.read(apiServiceProvider);
          final invitation = await api.getInvitationById(id);
          if (invitation != null) {
            // If it has AI-generated HTML, load directly
            final html = invitation['aiGeneratedHtml'] as String?;
            if (html != null && html.isNotEmpty) {
              _controller.loadHtmlString(html);
              return;
            }
            // Otherwise load by slug
            final invSlug = invitation['slug'] as String?;
            if (invSlug != null) {
              _controller.loadRequest(Uri.parse('https://invites.kz/$invSlug'));
              return;
            }
          }
        } catch (e) {
          // Fall through to empty
        }
      } else {
        // invitationId might be a slug string directly
        _controller.loadRequest(Uri.parse('https://invites.kz/${widget.invitationId}'));
        return;
      }
    }

    // Fallback: empty
    _controller.loadHtmlString(_getEmptyHtml());
  }

  String _getEmptyHtml() {
    return '''
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #fff9e6, #fff5d6);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 20px;
        }
        .empty { text-align: center; color: #999; }
        .empty h2 { color: #d4af37; }
      </style>
    </head>
    <body>
      <div class="empty">
        <h2>No invitation yet</h2>
        <p>Go back to chat and describe your event to generate an invitation.</p>
      </div>
    </body>
    </html>
    ''';
  }

  void _shareInvitation() {
    final slug = ref.read(savedSlugProvider);
    final shareUrl = slug != null
        ? 'https://invites.kz/$slug'
        : 'https://invites.kz/${widget.invitationId ?? ""}';

    final l10n = AppLocalizations.of(context);
    Share.share(shareUrl, subject: l10n?.shareSubject ?? 'My Invitation — Invites AI');
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final slug = ref.watch(savedSlugProvider);
    final generatedHtml = ref.watch(generatedHtmlProvider);
    final hasContent = generatedHtml != null || slug != null || widget.invitationId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.preview),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
        actions: [
          if (hasContent) ...[
            PopupMenuButton<String>(
              icon: const Icon(Icons.devices),
              onSelected: (mode) {
                setState(() => _viewMode = mode);
              },
              itemBuilder: (context) => [
                PopupMenuItem(value: 'mobile', child: Text(l10n.mobileView)),
                PopupMenuItem(value: 'tablet', child: Text(l10n.tabletView)),
                PopupMenuItem(value: 'desktop', child: Text(l10n.desktopView)),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: _shareInvitation,
            ),
          ],
        ],
      ),
      body: Stack(
        children: [
          Center(
            child: SizedBox(
              width: _getViewWidth(),
              child: WebViewWidget(controller: _controller),
            ),
          ),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
        ],
      ),
      bottomNavigationBar: hasContent
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _shareInvitation,
                        icon: const Icon(Icons.share),
                        label: Text(l10n.share),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: AppColors.primary),
                          foregroundColor: AppColors.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => context.go('/'),
                        icon: const Icon(Icons.edit),
                        label: Text(l10n.editButton),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }

  double? _getViewWidth() {
    switch (_viewMode) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
        return null;
      default:
        return null;
    }
  }
}
