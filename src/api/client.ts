const API_BASE = '/api';

async function request(path: string, options?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('na_token');
  
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export const coursesAPI = {
  getAll:  ()                    => request('/courses'),
  getOne:  (id: string)          => request(`/courses/${id}`),
  create:  (data: any)           => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id: string, data: any) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:  (id: string)          => request(`/courses/${id}`, { method: 'DELETE' }),
};

// ─── Videos ───────────────────────────────────────────────────────────────────
export const videosAPI = {
  getAll:  (courseId?: string) => request(`/videos${courseId ? `?courseId=${courseId}` : ''}`),
  create:  (data: any)        => request('/videos', { method: 'POST', body: JSON.stringify(data) }),
  delete:  (id: string)       => request(`/videos/${id}`, { method: 'DELETE' }),
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const notesAPI = {
  getAll:  (courseId?: string) => request(`/notes${courseId ? `?courseId=${courseId}` : ''}`),
  create:  (data: any)        => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  delete:  (id: string)       => request(`/notes/${id}`, { method: 'DELETE' }),
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzesAPI = {
  getAll:  (courseId?: string) => request(`/quizzes${courseId ? `?courseId=${courseId}` : ''}`),
  create:  (data: any)        => request('/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  submit:  (data: any)        => request('/quizzes?action=submit', { method: 'POST', body: JSON.stringify(data) }),
  delete:  (id: string)       => request(`/quizzes/${id}`, { method: 'DELETE' }),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentsAPI = {
  getAll:  () => request('/students'),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  getAll:  (email?: string)             => request(`/payments${email ? `?email=${email}` : ''}`),
  create:  (data: any)                  => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id: string, data: any)      => request(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:   (data: any) => request('/auth', { method: 'POST', body: JSON.stringify(data) }),
  profile: (email: string) => request(`/auth?email=${email}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => request('/analytics'),
};
