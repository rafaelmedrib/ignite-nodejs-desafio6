import { OperationType, Statement } from "../../../../modules/statements/entities/Statement";
import { IStatementsRepository } from "../../../../modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "../../../../modules/users/repositories/IUsersRepository";
import { ShowUserProfileError } from "../../../../modules/users/useCases/showUserProfile/ShowUserProfileError";
import { inject, injectable } from "tsyringe";
import { CreateStatementError } from "../createStatement/CreateStatementError";

interface IRequest {
  receiver_id: string;
  user_id: string;
  amount: number;
  description: string;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    receiver_id,
    user_id,
  }: IRequest): Promise<Statement> {
    const receiver = await this.usersRepository.findById(receiver_id);
    const user = await this.usersRepository.findById(user_id);

    if(!receiver) {
      throw new ShowUserProfileError();
    }

    const { balance } = await this.statementsRepository.getUserBalance({user_id});

    if(amount > balance) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const transfer = await this.statementsRepository.create({
      amount: -amount,
      description,
      type: OperationType.TRANSFER,
      user_id
    });

    await this.statementsRepository.create({
      amount,
      description,
      sender_id: user.id,
      type: OperationType.TRANSFER,
      user_id: receiver_id
    })

    return transfer;
  }
}

export { CreateTransferUseCase }