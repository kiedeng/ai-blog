from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Post, Category, Comment
from sqlalchemy import desc, asc

bp = Blueprint('admin', __name__)

def admin_required(f):
    """管理员权限装饰器"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role != 'admin':
            return jsonify({
                'success': False,
                'message': '需要管理员权限'
            }), 403
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_stats():
    """获取统计数据"""
    try:
        stats = {
            'users': User.query.count(),
            'posts': Post.query.count(),
            'published_posts': Post.query.filter_by(status='published').count(),
            'draft_posts': Post.query.filter_by(status='draft').count(),
            'categories': Category.query.count(),
            'comments': Comment.query.count(),
            'pending_comments': Comment.query.filter_by(status='pending').count()
        }
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """获取用户列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                User.username.contains(search) |
                User.email.contains(search) |
                User.display_name.contains(search)
            )
        
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        users = pagination.items
        
        return jsonify({
            'success': True,
            'data': {
                'users': [user.to_dict() for user in users],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': pagination.total,
                    'pages': pagination.pages,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/categories', methods=['GET'])
@jwt_required()
@admin_required
def get_categories():
    """获取分类列表"""
    try:
        categories = Category.query.order_by(Category.sort_order, Category.name).all()
        
        return jsonify({
            'success': True,
            'data': [category.to_dict() for category in categories]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/categories', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    """创建分类"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({
                'success': False,
                'message': '分类名称不能为空'
            }), 400
        
        # 检查分类名是否已存在
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({
                'success': False,
                'message': '分类名称已存在'
            }), 400
        
        category = Category(
            name=data['name'],
            slug=data.get('slug', data['name'].lower().replace(' ', '-')),
            description=data.get('description', ''),
            color=data.get('color'),
            icon=data.get('icon'),
            sort_order=data.get('sort_order', 0)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': category.to_dict(),
            'message': '分类创建成功'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category(category_id):
    """更新分类"""
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        if 'name' in data:
            category.name = data['name']
        
        if 'slug' in data:
            category.slug = data['slug']
        
        if 'description' in data:
            category.description = data['description']
        
        if 'color' in data:
            category.color = data['color']
        
        if 'icon' in data:
            category.icon = data['icon']
        
        if 'sort_order' in data:
            category.sort_order = data['sort_order']
        
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': category.to_dict(),
            'message': '分类更新成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_category(category_id):
    """删除分类"""
    try:
        category = Category.query.get_or_404(category_id)
        
        # 检查是否有文章使用此分类
        if category.posts.count() > 0:
            return jsonify({
                'success': False,
                'message': '该分类下还有文章，无法删除'
            }), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '分类删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
