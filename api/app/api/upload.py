from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from app.utils.helpers import allowed_file
import os
import uuid
from datetime import datetime

bp = Blueprint('upload', __name__)

# 配置
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'txt', 'md'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

@bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    """上传图片"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': '没有选择文件'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': '没有选择文件'
            }), 400
        
        if not allowed_file(file.filename, ALLOWED_EXTENSIONS):
            return jsonify({
                'success': False,
                'message': '不支持的文件类型'
            }), 400
        
        # 检查文件大小
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'message': '文件大小超过限制'
            }), 400
        
        # 生成安全的文件名
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4()}{ext}"
        
        # 创建上传目录
        upload_dir = os.path.join(UPLOAD_FOLDER, 'images', datetime.now().strftime('%Y/%m'))
        os.makedirs(upload_dir, exist_ok=True)
        
        # 保存文件
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # 返回文件URL
        file_url = f"/uploads/images/{datetime.now().strftime('%Y/%m')}/{unique_filename}"
        
        return jsonify({
            'success': True,
            'data': {
                'filename': unique_filename,
                'original_name': filename,
                'url': file_url,
                'size': file_size
            },
            'message': '上传成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/file', methods=['POST'])
@jwt_required()
def upload_file():
    """上传文件"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': '没有选择文件'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': '没有选择文件'
            }), 400
        
        if not allowed_file(file.filename, ALLOWED_EXTENSIONS):
            return jsonify({
                'success': False,
                'message': '不支持的文件类型'
            }), 400
        
        # 检查文件大小
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'message': '文件大小超过限制'
            }), 400
        
        # 生成安全的文件名
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4()}{ext}"
        
        # 创建上传目录
        upload_dir = os.path.join(UPLOAD_FOLDER, 'files', datetime.now().strftime('%Y/%m'))
        os.makedirs(upload_dir, exist_ok=True)
        
        # 保存文件
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # 返回文件URL
        file_url = f"/uploads/files/{datetime.now().strftime('%Y/%m')}/{unique_filename}"
        
        return jsonify({
            'success': True,
            'data': {
                'filename': unique_filename,
                'original_name': filename,
                'url': file_url,
                'size': file_size
            },
            'message': '上传成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
