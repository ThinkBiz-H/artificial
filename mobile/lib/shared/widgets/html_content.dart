import 'package:flutter/material.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';

import '../../core/services/launcher_service.dart';
import '../../core/utils/formatters.dart';

/// Renders CMS/product HTML (or plain text) with themed typography.
class HtmlContent extends StatelessWidget {
  const HtmlContent({super.key, required this.content, this.style});
  final String content;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final base = style ?? Theme.of(context).textTheme.bodyMedium;
    if (!Formatters.looksLikeHtml(content)) {
      return Text(content, style: base);
    }
    return HtmlWidget(
      content,
      textStyle: base,
      onTapUrl: (url) => LauncherService().openUrl(url),
      customStylesBuilder: (element) {
        if (element.localName == 'h1' || element.localName == 'h2' || element.localName == 'h3') {
          return {'font-family': 'serif', 'font-weight': '600'};
        }
        return null;
      },
    );
  }
}
