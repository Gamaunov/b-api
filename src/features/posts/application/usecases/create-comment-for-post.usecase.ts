import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PostsRepository } from '../../infrastructure/posts.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import {
  blogIdField,
  blogNotFound,
  postIDField,
  postNotFound,
  userIdField,
  userIsBanned,
} from '../../../../base/constants/constants';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { CommentInputModel } from '../../../comments/api/models/input/comment-input.model';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class PostCreateCommentCommand {
  constructor(
    public commentInputModel: CommentInputModel,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(PostCreateCommentCommand)
export class PostCreateCommentUseCase
  implements ICommandHandler<PostCreateCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: PostCreateCommentCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.postId)) {
      throw new NotFoundException();
    }

    if (isNaN(+command.userId)) {
      throw new ForbiddenException();
    }

    const user = await this.usersQueryRepository.findUserByIdWithBanInfo(
      +command.userId,
    );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    const post = await this.postsQueryRepository.findPostEntity(
      +command.postId,
    );

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    const blog = await this.blogsQueryRepository.findBlogEntity(post.blog.id);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    if (user.isBannedByBlogger) {
      return {
        data: false,
        code: ResultCode.Forbidden,
        field: userIdField,
        message: userIsBanned,
      };
    }

    const postId = await this.postsRepository.createCommentForSpecificPost(
      +command.postId,
      +command.userId,
      command.commentInputModel,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: postId,
    };
  }
}
