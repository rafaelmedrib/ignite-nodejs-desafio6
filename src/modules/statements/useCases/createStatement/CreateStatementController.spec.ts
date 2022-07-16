import request from "supertest";
import { Connection, getConnection } from "typeorm"

import { app } from "../../../../app";
import user from "../../../../../tests/mock/newUser-valid"
import { response } from "express";

const { email, password } = user;
let connection: Connection;
let authorizationHeader: string;

describe("On requesting for creating a statement operation", () => {
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
    const unauthenticated = await request(app).get("/api/v1/statements/deposit");
    expect(unauthenticated.statusCode).toBe(401);
  })

  it("should be able to make a deposit",async () => {
    const { body: { token } } = await request(app).post("/api/v1/sessions").send({ email, password });
    authorizationHeader = "bearer " + token;
    const deposit = 
      await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", authorizationHeader)
      .send({
        amount: 50.25,
        description: "test money",
      });
    
    expect(deposit.statusCode).toBe(201);
  })

  it("should be able to make a withdraw",async () => {
    const withdraw = 
      await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", authorizationHeader)
      .send({
        amount: 10.05,
        description: "test cash"
      })

      expect(withdraw.statusCode).toBe(201);
  })

  it("should not be able to make a withdraw with insufficient funds",async () => {
    const withdraw = 
      await request(app)
      .post("/api/v1/statements/withdraw")
      .set("Authorization", authorizationHeader)
      .send({
        amount: 999999.99,
        description: "I'm not rich yet"
      })

      expect(withdraw.statusCode).toBe(400);
  })
})