const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  // 更新token的方法
  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '网络错误' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('无法连接到服务器，请检查网络连接或服务器状态');
      }
      throw error;
    }
  }

  // 认证相关
  async login(username: string, password: string) {
    const response = await this.request<{
      success: boolean;
      data: { user: any; token: string };
      message: string;
    }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

      if (response.success) {
        this.token = response.data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.data.token);
        }
      }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }) {
    return this.request<{
      success: boolean;
      data: { user: any; token: string };
      message: string;
    }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<{
      success: boolean;
      data: any;
    }>('/api/profile');
  }

  async logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // 文章相关
  async getPosts(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    category_id?: number;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<{
      success: boolean;
      data: {
        posts: any[];
        pagination: any;
      };
    }>(`/api/posts?${searchParams.toString()}`);
  }

  async getPost(id: number) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/api/posts/${id}`);
  }

  async getPostBySlug(slug: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/api/posts/slug/${slug}`);
  }

  async createPost(postData: {
    title: string;
    content: string;
    status?: string;
    is_featured?: boolean;
    tags?: string[];
    meta_title?: string;
    meta_description?: string;
    category_id?: number;
  }) {
    return this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: number, postData: any) {
    return this.request<{
      success: boolean;
      data: any;
      message: string;
    }>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: number) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // 文件上传
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{
      success: boolean;
      data: {
        filename: string;
        original_name: string;
        url: string;
        size: number;
      };
      message: string;
    }>('/api/upload/image', {
      method: 'POST',
      headers: {}, // 让浏览器自动设置Content-Type
      body: formData,
    });
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{
      success: boolean;
      data: {
        filename: string;
        original_name: string;
        url: string;
        size: number;
      };
      message: string;
    }>('/api/upload/file', {
      method: 'POST',
      headers: {}, // 让浏览器自动设置Content-Type
      body: formData,
    });
  }

  // 分类相关
  async getCategories() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/api/admin/categories');
  }

  async createCategory(categoryData: {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    icon?: string;
    sort_order?: number;
  }) {
    return this.request<{
      success: boolean;
      data: any;
      message: string;
    }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
