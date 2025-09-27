#!/usr/bin/env python3
"""
创建管理员用户脚本
"""
from app import create_app, db
from app.models.user import User

def create_admin_user():
    """创建管理员用户"""
    app = create_app()
    
    with app.app_context():
        # 检查是否已存在管理员用户
        admin_user = User.query.filter_by(role='admin').first()
        if admin_user:
            print(f"管理员用户已存在: {admin_user.username}")
            return
        
        # 创建管理员用户
        admin_user = User(
            username='admin',
            email='admin@ai-blog.com',
            display_name='系统管理员',
            role='admin',
            bio='系统管理员账户'
        )
        admin_user.set_password('admin123456')
        
        try:
            db.session.add(admin_user)
            db.session.commit()
            print("管理员用户创建成功!")
            print("用户名: admin")
            print("密码: admin123456")
            print("邮箱: admin@ai-blog.com")
        except Exception as e:
            db.session.rollback()
            print(f"创建管理员用户失败: {e}")

if __name__ == '__main__':
    create_admin_user()
