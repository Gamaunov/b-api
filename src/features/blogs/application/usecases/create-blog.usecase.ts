import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog-input-model';

export class BlogCreateCommand {
  constructor(public blogInputModel: BlogInputModel) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: BlogCreateCommand): Promise<number> {
    return await this.blogsRepository.createBlog(command.blogInputModel);
  }
}
