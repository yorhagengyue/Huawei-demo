# Copyright (c) 2023-2024 DeepSeek.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
# the Software, and to permit persons to whom the Software is furnished to do so,
# subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
# IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from janus.models import MultiModalityCausalLM, VLChatProcessor
import numpy as np
import os
import PIL.Image

# Disable FlashAttention
os.environ["TRANSFORMERS_NO_FLASH_ATTN"] = "1"

# specify the path to the model - 使用本地路径而不是HuggingFace
# 可以通过环境变量JANUS_MODEL_PATH来设置模型路径
model_path = os.environ.get("JANUS_MODEL_PATH", "models/Janus-Pro-7B")
print(f"使用模型路径: {model_path}")

# 检查本地模型路径是否存在
if not os.path.exists(model_path):
    print(f"警告: 模型路径 '{model_path}' 不存在!")
    print("请确保已下载模型并正确设置路径。")
else:
    model_files = os.listdir(model_path)
    if model_files:
        print(f"模型路径 '{model_path}' 已找到，包含文件: {', '.join(model_files[:5])}" + 
              ("..." if len(model_files) > 5 else ""))
    else:
        print(f"警告: 模型路径 '{model_path}' 存在但为空文件夹!")

# 加载处理器
vl_chat_processor: VLChatProcessor = VLChatProcessor.from_pretrained(model_path, local_files_only=True)
tokenizer = vl_chat_processor.tokenizer

# Configure quantization - can be disabled by setting USE_QUANTIZATION to False
USE_QUANTIZATION = True
quantization_config = None

if USE_QUANTIZATION:
    # 设置默认的量化配置，包括启用CPU卸载
    quantization_config = BitsAndBytesConfig(
        load_in_8bit=True,
        bnb_8bit_compute_dtype=torch.bfloat16,
        llm_int8_enable_fp32_cpu_offload=True  # 启用CPU卸载，解决GPU内存不足问题
    )

# Configure model loading
config_kwargs = {
    "trust_remote_code": True,
    "use_flash_attention_2": False,
    "device_map": {
        "": "cuda:0",  # 默认设备
        "vision_model": "cuda:0",  # 视觉模型放在GPU上
        "language_model.decoder.embed_tokens": "cpu",  # 大型嵌入层放在CPU上
        "language_model.decoder.layer.0": "cuda:0",  # 第一层放在GPU上
        "language_model.decoder.layer.1": "cuda:0"   # 第二层放在GPU上
        # 其他层会自动分配
    },
    "attn_implementation": "eager",
    "torch_dtype": torch.bfloat16,
    "low_cpu_mem_usage": True  # 降低CPU内存使用
}

# 只有在启用量化时才添加量化配置
if quantization_config:
    config_kwargs["quantization_config"] = quantization_config

# Load the model
try:
    print(f"正在加载本地模型: {model_path}")
    vl_gpt: MultiModalityCausalLM = AutoModelForCausalLM.from_pretrained(
        model_path, 
        **config_kwargs,
        local_files_only=True  # 只从本地加载，不从HuggingFace下载
    )
    vl_gpt = vl_gpt.eval()
    print("本地模型加载成功!")
except Exception as e:
    print(f"本地模型加载失败: {str(e)}")
    print(f"请确保模型文件已下载到 '{model_path}' 目录下")
    raise e

def process_image(image_path):
    # 加载并处理图像
    image = PIL.Image.open(image_path)
    # 转换为RGB模式（如果是PNG，可能是RGBA）
    image = image.convert('RGB')
    # 使用图像处理器的预处理方法
    image_processor = vl_chat_processor.image_processor
    processed = image_processor.preprocess([image], return_tensors="pt")
    return processed["pixel_values"][0]

def analyze_image(model, processor, image_path, question="请详细描述这张图片的内容，包括场景、颜色、风格和主要元素。"):
    # 加载图像
    image = PIL.Image.open(image_path).convert('RGB')
    
    # 准备对话格式
    conversation = [
        {
            "role": "User",
            "content": f"{processor.image_tag} {question}",
            "images": [image]
        },
        {
            "role": "Assistant",
            "content": ""
        }
    ]
    
    # 使用process_one方法处理输入
    inputs = processor.process_one(
        conversations=conversation,
        images=[image],
        return_tensors="pt"
    )
    
    # 将输入移到GPU或CPU，根据可用性
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
    
    for k, v in inputs.__dict__.items():
        if isinstance(v, torch.Tensor):
            if k == 'input_ids':
                setattr(inputs, k, v.to(device))
            else:
                setattr(inputs, k, v.to(device).to(dtype))
    
    # 生成回答
    with torch.inference_mode():
        # 计算输入序列的长度
        seq_len = inputs.input_ids.size(0)
        
        # 准备掩码
        # 假设图像token在序列的开始部分
        images_seq_mask = torch.zeros((1, seq_len), dtype=torch.bool).to(device)
        images_seq_mask[0, :576] = True  # 前576个位置用于图像token
        
        images_emb_mask = torch.ones((1, 1, 576), dtype=torch.bool).to(device)
        
        # 准备输入嵌入
        inputs_embeds = model.prepare_inputs_embeds(
            input_ids=inputs.input_ids.unsqueeze(0),
            pixel_values=inputs.pixel_values.unsqueeze(0),
            images_seq_mask=images_seq_mask,
            images_emb_mask=images_emb_mask
        )
        
        # 生成回答
        outputs = model.language_model.generate(
            inputs_embeds=inputs_embeds,
            max_new_tokens=500,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            use_cache=True,
            pad_token_id=processor.tokenizer.pad_token_id,
            eos_token_id=processor.tokenizer.eos_token_id
        )
    
    # 解码输出
    response = processor.tokenizer.decode(outputs[0], skip_special_tokens=True)
    # 提取助手的回答
    try:
        response = response.split("Assistant: ")[1].strip()
    except:
        pass
    return response

# 测试图像分析
image_paths = [
    "generated_samples/cyberpunk_0.png",
    "generated_samples/cyberpunk_1.png",
    "generated_samples/sunset_0.png"
]

# 创建输出目录
os.makedirs('generated_samples', exist_ok=True)

# 检查是否有图像可以分析
existing_images = []
for image_path in image_paths:
    if os.path.exists(image_path):
        existing_images.append(image_path)

if existing_images:
    print("开始分析生成的图片...")
    for image_path in existing_images:
        print(f"\n正在分析图片: {image_path}")
        print("-" * 50)
        response = analyze_image(vl_gpt, vl_chat_processor, image_path)
        print("\n模型的分析结果：")
        print(response)
        print("=" * 50)
else:
    print("没有找到现有图片进行分析，将直接进行图像生成。")

# 添加图像生成代码
print("\n现在开始生成新图片...\n")

def create_prompt(user_input: str) -> str:
    conversation = [
        {
            "role": "User",
            "content": user_input,
        },
        {"role": "Assistant", "content": ""},
    ]

    sft_format = vl_chat_processor.apply_sft_template_for_multi_turn_prompts(
        conversations=conversation,
        sft_format=vl_chat_processor.sft_format,
        system_prompt="",
    )
    prompt = sft_format + vl_chat_processor.image_start_tag
    return prompt


@torch.inference_mode()
def generate(
    mmgpt: MultiModalityCausalLM,
    vl_chat_processor: VLChatProcessor,
    prompt: str,
    temperature: float = 1,
    parallel_size: int = 4,
    cfg_weight: float = 5,
    image_token_num_per_image: int = 576,
    img_size: int = 384,
    patch_size: int = 16,
):
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # 如果无法使用CUDA，减少并行大小以节省内存
        if not torch.cuda.is_available():
            parallel_size = min(2, parallel_size)
            print("警告: 未检测到CUDA，使用CPU运行，并减少生成数量以节省内存。")
        
        input_ids = vl_chat_processor.tokenizer.encode(prompt)
        input_ids = torch.LongTensor(input_ids)

        tokens = torch.zeros((parallel_size*2, len(input_ids)), dtype=torch.int).to(device)
        for i in range(parallel_size*2):
            tokens[i, :] = input_ids
            if i % 2 != 0:
                tokens[i, 1:-1] = vl_chat_processor.pad_id

        inputs_embeds = mmgpt.language_model.get_input_embeddings()(tokens)

        generated_tokens = torch.zeros((parallel_size, image_token_num_per_image), dtype=torch.int).to(device)
        outputs = None  # Initialize outputs for use in the loop

        print("开始生成图像...")
        for i in range(image_token_num_per_image):
            if i % 100 == 0 and i > 0:
                print(f"生成进度: {i}/{image_token_num_per_image}")
                
            outputs = mmgpt.language_model.model(
                inputs_embeds=inputs_embeds, 
                use_cache=True,
                past_key_values=outputs.past_key_values if i != 0 else None
            )
            hidden_states = outputs.last_hidden_state
            
            logits = mmgpt.gen_head(hidden_states[:, -1, :])
            logit_cond = logits[0::2, :]
            logit_uncond = logits[1::2, :]
            
            logits = logit_uncond + cfg_weight * (logit_cond - logit_uncond)
            probs = torch.softmax(logits / temperature, dim=-1)
            
            next_token = torch.multinomial(probs, num_samples=1)
            generated_tokens[:, i] = next_token.squeeze(dim=-1)
            
            next_token = torch.cat([next_token.unsqueeze(dim=1), next_token.unsqueeze(dim=1)], dim=1).view(-1)
            img_embeds = mmgpt.prepare_gen_img_embeds(next_token)
            inputs_embeds = img_embeds.unsqueeze(dim=1)
        
        print("解码生成的图像...")
        dec = mmgpt.gen_vision_model.decode_code(
            generated_tokens.to(dtype=torch.int),
            shape=[parallel_size, 8, img_size // patch_size, img_size // patch_size]
        )
        dec = dec.to(torch.float32).cpu().numpy().transpose(0, 2, 3, 1)
        
        dec = np.clip((dec + 1) / 2 * 255, 0, 255)
        
        visual_img = np.zeros((parallel_size, img_size, img_size, 3), dtype=np.uint8)
        visual_img[:, :, :] = dec
        
        import time
        
        # 创建文件夹
        os.makedirs('generated_samples', exist_ok=True)
        
        # 创建时间戳
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        
        # 保存图像
        saved_paths = []
        for i in range(parallel_size):
            save_path = os.path.join('generated_samples', f"{timestamp}_image_{i}.png")
            PIL.Image.fromarray(visual_img[i]).save(save_path)
            print(f"图像已保存到: {save_path}")
            saved_paths.append(save_path)
        
        return saved_paths
    
    except Exception as e:
        print(f"图像生成过程中出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

# 生成一些测试图片
prompts = [
    "一座有着中国传统风格的山水画，有高山、流水和亭台楼阁",
    "A photorealistic image of a Chinese dragon in flight against a stormy sky"
]

try:
    for idx, user_prompt in enumerate(prompts):
        print(f"\n生成图片提示 #{idx+1}: {user_prompt}")
        print("-" * 50)
        prompt = create_prompt(user_prompt)
        generated_paths = generate(vl_gpt, vl_chat_processor, prompt)
        if generated_paths:
            print(f"生成的图片已保存到: {', '.join(generated_paths)}")
        else:
            print(f"图片 #{idx+1} 生成失败")
        print("=" * 50)
    
    print("\n所有测试完成!")
except Exception as e:
    print(f"测试过程中发生错误: {str(e)}")
    import traceback
    traceback.print_exc()