export const spinnerVariants = ['classic', 'orbit', 'flutter', 'neon'] as const;

export type SpinnerVariant = (typeof spinnerVariants)[number];
