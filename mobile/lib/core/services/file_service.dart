import 'dart:io';

import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';

class FileService {
  Future<String> tempPath(String fileName) async {
    final dir = await getTemporaryDirectory();
    return '${dir.path}${Platform.pathSeparator}$fileName';
  }

  /// Returns null on success, otherwise a user-facing message.
  Future<String?> open(String path) async {
    final result = await OpenFilex.open(path);
    if (result.type == ResultType.done) return null;
    if (result.type == ResultType.noAppToOpen) {
      return 'No app found to open this file.';
    }
    return result.message.isEmpty ? 'Unable to open the file.' : result.message;
  }
}
