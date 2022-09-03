import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({ statement, balance }: { statement: Statement[], balance: number }) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      sender_id = null
    }) => {

      if(sender_id === null) {
        return {
          id,
          amount: Number(amount) < 0 ? Number(amount) * -1 : Number(amount),
          description,
          type,
          created_at,
          updated_at,
        }  
      } else {
        return {
          id,
          amount: Number(amount) < 0 ? Number(amount) * -1 : Number(amount),
          description,
          type,
          created_at,
          updated_at,
          sender_id
        }
      }
    }
    );

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
