export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">
            Chambalín
          </h1>

          <button className="rounded-lg bg-blue-700 px-4 py-2 text-white">
            Iniciar sesión
          </button>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-2xl text-4xl font-bold md:text-5xl">
          Encontrá trabajo para lo que sabés hacer.
        </h2>

        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Conectamos personas que necesitan ayuda con quienes
          pueden ofrecer sus servicios.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="¿Qué trabajo estás buscando?"
            className="rounded-lg border bg-white px-4 py-3"
          />

          <button className="rounded-lg bg-blue-700 px-6 py-3 font-medium text-white">
            Buscar trabajos
          </button>
        </div>
      </section>
    </main>
  );
}