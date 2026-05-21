import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${datePart}-${randomPart}`;
}

export function getTimeAgo(dateInput: string | Date): string {
  const now = new Date();
  const date = new Date(dateInput);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
}

export function formatTime(dateInput: string | Date): string {
  return new Date(dateInput).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateInput: string | Date): string {
  return new Date(dateInput).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput: string | Date): string {
  return new Date(dateInput).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSizeLabel(size: string): string {
  const labels: Record<string, string> = {
    small: 'S',
    medium: 'M',
    large: 'L',
  };
  return labels[size] || size;
}

export function getTemperatureLabel(temp: string): string {
  const labels: Record<string, string> = {
    hot: 'Hot',
    iced: 'Iced',
  };
  return labels[temp] || temp;
}

export function getSugarLabel(level: string): string {
  const labels: Record<string, string> = {
    normal: 'Normal Sugar',
    less: 'Less Sugar',
    'no-sugar': 'No Sugar',
  };
  return labels[level] || level;
}

export function getMilkLabel(milk: string): string {
  const labels: Record<string, string> = {
    regular: 'Regular Milk',
    oat: 'Oat Milk',
    almond: 'Almond Milk',
    soy: 'Soy Milk',
  };
  return labels[milk] || milk;
}
