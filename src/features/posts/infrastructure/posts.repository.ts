import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PostInputModel } from '../api/models/input/post-input-model';
import { CommentInputModel } from '../../comments/api/models/input/comment-input.model';
import { LikeStatusInputModel } from '../api/models/input/like-status-input.model';
import { Post } from '../domain/post.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { PostLike } from '../domain/post-like.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createPostForSpecificBlog(
    postInputModel: PostInputModel,
    blogId: number,
    blogName: string,
  ): Promise<number> {
    const posts = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        title: postInputModel.title,
        shortDescription: postInputModel.shortDescription,
        content: postInputModel.content,
        blogId: blogId,
        blogName: blogName,
      })
      .execute();

    return posts.identifiers[0].id;
  }

  async updatePost(
    postInputModel: PostInputModel,
    postId: number,
  ): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Post)
      .set({
        title: postInputModel.title,
        shortDescription: postInputModel.shortDescription,
        content: postInputModel.content,
      })
      .where('id = :id', { id: postId })
      .execute();

    return result.affected === 1;
  }

  async createCommentForSpecificPost(
    postId: number,
    userId: number,
    commentInputModel: CommentInputModel,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const comments = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(Comment)
        .values({
          content: commentInputModel.content,
          userId: userId,
          postId: postId,
        })
        .returning('id')
        .execute();

      return comments.identifiers[0].id;
    });
  }

  async postLikeStatus(
    postId: number,
    userId: number,
    likeStatusInputModel: LikeStatusInputModel,
  ): Promise<number> {
    return this.dataSource.transaction(async () => {
      const existingLike = await this.dataSource
        .createQueryBuilder()
        .select('id')
        .from(PostLike, 'PostLike')
        .where('"postId" = :postId', { postId: postId })
        .andWhere('"userId" = :userId', { userId: userId })
        .execute();

      if (existingLike && existingLike.length > 0) {
        await this.dataSource
          .createQueryBuilder()
          .update(PostLike)
          .set({ likeStatus: likeStatusInputModel.likeStatus })
          .where('"postId" = :postId', { postId: postId })
          .andWhere('"userId" = :userId', { userId: userId })
          .execute();

        return existingLike[0].id;
      } else {
        const newLike = await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(PostLike)
          .values({
            postId: postId,
            userId: userId,
            likeStatus: likeStatusInputModel.likeStatus,
          })
          .returning('id')
          .execute();

        return newLike.identifiers[0].id;
      }
    });
  }

  async deletePost(postId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id = :id', { id: postId })
      .execute();

    return result.affected === 1;
  }
}
