export function getMatchingPosts(posts, profile) {
  return posts.filter((post) =>
    !hasExcludedKeyword(post, profile) && hasProfileKeyword(post, profile)
  );
}

function hasExcludedKeyword(post, profile) {
  const exclusionKeywords = profile.exclusionKeywords || [];
  if (exclusionKeywords.length === 0) {
    return false;
  }

  const text = getPostSearchText(post);
  return exclusionKeywords.some((term) => hasTerm(text, term));
}

function hasProfileKeyword(post, profile) {
  const keywords = [
    ...(profile.primaryKeywords || []),
    ...(profile.supportingKeywords || []),
    ...(profile.locationKeywords || []),
    ...(profile.hiringKeywords || [])
  ];

  if (keywords.length === 0) {
    return true;
  }

  const text = getPostSearchText(post);
  return keywords.some((term) => hasTerm(text, term));
}

function getPostSearchText(post) {
  return [
    post.text,
    post.rawText,
    post.author,
    post.authorHeadline,
    ...(post.hashtags || [])
  ].join(" ").toLowerCase();
}

function hasTerm(text, term) {
  const normalizedTerm = String(term || "").trim().toLowerCase();
  if (!normalizedTerm) {
    return false;
  }

  if (/^[a-z0-9]+(?: [a-z0-9]+)*$/.test(normalizedTerm)) {
    const pattern = normalizedTerm.split(/\s+/).map(escapeRegExp).join("\\s+");
    return new RegExp(`\\b${pattern}\\b`, "i").test(text);
  }

  return text.includes(normalizedTerm);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
