import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

const  email = "test@finapi.com";
const  name = "Test Tester Testudo";
const password = "testing";

describe("On authenticating an user...", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);

    await createUserUseCase.execute({ email, name, password });
  })

  it("should be able to retrieve user information and a signed token",async () => {
    const { user, token } = await authenticateUserUseCase.execute({ email, password});
    
    expect(user.name).toBe("Test Tester Testudo");
    expect(token).toBeTruthy();
  })

  it("should not be able to authenticate an nonexisting user",async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({ email: "nonexisting@user.com", password });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("should not be able to authenticate using an invalid password",async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({ email, password: "wrongPassword" });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
})