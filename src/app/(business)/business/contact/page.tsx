import { getSettings } from '@/lib/settings';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <ContactContent
      phone={settings.contact_phone}
      whatsapp={settings.contact_whatsapp}
      email={settings.contact_email}
    />
  );
}
