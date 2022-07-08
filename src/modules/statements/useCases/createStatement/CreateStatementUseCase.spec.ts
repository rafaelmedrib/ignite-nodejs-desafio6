import { OperationType, Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";


let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

const newUserDTO: ICreateUserDTO = {
  email: "test@finapi.com",
  name: "Test Tester Testudo",
  password: "testing"
}

const newDepositOperation: ICreateStatementDTO = {
  amount: 1000,
  description: "test",
  type: OperationType.DEPOSIT,
  user_id: ""
}

let userId: string;

describe("On creating a statement", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory);

    const { id } = await createUserUseCase.execute(newUserDTO);
    userId = id;
    newDepositOperation.user_id = userId;
  })
  
  it("should be able to create a deposit",async () => {
    const statement = await createStatementUseCase.execute(newDepositOperation);

    expect(statement).toBeInstanceOf(Statement);

    const savedStatement = await statementRepositoryInMemory.findStatementOperation({ statement_id: statement.id, user_id: userId })

    expect(savedStatement).toBeInstanceOf(Statement);
  })

  it("should be able to create a withdraw", async () => {
    const newWithdrawOperation = Object.assign(newDepositOperation, { type: OperationType.WITHDRAW });
    
    const statement = await createStatementUseCase.execute(newWithdrawOperation);
    expect(statement).toBeInstanceOf(Statement);

    const savedStatement = await statementRepositoryInMemory.findStatementOperation({ statement_id: statement.id, user_id: userId })

    expect(savedStatement).toBeInstanceOf(Statement);
  })
  
  it("should not be able to withdraw an amount superior to current balance", async () => {
    await expect(async () => {
      await createStatementUseCase.execute(Object.assign(newDepositOperation, { type: OperationType.WITHDRAW , amount: 2000 }));
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })

  it("should not be able to register an operation using a nonexisting user", async () => {

    await expect(async () => {
      await createStatementUseCase.execute(Object.assign(newDepositOperation, { user_id: "nonExistingUser" }));
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })
})