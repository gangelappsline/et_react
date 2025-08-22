export default function AboutSection() {
  return (
    <section className="max-w-7xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-8 items-center" id="about">
      <div className="space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Construimos confianza en el sector inmobiliario</h2>
        <p className="text-gray-700 text-lg">Nuestro equipo de abogados expertos te acompaña en cada paso de tu proceso inmobiliario, asegurando transparencia, legalidad y tranquilidad en cada operación.</p>
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-3">
            <span className="bg-teal-600 text-white rounded-full px-3 py-1 text-sm font-semibold">8 años</span>
            <span className="text-gray-700">de experiencia</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-teal-600 rounded-full"></span>
              <span className="font-semibold text-gray-900">Valores</span>
              <span className="text-gray-700">Ética, compromiso y transparencia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-teal-600 rounded-full"></span>
              <span className="font-semibold text-gray-900">Misión</span>
              <span className="text-gray-700">Proteger tu patrimonio y tus intereses</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="bg-teal-100 rounded-lg p-6 shadow w-full">
          <h3 className="font-bold text-lg mb-2 text-teal-700">Nuestro equipo</h3>
          <p className="text-gray-700 text-sm">Abogados especializados en derecho inmobiliario, listos para asesorarte en cada etapa.</p>
        </div>
      </div>
    </section>
  );
}
