import os
from werkzeug.utils import secure_filename

def allowed_file(filename, allowed_extensions):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_file_extension(filename):
    """获取文件扩展名"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def create_directory(path):
    """创建目录"""
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def get_file_size(file):
    """获取文件大小"""
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    return size

def format_file_size(size):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def sanitize_filename(filename):
    """清理文件名"""
    # 移除危险字符
    filename = secure_filename(filename)
    # 限制长度
    if len(filename) > 100:
        name, ext = os.path.splitext(filename)
        filename = name[:95] + ext
    return filename
