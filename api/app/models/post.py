from app import db
from datetime import datetime
import uuid
import re

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)  # 原始Markdown内容
    html_content = db.Column(db.Text, nullable=True)  # 渲染后的HTML
    excerpt = db.Column(db.Text, nullable=True)  # 摘要
    cover_image = db.Column(db.String(255), nullable=True)  # 封面图片
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    is_featured = db.Column(db.Boolean, default=False)  # 是否精选
    view_count = db.Column(db.Integer, default=0)  # 浏览次数
    like_count = db.Column(db.Integer, default=0)  # 点赞数
    comment_count = db.Column(db.Integer, default=0)  # 评论数
    tags = db.Column(db.JSON, nullable=True)  # 标签列表
    meta_title = db.Column(db.String(200), nullable=True)  # SEO标题
    meta_description = db.Column(db.Text, nullable=True)  # SEO描述
    published_at = db.Column(db.DateTime, nullable=True)  # 发布时间
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 外键
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    
    # 关系
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    
    def generate_slug(self):
        """生成URL友好的slug"""
        if not self.title:
            return None
        
        # 转换为小写，替换空格为连字符，移除特殊字符
        slug = self.title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        # 确保唯一性
        base_slug = slug
        counter = 1
        while Post.query.filter(Post.slug == slug, Post.id != self.id).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def update_slug(self):
        """更新slug"""
        self.slug = self.generate_slug()
    
    def extract_excerpt(self, max_length=200):
        """从内容中提取摘要"""
        if not self.content:
            return None
        
        # 移除Markdown标记
        import re
        text = re.sub(r'#+\s*', '', self.content)  # 移除标题标记
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # 移除粗体标记
        text = re.sub(r'\*(.*?)\*', r'\1', text)  # 移除斜体标记
        text = re.sub(r'`(.*?)`', r'\1', text)  # 移除代码标记
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # 移除链接，保留文本
        text = re.sub(r'\n+', ' ', text)  # 替换换行为空格
        text = text.strip()
        
        if len(text) <= max_length:
            return text
        
        return text[:max_length].rsplit(' ', 1)[0] + '...'
    
    def to_dict(self, include_content=False):
        """转换为字典"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'cover_image': self.cover_image,
            'status': self.status,
            'is_featured': self.is_featured,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'comment_count': self.comment_count,
            'tags': self.tags or [],
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict() if self.author else None,
            'category': self.category.to_dict() if self.category else None
        }
        
        if include_content:
            data['content'] = self.content
            data['html_content'] = self.html_content
        
        return data
    
    def __repr__(self):
        return f'<Post {self.title}>'
