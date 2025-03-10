'use client';

import React, { useRef, useEffect } from 'react';

interface TechBackgroundProps {
  opacity?: number;
  colorMode?: 'blue' | 'cyan' | 'purple';
  intensity?: number;
}

const TechBackground: React.FC<TechBackgroundProps> = ({
  opacity = 0.2,
  colorMode = 'blue',
  intensity = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 颜色配置 - 适度的颜色强度
  const colorConfigs = {
    blue: { r: 0.2, g: 0.6, b: 1.0 },
    cyan: { r: 0.3, g: 0.9, b: 1.0 },
    purple: { r: 0.6, g: 0.4, b: 1.0 }
  };
  
  const color = colorConfigs[colorMode];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 创建WebGL上下文
    const gl = canvas.getContext('webgl', { 
      powerPreference: 'low-power',  // 请求低功耗模式减少资源消耗
      antialias: false               // 关闭抗锯齿以提高性能
    });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // 设置画布尺寸 - 降低分辨率以提高性能
    const setCanvasSize = () => {
      const pixelRatio = 0.8; // 降低分辨率
      canvas.width = canvas.clientWidth * pixelRatio;
      canvas.height = canvas.clientHeight * pixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // 顶点着色器源码
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // 片元着色器源码 - 简化效果以提高性能
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color;
      uniform float u_intensity;
      
      // 简化噪声函数
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // 多个波纹叠加函数
      float multipleRings(vec2 uv, float time) {
        float dist = length(uv);
        float rings = 0.0;
        
        // 减少波纹数量以提高性能
        for (int i = 1; i <= 3; i++) {
          float speed = 0.2 * float(i);
          float size = 0.8 * float(i);
          float ringDist = mod(dist * size - time * speed, 1.0);
          float ring = smoothstep(0.0, 0.1, ringDist) * smoothstep(0.3, 0.2, ringDist);
          rings += ring * (0.5 / float(i));
        }
        
        return rings;
      }
      
      // 主函数
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 centeredUV = uv * 2.0 - 1.0;
        centeredUV.x *= u_resolution.x / u_resolution.y;
        
        // 动态背景
        float time = u_time * 0.15; // 减缓动画速度以降低资源消耗
        
        float brightness = 0.0;
        
        // 创建适度的波纹效果
        float rings = multipleRings(centeredUV, time);
        brightness += rings * 0.4 * u_intensity;
        
        // 中心发光效果
        float centerGlow = 0.03 / (length(centeredUV) + 0.15);
        brightness += centerGlow * 0.3 * u_intensity;
        
        // 应用颜色
        vec3 finalColor = u_color * brightness * u_intensity;
        
        // 输出颜色
        gl_FragColor = vec4(finalColor, brightness * 2.0 * ${opacity.toFixed(1)});
      }
    `;

    // 编译着色器
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    // 创建着色器程序
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return;
    
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    
    // 设置顶点数据
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    // 获取着色器变量位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
    
    // 启用顶点属性
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    // 渲染循环 - 降低帧率以减少资源消耗
    let startTime = performance.now();
    let lastRenderTime = 0;
    let animationFrameId: number;
    const targetFPS = 30; // 降低目标帧率以减少CPU使用
    const frameInterval = 1000 / targetFPS;
    
    const render = (currentTime: number) => {
      // 限制帧率
      if (currentTime - lastRenderTime < frameInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      lastRenderTime = currentTime;
      
      // 计算时间
      const elapsedTime = (currentTime - startTime) / 1000.0; // 转换为秒
      
      // 使用着色器程序
      gl.useProgram(program);
      
      // 设置统一变量
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsedTime);
      gl.uniform3f(colorLocation, color.r, color.g, color.b);
      gl.uniform1f(intensityLocation, intensity);
      
      // 设置混合模式
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // 绘制
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // 请求下一帧
      animationFrameId = requestAnimationFrame(render);
    };
    
    render(performance.now());
    
    // 清理函数
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      
      // 删除着色器和程序
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [opacity, colorMode, intensity, color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="webgl-container"
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // 恢复原来的z-index
        pointerEvents: 'none'
      }}
    />
  );
};

export default TechBackground; 