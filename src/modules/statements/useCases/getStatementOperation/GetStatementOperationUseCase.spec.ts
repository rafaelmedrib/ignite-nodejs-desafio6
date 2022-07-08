import { OperationType, Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

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
let statementId: string;

describe("On getting statement operation", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementRepositoryInMemory);

    const { id } = await createUserUseCase.execute(newUserDTO);
    userId = id;
    newDepositOperation.user_id = userId;

    {
      const { id } = await createStatementUseCase.execute(newDepositOperation)
      statementId = id;
    }
  })
  
  it("should be able to retrieve statement operation using operation id",async () => {
    const statement = await getStatementOperationUseCase.execute({ user_id: userId, statement_id: statementId });
    
    expect(statement).toBeInstanceOf(Statement);
    expect(statement.amount).toBe(1000);
  });

  it("should not be able to retrieve a statement operation using wrong statement id", async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: userId, statement_id: "wrongId" })  
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
  
  it("should not be able to retrieve a statement operation using wrong user id", async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: "wrongId", statement_id: statementId });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
})