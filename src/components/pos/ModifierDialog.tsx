'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, getSizeLabel } from '@/lib/utils';
import { modifiers as allModifiers } from '@/data/mock-products';
import { Minus, Plus, StickyNote } from 'lucide-react';
import type {
  Product,
  ProductSize,
  Temperature,
  SugarLevel,
  MilkType,
  OrderItemModifier,
} from '@/types';

interface ModifierDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    size: ProductSize;
    temperature?: Temperature;
    sugarLevel?: SugarLevel;
    milkType?: MilkType;
    modifiers: OrderItemModifier[];
    notes: string;
    quantity: number;
    unitPrice: number;
  }) => void;
}

export function ModifierDialog({
  product,
  isOpen,
  onClose,
  onConfirm,
}: ModifierDialogProps) {
  const [size, setSize] = useState<ProductSize>('medium');
  const [temperature, setTemperature] = useState<Temperature>('iced');
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('normal');
  const [milkType, setMilkType] = useState<MilkType>('regular');
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  const availableModifiers = useMemo(() => {
    if (!product) return [];
    return allModifiers.filter((m) =>
      product.availableModifiers.includes(m.id)
    );
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => v.size === size) || product.variants[0];
  }, [product, size]);

  const modifierTotal = useMemo(() => {
    return allModifiers
      .filter((m) => selectedModifiers.includes(m.id))
      .reduce((sum, m) => sum + m.price, 0);
  }, [selectedModifiers]);

  const unitPrice = (currentVariant?.price || 0) + modifierTotal;
  const totalPrice = unitPrice * quantity;

  const toggleModifier = (modId: string) => {
    setSelectedModifiers((prev) =>
      prev.includes(modId)
        ? prev.filter((id) => id !== modId)
        : [...prev, modId]
    );
  };

  const handleConfirm = () => {
    if (!product || !currentVariant) return;

    const mods: OrderItemModifier[] = allModifiers
      .filter((m) => selectedModifiers.includes(m.id))
      .map((m) => ({ modifierId: m.id, name: m.name, price: m.price }));

    onConfirm({
      size: currentVariant.size,
      temperature: product.hasTemperature ? temperature : undefined,
      sugarLevel: product.hasSugarLevel ? sugarLevel : undefined,
      milkType: product.hasMilkType ? milkType : undefined,
      modifiers: mods,
      notes,
      quantity,
      unitPrice,
    });

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSize('medium');
    setTemperature('iced');
    setSugarLevel('normal');
    setMilkType('regular');
    setSelectedModifiers([]);
    setNotes('');
    setQuantity(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product.name}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Product Info */}
        <div className="flex items-center gap-4 pb-4 border-b border-espresso-100">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-espresso-100 to-espresso-200 flex items-center justify-center text-4xl shrink-0">
            ☕
          </div>
          <div>
            <h3 className="text-lg font-bold text-espresso-900">
              {product.name}
            </h3>
            <p className="text-sm text-espresso-400">{product.description}</p>
          </div>
        </div>

        {/* Size Selection */}
        {product.variants.length > 1 && (
          <Section title="Ukuran">
            <div className="flex gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => setSize(variant.size)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border text-center transition-all duration-200 cursor-pointer',
                    size === variant.size
                      ? 'border-amber-accent bg-amber-50 text-amber-accent'
                      : 'border-espresso-200 bg-white text-espresso-600 hover:bg-espresso-50'
                  )}
                >
                  <span className="text-lg font-bold">
                    {getSizeLabel(variant.size)}
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {formatCurrency(variant.price)}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Temperature */}
        {product.hasTemperature && (
          <Section title="Suhu">
            <div className="flex gap-2">
              {(['hot', 'iced'] as Temperature[]).map((temp) => (
                <OptionButton
                  key={temp}
                  label={temp === 'hot' ? '🔥 Hot' : '🧊 Iced'}
                  isSelected={temperature === temp}
                  onClick={() => setTemperature(temp)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Sugar Level */}
        {product.hasSugarLevel && (
          <Section title="Level Gula">
            <div className="flex gap-2">
              {(
                [
                  { value: 'normal', label: 'Normal' },
                  { value: 'less', label: 'Less Sugar' },
                  { value: 'no-sugar', label: 'No Sugar' },
                ] as { value: SugarLevel; label: string }[]
              ).map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={sugarLevel === option.value}
                  onClick={() => setSugarLevel(option.value)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Milk Type */}
        {product.hasMilkType && (
          <Section title="Jenis Susu">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'regular', label: 'Regular', extra: 0 },
                  { value: 'oat', label: 'Oat Milk', extra: 6000 },
                  { value: 'almond', label: 'Almond Milk', extra: 7000 },
                  { value: 'soy', label: 'Soy Milk', extra: 5000 },
                ] as { value: MilkType; label: string; extra: number }[]
              ).map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  sublabel={
                    option.extra > 0
                      ? `+${formatCurrency(option.extra)}`
                      : undefined
                  }
                  isSelected={milkType === option.value}
                  onClick={() => setMilkType(option.value)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Modifiers / Toppings */}
        {availableModifiers.length > 0 && (
          <Section title="Tambahan">
            <div className="grid grid-cols-2 gap-2">
              {availableModifiers.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => toggleModifier(mod.id)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200 cursor-pointer',
                    selectedModifiers.includes(mod.id)
                      ? 'border-amber-accent bg-amber-50 text-espresso-800'
                      : 'border-espresso-200 bg-white text-espresso-600 hover:bg-espresso-50'
                  )}
                >
                  <span className="font-medium">{mod.name}</span>
                  <span className="text-xs font-mono text-espresso-500">
                    +{formatCurrency(mod.price)}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Notes */}
        <Section title="Catatan">
          <div className="relative">
            <StickyNote className="absolute left-3 top-3 w-4 h-4 text-espresso-400 pointer-events-none" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-espresso-200 bg-white text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-amber-accent/30 focus:border-amber-accent resize-none transition-all"
              placeholder="Catatan khusus (opsional)"
            />
          </div>
        </Section>
      </div>

      {/* Footer — Quantity + Total + Add Button */}
      <div className="sticky bottom-0 px-6 py-4 border-t border-espresso-100 bg-cream/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl border border-espresso-200 flex items-center justify-center text-espresso-600 hover:bg-espresso-50 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-lg font-bold font-mono text-espresso-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl border border-espresso-200 flex items-center justify-center text-espresso-600 hover:bg-espresso-50 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Order Button */}
          <Button
            size="lg"
            onClick={handleConfirm}
            className="min-w-[200px]"
          >
            Tambah — {formatCurrency(totalPrice)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-espresso-700 mb-2.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function OptionButton({
  label,
  sublabel,
  isSelected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-amber-accent bg-amber-50 text-amber-accent'
          : 'border-espresso-200 bg-white text-espresso-600 hover:bg-espresso-50'
      )}
    >
      {label}
      {sublabel && (
        <span className="text-[10px] font-mono text-espresso-400">
          {sublabel}
        </span>
      )}
    </button>
  );
}
