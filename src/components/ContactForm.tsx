"use client";

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setStatus('error');
      setErrorMsg('All fields are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('sending');

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement)?.value;

    const body = new FormData();
    body.append('name', trimmedName);
    body.append('email', trimmedEmail);
    body.append('message', trimmedMessage);
    body.append('website', honeypot || '');

    try {
      const res = await fetch('/php/mailer.php', { method: 'POST', body });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the server. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-success">
        <p>Message sent. I&rsquo;ll be in touch.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — hidden from real users, bots fill it */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
      />
      <div className="contact-field">
        <label className="contact-label" htmlFor="name">Name</label>
        <input
          className="contact-input"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === 'sending'}
        />
      </div>

      <div className="contact-field">
        <label className="contact-label" htmlFor="email">Email</label>
        <input
          className="contact-input"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'sending'}
        />
      </div>

      <div className="contact-field">
        <label className="contact-label" htmlFor="message">Message</label>
        <textarea
          className="contact-input contact-textarea"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={status === 'sending'}
        />
      </div>

      {status === 'error' && (
        <p className="contact-error">{errorMsg}</p>
      )}

      <button
        className="contact-submit"
        type="submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
