import type { CustomerSet } from '@cloudcommerce/types';

export type FirebaseUserInfo = {
  name?: string,
  email: string,
  email_verified?: boolean,
};

/* Body for customers auto-created on first login. Store config
(`passport.newCustomer`) can force fields such as `enabled: false`
for stores that must approve customers before selling. */
export const getNewCustomerBody = (
  { name, email, email_verified: isEmailVerified }: FirebaseUserInfo,
  defaults?: Partial<CustomerSet>,
): CustomerSet => {
  return {
    display_name: name || '',
    main_email: email,
    emails: [{
      address: email,
      verified: !!isEmailVerified,
    }],
    ...defaults,
  };
};

export default getNewCustomerBody;
