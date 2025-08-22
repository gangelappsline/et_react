const services = [
  {
    title: 'Consultoría Legal',
    desc: 'Asesoría en compra, venta y arrendamiento de inmuebles. Revisión de contratos y trámites legales.',
    icon: '🏛️',
  },
  {
    title: 'Due Diligence',
    desc: 'Investigación y análisis legal de propiedades para garantizar operaciones seguras.',
    icon: '🔍',
  },
  {
    title: 'Gestión de Contratos',
    desc: 'Redacción y revisión de contratos inmobiliarios, promesas de compraventa y arrendamiento.',
    icon: '📄',
  },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900">Nuestros Servicios</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-teal-50 rounded-lg shadow p-8 flex flex-col items-center text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="font-bold text-xl mb-2 text-teal-700">{s.title}</h3>
              <p className="text-gray-700">{s.desc}</p>
              <a href="#contacto" className="mt-4 text-teal-700 font-semibold hover:underline">Saber más</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
