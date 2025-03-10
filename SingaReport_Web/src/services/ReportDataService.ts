import { DataPoint } from '@/types/map-types';

/**
 * 从API获取报告数据并转换为DataVizSphere可用的格式
 */
export async function fetchReportDataPoints(): Promise<DataPoint[]> {
  try {
    console.log('Fetching report data from database for visualization...');
    
    // 使用forceDatabase=true参数强制从数据库获取真实数据，而不是演示数据
    const response = await fetch('/api/reports?forceDatabase=true&allUsers=true');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching reports (${response.status}): ${errorText}`);
      throw new Error(`Error fetching reports: ${response.status}`);
    }
    
    const data = await response.json();
    const reports = data.reports || [];
    
    console.log(`Successfully fetched ${reports.length} reports`);
    console.log(`Reports with coordinates: ${reports.filter((r: any) => r.latitude && r.longitude).length}`);
    
    // 将API响应转换为DataPoint格式
    const dataPoints = reports
      .filter((report: any) => {
        // 只包含有地理坐标的报告
        const hasCoordinates = report.latitude && report.longitude; 
        if (!hasCoordinates) {
          console.debug('Report without coordinates:', report.id);
        }
        return hasCoordinates;
      })
      .map((report: any) => {
        // 确保类别是有效的
        let category = report.category || 'other';
        
        // 标准化类别名称
        const categoryMap: Record<string, string> = {
          'infrastructural': 'infrastructure',
          'infrastructure_issues': 'infrastructure',
          'street_facility': 'infrastructure',
          'street_light': 'infrastructure',
          'environment_issues': 'environment',
          'cleanliness_issues': 'cleanliness',
          'cleaning': 'cleanliness',
          'sanitation': 'cleanliness',
          'safety_issues': 'safety',
          'security': 'safety',
          'hazard': 'safety',
          'facilities_issues': 'facilities',
          'noise_issues': 'noise',
          'pollution': 'environment',
          'construction_issues': 'construction',
          'building': 'construction'
        };
        
        if (categoryMap[category.toLowerCase()]) {
          category = categoryMap[category.toLowerCase()];
        }
        
        // 根据严重程度设置value值
        let value = 5; // 默认值
        if (report.severity) {
          switch (report.severity.toLowerCase()) {
            case 'high':
            case 'urgent':
            case 'critical':
              value = 7;
              break;
            case 'medium':
            case 'normal':
            case 'moderate':
              value = 5;
              break;
            case 'low':
            case 'minor':
              value = 3;
              break;
            default:
              value = 5;
          }
        }
        
        return {
          lat: parseFloat(report.latitude),
          lng: parseFloat(report.longitude),
          value: value,
          category: category,
          // 添加额外数据以便在悬停提示中显示
          title: report.title,
          description: report.description,
          status: report.status,
          id: report.id,
          createdAt: report.createdAt,
          location: report.location
        };
      });
    
    console.log(`Transformed ${dataPoints.length} reports to data points for visualization`);
    return dataPoints;
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error; // 重新抛出错误以便上层组件处理
  }
} 