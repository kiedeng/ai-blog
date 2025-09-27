from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
from app.utils.validators import validate_email, validate_password
from datetime import datetime
import re

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        if not data.get('username'):
            return jsonify({
                'success': False,
                'message': '用户名不能为空'
            }), 400
        
        if not data.get('email'):
            return jsonify({
                'success': False,
                'message': '邮箱不能为空'
            }), 400
        
        if not data.get('password'):
            return jsonify({
                'success': False,
                'message': '密码不能为空'
            }), 400
        
        # 验证邮箱格式
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': '邮箱格式不正确'
            }), 400
        
        # 验证密码强度
        if not validate_password(data['password']):
            return jsonify({
                'success': False,
                'message': '密码至少8位，包含字母和数字'
            }), 400
        
        # 检查用户名是否已存在
        if User.query.filter_by(username=data['username']).first():
            return jsonify({
                'success': False,
                'message': '用户名已存在'
            }), 400
        
        # 检查邮箱是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': '邮箱已存在'
            }), 400
        
        # 创建用户
        user = User(
            username=data['username'],
            email=data['email'],
            display_name=data.get('display_name', data['username']),
            bio=data.get('bio', '')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # 生成token
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'token': token
            },
            'message': '注册成功'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        if not data.get('username') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': '用户名和密码不能为空'
            }), 400
        
        # 查找用户（支持用户名或邮箱登录）
        user = User.query.filter(
            (User.username == data['username']) | 
            (User.email == data['username'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': '用户名或密码错误'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': '账户已被禁用'
            }), 401
        
        # 更新最后登录时间
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # 生成token
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict(),
                'token': token
            },
            'message': '登录成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """获取用户信息"""
    try:
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """更新用户信息"""
    try:
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        # 更新字段
        if 'display_name' in data:
            user.display_name = data['display_name']
        
        if 'bio' in data:
            user.bio = data['bio']
        
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        
        # 如果更新邮箱，需要验证
        if 'email' in data and data['email'] != user.email:
            if not validate_email(data['email']):
                return jsonify({
                    'success': False,
                    'message': '邮箱格式不正确'
                }), 400
            
            # 检查邮箱是否已存在
            if User.query.filter(User.email == data['email'], User.id != user.id).first():
                return jsonify({
                    'success': False,
                    'message': '邮箱已存在'
                }), 400
            
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': user.to_dict(),
            'message': '信息更新成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """修改密码"""
    try:
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在'
            }), 404
        
        data = request.get_json()
        
        # 验证旧密码
        if not user.check_password(data.get('old_password', '')):
            return jsonify({
                'success': False,
                'message': '旧密码错误'
            }), 400
        
        # 验证新密码
        if not validate_password(data.get('new_password', '')):
            return jsonify({
                'success': False,
                'message': '新密码至少8位，包含字母和数字'
            }), 400
        
        # 更新密码
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '密码修改成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
