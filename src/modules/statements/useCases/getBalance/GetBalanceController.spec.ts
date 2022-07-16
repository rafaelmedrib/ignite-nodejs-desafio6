import { Connection, getConnection } from "typeorm"
import request from "supertest";

import user from "../../../../../tests/mock/newUser-valid";
import { app } from "../../../../app";

let connection: Connection;
const { email, password } = user;

describe("On requesting for balance and statements info", () => {
  beforeAll(async () => {
    connection = getConnection();
    await connection.connect();
    await connection.runMigrations()

    await request(app).post("/api/v1/users").send(user);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  it("should not be able to perform any operation when unauthenticated",async () => {
    const unauthenticated = await request(app).get("/api/v1/statements/balance");
    expect(unauthenticated.statusCode).toBe(401);
  })

  it("should be able to get balance and statements info",async () => {
    const { body: { token } } = await request(app).post("/api/v1/sessions").send({ email, password });
    
    const balance = 
      await request(app)
      .get("/api/v1/statements/balance")
      .set("Authorization", "bearer " + token);

    expect(balance.statusCode).toBe(200);
  })
})