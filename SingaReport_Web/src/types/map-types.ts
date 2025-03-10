/**
 * 用于DataVizSphere组件的数据点类型定义
 */
export interface DataPoint {
  lat: number;
  lng: number;
  value: number;
  category: string;
  // 可选的额外字段，用于悬停提示和详细信息
  title?: string;
  description?: string;
  status?: string;
  id?: string;
  [key: string]: any; // 允许额外的自定义字段
} 