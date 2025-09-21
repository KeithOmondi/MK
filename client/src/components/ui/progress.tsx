
export interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress = ({ value, className = "" }: ProgressProps) => {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded ${className}`}>
      <div
        className="h-2 bg-blue-500 rounded"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
