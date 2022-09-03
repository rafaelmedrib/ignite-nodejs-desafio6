import { OperationType } from "../../../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../../../modules/statements/repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "../../../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../../modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../../modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createTransferUseCase: CreateTransferUseCase;

const newUserDTO: ICreateUserDTO = {
  email: "test@finapi.com",
  name: "Test Tester Testudo",
  password: "testing"
}

const newUser2DTO: ICreateUserDTO = {
  email: "ti@pispenuv.ne",
  name: "Julia Brewer",
  password: "710483"
}

const newDepositOperation: ICreateStatementDTO = {
  amount: 1000,
  description: "test",
  type: OperationType.DEPOSIT,
  user_id: ""
}

let userId: string;
let user2Id: string;

describe("On creating a statement", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
    createTransferUseCase = new CreateTransferUseCase(usersRepositoryInMemory, statementRepositoryInMemory);

    const { id } = await createUserUseCase.execute(newUserDTO);
    userId = id;
    newDepositOperation.user_id = userId;

    await createStatementUseCase.execute(newDepositOperation);

    const { id: id2 } = await createUserUseCase.execute(newUser2DTO);
    user2Id = id2;
  })

  it('should be able to make a transfer from user 1 to user 2',async () => {
    expect(async () => {
      await createTransferUseCase.execute({
        amount: 25,
        description: 'test',
        receiver_id: user2Id,
        user_id: userId
      });  
    }).not.toThrow();
  })

});