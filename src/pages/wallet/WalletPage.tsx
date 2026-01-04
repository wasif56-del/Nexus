import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PaymentForm, PaymentFormData } from '../../components/payment/PaymentForm';
import { TransactionHistory } from '../../components/payment/TransactionHistory';
import { useAuth } from '../../context/AuthContext';
import { getWalletByUserId, getTransactionsByUserId, createTransaction } from '../../data/wallet';
import { findUserById, users } from '../../data/users';
import { Transaction } from '../../types';
import toast from 'react-hot-toast';

type ActionType = 'deposit' | 'withdraw' | 'transfer' | null;

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);
  
  const loadWalletData = () => {
    if (!user) return;
    
    const wallet = getWalletByUserId(user.id);
    if (wallet) {
      setWalletBalance(wallet.balance);
      const userTransactions = getTransactionsByUserId(user.id);
      setTransactions(userTransactions);
    }
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };
  
  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!user) return;
    
    const wallet = getWalletByUserId(user.id);
    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }
    
    const amountInCents = Math.round(data.amount * 100);
    
    if (activeAction === 'deposit') {
      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        walletId: wallet.id,
        type: 'deposit',
        amount: amountInCents,
        currency: 'USD',
        description: 'Bank transfer deposit',
        status: 'completed',
        metadata: {
          paymentMethod: 'card',
          reference: `DEP-${Date.now()}`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      createTransaction(transaction);
      toast.success(`Successfully deposited ${formatAmount(amountInCents)}`);
    } else if (activeAction === 'withdraw') {
      if (wallet.balance < amountInCents) {
        toast.error('Insufficient balance');
        return;
      }
      
      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        walletId: wallet.id,
        type: 'withdraw',
        amount: -amountInCents,
        currency: 'USD',
        description: 'Withdrawal to bank account',
        status: 'completed',
        metadata: {
          paymentMethod: 'bank_transfer',
          reference: `WD-${Date.now()}`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      createTransaction(transaction);
      toast.success(`Successfully withdrew ${formatAmount(amountInCents)}`);
    } else if (activeAction === 'transfer') {
      if (!transferRecipient) {
        toast.error('Please select a recipient');
        return;
      }
      
      if (wallet.balance < amountInCents) {
        toast.error('Insufficient balance');
        return;
      }
      
      const recipientWallet = getWalletByUserId(transferRecipient);
      if (!recipientWallet) {
        toast.error('Recipient wallet not found');
        return;
      }
      
      const recipient = findUserById(transferRecipient);
      
      // Create outgoing transaction
      const senderTransaction: Transaction = {
        id: `tx-${Date.now()}-1`,
        walletId: wallet.id,
        type: 'transfer',
        amount: -amountInCents,
        currency: 'USD',
        senderId: user.id,
        receiverId: transferRecipient,
        description: `Transfer to ${recipient?.name || 'User'}`,
        status: 'completed',
        metadata: {
          reference: `TRF-${Date.now()}`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create incoming transaction for recipient
      const receiverTransaction: Transaction = {
        id: `tx-${Date.now()}-2`,
        walletId: recipientWallet.id,
        type: 'transfer',
        amount: amountInCents,
        currency: 'USD',
        senderId: user.id,
        receiverId: transferRecipient,
        description: `Transfer from ${user.name}`,
        status: 'completed',
        metadata: {
          reference: `TRF-${Date.now()}`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      createTransaction(senderTransaction);
      createTransaction(receiverTransaction);
      toast.success(`Successfully transferred ${formatAmount(amountInCents)} to ${recipient?.name || 'User'}`);
    }
    
    setShowPaymentForm(false);
    setActiveAction(null);
    setTransferRecipient('');
    loadWalletData();
  };
  
  const handleActionClick = (action: ActionType) => {
    setActiveAction(action);
    setShowPaymentForm(true);
  };
  
  const handleCancel = () => {
    setShowPaymentForm(false);
    setActiveAction(null);
    setTransferRecipient('');
  };
  
  if (!user) return null;
  
  const availableUsers = users.filter(u => u.id !== user.id);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600">Manage your funds and transactions</p>
      </div>
      
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <CardBody className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold">{formatAmount(walletBalance)}</h2>
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center">
                  <TrendingUp size={16} className="mr-2" />
                  <span className="text-sm text-primary-100">All transactions</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Wallet size={48} />
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActionClick('deposit')}>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
              <ArrowDownLeft size={32} className="text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Deposit</h3>
            <p className="text-sm text-gray-600">Add funds to your wallet</p>
          </CardBody>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActionClick('withdraw')}>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-error-100 rounded-full mb-4">
              <ArrowUpRight size={32} className="text-error-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Withdraw</h3>
            <p className="text-sm text-gray-600">Withdraw funds to your bank</p>
          </CardBody>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActionClick('transfer')}>
          <CardBody className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <ArrowRightLeft size={32} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer</h3>
            <p className="text-sm text-gray-600">Send money to another user</p>
          </CardBody>
        </Card>
      </div>
      
      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeAction === 'deposit' && 'Deposit Funds'}
                  {activeAction === 'withdraw' && 'Withdraw Funds'}
                  {activeAction === 'transfer' && 'Transfer Funds'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  ×
                </Button>
              </div>
              
              {activeAction === 'transfer' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Recipient
                  </label>
                  <select
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                onCancel={handleCancel}
                title={
                  activeAction === 'deposit' ? 'Deposit Funds' :
                  activeAction === 'withdraw' ? 'Withdraw Funds' :
                  'Transfer Funds'
                }
                submitLabel={
                  activeAction === 'deposit' ? 'Deposit' :
                  activeAction === 'withdraw' ? 'Withdraw' :
                  'Transfer'
                }
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction History */}
      <TransactionHistory transactions={transactions} currentUserId={user.id} />
    </div>
  );
};

