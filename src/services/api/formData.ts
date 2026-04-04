export function appendToFormData(
  value: unknown,
  formData: FormData = new FormData(),
  prefix = '',
): FormData {
  if (value === null || value === undefined) {
    return formData;
  }

  if (value instanceof Date) {
    formData.append(prefix, value.toISOString());
    return formData;
  }

  if (value instanceof File) {
    formData.append(prefix, value, value.name);
    return formData;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPrefix = prefix ? `${prefix}[${index}]` : String(index);
      appendToFormData(item, formData, nextPrefix);
    });
    return formData;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      appendToFormData(nestedValue, formData, nextPrefix);
    });
    return formData;
  }

  formData.append(prefix, String(value));
  return formData;
}

export function convertirObjetoAFormData(objeto: unknown): FormData {
  return appendToFormData(objeto);
}
