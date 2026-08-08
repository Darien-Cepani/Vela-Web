/** Single source of truth for contact details.
 *  Kept in its own tiny module so the eagerly-loaded Footer can share it with
 *  the lazily-loaded Contact section without dragging that chunk into the
 *  initial bundle. */
export const CONTACT_EMAIL = 'darien.cepani42@gmail.com'
