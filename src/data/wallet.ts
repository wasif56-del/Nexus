import { Wallet, Transaction, FundingDeal } from '../types';

// Mock wallets
export const wallets: Wallet[] = [
  {
    id: 'wallet1',
    userId: 'i1',
    balance: 5000000, // $50,000.00
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'wallet2',
    userId: 'i2',
    balance: 3000000, // $30,000.00
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'wallet3',
    userId: 'e1',
    balance: 50000, // $500.00
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'wallet4',
    userId: 'e2',
    balance: 25000, // $250.00
    currency: 'USD',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
];

// Mock transactions
export const transactions: Transaction[] = [
  {
    id: 'tx1',
    walletId: 'wallet1',
    type: 'deposit',
    amount: 1000000, // $10,000
    currency: 'USD',
    description: 'Bank transfer deposit',
    status: 'completed',
    metadata: {
      paymentMethod: 'bank_transfer',
      reference: 'DEP-2024-001'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'tx2',
    walletId: 'wallet1',
    type: 'funding',
    amount: -1500000, // -$15,000
    currency: 'USD',
    senderId: 'i1',
    receiverId: 'e1',
    description: 'Funding for TechWave AI - Series A',
    status: 'completed',
    metadata: {
      dealId: 'deal1',
      reference: 'FUND-2024-001'
    },
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: 'tx3',
    walletId: 'wallet3',
    type: 'funding',
    amount: 1500000, // $15,000
    currency: 'USD',
    senderId: 'i1',
    receiverId: 'e1',
    description: 'Funding received from Michael Rodriguez',
    status: 'completed',
    metadata: {
      dealId: 'deal1',
      reference: 'FUND-2024-001'
    },
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: 'tx4',
    walletId: 'wallet2',
    type: 'transfer',
    amount: -500000, // -$5,000
    currency: 'USD',
    senderId: 'i2',
    receiverId: 'e2',
    description: 'Transfer to GreenLife Solutions',
    status: 'completed',
    metadata: {
      reference: 'TRF-2024-001'
    },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z'
  },
  {
    id: 'tx5',
    walletId: 'wallet4',
    type: 'transfer',
    amount: 500000, // $5,000
    currency: 'USD',
    senderId: 'i2',
    receiverId: 'e2',
    description: 'Transfer received from Jennifer Lee',
    status: 'completed',
    metadata: {
      reference: 'TRF-2024-001'
    },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z'
  },
  {
    id: 'tx6',
    walletId: 'wallet1',
    type: 'withdraw',
    amount: -200000, // -$2,000
    currency: 'USD',
    description: 'Withdrawal to bank account',
    status: 'completed',
    metadata: {
      paymentMethod: 'bank_transfer',
      reference: 'WD-2024-001'
    },
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z'
  }
];

// Mock funding deals
export const fundingDeals: FundingDeal[] = [
  {
    id: 'deal1',
    investorId: 'i1',
    entrepreneurId: 'e1',
    amount: 1500000, // $15,000
    currency: 'USD',
    equity: 15,
    status: 'completed',
    description: 'Series A funding for TechWave AI',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: 'deal2',
    investorId: 'i2',
    entrepreneurId: 'e2',
    amount: 2000000, // $20,000
    currency: 'USD',
    equity: 20,
    status: 'pending',
    description: 'Seed funding for GreenLife Solutions',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

// Helper functions
export const getWalletByUserId = (userId: string): Wallet | null => {
  return wallets.find(w => w.userId === userId) || null;
};

export const getTransactionsByWalletId = (walletId: string): Transaction[] => {
  return transactions.filter(tx => tx.walletId === walletId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getTransactionsByUserId = (userId: string): Transaction[] => {
  const wallet = getWalletByUserId(userId);
  if (!wallet) return [];
  return getTransactionsByWalletId(wallet.id);
};

export const createTransaction = (transaction: Transaction): void => {
  transactions.push(transaction);
  
  // Update wallet balance
  const wallet = wallets.find(w => w.id === transaction.walletId);
  if (wallet) {
    wallet.balance += transaction.amount;
    wallet.updatedAt = new Date().toISOString();
  }
};

export const createFundingDeal = (deal: FundingDeal): void => {
  fundingDeals.push(deal);
};

export const updateFundingDealStatus = (
  dealId: string,
  status: FundingDeal['status']
): void => {
  const deal = fundingDeals.find(d => d.id === dealId);
  if (deal) {
    deal.status = status;
    deal.updatedAt = new Date().toISOString();
    
    // If completed, create transactions for both parties
    if (status === 'completed') {
      const investorWallet = getWalletByUserId(deal.investorId);
      const entrepreneurWallet = getWalletByUserId(deal.entrepreneurId);
      
      if (investorWallet && entrepreneurWallet) {
        // Investor transaction (outgoing)
        const investorTx: Transaction = {
          id: `tx-${Date.now()}-1`,
          walletId: investorWallet.id,
          type: 'funding',
          amount: -deal.amount,
          currency: deal.currency,
          senderId: deal.investorId,
          receiverId: deal.entrepreneurId,
          description: `Funding: ${deal.description}`,
          status: 'completed',
          metadata: {
            dealId: deal.id,
            reference: `FUND-${Date.now()}`
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Entrepreneur transaction (incoming)
        const entrepreneurTx: Transaction = {
          id: `tx-${Date.now()}-2`,
          walletId: entrepreneurWallet.id,
          type: 'funding',
          amount: deal.amount,
          currency: deal.currency,
          senderId: deal.investorId,
          receiverId: deal.entrepreneurId,
          description: `Funding received: ${deal.description}`,
          status: 'completed',
          metadata: {
            dealId: deal.id,
            reference: `FUND-${Date.now()}`
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        createTransaction(investorTx);
        createTransaction(entrepreneurTx);
      }
    }
  }
};

