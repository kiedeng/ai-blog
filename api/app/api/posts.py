from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Post, Category, User
from app.services.markdown_service import MarkdownService
from sqlalchemy import desc, asc
import json

bp = Blueprint('posts', __name__)
markdown_service = MarkdownService()

@bp.route('/posts', methods=['GET'])
def get_posts():
    """获取文章列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'published')
        category_id = request.args.get('category_id', type=int)
        search = request.args.get('search', '')
        sort = request.args.get('sort', 'created_at')
        order = request.args.get('order', 'desc')
        
        # 构建查询
        query = Post.query
        
        # 状态过滤
        if status:
            query = query.filter(Post.status == status)
        
        # 分类过滤
        if category_id:
            query = query.filter(Post.category_id == category_id)
        
        # 搜索过滤
        if search:
            query = query.filter(
                Post.title.contains(search) | 
                Post.content.contains(search) |
                Post.excerpt.contains(search)
            )
        
        # 排序
        if order == 'desc':
            query = query.order_by(desc(getattr(Post, sort)))
        else:
            query = query.order_by(asc(getattr(Post, sort)))
        
        # 分页
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        posts = pagination.items
        
        return jsonify({
            'success': True,
            'data': {
                'posts': [post.to_dict() for post in posts],
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

@bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """获取单篇文章"""
    try:
        post = Post.query.get_or_404(post_id)
        
        # 增加浏览次数
        post.view_count += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': post.to_dict(include_content=True)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/posts/slug/<slug>', methods=['GET'])
def get_post_by_slug(slug):
    """通过slug获取文章"""
    try:
        post = Post.query.filter_by(slug=slug).first_or_404()
        
        # 增加浏览次数
        post.view_count += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': post.to_dict(include_content=True)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """创建文章"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        if not data.get('title'):
            return jsonify({
                'success': False,
                'message': '标题不能为空'
            }), 400
        
        if not data.get('content'):
            return jsonify({
                'success': False,
                'message': '内容不能为空'
            }), 400
        
        # 创建文章
        post = Post(
            title=data['title'],
            content=data['content'],
            status=data.get('status', 'draft'),
            is_featured=data.get('is_featured', False),
            tags=data.get('tags', []),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
            author_id=int(get_jwt_identity()),
            category_id=data.get('category_id')
        )
        
        # 生成slug
        post.update_slug()
        
        # 提取摘要
        post.excerpt = post.extract_excerpt()
        
        # 处理Markdown内容
        html_content = markdown_service.render_html(post.content)
        post.html_content = html_content
        
        # 如果是发布状态，设置发布时间
        if post.status == 'published':
            post.published_at = db.func.now()
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': post.to_dict(include_content=True),
            'message': '文章创建成功'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """更新文章"""
    try:
        post = Post.query.get_or_404(post_id)
        
        # 检查权限
        if post.author_id != int(get_jwt_identity()):
            return jsonify({
                'success': False,
                'message': '无权限修改此文章'
            }), 403
        
        data = request.get_json()
        
        # 更新字段
        if 'title' in data:
            post.title = data['title']
            post.update_slug()  # 更新slug
        
        if 'content' in data:
            post.content = data['content']
            # 重新处理Markdown内容
            html_content = markdown_service.render_html(post.content)
            post.html_content = html_content
            post.excerpt = post.extract_excerpt()
        
        if 'status' in data:
            post.status = data['status']
            if post.status == 'published' and not post.published_at:
                post.published_at = db.func.now()
        
        if 'is_featured' in data:
            post.is_featured = data['is_featured']
        
        if 'tags' in data:
            post.tags = data['tags']
        
        if 'meta_title' in data:
            post.meta_title = data['meta_title']
        
        if 'meta_description' in data:
            post.meta_description = data['meta_description']
        
        if 'category_id' in data:
            post.category_id = data['category_id']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': post.to_dict(include_content=True),
            'message': '文章更新成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """删除文章"""
    try:
        post = Post.query.get_or_404(post_id)
        
        # 检查权限
        if post.author_id != int(get_jwt_identity()):
            return jsonify({
                'success': False,
                'message': '无权限删除此文章'
            }), 403
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '文章删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
