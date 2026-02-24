import ContactForm from '@/components/ContactForm';

export default function Contact() {
  return (
    <main className="contact-page">
      <div className="contact-inner">
        <div className="contact-header">
          <h1 className="contact-heading">Get in Touch</h1>
          <p className="contact-subheading">
            Have a project in mind, a question, or just want to say hello? Send me a message.
          </p>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
