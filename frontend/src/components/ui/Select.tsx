import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={clsx('relative z-50', className)}>
        <Listbox.Button
          className={clsx(
            'relative w-full cursor-pointer',
            'glass rounded-[var(--radius-lg)]',
            'py-2.5 pl-4 pr-10',
            'text-left text-sm',
            'focus-ring',
            'transition-all duration-200',
            'hover:bg-[var(--color-surface-hover)]'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className={clsx(
              !selectedOption && 'text-[var(--color-text-muted)]'
            )}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown
              className="w-4 h-4 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={clsx(
              'absolute mt-2 w-full',
              'bg-[var(--color-bg-elevated)] backdrop-blur-xl',
              'border border-[var(--color-border)]',
              'rounded-[var(--radius-lg)]',
              'py-1 overflow-auto',
              'max-h-60',
              'shadow-2xl',
              'focus:outline-none',
              'z-[9999]'
            )}
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none',
                    'py-2.5 pl-10 pr-4',
                    'transition-colors duration-100',
                    active
                      ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand-light)]'
                      : 'text-[var(--color-text-primary)]'
                  )
                }
              >
                {({ selected, active }) => (
                  <>
                    <span className="flex items-center gap-2">
                      {option.icon}
                      <span className={clsx('block truncate', selected && 'font-semibold')}>
                        {option.label}
                      </span>
                    </span>
                    {option.description && (
                      <span
                        className={clsx(
                          'block text-xs mt-0.5 ml-6',
                          active ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'
                        )}
                      >
                        {option.description}
                      </span>
                    )}
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-brand)]">
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
