import { Pressable, Text, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, variant = 'primary', ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg items-center justify-center';
  const variantClasses = variant === 'primary'
    ? 'bg-red-500 active:bg-red-600'
    : 'bg-gray-200 active:bg-gray-300';

  return (
    <Pressable className={`${baseClasses} ${variantClasses}`} {...props}>
      <Text className={variant === 'primary' ? 'text-white font-semibold' : 'text-gray-800 font-semibold'}>
        {title}
      </Text>
    </Pressable>
  );
}
