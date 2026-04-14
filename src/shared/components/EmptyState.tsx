interface EmptyStateProps {
  title: string;
  description: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function EmptyState({
  title,
  description,
  headingLevel = 'h3',
}: EmptyStateProps) {
  const HeadingTag = headingLevel;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-12 text-center">
      <HeadingTag className="text-lg font-semibold text-gray-900">
        {title}
      </HeadingTag>
      <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}
