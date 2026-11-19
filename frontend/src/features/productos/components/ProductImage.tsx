import { useState } from 'react';
import type { Producto } from '../types/product.types';
import { DEMO_PRODUCT_IMAGES } from '../productImages';

/** Resuelve primero la URL registrada; para datos antiguos, usa la foto de demostración local. */
export function ProductImage({ product }: { product: Producto }) {
  const preferred = product.imagen_url?.trim() || DEMO_PRODUCT_IMAGES[product.nombre] || '';
  const demo = DEMO_PRODUCT_IMAGES[product.nombre] || '';
  const [failedUrl, setFailedUrl] = useState('');
  const [failedDemo, setFailedDemo] = useState(false);

  // Una URL rota no deja la tarjeta en blanco: se prueba la foto local una sola vez.
  const source = preferred === failedUrl && demo && preferred !== demo && !failedDemo ? demo
    : preferred === failedUrl || (preferred === demo && failedDemo) ? '' : preferred;
  return (
    <div className="h-40 overflow-hidden bg-mist">
      {source ? (
        <img
          key={source}
          src={source}
          alt={product.nombre}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => {
            if (source === demo) setFailedDemo(true);
            else setFailedUrl(source);
          }}
        />
      ) : (
        <div className="grid h-full place-content-center text-5xl" aria-label="Imagen no disponible">🍽️</div>
      )}
    </div>
  );
}
