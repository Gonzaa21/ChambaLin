
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PruebaSupabase() {
  const [categorias, setCategorias] = useState([]);
  const [estado, setEstado] = useState("Probando conexión...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function probarConexion() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");

      if (error) {
        setError(error.message);
        setEstado("No se pudo leer la base de datos");
        return;
      }

      setCategorias(data ?? []);
      setEstado("Conexión exitosa");
    }

    probarConexion();
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Prueba de conexión — Chambalín</h1>
      <p>{estado}</p>

      {error && (
        <p style={{ color: "crimson" }}>
          Error: {error}
        </p>
      )}

      {categorias.length > 0 && (
        <>
          <h2>Categorías recibidas de Supabase</h2>
          <ul>
            {categorias.map((categoria) => (
              <li key={categoria.id}>
                {categoria.name} ({categoria.slug})
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
