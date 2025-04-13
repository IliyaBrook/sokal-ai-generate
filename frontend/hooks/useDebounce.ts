import { useState, useEffect } from 'react';

/**
 * Хук для дебаунсинга изменений значения.
 * Вернет значение только после того, как оно не изменялось в течение заданного времени.
 * 
 * @param value Значение, которое нужно дебаунсить
 * @param delay Задержка в миллисекундах
 * @returns Дебаунсированное значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер для обновления дебаунсированного значения
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер, если значение изменилось до истечения задержки
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 