/**
 * 轮播项类型定义
 * 支持图片和视频两种类型
 */
export interface CarouselItem {
  /** 唯一标识 */
  id: number;
  /** 类型：图片或视频 */
  type: "image" | "video";
  /**
   * 资源路径
   * - 图片类型：图片URL路径
   * - 视频类型：Cloudflare Stream 视频ID
   */
  src: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 视频缩略图（仅视频类型使用） */
  thumbnail?: string;
}
