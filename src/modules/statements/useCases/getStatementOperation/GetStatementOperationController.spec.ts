import { Connection, getConnection } from "typeorm"
import request from "supertest";

import user from "../../../../../tests/mock/newUser-valid";
import { app } from "../../../../app";

const { email, password } = user;
let connection: Connection;
let authorizationHeader: string;

describe("On requesting for statement operation info", () => {
  beforeAll(async () => {
    connection = getConnection();
    await connection.connect();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(user);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  it("should not be able to perform any operation when unauthenticated", async () => {
    const unauthenticated = await request(app).get("/api/v1/statements/");
    expect(unauthenticated.statusCode).toBe(401);
  });

  it("should be able to get statement operation info", async () => {
    const { body: { token } } = await request(app).post("/api/v1/sessions").send({ email, password });
    authorizationHeader = "bearer " + token;

    const { body: { id } } = 
      await request(app)
      .post("/api/v1/statements/deposit")
      .set("Authorization", authorizationHeader)
      .send({
        amount: 50.25,
        description: "test money",
      });

    const statement = 
      await request(app)
        .get(`/api/v1/statements/${id}`)
        .set("Authorization", authorizationHeader);

    expect(statement.statusCode).toBe(200);
  })

  it("should handle error when using wrong statement id", async () => {
    const wrongStatementId = "bfd68816-0536-11ed-b939-0242ac120002";
    const statement = 
      await request(app)
        .get(`/api/v1/statements/${wrongStatementId}`)
        .set("Authorization", authorizationHeader);
    expect(statement.statusCode).toBe(404);
  })
})