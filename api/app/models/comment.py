from app import db
from datetime import datetime
import uuid

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    is_reply = db.Column(db.Boolean, default=False)  # 是否为回复
    like_count = db.Column(db.Integer, default=0)  # 点赞数
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 外键
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # 允许匿名评论
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)  # 回复的评论ID
    
    # 关系
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    def to_dict(self, include_replies=True):
        """转换为字典"""
        data = {
            'id': self.id,
            'uuid': self.uuid,
            'content': self.content,
            'status': self.status,
            'is_reply': self.is_reply,
            'like_count': self.like_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict() if self.author else None,
            'post_id': self.post_id,
            'parent_id': self.parent_id
        }
        
        if include_replies and self.replies:
            data['replies'] = [reply.to_dict(include_replies=False) for reply in self.replies.filter_by(status='approved')]
        
        return data
    
    def __repr__(self):
        return f'<Comment {self.id}>'
