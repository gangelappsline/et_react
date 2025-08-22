import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  return (
    <section id="contacto" className="flex flex-col items-center py-16 px-4 bg-white text-black animate-fade-in-up">
      <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded"
          required
        />
        <textarea
          name="mensaje"
          placeholder="Mensaje"
          value={form.mensaje}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded"
          rows={4}
          required
        />
        <button type="submit" className="bg-black text-white py-3 rounded hover:bg-gray-800 transition">Enviar</button>
        {enviado && <div className="text-green-600 text-center">¡Mensaje enviado!</div>}
      </form>
    </section>
  );
}
