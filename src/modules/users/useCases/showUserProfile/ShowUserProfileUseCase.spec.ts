import { User } from "@modules/users/entities/User";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

const  email = "test@finapi.com";
const  name = "Test Tester Testudo";
const password = "testing";
let user: User;

describe("On showing user profile...", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository;
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);

    user = await createUserUseCase.execute({ email, name, password });
  })

  it("should be able to retrieve user's profile data",async () => {
    const userProfile = await showUserProfileUseCase.execute(user.id);

    expect(userProfile.name).toBe(name);
  });

  it("should not be able to retrieve data from an unregistered user id",async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute("7h1s-1d-d035n'7-3x157")
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
})