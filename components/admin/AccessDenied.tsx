export function AccessDenied() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center">
      <p className="font-serif text-3xl">Acceso restringido</p>
      <p className="mx-auto mt-3 max-w-md text-taupe">
        Tu correo no está autorizado para el panel de Montalchino. Si crees que es un
        error, contacta al equipo.
      </p>
    </div>
  );
}