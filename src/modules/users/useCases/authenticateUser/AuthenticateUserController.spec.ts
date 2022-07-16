import { Connection, getConnection } from "typeorm";
import request from "supertest";

import user from "../../../../../tests/mock/newUser-valid";
import { app } from "../../../../app";

let connection: Connection;

const { email, password } = user;

describe("On requesting login", () => {
  beforeAll(async () => {
    connection = getConnection();
    await connection.connect()
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(user);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to use valid credentials and retrieve a token and the user info", async () => {
    const response = await request(app).post("/api/v1/sessions").send({ email, password });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to login using incorrect email",async () => {
    const response = await request(app).post("/api/v1/sessions").send({ email: "wrong@email.com", password });
    
    expect(response.statusCode).toBe(401);
  });

  it("should not be able to login using incorrect password",async () => {
    const response = await request(app).post("/api/v1/sessions").send({ email, password: "wrongPassword" });

    expect(response.statusCode).toBe(401);
  });
});