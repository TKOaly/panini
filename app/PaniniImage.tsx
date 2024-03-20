import { Panini } from "@prisma/client";

export const PaniniImage = ({
  panini,
  className,
}: {
  panini: Panini;
  className?: string;
}) => {
  if (panini.image) {
    return (
      <img
        draggable="false"
        src={panini.image ?? "/placeholder.png"}
        alt={panini.description || panini.name}
        className={`block w-100 max-h-100 w-full ${className ?? ""}`}
      />
    );
  }

  return (
    <div className="relative w-full select-none">
      <img
        draggable="false"
        src={"/placeholder.png"}
        alt={panini.description || panini.name}
        className={`block w-100 max-h-100 w-full ${className ?? ""}`}
      />
      <span className="text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {panini.name}
      </span>
    </div>
  );
};
