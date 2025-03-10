// 这个脚本使用Canvas API生成点纹理
// 可以在浏览器控制台中运行

function createPointTexture() {
  // 创建一个Canvas元素
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  
  // 获取2D上下文
  const ctx = canvas.getContext('2d');
  
  // 清除画布
  ctx.clearRect(0, 0, size, size);
  
  // 创建一个径向渐变
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  
  // 添加颜色停止点
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  // 填充径向渐变
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // 将Canvas内容转换为data URL
  return canvas.toDataURL('image/png');
}

// 打印生成的data URL，可以复制并保存为PNG文件
console.log(createPointTexture());

// 可选：在页面中显示生成的纹理
function showTexture() {
  const img = document.createElement('img');
  img.src = createPointTexture();
  img.style.width = '128px';
  img.style.height = '128px';
  img.style.background = '#333';
  document.body.appendChild(img);
}

// 调用显示函数
showTexture(); 