import { OperationType, Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "../getStatementOperation/GetStatementOperationUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

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

describe("On getting user balance", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementRepositoryInMemory, usersRepositoryInMemory);

    const { id } = await createUserUseCase.execute(newUserDTO);
    userId = id;
    newDepositOperation.user_id = userId;

    await createStatementUseCase.execute(newDepositOperation);
  })

  it("should be able to retrieve user balance and statement",async () => {
    const userBalance = await getBalanceUseCase.execute({ user_id: userId });

    expect(userBalance).toHaveProperty("balance");
    expect(userBalance).toHaveProperty("statement");
    expect(userBalance.statement[0]).toBeInstanceOf(Statement);
  });

  it("should not be able to retrieve balance and statement data from a nonexisting user",async () => {
    await expect( async () => {
      await getBalanceUseCase.execute({ user_id: "wrongId" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
})