import React, { useState } from 'react';
import { DollarSign, User, FileText, CheckCircle, X } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { getWalletByUserId, createFundingDeal, updateFundingDealStatus } from '../../data/wallet';
import { FundingDeal } from '../../types';
import toast from 'react-hot-toast';

interface FundingDealFlowProps {
  entrepreneurId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

export const FundingDealFlow: React.FC<FundingDealFlowProps> = ({
  entrepreneurId,
  onClose,
  onComplete
}) => {
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState<'details' | 'review' | 'payment' | 'complete'>('details');
  const [formData, setFormData] = useState({
    amount: '',
    equity: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const entrepreneur = findUserById(entrepreneurId);
  const investorWallet = currentUser ? getWalletByUserId(currentUser.id) : null;
  
  if (!currentUser || !entrepreneur || currentUser.role !== 'investor') {
    return null;
  }
  
  const amountInCents = formData.amount ? Math.round(parseFloat(formData.amount) * 100) : 0;
  const equityPercent = formData.equity ? parseFloat(formData.equity) : 0;
  
  const validateDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.equity || parseFloat(formData.equity) <= 0 || parseFloat(formData.equity) > 100) {
      newErrors.equity = 'Equity must be between 0 and 100';
    }
    
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (investorWallet && amountInCents > investorWallet.balance) {
      newErrors.amount = 'Insufficient wallet balance';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (step === 'details') {
      if (validateDetails()) {
        setStep('review');
      }
    } else if (step === 'review') {
      setStep('payment');
    } else if (step === 'payment') {
      handleCompleteFunding();
    }
  };
  
  const handleCompleteFunding = () => {
    if (!validateDetails()) return;
    
    // Create funding deal
    const deal: FundingDeal = {
      id: `deal-${Date.now()}`,
      investorId: currentUser.id,
      entrepreneurId: entrepreneurId,
      amount: amountInCents,
      currency: 'USD',
      equity: equityPercent,
      status: 'completed',
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    createFundingDeal(deal);
    updateFundingDealStatus(deal.id, 'completed');
    
    toast.success(`Successfully funded ${entrepreneur.name} with ${formatAmount(amountInCents)}`);
    setStep('complete');
    
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Fund Startup</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        )}
      </CardHeader>
      
      <CardBody>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['details', 'review', 'payment', 'complete'].map((s, index) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === s ? 'bg-primary-600 text-white' :
                ['details', 'review', 'payment', 'complete'].indexOf(step) > index ? 'bg-success-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {['details', 'review', 'payment', 'complete'].indexOf(step) > index ? (
                  <CheckCircle size={20} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  ['details', 'review', 'payment', 'complete'].indexOf(step) > index ? 'bg-success-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Step 1: Details */}
        {step === 'details' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-lg">
                <Avatar
                  src={entrepreneur.avatarUrl}
                  alt={entrepreneur.name}
                  size="md"
                  className="mr-3"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{entrepreneur.name}</h3>
                  <p className="text-sm text-gray-600">
                    {entrepreneur.role === 'entrepreneur' && 'startupName' in entrepreneur
                      ? entrepreneur.startupName
                      : 'Entrepreneur'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-8"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-error-600">{errors.amount}</p>
              )}
              {investorWallet && (
                <p className="mt-1 text-sm text-gray-500">
                  Available: {formatAmount(investorWallet.balance)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equity Percentage (%)
              </label>
              <Input
                type="number"
                value={formData.equity}
                onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
              />
              {errors.equity && (
                <p className="mt-1 text-sm text-error-600">{errors.equity}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="Describe the funding purpose, terms, etc."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-600">{errors.description}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {onClose && (
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                Review
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Startup:</span>
                <span className="font-semibold text-gray-900">{entrepreneur.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Investment Amount:</span>
                <span className="font-semibold text-gray-900">{formatAmount(amountInCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Equity:</span>
                <span className="font-semibold text-gray-900">{equityPercent}%</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Description:</p>
                <p className="text-gray-900">{formData.description}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment */}
        {step === 'payment' && (
          <div className="space-y-6">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-primary-900">{formatAmount(amountInCents)}</span>
              </div>
              <p className="text-xs text-gray-500">This amount will be transferred from your wallet</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Payment Method:</p>
              <div className="flex items-center">
                <DollarSign size={20} className="text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">Wallet Balance</span>
                {investorWallet && (
                  <Badge variant="success" className="ml-2">
                    {formatAmount(investorWallet.balance)} available
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep('review')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1" disabled={!investorWallet || amountInCents > investorWallet.balance}>
                Complete Funding
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full mb-4">
              <CheckCircle size={40} className="text-success-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Funding Complete!</h3>
            <p className="text-gray-600 mb-6">
              You have successfully funded {entrepreneur.name} with {formatAmount(amountInCents)}
            </p>
            {onClose && (
              <Button onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

