import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/auth-utils';
import { generateToken } from '@/lib/auth/jwt-utils';

// 验证密码强度的函数
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  // 检查密码长度
  if (password.length < 8) {
    return { 
      valid: false, 
      message: '密码必须至少包含8个字符' 
    };
  }

  // 检查密码是否包含大写字母
  if (!/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      message: '密码必须包含至少一个大写字母' 
    };
  }

  // 检查密码是否包含小写字母
  if (!/[a-z]/.test(password)) {
    return { 
      valid: false, 
      message: '密码必须包含至少一个小写字母' 
    };
  }

  // 检查密码是否包含数字
  if (!/[0-9]/.test(password)) {
    return { 
      valid: false, 
      message: '密码必须包含至少一个数字' 
    };
  }

  // 检查密码是否包含特殊字符
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { 
      valid: false, 
      message: '密码必须包含至少一个特殊字符' 
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Add debug log
    console.log('Register request body:', JSON.stringify(body));
    
    // Extract user registration data
    const { 
      username, 
      name, 
      email, 
      password
    } = body;

    // Basic validation
    if (!username || !email || !password) {
      console.log('Register validation failed:', { username, email, password: !!password });
      return NextResponse.json(
        { error: 'Missing required fields. Username, email, and password are required.' },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    try {
      // Register the user
      const newUser = await createUser({
        username,
        email,
        password,
        name
      });

      // Use generateToken method to create JWT token
      const token = await generateToken({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      });

      // Create response
      const response = NextResponse.json(
        { 
          success: true,
          message: 'User registration successful',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username
          },
          token
        },
        { status: 201 }
      );

      // Set HTTP-only cookie
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    } catch (err: any) {
      // Handle specific errors from the createUser function
      return NextResponse.json(
        { error: err.message || 'Registration failed' },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 