export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center py-20 px-4 bg-black text-white animate-fade-in">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-slide-down">Asesoría Legal Inmobiliaria</h1>
      <p className="text-lg md:text-2xl mb-8 animate-fade-in delay-200">Protege tu patrimonio con expertos en derecho inmobiliario.</p>
      <a href="#contacto" className="bg-white text-black px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-200 transition animate-fade-in delay-400">Contáctanos</a>
    </section>
  );
}
