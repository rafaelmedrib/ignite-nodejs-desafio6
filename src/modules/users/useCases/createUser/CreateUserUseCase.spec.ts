import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import exp from "constants";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => { 
  beforeEach(async ()=>{
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })
  
  it("should be able to create a new user and return the new user", async () => {
    const newUserDTO: ICreateUserDTO = {
      email: "test@finapi.com",
      name: "Test Tester Testudo",
      password: "testing"
    }

    const newUser = await createUserUseCase.execute(newUserDTO);

    expect(newUser.name).toBe("Test Tester Testudo");
  });

  it("should not be able to create an user when the e-mail has been used already", async () => {
    await expect(async () => {
      const newUserDTO: ICreateUserDTO = {
        email: "test@finapi.com",
        name: "Test Tester Testudo",
        password: "testing"
      }

      const newUser2DTO: ICreateUserDTO = {
        email: "test@finapi.com",
        name: "Test Tester Testudo 2",
        password: "testing2"
      }
  
      await createUserUseCase.execute(newUserDTO);
      await createUserUseCase.execute(newUser2DTO);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
})