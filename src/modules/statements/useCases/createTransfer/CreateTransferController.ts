import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

export class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    
    const { receiver_id } = request.params;
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    
    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const transfer = await createTransferUseCase.execute({
      amount,
      description, 
      receiver_id, 
      user_id
    })

    return response.status(200).json(transfer);
  }
}
