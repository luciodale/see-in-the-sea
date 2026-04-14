/**
 * Typed accessors for `FormData` values.
 *
 * `FormData.get` returns `FormDataEntryValue | null`, which is `string | File | null`.
 * These helpers validate the shape at the boundary instead of casting blindly
 * (e.g. `formData.get('x') as string`), which silently accepts `null` or a
 * `File` and blows up downstream in string operations.
 */

export function getString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

export function getRequiredString(
  formData: FormData,
  key: string
): string | undefined {
  const value = getString(formData, key);
  return value && value.length > 0 ? value : undefined;
}

export function getFile(formData: FormData, key: string): File | undefined {
  const value = formData.get(key);
  return value instanceof File ? value : undefined;
}
