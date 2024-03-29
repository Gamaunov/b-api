import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import { UsersTestManager } from '../../base/managers/users.manager';
import { waitForIt } from '../../../src/base/utils/wait';
import { testing_allData_uri } from '../../base/utils/constants/routes';
import { beforeAllConfig } from '../../base/settings/beforeAllConfig';
import {
  basicAuthLogin,
  basicAuthPassword,
} from '../../base/utils/constants/auth.constants';
import { expectErrorWithPath } from '../../base/utils/functions/expect/expectErrorWithPath';
import { createBlogInput } from '../../base/utils/constants/blogs.constant';
import {
  createPostInput,
  createPostInput2,
  createPostInput3,
  createPostInput4,
  createPostInput5,
  createPostInput6,
  createPostInput7,
} from '../../base/utils/constants/posts.constants';
import { expectFirstPaginatedPost } from '../../base/utils/functions/expect/posts/expectFirstPaginatedPost';
import { expectPaginatedPosts } from '../../base/utils/functions/expect/posts/expectPaginatedPosts';

describe('Blogs: GET sa/blogs/:blogId/posts', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const testConfig = await beforeAllConfig();
    app = testConfig.app;
    agent = testConfig.agent;
    usersTestManager = testConfig.usersTestManager;
  }, 15000);

  describe('negative: GET sa/blogs/:id/posts', () => {
    it(`should clear db`, async () => {
      await agent.delete(testing_allData_uri);
    });

    it(`should not Return posts for blog with paging and sorting if login is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth('incorrect', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts`);
    });

    it(`should not Return posts for blog with paging and sorting if login is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth('', basicAuthPassword)
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts`);
    });

    it(`should not Return posts for blog with paging and sorting if password is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth(basicAuthLogin, 'incorrect')
        .query({ pageSize: 3, sortDirection: 'asc' })
        .expect(401);

      expectErrorWithPath(
        response,
        401,
        `/sa/blogs/${blogId}/posts?pageSize=3&sortDirection=asc`,
      );
    });

    it(`should not Return posts for blog with paging and sorting if password is incorrect`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth(basicAuthLogin, '')
        .expect(401);

      expectErrorWithPath(response, 401, `/sa/blogs/${blogId}/posts`);
    });
  });

  describe('positive: GET sa/blogs/:id/posts', () => {
    it(`should clear db`, async () => {
      await waitForIt();
      await agent.delete(testing_allData_uri);
    }, 15000);

    it(`should Return created post`, async () => {
      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput, blogId);

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 5, sortDirection: 'desc' })
        .expect(200);

      expectFirstPaginatedPost(
        response,
        1,
        1,
        5,
        1,
        createPostInput,
        blogId,
        createBlogInput.name,
      );
    });

    it(`should Return posts for blog with paging and sorting`, async () => {
      await agent.delete(testing_allData_uri);

      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput, blogId);
      await usersTestManager.createPostForBlog(createPostInput2, blogId);
      await usersTestManager.createPostForBlog(createPostInput3, blogId);
      await usersTestManager.createPostForBlog(createPostInput4, blogId);
      await usersTestManager.createPostForBlog(createPostInput5, blogId);
      await usersTestManager.createPostForBlog(createPostInput6, blogId);
      await usersTestManager.createPostForBlog(createPostInput7, blogId);

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 7, sortDirection: 'asc' })
        .expect(200);

      expectPaginatedPosts(
        response,
        1,
        1,
        7,
        7,
        createPostInput,
        createPostInput2,
        createPostInput3,
        createPostInput4,
        createPostInput5,
        createPostInput6,
        createPostInput7,
        blogId,
        createBlogInput.name,
      );
    });

    it(`should Return posts for blog with paging and sorting`, async () => {
      await agent.delete(testing_allData_uri);

      const blog = await usersTestManager.createBlog(createBlogInput);
      const blogId = blog.body.id;

      await usersTestManager.createPostForBlog(createPostInput, blogId);
      await usersTestManager.createPostForBlog(createPostInput2, blogId);
      await usersTestManager.createPostForBlog(createPostInput3, blogId);
      await usersTestManager.createPostForBlog(createPostInput4, blogId);
      await usersTestManager.createPostForBlog(createPostInput5, blogId);
      await usersTestManager.createPostForBlog(createPostInput6, blogId);
      await usersTestManager.createPostForBlog(createPostInput7, blogId);

      const response = await agent
        .get(`/sa/blogs/${blogId}/posts`)
        .auth(basicAuthLogin, basicAuthPassword)
        .query({ pageSize: 7, sortDirection: 'desc' })
        .expect(200);

      expectPaginatedPosts(
        response,
        1,
        1,
        7,
        7,
        createPostInput7,
        createPostInput6,
        createPostInput5,
        createPostInput4,
        createPostInput3,
        createPostInput2,
        createPostInput,
        blogId,
        createBlogInput.name,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
