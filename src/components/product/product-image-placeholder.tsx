// Ilustração genérica de pneu usada como placeholder de imagem de produto.
// Nesta etapa não há fotos reais de produto — a integração com um catálogo
// de imagens real acontece em uma etapa futura. `rotate` permite variar o
// ângulo entre as miniaturas de uma galeria, para diferenciá-las visualmente.
export function ProductImagePlaceholder({
  className,
  rotate = 0,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Ilustração de pneu"
      className={className}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="currentColor"
        strokeWidth="16"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="currentColor"
        strokeWidth="16"
        strokeDasharray="4 10"
        opacity="0.35"
      />
      <circle
        cx="100"
        cy="100"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        opacity="0.6"
      />
      <circle cx="100" cy="100" r="10" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
