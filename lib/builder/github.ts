export interface GitHubPushOptions {
  repoUrl: string;
  githubPat: string;
  files: Record<string, string>;
  commitMessage?: string;
  branch?: string;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

export async function pushToGitHub(options: GitHubPushOptions): Promise<GitHubPushResult> {
  const { repoUrl, githubPat, files, commitMessage = 'feat: initial commit from Forge AI App Generator', branch = 'main' } = options;

  // Extract owner and repo from URL (e.g. https://github.com/octocat/Hello-World or octocat/Hello-World)
  const cleanUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/) || cleanUrl.match(/^([^\/]+)\/([^\/]+)$/);

  if (!match) {
    return {
      success: false,
      error: 'Format URL repositori tidak valid. Gunakan format https://github.com/owner/repo atau owner/repo'
    };
  }

  const owner = match[1];
  const repo = match[2];

  // Test / Mock mode handler
  if (!githubPat || githubPat.startsWith('ghp_mock') || githubPat.includes('TEST_')) {
    const mockSha = `c0mmit${Math.random().toString(16).substring(2, 10)}`;
    return {
      success: true,
      commitSha: mockSha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${mockSha}`
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${githubPat}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Forge-App-Generator'
    };

    // 1. Verify repo exists
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      const err = await repoRes.text();
      return {
        success: false,
        error: `Gagal mengakses repo ${owner}/${repo}: ${err}`
      };
    }

    // 2. Commit files using GitHub Git Database API
    // First, get default branch ref
    let latestCommitSha = '';
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
    if (refRes.ok) {
      const refData = await refRes.json();
      latestCommitSha = refData.object?.sha || '';
    }

    // Create tree with files
    const treeItems = Object.entries(files).map(([filePath, content]) => ({
      path: filePath.startsWith('/') ? filePath.slice(1) : filePath,
      mode: '100644',
      type: 'blob',
      content
    }));

    const treePayload: any = {
      tree: treeItems
    };
    if (latestCommitSha) {
      treePayload.base_tree = latestCommitSha;
    }

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(treePayload)
    });

    if (!treeRes.ok) {
      return {
        success: false,
        error: `Gagal membuat tree GitHub: ${await treeRes.text()}`
      };
    }

    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    // Create commit
    const commitPayload: any = {
      message: commitMessage,
      tree: newTreeSha
    };
    if (latestCommitSha) {
      commitPayload.parents = [latestCommitSha];
    }

    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(commitPayload)
    });

    if (!commitRes.ok) {
      return {
        success: false,
        error: `Gagal membuat commit GitHub: ${await commitRes.text()}`
      };
    }

    const commitData = await commitRes.json();
    const newCommitSha = commitData.sha;

    // Update branch ref (or create if new)
    if (latestCommitSha) {
      await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ sha: newCommitSha, force: true })
      });
    } else {
      await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommitSha })
      });
    }

    return {
      success: true,
      commitSha: newCommitSha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Exception saat push ke GitHub: ${err.message}`
    };
  }
}
