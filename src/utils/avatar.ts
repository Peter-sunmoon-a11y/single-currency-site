/**
 * 头像管理工具函数
 */

const AVATAR_COUNT = 14; // Avatar-0.png 到 Avatar-13.png
const AVATAR_STORAGE_KEY = "userAvatar";

/**
 * 获取随机头像文件名
 */
export function getRandomAvatarId(): number {
  return Math.floor(Math.random() * AVATAR_COUNT);
}

/**
 * 根据头像ID获取头像URL
 */
export function getAvatarUrl(avatarId: number): string {
  return `/images/avatars/Avatar-${avatarId}.png`;
}

/**
 * 获取随机头像URL
 */
export function getRandomAvatarUrl(): string {
  const avatarId = getRandomAvatarId();
  return getAvatarUrl(avatarId);
}

/**
 * 为用户分配并保存随机头像
 * @param userId 用户ID，用于确保同一用户总是得到相同的头像（可选）
 */
export function assignRandomAvatar(userId?: string | number): string {
  console.info(userId);
  try {
    // 如果已经有头像，直接返回
    const existingAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (existingAvatar) {
      return existingAvatar;
    }

    const avatarUrl = getAvatarUrl(0);

    // 保存到 localStorage
    localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
    return avatarUrl;
  } catch (error) {
    console.warn("Failed to assign avatar:", error);
    // 如果出错，返回默认头像
    return getAvatarUrl(0);
  }
}

/**
 * 获取用户当前头像
 */
export function getUserAvatar(): string | null {
  try {
    return localStorage.getItem(AVATAR_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to get user avatar:", error);
    return null;
  }
}

/**
 * 设置用户头像
 */
export function setUserAvatar(avatarUrl: string): void {
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, avatarUrl);
  } catch (error) {
    console.warn("Failed to set user avatar:", error);
  }
}

/**
 * 清除用户头像
 */
export function clearUserAvatar(): void {
  try {
    // localStorage.removeItem(AVATAR_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear user avatar:", error);
  }
}

/**
 * 检查头像URL是否有效
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url) return false;

  // 检查是否是我们的头像格式
  const avatarPattern = /^\/images\/avatar\/Avatar-\d+\.png$/;
  if (avatarPattern.test(url)) return true;

  // 检查是否是有效的HTTP(S) URL
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 获取用户头像，如果没有则分配一个
 */
export function getOrAssignUserAvatar(userId?: string | number): string {
  const existingAvatar = getUserAvatar();

  if (existingAvatar && isValidAvatarUrl(existingAvatar)) {
    return existingAvatar;
  }

  return assignRandomAvatar(userId);
}
