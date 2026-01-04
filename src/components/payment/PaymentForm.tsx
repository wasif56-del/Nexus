import React, { useState } from 'react';
import { CreditCard, Lock, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onCancel?: () => void;
  title?: string;
  submitLabel?: string;
  defaultAmount?: number;
}

export interface PaymentFormData {
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  zipCode: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onCancel,
  title = 'Payment Details',
  submitLabel = 'Pay',
  defaultAmount = 0
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: defaultAmount,
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    zipCode: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };
  
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentFormData, string>> = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!formData.cardholderName || formData.cardholderName.length < 3) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }
    
    if (!formData.zipCode || formData.zipCode.length < 5) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onSubmit(formData);
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Lock size={16} className="mr-1" />
            <span>Secure payment</span>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="pl-8"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-error-600">{errors.amount}</p>
            )}
          </div>
          
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <div className="relative">
              <CreditCard size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                className="pl-10"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-error-600">{errors.cardNumber}</p>
            )}
          </div>
          
          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <Input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-error-600">{errors.expiryDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <Input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                placeholder="123"
                maxLength={4}
                required
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-error-600">{errors.cvv}</p>
              )}
            </div>
          </div>
          
          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <Input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
              placeholder="John Doe"
              required
            />
            {errors.cardholderName && (
              <p className="mt-1 text-sm text-error-600">{errors.cardholderName}</p>
            )}
          </div>
          
          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <Input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '').substring(0, 10) })}
              placeholder="12345"
              required
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-error-600">{errors.zipCode}</p>
            )}
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check size={16} className="text-success-600" />
              <span>Secured by SSL encryption</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Check size={16} className="text-success-600" />
              <span>PCI DSS compliant</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing}
              isLoading={isProcessing}
            >
              {isProcessing ? 'Processing...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

