'use client';

import { useState } from 'react';
import { sendContactEmail, type ContactResult } from './actions';

const lime = '#a7d252';
const muted = '#888';
const border = '#1f1f1f';
const surface = '#111';

const serviceGroups = [
  {
    group: 'Marketing',
    options: ['Content Strategy', 'Content Creation', 'UGC Network'],
  },
  {
    group: 'Branding',
    options: ['Logo & Identity', 'Brand Guidelines', 'Naming', 'Visual Systems'],
  },
  {
    group: 'Product',
    options: ['Web App', 'Mobile App', 'Landing Page', 'SaaS MVP', 'E-commerce'],
  },
  {
    group: 'Other',
    options: ['Full Agency Retainer', 'Not sure yet'],
  },
];

type Props = {
  phone?: string;
  whatsapp?: string;
  email?: string;
};

export default function ContactContent({ phone, whatsapp, email }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleService(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const fd = new FormData(e.currentTarget);
    fd.set('service', Array.from(selected).join(', ') || 'Not specified');
    const result: ContactResult = await sendContactEmail(fd);
    if (result.success) {
      setStatus('done');
    } else {
      setErrorMsg(result.error);
      setStatus('error');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0a0a0a',
    border: `1px solid ${border}`,
    borderRadius: '2px',
    color: '#fff',
    fontSize: '0.925rem',
    padding: '0.875rem 1rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: muted,
    marginBottom: '0.5rem',
  };

  const contactItems = [
    { label: 'Response time', value: 'Within 24 hours' },
    { label: 'Based in', value: 'Nigeria — serving clients globally' },
    ...(email ? [{ label: 'Email', value: email, href: `mailto:${email}` }] : []),
    ...(phone ? [{ label: 'Phone', value: phone, href: `tel:${phone}` }] : []),
    ...(whatsapp
      ? [{ label: 'WhatsApp', value: whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`, external: true }]
      : []),
  ];

  return (
    <div className="biz-section">
      <div className="biz-contact-grid">
        {/* Left — Info */}
        <div>
          <p style={{ color: lime, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Get in Touch
          </p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            Let&apos;s build<br />something <span style={{ color: lime }}>real.</span>
          </h1>
          <p style={{ color: muted, fontSize: '1rem', lineHeight: 1.7, marginBottom: '3rem' }}>
            Tell us what you&apos;re working on. We&apos;ll get back to you within 24 hours.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {contactItems.map((item) => (
              <div key={item.label}>
                <p style={{ color: lime, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {item.label}
                </p>
                {'href' in item && item.href ? (
                  <a
                    href={item.href}
                    target={'external' in item && item.external ? '_blank' : undefined}
                    rel={'external' in item && item.external ? 'noopener noreferrer' : undefined}
                    style={{ fontSize: '0.925rem', color: '#fff', textDecoration: 'none' }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p style={{ fontSize: '0.925rem' }}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '4px', padding: '2.5rem' }}>
          {status === 'done' ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Message sent.</h2>
              <p style={{ color: muted, fontSize: '0.925rem' }}>We&apos;ll be in touch within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label htmlFor="name" style={labelStyle}>Name *</label>
                <input id="name" name="name" type="text" required placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label htmlFor="email" style={labelStyle}>Email *</label>
                <input id="email" name="email" type="email" required placeholder="you@company.com" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>Services interested in</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {serviceGroups.map(({ group, options }) => (
                    <div key={group}>
                      <p style={{ fontSize: '0.7rem', color: lime, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{group}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {options.map((opt) => {
                          const val = `${group} — ${opt}`;
                          const isOn = selected.has(val);
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => toggleService(val)}
                              style={{
                                background: isOn ? lime : 'transparent',
                                color: isOn ? '#000' : muted,
                                border: `1px solid ${isOn ? lime : border}`,
                                borderRadius: '2px',
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.85rem',
                                cursor: 'pointer',
                                fontWeight: isOn ? 700 : 400,
                                transition: 'all 0.1s',
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="message" style={labelStyle}>Message *</label>
                <textarea id="message" name="message" required rows={5} placeholder="Tell us about your project, goals, timeline..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              {status === 'error' && (
                <p style={{ color: '#ff4444', fontSize: '0.85rem' }}>{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ background: lime, color: '#000', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', padding: '0.95rem', borderRadius: '2px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', textTransform: 'uppercase', opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
