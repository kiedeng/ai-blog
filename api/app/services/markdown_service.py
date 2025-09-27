import markdown
import bleach
from markdown.extensions import codehilite, tables, toc, fenced_code
from markdown.extensions.toc import TocExtension
import re

class MarkdownService:
    def __init__(self):
        # 配置Markdown扩展
        self.extensions = [
            'codehilite',
            'tables',
            'toc',
            'fenced_code',
            'nl2br',
            'attr_list'
        ]
        
        # 配置扩展选项
        self.extension_configs = {
            'codehilite': {
                'css_class': 'highlight',
                'use_pygments': True,
                'noclasses': False
            },
            'toc': {
                'permalink': True,
                'permalink_title': '永久链接',
                'baselevel': 1
            }
        }
        
        # 允许的HTML标签
        self.allowed_tags = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'strong', 'b', 'em', 'i', 'u', 's', 'del',
            'ul', 'ol', 'li',
            'blockquote',
            'code', 'pre',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span',
            'details', 'summary'
        ]
        
        # 允许的HTML属性
        self.allowed_attributes = {
            '*': ['class', 'id'],
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'table': ['class'],
            'th': ['scope'],
            'td': ['colspan', 'rowspan']
        }
    
    def render_html(self, markdown_content):
        """将Markdown转换为HTML"""
        try:
            # 创建Markdown实例
            md = markdown.Markdown(
                extensions=self.extensions,
                extension_configs=self.extension_configs
            )
            
            # 转换Markdown为HTML
            html = md.convert(markdown_content)
            
            # 清理HTML，防止XSS攻击
            clean_html = bleach.clean(
                html,
                tags=self.allowed_tags,
                attributes=self.allowed_attributes,
                strip=True
            )
            
            return clean_html
            
        except Exception as e:
            print(f"Markdown渲染错误: {e}")
            return f"<p>Markdown渲染错误: {str(e)}</p>"
    
    def extract_metadata(self, markdown_content):
        """提取Markdown元数据"""
        metadata = {}
        
        # 提取YAML前置元数据
        if markdown_content.startswith('---'):
            try:
                import yaml
                parts = markdown_content.split('---', 2)
                if len(parts) >= 3:
                    yaml_content = parts[1].strip()
                    metadata = yaml.safe_load(yaml_content) or {}
            except:
                pass
        
        return metadata
    
    def extract_toc(self, markdown_content):
        """提取目录结构"""
        toc = []
        lines = markdown_content.split('\n')
        
        for line in lines:
            # 匹配标题
            match = re.match(r'^(#{1,6})\s+(.+)$', line.strip())
            if match:
                level = len(match.group(1))
                title = match.group(2).strip()
                
                # 生成锚点
                anchor = re.sub(r'[^\w\s-]', '', title.lower())
                anchor = re.sub(r'[-\s]+', '-', anchor)
                anchor = anchor.strip('-')
                
                toc.append({
                    'level': level,
                    'title': title,
                    'anchor': anchor
                })
        
        return toc
    
    def process_images(self, html_content, base_url=''):
        """处理图片URL"""
        # 将相对路径转换为绝对路径
        if base_url:
            html_content = re.sub(
                r'src="([^"]+)"',
                lambda m: f'src="{base_url}{m.group(1)}"',
                html_content
            )
        
        return html_content
    
    def highlight_code(self, html_content):
        """代码高亮处理"""
        # 这里可以添加自定义的代码高亮逻辑
        return html_content
