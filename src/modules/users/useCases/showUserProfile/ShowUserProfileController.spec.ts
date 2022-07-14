import { Connection, getConnection } from "typeorm"
import request from "supertest";

import { app } from "../../../../app";
import user from "../../../../../tests/mock/newUser-valid";

let connection: Connection;
const { email, password } = user;

describe("On requesting for user profile info", () => {
  beforeAll(async () => {
    connection = getConnection();
    await connection.connect();
    await connection.runMigrations();
    await request(app).post("/api/v1/users").send(user)
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to retrieve user profile info when authenticated", async () => {
    const response = await request(app).post("/api/v1/sessions").send({ email, password })
    const userProfile = await request(app).get("/api/v1/profile").set("Authorization", "bearer " + response.body.token);
    
    expect(userProfile.statusCode).toBe(200);
  })

  it("should not be able to retrieve user profile info when unauthenticated", async () => {
    const unauthenticated = await request(app).get("/api/v1/profile");
    expect(unauthenticated.statusCode).toBe(401);
  })
})