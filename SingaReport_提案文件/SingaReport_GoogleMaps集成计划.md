# SingaReport Google Maps集成计划

## 文档概述

本文档详细说明如何将Google Maps API集成到SingaReport智慧城市解决方案中，提供了完整的实施步骤和技术细节。

**文档编制日期**: 2024年3月
**文档版本**: 1.0
**适用项目阶段**: 开发阶段

---

## 一、项目分析

### 1. 地图功能需求

基于对SingaReport项目代码的分析，我们需要在以下几个关键场景中集成地图功能：

- **报告创建页面**：允许用户通过地图选择和标记问题位置
- **仪表板页面**：展示报告的地理分布和热点区域
- **报告详情页面**：显示单个报告的精确位置
- **数据分析页面**：基于地理位置的问题分布分析和可视化

### 2. 当前实现状态

目前项目中的地图相关功能处于以下状态：

- 报告创建页面有地图占位符，但无实际功能
- 数据库模型已包含位置信息字段（`location`, `latitude`, `longitude`）
- 后端API已支持位置数据的存储和查询
- 前端没有任何地图相关的实际实现

### 3. 技术选择理由

选择Google Maps API的原因：

- 在新加坡地区有高精度的地图数据
- 强大的地点搜索和地理编码能力
- 完善的React集成库和文档
- 支持热图、标记自定义等高级功能
- 良好的移动设备支持和响应式设计

---

## 二、集成计划

### 第一阶段：环境准备与基础配置

#### 1.1 获取Google Maps API密钥

1. 访问[Google Cloud Platform Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Maps JavaScript API、Places API和Geocoding API
4. 创建API密钥并设置适当的使用限制
5. 注意保存API密钥，用于后续配置

#### 1.2 安装依赖包

```bash
cd SingaReport_Web
npm install @react-google-maps/api @googlemaps/react-wrapper google-map-react
```

#### 1.3 配置环境变量

在`.env`文件中添加Google Maps API密钥：

```bash
# 添加到现有.env文件
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### 1.4 创建地图基础组件

在`src/components/maps`目录下创建基础地图组件：

1. **创建地图容器组件**
   - `MapContainer.tsx`：基础地图容器
   - `MapMarker.tsx`：地图标记组件
   - `MapInfoWindow.tsx`：信息窗口组件
   - `MapSearchBox.tsx`：地图搜索组件

2. **创建地图上下文**
   - `MapContext.tsx`：提供地图状态共享

### 第二阶段：报告创建页面地图集成

#### 2.1 实现位置选择地图

改造`src/app/(public)/report/new/page.tsx`中的地图实现：

1. **添加地图组件**
   - 替换占位符为实际功能的Google Maps组件
   - 实现拖拽标记选择位置功能
   - 添加地址自动补全功能

2. **实现当前位置检测功能**
   - 使用浏览器Geolocation API获取用户当前位置
   - 实现"使用当前位置"按钮功能

3. **添加地址反向解析**
   - 通过Google Maps Geocoding API将坐标转换为具体地址
   - 自动填充地址字段

#### 2.2 报告位置数据处理

1. **扩展表单数据处理**
   - 修改表单状态以包含完整的位置信息
   - 添加坐标和地址验证功能

2. **调整API请求**
   - 确保POST请求包含位置坐标和描述
   - 添加错误处理和数据验证

### 第三阶段：仪表板地图视图

#### 3.1 创建仪表板地图组件

1. **实现报告分布地图**
   - 在dashboard页面添加地图视图选项卡
   - 创建可视化所有报告位置的地图组件

2. **开发热点图功能**
   - 使用Google Maps热图功能显示问题集中区域
   - 按问题类型和状态筛选热图数据

#### 3.2 地图数据处理

1. **创建API端点**
   - 新增专用于地图数据的API端点
   - 实现地理位置聚合和数据优化

2. **数据加载优化**
   - 实现数据分页和延迟加载
   - 减少不必要的数据传输

### 第四阶段：报告详情和数据分析

#### 4.1 报告详情页地图

1. **单个报告位置地图**
   - 在报告详情页添加精确位置地图
   - 实现街景视图集成（如适用）

2. **相关问题展示**
   - 在地图上显示邻近区域的相关问题
   - 提供空间关联分析功能

#### 4.2 数据分析页面

1. **创建地理分析组件**
   - 实现基于地理位置的分布统计
   - 开发时间-空间分析视图

2. **交互式筛选功能**
   - 按区域、问题类型和时间筛选数据
   - 可视化问题解决速度的地区差异

### 第五阶段：性能优化和移动适配

#### 5.1 性能优化

1. **加载优化**
   - 实现懒加载和按需加载地图资源
   - 使用地图数据缓存减少API调用

2. **渲染优化**
   - 对大量标记点使用聚类技术
   - 实现视图边界检查以减少渲染内容

#### 5.2 移动设备适配

1. **响应式地图设计**
   - 为不同屏幕尺寸优化地图界面
   - 实现移动友好的交互控件

2. **触摸操作优化**
   - 优化触摸手势支持
   - 针对移动设备的性能调整

---

## 三、技术实现细节

### 1. 核心组件设计

#### 基础地图组件 (MapContainer.tsx)

```typescript
'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// 新加坡中心坐标
const defaultCenter = {
  lat: 1.3521,
  lng: 103.8198
};

interface MapContainerProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

export default function MapContainer({ 
  center = defaultCenter, 
  zoom = 12, 
  onClick, 
  children 
}: MapContainerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onClick={onClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      }}
    >
      {children}
    </GoogleMap>
  ) : (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
```

#### 地图标记组件 (MapMarker.tsx)

```typescript
'use client';

import { Marker } from '@react-google-maps/api';

interface MapMarkerProps {
  position: google.maps.LatLngLiteral;
  draggable?: boolean;
  icon?: string;
  onClick?: () => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
}

export default function MapMarker({ 
  position, 
  draggable = false, 
  icon,
  onClick, 
  onDragEnd 
}: MapMarkerProps) {
  return (
    <Marker
      position={position}
      draggable={draggable}
      icon={icon}
      onClick={onClick}
      onDragEnd={onDragEnd}
    />
  );
}
```

#### 搜索框组件 (MapSearchBox.tsx)

```typescript
'use client';

import { useRef, useState, useEffect } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';

interface MapSearchBoxProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

export default function MapSearchBox({ 
  onPlaceSelected, 
  placeholder = "Search for a location" 
}: MapSearchBoxProps) {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const onUnmount = () => {
    setSearchBox(null);
  };

  useEffect(() => {
    if (searchBox) {
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
          onPlaceSelected(places[0]);
        }
      });
    }
  }, [searchBox, onPlaceSelected]);

  return (
    <StandaloneSearchBox
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
      />
    </StandaloneSearchBox>
  );
}
```

### 2. 报告创建页面实现

#### 地图选择位置组件

```typescript
'use client';

import { useState, useCallback } from 'react';
import MapContainer from '@/components/maps/MapContainer';
import MapMarker from '@/components/maps/MapMarker';
import MapSearchBox from '@/components/maps/MapSearchBox';

interface LocationPickerProps {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
  };
}

export default function LocationPicker({ 
  onLocationSelected, 
  initialLocation 
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(
    initialLocation?.latitude && initialLocation?.longitude 
      ? { 
          lat: initialLocation.latitude, 
          lng: initialLocation.longitude 
        } 
      : null
  );
  
  const [address, setAddress] = useState(initialLocation?.address || '');

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarkerPosition(newPosition);
      
      // 反向地理编码获取地址
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const newAddress = results[0].formatted_address;
          setAddress(newAddress);
          onLocationSelected({
            latitude: newPosition.lat,
            longitude: newPosition.lng,
            address: newAddress
          });
        }
      });
    }
  }, [onLocationSelected]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarkerPosition(newPosition);
      
      // 反向地理编码获取地址
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const newAddress = results[0].formatted_address;
          setAddress(newAddress);
          onLocationSelected({
            latitude: newPosition.lat,
            longitude: newPosition.lng,
            address: newAddress
          });
        }
      });
    }
  }, [onLocationSelected]);

  const handlePlaceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setMarkerPosition(newPosition);
      
      const newAddress = place.formatted_address || '';
      setAddress(newAddress);
      onLocationSelected({
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        address: newAddress
      });
    }
  }, [onLocationSelected]);

  const handleCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarkerPosition(newPosition);
          
          // 反向地理编码获取地址
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: newPosition }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const newAddress = results[0].formatted_address;
              setAddress(newAddress);
              onLocationSelected({
                latitude: newPosition.lat,
                longitude: newPosition.lng,
                address: newAddress
              });
            }
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to retrieve your location. Please allow location access or select location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, [onLocationSelected]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute top-2 left-2 right-2 z-10">
          <MapSearchBox onPlaceSelected={handlePlaceSelected} placeholder="Search for a location" />
        </div>
        <div className="h-[300px] rounded-lg overflow-hidden">
          <MapContainer 
            onClick={handleMapClick}
            center={markerPosition || undefined}
            zoom={markerPosition ? 15 : 12}
          >
            {markerPosition && (
              <MapMarker 
                position={markerPosition} 
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
          </MapContainer>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          placeholder="Enter location or address"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (markerPosition) {
              onLocationSelected({
                latitude: markerPosition.lat,
                longitude: markerPosition.lng,
                address: e.target.value
              });
            }
          }}
        />
      </div>
      
      <div className="flex space-x-2">
        <button 
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
          onClick={handleCurrentLocation}
        >
          <span className="mr-2">📍</span> Use Current Location
        </button>
        <button 
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
          onClick={() => {
            // Clear the marker and address
            setMarkerPosition(null);
            setAddress('');
            onLocationSelected({
              latitude: 0,
              longitude: 0,
              address: ''
            });
          }}
        >
          <span className="mr-2">🔄</span> Reset Location
        </button>
      </div>
    </div>
  );
}
```

### 3. 仪表板地图视图

#### 创建地图视图组件

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { HeatmapLayer } from '@react-google-maps/api';
import MapContainer from '@/components/maps/MapContainer';
import MapMarker from '@/components/maps/MapMarker';
import MapInfoWindow from '@/components/maps/MapInfoWindow';

interface Report {
  id: string;
  title: string;
  category: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  location?: string;
}

interface DashboardMapProps {
  reports: Report[];
  selectedCategory?: string;
  selectedStatus?: string;
}

export default function DashboardMap({ 
  reports, 
  selectedCategory, 
  selectedStatus 
}: DashboardMapProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // 过滤包含位置信息的报告
  const geoReports = useMemo(() => {
    return reports.filter(report => 
      report.latitude && report.longitude &&
      (!selectedCategory || report.category === selectedCategory) &&
      (!selectedStatus || report.status === selectedStatus)
    );
  }, [reports, selectedCategory, selectedStatus]);

  // 生成热图数据
  const heatmapData = useMemo(() => {
    return geoReports.map(report => ({
      location: new google.maps.LatLng(report.latitude!, report.longitude!),
      weight: 1
    }));
  }, [geoReports]);

  // 标记点图标根据类别自定义
  const getMarkerIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'roads': '/icons/marker-road.png',
      'cleanliness': '/icons/marker-clean.png',
      'facilities': '/icons/marker-facility.png',
      'safety': '/icons/marker-safety.png',
      'environment': '/icons/marker-environment.png',
      // 默认使用标准图标
      'default': ''
    };
    
    return iconMap[category] || iconMap.default;
  };

  // 计算所有点的中心位置
  const mapCenter = useMemo(() => {
    if (geoReports.length === 0) {
      // 默认为新加坡中心
      return { lat: 1.3521, lng: 103.8198 };
    }
    
    const sumLat = geoReports.reduce((sum, report) => 
      sum + (report.latitude || 0), 0);
    const sumLng = geoReports.reduce((sum, report) => 
      sum + (report.longitude || 0), 0);
    
    return {
      lat: sumLat / geoReports.length,
      lng: sumLng / geoReports.length
    };
  }, [geoReports]);

  return (
    <div className="h-full relative">
      <div className="absolute top-4 right-4 z-10 bg-white rounded-md shadow-md p-2">
        <button
          className={`px-3 py-1 text-sm rounded-md ${
            showHeatmap ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Show Markers' : 'Show Heatmap'}
        </button>
      </div>
      
      <MapContainer center={mapCenter}>
        {/* 热图层 */}
        {showHeatmap && geoReports.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 20,
              opacity: 0.7,
              gradient: [
                'rgba(0, 255, 255, 0)',
                'rgba(0, 255, 255, 1)',
                'rgba(0, 191, 255, 1)',
                'rgba(0, 127, 255, 1)',
                'rgba(0, 63, 255, 1)',
                'rgba(0, 0, 255, 1)',
                'rgba(0, 0, 223, 1)',
                'rgba(0, 0, 191, 1)',
                'rgba(0, 0, 159, 1)',
                'rgba(0, 0, 127, 1)',
                'rgba(63, 0, 91, 1)',
                'rgba(127, 0, 63, 1)',
                'rgba(191, 0, 31, 1)',
                'rgba(255, 0, 0, 1)'
              ]
            }}
          />
        )}
        
        {/* 标记点 */}
        {!showHeatmap && geoReports.map(report => (
          <MapMarker
            key={report.id}
            position={{ lat: report.latitude!, lng: report.longitude! }}
            icon={getMarkerIcon(report.category)}
            onClick={() => setSelectedReport(report)}
          />
        ))}
        
        {/* 信息窗口 */}
        {selectedReport && (
          <MapInfoWindow
            position={{ 
              lat: selectedReport.latitude!, 
              lng: selectedReport.longitude! 
            }}
            onClose={() => setSelectedReport(null)}
          >
            <div className="p-2">
              <h3 className="font-medium text-gray-900">{selectedReport.title}</h3>
              <p className="text-sm text-gray-500">
                {selectedReport.location || 'No address provided'}
              </p>
              <span className={`inline-block px-2 py-1 mt-2 text-xs rounded-full ${
                selectedReport.status === 'resolved' 
                  ? 'bg-green-100 text-green-800' 
                  : selectedReport.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedReport.status}
              </span>
              <div className="mt-2">
                <a 
                  href={`/report/${selectedReport.id}`}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View Details →
                </a>
              </div>
            </div>
          </MapInfoWindow>
        )}
      </MapContainer>
    </div>
  );
}
```

---

## 四、集成测试计划

### 1. 单元测试

为地图组件创建单元测试，验证：
- 组件渲染是否正确
- 事件处理是否按预期工作
- 边界情况处理是否合理

### 2. 集成测试

测试地图功能在整个应用流程中的表现：
- 报告创建流程中的位置选择
- 查看报告时的位置显示
- 仪表板中的地图交互

### 3. 性能测试

测试地图功能的性能指标：
- 地图加载时间
- 大量标记点渲染性能
- 热图渲染性能
- 移动设备上的响应性

---

## 五、风险与缓解措施

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| API使用量超过免费限额 | 中 | 高 | 实施请求节流、缓存和批处理；设置使用量警报 |
| 移动设备性能问题 | 中 | 中 | 实施渐进式加载；针对移动设备优化地图设置 |
| 定位准确性不足 | 低 | 高 | 提供手动调整功能；使用多种定位方法 |
| API版本变更 | 低 | 中 | 遵循Google API最佳实践；定期测试和更新 |
| 隐私合规问题 | 低 | 高 | 确保符合PDPA要求；加密位置信息；实施用户同意机制 |

---

## 六、实施时间表

| 阶段 | 任务 | 估计时间 |
|------|------|----------|
| 1 | 环境准备与基础组件 | 2-3天 |
| 2 | 报告创建页面集成 | 3-4天 |
| 3 | 仪表板地图视图 | 2-3天 |
| 4 | 报告详情和数据分析 | 3-4天 |
| 5 | 性能优化和移动适配 | 2-3天 |
| 6 | 测试和修复问题 | 2-3天 |

**总计时间**: 约2-3周

---

## 七、结论

集成Google Maps API将显著增强SingaReport的功能和用户体验，使市民能够更准确地报告和跟踪城市问题。该集成将支持项目的核心目标，即提供一个高效、直观的城市问题报告平台，并为政府部门提供基于位置的数据分析能力。

通过本文档的实施计划，我们可以有条不紊地完成Google Maps的集成，实现从问题定位到数据可视化的全流程支持。 