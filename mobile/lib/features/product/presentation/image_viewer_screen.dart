import 'package:flutter/material.dart';

import '../../../shared/widgets/app_network_image.dart';

/// Full-screen pinch-to-zoom gallery.
class ImageViewerScreen extends StatefulWidget {
  const ImageViewerScreen({super.key, required this.images, this.initialIndex = 0});
  final List<String> images;
  final int initialIndex;

  static Future<void> open(BuildContext context, List<String> images, int index) {
    return Navigator.of(context, rootNavigator: true).push(PageRouteBuilder<void>(
      opaque: false,
      barrierColor: Colors.black,
      pageBuilder: (_, __, ___) => ImageViewerScreen(images: images, initialIndex: index),
      transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
    ));
  }

  @override
  State<ImageViewerScreen> createState() => _ImageViewerScreenState();
}

class _ImageViewerScreenState extends State<ImageViewerScreen> {
  late final PageController _controller = PageController(initialPage: widget.initialIndex);
  late int _index = widget.initialIndex;
  final TransformationController _transform = TransformationController();

  @override
  void dispose() {
    _controller.dispose();
    _transform.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('${_index + 1} / ${widget.images.length}',
            style: const TextStyle(color: Colors.white, fontSize: 15)),
      ),
      body: PageView.builder(
        controller: _controller,
        itemCount: widget.images.length,
        onPageChanged: (i) {
          _transform.value = Matrix4.identity();
          setState(() => _index = i);
        },
        itemBuilder: (_, i) => InteractiveViewer(
          transformationController: i == _index ? _transform : null,
          minScale: 1,
          maxScale: 5,
          child: Center(
            child: AppNetworkImage(url: widget.images[i], fit: BoxFit.contain, targetWidth: 1200),
          ),
        ),
      ),
    );
  }
}
