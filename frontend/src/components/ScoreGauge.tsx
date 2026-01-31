
interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({ 
  score, 
  maxScore = 1000, 
  size = 'md', 
  showLabel = true
}: ScoreGaugeProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getColor = () => {
    if (score >= 600) return '#0D9488'; // Teal
    if (score >= 300) return '#EAB308'; // Primary
    return '#E53E3E'; // Rouge
  };

  const getLabel = () => {
    if (score >= 600) return 'Bon score';
    if (score >= 300) return 'Score moyen';
    return 'Score faible';
  };

  const sizes = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-base' },
  };

  const strokeWidth = size === 'sm' ? 6 : 8;
  const radius = size === 'sm' ? 35 : size === 'md' ? 50 : 65;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className={`${sizes[size].container} transform -rotate-90`}>
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percentage / 100) * circumference}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${sizes[size].text} font-bold text-text-primary`}>
            {score}
            <span className="text-sm text-text-secondary">/{maxScore}</span>
          </div>
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <p className={`${sizes[size].label} font-medium text-text-secondary`}>
            {getLabel()}
          </p>
        </div>
      )}
    </div>
  );
}
