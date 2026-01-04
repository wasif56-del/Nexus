import React from 'react';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Transaction } from '../../types';
import { findUserById } from '../../data/users';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentUserId: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  currentUserId
}) => {
  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };
  
  const getTransactionIcon = (type: Transaction['type'], amount: number) => {
    const isIncoming = amount > 0;
    
    if (type === 'funding') {
      return isIncoming ? (
        <div className="p-2 bg-success-100 rounded-full">
          <DollarSign size={18} className="text-success-600" />
        </div>
      ) : (
        <div className="p-2 bg-primary-100 rounded-full">
          <DollarSign size={18} className="text-primary-600" />
        </div>
      );
    }
    
    return isIncoming ? (
      <div className="p-2 bg-success-100 rounded-full">
        <ArrowDownLeft size={18} className="text-success-600" />
      </div>
    ) : (
      <div className="p-2 bg-error-100 rounded-full">
        <ArrowUpRight size={18} className="text-error-600" />
      </div>
    );
  };
  
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-success-600" />;
      case 'pending':
        return <Clock size={16} className="text-warning-600" />;
      case 'failed':
        return <XCircle size={16} className="text-error-600" />;
      case 'cancelled':
        return <AlertCircle size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="gray">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  const getOtherParty = (transaction: Transaction) => {
    if (transaction.type === 'transfer' || transaction.type === 'funding') {
      if (transaction.senderId === currentUserId && transaction.receiverId) {
        const user = findUserById(transaction.receiverId);
        return user ? user.name : 'Unknown';
      } else if (transaction.receiverId === currentUserId && transaction.senderId) {
        const user = findUserById(transaction.senderId);
        return user ? user.name : 'Unknown';
      }
    }
    return null;
  };
  
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
          </div>
        </CardBody>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map(transaction => {
                const isIncoming = transaction.amount > 0;
                const otherParty = getOtherParty(transaction);
                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type, transaction.amount)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          {otherParty && (
                            <div className="text-sm text-gray-500">
                              {isIncoming ? 'From' : 'To'}: {otherParty}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          isIncoming ? 'text-success-600' : 'text-gray-900'
                        }`}
                      >
                        {isIncoming ? '+' : '-'}
                        {formatAmount(Math.abs(transaction.amount), transaction.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        {getStatusBadge(transaction.status)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

