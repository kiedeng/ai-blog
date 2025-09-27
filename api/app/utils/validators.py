import re

def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """验证密码强度"""
    if len(password) < 8:
        return False
    
    # 至少包含字母和数字
    has_letter = re.search(r'[a-zA-Z]', password)
    has_digit = re.search(r'\d', password)
    
    return has_letter and has_digit

def validate_username(username):
    """验证用户名格式"""
    # 用户名只能包含字母、数字、下划线和连字符
    pattern = r'^[a-zA-Z0-9_-]{3,20}$'
    return re.match(pattern, username) is not None

def validate_slug(slug):
    """验证slug格式"""
    # slug只能包含字母、数字、连字符
    pattern = r'^[a-z0-9-]+$'
    return re.match(pattern, slug) is not None
