import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
Pick<
  Statement,
  'user_id' |
  'description' |
  'amount' |
  'type'
> | Pick<
  Statement,
  'sender_id' |
  'user_id' |
  'description' |
  'amount' |
  'type'
>
