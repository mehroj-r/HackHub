// Display helpers for the profile phone. Stored phones are already normalized
// by profileSchema (lib/validation/profile.ts): digits with a leading "+",
// e.g. "+998901234567".

const UZ = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/;

/**
 * "+998901234567" → "+998 90 123 45 67". Uzbek numbers get the local
 * grouping; anything else is shown as stored, since grouping differs by
 * country.
 */
export function formatPhone(phone: string): string {
  const uz = UZ.exec(phone);
  return uz ? `+998 ${uz.slice(1).join(" ")}` : phone;
}

/** A tel: link for a stored phone (spaces and dashes are never stored). */
export function phoneHref(phone: string): string {
  return `tel:${phone}`;
}
