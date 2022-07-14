import { app } from "../../../../app";
import { Connection, getConnection } from "typeorm";
import request from "supertest";

import user from "../../../../../tests/mock/newUser-valid"

let connection: Connection;

describe("On sending a request to create a new user", () => {
  beforeAll(async () => {
    connection = getConnection();
    await connection.connect()
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should return status 201", async () => {
    const createUser = await request(app).post("/api/v1/users").send(user)
    
    expect(createUser.statusCode).toBe(201);
  })

  it("should not be able to create a user when the e-mail is already in use", async () => {
    user.name = "Test Tester Testudo II"
    const createUserError = await request(app).post("/api/v1/users").send(user);
    expect(createUserError.statusCode).toBe(400);
  })
})
