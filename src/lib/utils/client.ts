const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  // Only access localStorage on client side
  if (typeof window === 'undefined') {
    throw new Error('apiRequest can only be called from client side');
  }

  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as HeadersInit),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function apiRequestFormData(
  endpoint: string,
  formData: FormData
): Promise<any> {
  // Only access localStorage on client side
  if (typeof window === 'undefined') {
    throw new Error('apiRequestFormData can only be called from client side');
  }

  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

