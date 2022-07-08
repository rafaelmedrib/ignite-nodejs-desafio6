export default {
  jwt: {
    secret: process.env.JWT_SECRET as string || "don'tTellAnyone",
    expiresIn: '1d'
  }
}
