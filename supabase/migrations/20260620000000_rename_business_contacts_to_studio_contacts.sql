-- business.aorthar.com was renamed to studio.aorthar.com
alter table public.business_contacts rename to studio_contacts;

alter policy "Admins can view business contacts" on public.studio_contacts
  rename to "Admins can view studio contacts";

alter policy "Admins can update business contacts" on public.studio_contacts
  rename to "Admins can update studio contacts";
