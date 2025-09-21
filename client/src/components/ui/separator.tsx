

export interface SeparatorProps {
  className?: string;
}

export const Separator = ({ className = "" }: SeparatorProps) => {
  return <hr className={`border-t border-gray-200 my-4 ${className}`} />;
};
