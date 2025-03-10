'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
// 使用any类型临时解决类型问题
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DataPoint } from '@/types/map-types';

// 色彩映射表 - 保留原来的颜色对应
const CATEGORIES_COLORS: Record<string, string> = {
  'infrastructure': '#FF9F9F',
  'cleanliness': '#90DEFF',
  'facilities': '#A5F0C5',
  'safety': '#FFEBB0',
  'environment': '#D0BDFF',
  'noise': '#FFD4F0',
  'construction': '#FFD0A0',
  'other': '#FFFFFF',
  'default': '#CCCCCC'
};

// 移除默认数据点，我们将使用从API获取的真实数据

interface DataVizSphereProps {
  width?: number | string;
  height?: number | string;
  dataPoints: DataPoint[]; // 不再提供默认值，要求必须传入数据
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  isLoading?: boolean; // 添加加载状态
}

const DataVizSphere: React.FC<DataVizSphereProps> = ({
  width = '100%',
  height = 400,
  dataPoints,
  rotationSpeed = 0.002,
  interactive = true,
  className = '',
  isLoading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const dataPointsRef = useRef<DataPoint[]>(dataPoints);
  
  // 更新点云数据函数 - 提前定义到使用之前
  const updateDataPoints = () => {
    if (!pointsRef.current || !sceneRef.current) return;
    
    const particles = dataPointsRef.current.length;
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);
    const sizes = new Float32Array(particles);
    
    // 更新点的位置和颜色
    dataPointsRef.current.forEach((point, i) => {
      const phi = (90 - point.lat) * (Math.PI / 180);
      const theta = (point.lng + 180) * (Math.PI / 180);
      
      const x = -(2 * Math.sin(phi) * Math.cos(theta));
      const y = 2 * Math.cos(phi);
      const z = 2 * Math.sin(phi) * Math.sin(theta);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // 修复类型错误 - 安全访问颜色映射表
      const color = new THREE.Color(
        point.category && CATEGORIES_COLORS[point.category] 
          ? CATEGORIES_COLORS[point.category] 
          : CATEGORIES_COLORS['default']
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = point.value * 0.15;
    });
    
    (pointsRef.current.geometry as THREE.BufferGeometry).setAttribute(
      'position', 
      new THREE.BufferAttribute(positions, 3)
    );
    (pointsRef.current.geometry as THREE.BufferGeometry).setAttribute(
      'color', 
      new THREE.BufferAttribute(colors, 3)
    );
    (pointsRef.current.geometry as THREE.BufferGeometry).setAttribute(
      'size', 
      new THREE.BufferAttribute(sizes, 1)
    );
    
    (pointsRef.current.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
    (pointsRef.current.geometry as THREE.BufferGeometry).attributes.color.needsUpdate = true;
    (pointsRef.current.geometry as THREE.BufferGeometry).attributes.size.needsUpdate = true;
  };
  
  useEffect(() => {
    dataPointsRef.current = dataPoints;
    
    // 如果已经初始化了场景但数据点发生变化，则更新点云
    if (sceneRef.current && pointsRef.current) {
      updateDataPoints();
    }
  }, [dataPoints]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // 背景和雾
    scene.background = new THREE.Color(0x182635);
    scene.fog = new THREE.Fog(0x182635, 5, 20);
    
    // 相机
    const aspectRatio = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // 控制器
    if (interactive) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = 10;
      controls.minDistance = 3;
      controlsRef.current = controls;
    }
    
    // 创建地球
    const createEarth = () => {
      // 地球材质
      const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
      const earthMaterial = new THREE.MeshBasicMaterial({
        color: 0x0A3A5A,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      sphereRef.current = earth;
      scene.add(earth);
      
      // 添加地球轮廓
      const outlineGeometry = new THREE.SphereGeometry(2.02, 64, 64);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x6DE4FF,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide,
      });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      scene.add(outline);
      
      // 添加大气层效果
      const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x6DE4FF,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.add(atmosphere);
    };
    
    // 创建数据点并添加到场景
    const createDataPoints = () => {
      // 数据点几何体
      const pointsGeometry = new THREE.BufferGeometry();
      const particles = dataPointsRef.current.length;
      
      const positions = new Float32Array(particles * 3);
      const colors = new Float32Array(particles * 3);
      const sizes = new Float32Array(particles);
      
      // 将经纬度转换为3D坐标
      dataPointsRef.current.forEach((point, i) => {
        // 经纬度转球面坐标
        const phi = (90 - point.lat) * (Math.PI / 180);
        const theta = (point.lng + 180) * (Math.PI / 180);
        
        const x = -(2 * Math.sin(phi) * Math.cos(theta));
        const y = 2 * Math.cos(phi);
        const z = 2 * Math.sin(phi) * Math.sin(theta);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // 修复类型错误 - 安全访问颜色映射表
        const color = new THREE.Color(
          point.category && CATEGORIES_COLORS[point.category] 
            ? CATEGORIES_COLORS[point.category] 
            : CATEGORIES_COLORS['default']
        );
        
        // 增加颜色饱和度和亮度
        color.r = Math.min(1.0, color.r * 1.3);
        color.g = Math.min(1.0, color.g * 1.3);
        color.b = Math.min(1.0, color.b * 1.3);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // 设置更大的尺寸
        sizes[i] = point.value * 0.15;
      });
      
      pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pointsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      // 创建着色器材质
      const pointsMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          pointTexture: { value: new THREE.TextureLoader().load('/point-texture.svg') }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // 点的大小随时间有更强的脉动
            float pulse = sin(time * 3.0 + position.x * 2.0 + position.y + position.z) * 0.2 + 1.3;
            gl_PointSize = size * pulse * (350.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          
          void main() {
            // 增加高光和发光效果，让颜色更亮
            vec4 texColor = texture2D(pointTexture, gl_PointCoord);
            vec3 glow = vColor * 2.0; // 增强颜色亮度
            gl_FragColor = vec4(glow, texColor.a);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
      });
      
      // 创建点云
      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      pointsRef.current = points;
      scene.add(points);
      
      // 添加连接线效果
      createConnectionLines(positions);
    };
    
    // 新增：创建数据点之间的连接线
    const createConnectionLines = (positions: Float32Array) => {
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions: number[] = [];
      const lineColors: number[] = [];
      
      // 创建一些随机连接，但不是所有点都连接
      const numPoints = positions.length / 3;
      const numConnections = Math.min(30, numPoints * 2); // 限制连接数量
      
      for (let i = 0; i < numConnections; i++) {
        // 随机选择两个点
        const idx1 = Math.floor(Math.random() * numPoints);
        const idx2 = Math.floor(Math.random() * numPoints);
        
        if (idx1 !== idx2) {
          // 添加第一个点的位置
          linePositions.push(
            positions[idx1 * 3],
            positions[idx1 * 3 + 1],
            positions[idx1 * 3 + 2]
          );
          
          // 添加第二个点的位置
          linePositions.push(
            positions[idx2 * 3],
            positions[idx2 * 3 + 1],
            positions[idx2 * 3 + 2]
          );
          
          // 设置线条颜色（浅蓝色）
          for (let j = 0; j < 6; j++) {
            lineColors.push(0.3, 0.8, 1.0);
          }
        }
      }
      
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x6DE4FF,
        transparent: true,
        opacity: 0.4,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });
      
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      sceneRef.current?.add(lines);
    };
    
    // 添加光线
    const addLights = () => {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(0, 0, 5);
      scene.add(directionalLight);
      
      // 添加点光源以增强效果
      const pointLight = new THREE.PointLight(0x6DE4FF, 1.5, 10);
      pointLight.position.set(0, 0, 3);
      scene.add(pointLight);
    };
    
    // 创建场景元素
    createEarth();
    createDataPoints();
    addLights();
    
    // 鼠标事件
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      
      // 计算屏幕上的鼠标坐标
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // 设置鼠标位置用于工具提示
      setPointerPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    };
    
    // 检测交互
    const checkIntersection = () => {
      if (!camera || !scene || !pointsRef.current) return;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(pointsRef.current, false);
      
      if (intersects.length > 0) {
        const index = intersects[0].index;
        // 安全访问数组元素
        if (index !== undefined && index >= 0 && index < dataPointsRef.current.length) {
          setHoveredPoint(dataPointsRef.current[index]);
        }
      } else {
        setHoveredPoint(null);
      }
    };
    
    // 添加鼠标移动事件监听器
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    
    // 动画循环
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // 更新球体旋转
      if (sphereRef.current && !controlsRef.current?.enableDamping) {
        sphereRef.current.rotation.y += rotationSpeed;
      }
      
      // 更新点云着色器时间
      if (pointsRef.current) {
        (pointsRef.current.material as THREE.ShaderMaterial).uniforms.time.value = performance.now() / 1000;
      }
      
      // 更新控制器
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // 检查鼠标交互
      checkIntersection();
      
      // 渲染场景
      renderer.render(scene, camera);
    };
    
    animate();
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // 清理 Three.js 资源
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
      
      if (sphereRef.current) {
        sphereRef.current.geometry.dispose();
        (sphereRef.current.material as THREE.Material).dispose();
      }
      
      scene.clear();
    };
  }, [interactive, rotationSpeed]);

  // 确定容器样式
  const containerStyle = {
    width,
    height,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: '8px',
  };

  // 工具提示样式
  const tooltipStyle = {
    position: 'absolute' as const,
    top: `${pointerPosition.y + 10}px`,
    left: `${pointerPosition.x + 10}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    zIndex: 10,
    pointerEvents: 'none' as const,
    opacity: hoveredPoint ? 1 : 0,
    transform: hoveredPoint ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.2s, transform 0.2s',
  };

  return (
    <div ref={containerRef} style={containerStyle} className={`relative ${className}`}>
      {/* 弹出工具提示 */}
      {hoveredPoint && (
        <div 
          className="absolute bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs z-10 backdrop-blur-sm"
          style={{ 
            left: pointerPosition.x + 12, 
            top: pointerPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="flex items-start space-x-3">
            <div 
              className="w-3 h-3 mt-1 flex-shrink-0" 
              style={{ 
                backgroundColor: hoveredPoint && hoveredPoint.category && CATEGORIES_COLORS[hoveredPoint.category] 
                  ? CATEGORIES_COLORS[hoveredPoint.category] 
                  : CATEGORIES_COLORS['default'],
                boxShadow: '0 0 5px rgba(255,255,255,0.7)'
              }} />
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white text-sm">
                {hoveredPoint.title || `${hoveredPoint.category.charAt(0).toUpperCase() + hoveredPoint.category.slice(1)} Issue`}
              </h4>
              
              {hoveredPoint.description && (
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-2">
                  {hoveredPoint.description.length > 80 ? hoveredPoint.description.substring(0, 80) + '...' : hoveredPoint.description}
                </p>
              )}
              
              <div className="mt-2 flex flex-wrap gap-1">
                {hoveredPoint.status && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                    ${hoveredPoint.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      hoveredPoint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                    {hoveredPoint.status.charAt(0).toUpperCase() + hoveredPoint.status.slice(1).replace(/-/g, ' ')}
                  </span>
                )}
                
                {hoveredPoint.location && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {hoveredPoint.location}
                  </span>
                )}
              </div>
              
              {hoveredPoint.createdAt && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Reported: {new Date(hoveredPoint.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataVizSphere; 