from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
# from flask_limiter import Limiter
# from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv
from flask_cors import CORS

# 加载环境变量
load_dotenv()

# 初始化扩展
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # 配置CORS，允许跨域请求
    CORS(app, 
         origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],  # 允许的前端地址
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  # 允许的HTTP方法
         allow_headers=['Content-Type', 'Authorization'],  # 允许的请求头
         supports_credentials=True)  # 允许携带凭证
    
    # 配置
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://kieden:kd180616@192.168.31.183:3366/ai-blog')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    # 文件上传配置
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    
    # 创建上传目录
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'images'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'files'), exist_ok=True)
    
    # 注册蓝图
    from app.api import posts, auth, upload, admin
    app.register_blueprint(posts.bp, url_prefix='/api')
    app.register_blueprint(auth.bp, url_prefix='/api')
    app.register_blueprint(upload.bp, url_prefix='/api')
    app.register_blueprint(admin.bp, url_prefix='/api')
    
    # 添加全局OPTIONS处理，确保CORS预检请求正常工作
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
    
    return app
