const GITHUB_API = 'https://api.github.com';

interface GitHubFile {
  content: string;
  sha: string;
  name: string;
  path: string;
}

function getConfig() {
  const pat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_REPO_OWNER || 'mryan-rapt';
  const repo = process.env.GITHUB_REPO_NAME || 'cro-test';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!pat) throw new Error('GITHUB_PAT environment variable not set');
  return { pat, owner, repo, branch };
}

export async function getFile(path: string): Promise<GitHubFile> {
  const { pat, owner, repo, branch } = getConfig();

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub getFile failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');

  return {
    content: decoded,
    sha: data.sha,
    name: data.name,
    path: data.path,
  };
}

export async function commitFile(
  path: string,
  content: string,
  message: string,
  currentSha: string
): Promise<string> {
  const { pat, owner, repo, branch } = getConfig();

  const encoded = Buffer.from(content).toString('base64');

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encoded,
        sha: currentSha,
        branch,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub commitFile failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.commit.sha as string;
}

export async function commitMultipleFiles(
  files: Array<{ path: string; content: string }>,
  message: string
): Promise<string> {
  const { pat, owner, repo, branch } = getConfig();

  // Get the current commit SHA for the branch
  const refRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!refRes.ok) throw new Error(`GitHub getRef failed: ${refRes.status}`);
  const ref = await refRes.json();
  const baseCommitSha = ref.object.sha as string;

  // Get the base tree SHA
  const commitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/commits/${baseCommitSha}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!commitRes.ok) throw new Error(`GitHub getCommit failed: ${commitRes.status}`);
  const commit = await commitRes.json();
  const baseTreeSha = commit.tree.sha as string;

  // Create blobs for each file
  const treeItems = await Promise.all(
    files.map(async ({ path, content }) => {
      const blobRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, encoding: 'utf-8' }),
        }
      );
      if (!blobRes.ok) throw new Error(`GitHub createBlob failed: ${blobRes.status}`);
      const blob = await blobRes.json();
      return {
        path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha as string,
      };
    })
  );

  // Create new tree
  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    }
  );
  if (!treeRes.ok) throw new Error(`GitHub createTree failed: ${treeRes.status}`);
  const tree = await treeRes.json();

  // Create commit
  const newCommitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/commits`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [baseCommitSha],
      }),
    }
  );
  if (!newCommitRes.ok) throw new Error(`GitHub createCommit failed: ${newCommitRes.status}`);
  const newCommit = await newCommitRes.json();

  // Update branch ref
  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sha: newCommit.sha }),
    }
  );
  if (!updateRefRes.ok) throw new Error(`GitHub updateRef failed: ${updateRefRes.status}`);

  return newCommit.sha as string;
}
