// updateOrCreateTag.js
module.exports = async ({ github, context, tag }) => {
  try {
    await github.rest.git.createRef({
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: `refs/tags/${tag}`,
      sha: context.sha,
    });
  } catch (error) {
    if (error.status === 422) {
      await github.rest.git.updateRef({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: `tags/${tag}`,
        sha: context.sha,
        force: true,
      });
    } else {
      throw error;
    }
  }
};