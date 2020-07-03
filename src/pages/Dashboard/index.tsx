import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  // Armazenar as Transações oriundas da Base de dados enviadas pela requisição a api
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Armazenar as Balance oriundas do método GetBalance enviadas pela requisição a api
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      // Invoca a api e o metodo de listar as tranasações no Banckend
      const response = await api.get('/transactions');

      /* Para um ganho de performance as formatações de valores e data serão feitas no
         momento da recuperação e não na parte HTML, podendo ser acionada todas as vezes pelo
         mesmo usuário sem a necessidade.
      */
      const transactionFormatedValue = response.data.transactions.map(
        (transaction: Transaction) => ({
          ...transaction,
          formattedValue: formatValue(transaction.value),
          formattedDate:  new Date(transaction.created_at).toLocaleDateString('pt-br'),
        }),
      )

      /* Obtém os dados para a formatação dos valores do balance que estão no response */
      const banlanceFormatedValue = {
        income: formatValue(response.data.balance.income),
        outcome: formatValue(response.data.balance.outcome),
        total: formatValue(response.data.balance.total),
      }

      setTransactions(transactionFormatedValue);
      setBalance(banlanceFormatedValue);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>

              {transactions.map(transactions => (
               <tr key={transactions.id}>
                 <td className="title">{transactions.title}</td>
                 <td className={ transactions.type }>
                   {transactions.type === 'outcome' && ' - '}
                   {transactions.formattedValue}
                 </td>
                 <td>{transactions.category.title}</td>
                 <td>{transactions.formattedDate}</td>
               </tr>
              ))}

            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
